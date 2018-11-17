package Admin;

use strict;
use warnings;
use FileHandle;
use JSON;
use Data::Dumper;
use Scalar::Util qw(looks_like_number);
use List::MoreUtils 'firstidx';

my $json = JSON->new->convert_blessed;

my %command = (
    dec     => \&cmd_decr,
    del     => \&cmd_delete,
    e       => \&cmd_eval,
    inc     => \&cmd_incr,
    games   => \&cmd_games,
    give    => \&cmd_give,
    keys    => \&cmd_keys,
    p       => \&cmd_print,
    players => \&cmd_players,
    r       => \&cmd_registers,
    set     => \&cmd_set,
    use     => \&cmd_use,
    x       => \&cmd_dump,
);

sub new {
    my ( $pkg, $fh, $game ) = @_;
    my $self = bless { fh => $fh, game => $game }, $pkg;
    my @games = keys %{ $game->{game} };
    if (@games) {
        $self->{instance} = $games[0];
        syswrite $fh, "using $self->{instance}\n";
    }
    syswrite $fh, "> ";
    return $self;
}

sub get_game {
    my $self = shift;
    if ( !$self->{instance} && $self->{game}{game}{ $self->{insance} } ) {
        syswrite $self->{fh}, "No game chosen\nGames available: ";
        syswrite $self->{fh}, join( ", ", keys %{ $self->{game}{game} } );
        syswrite $self->{fh}, "\n";
        return;
    }

    return $self->{game}{game}{ $self->{instance} };
}

sub run {
    my ( $self, $input ) = @_;
    $input =~ s/\s+$//;
    my ( $cmd, @toks ) = split /\s+/, $input, 3;
    if ( exists $command{$cmd} ) {
        $command{$cmd}->( $self, @toks );
    }
    else {
        syswrite $self->{fh}, "No command '$cmd'\n";
        syswrite $self->{fh}, Dumper [ keys %command ];
    }
    syswrite $self->{fh}, "> ";
}

sub lookup {
    my ( $game, $path ) = @_;
    my $base = $game;

    my ( $name, $loc ) = $path =~ m#^\s*(?::([^/]+))?(/?.*?)/?\s*$#;
    if ($name) {
        for my $p ( values %{ $game->{player} } ) {
            if ( $p->{public}{name} =~ /$name/ ) {
                $base = $p;
                last;
            }
        }
    }

    $loc =~ s#^/?#/#;
    $loc =~ s#\+# #;
    $loc =~ s#/([^/]+)#{$1}#g;

    return ( $base, $loc );
}

sub cmd_decr {
    my ( $self, $path ) = @_;
    my $game = $self->get_game || return;
    my ( $base, $expr ) = lookup( $game, $path );
    eval "\$base->$expr--";
    $self->cmd_print($path);
}

sub cmd_eval {
    my ( $self, $path, $cmd ) = @_;
    my $game = $self->get_game || return;
    my ( $base, $expr ) = lookup( $game, $path );
    eval "\$base->$expr $cmd";
    $self->cmd_dump($path);
}

sub cmd_incr {
    my ( $self, $path ) = @_;
    my $game = $self->get_game || return;
    my ( $base, $expr ) = lookup( $game, $path );
    eval "\$base->$expr++";
    $self->cmd_print($path);
}

sub cmd_dump {
    my ( $self, $path ) = @_;
    return unless $path;
    my $game = $self->get_game || return;
    my ( $base, $expr ) = lookup( $game, $path );
    eval "\$base = \$base->$expr";
    my $d = Data::Dumper->new( [$base], ['x'] );
    $d->Sortkeys(1);
    for my $p ( values %{ $game->{player} } ) {
        $d->Seen( { '*sock', $p->{sock} } );
    }
    $d->Seen(
        {   '*private' => $game->{private}{player},
            '*public'  => $game->{public}{player},
            '*map'     => $game->{map}
        }
    );
    $d->Seen( { '*game' => $game } ) if !( ref($base) && $game == $base );
    syswrite $self->{fh}, $d->Dump;
}

sub cmd_print {
    my ( $self, $path ) = @_;
    my $game = $self->get_game || return;
    my ( $base, $expr ) = lookup( $game, $path );
    eval "\$base = \$base->$expr";
    syswrite $self->{fh}, scalar($base) . "\n";
}

sub cmd_games {
    my $self = shift;
    syswrite $self->{fh}, Dumper [ keys %{ $self->{game}{game} } ];
}

sub find_player {
    my ($game, $name) = @_;
    for my $p ( values %{ $game->{player} } ) {
        if ( $p->{public}{name} =~ /$name/i ) {
            return $p;
        }
    }
    return;
}

sub get_option {
    my ( $game, $card ) = @_;
    my $idx = firstidx { $_->{name} =~ /$card/i } @{ $game->{options}{cards} };
    if ($idx != -1) {
        return splice @{ $game->{options}{cards} }, $idx, 1;
    }
    return;
}

sub cmd_give {
    my ($self, $name, $card) = @_;
    if (!$name) {
        syswrite $self->{fh}, "Missing name\n";
        return;
    }
    if (!$card) {
        syswrite $self->{fh}, "Missing card\n";
        return;
    }
    my $game = $self->get_game || return;
    my $p = find_player($game, $name);
    return unless $p;
   
    my $o = get_option($game, $card);
    return unless defined $o;
    $p->{public}{options}{$o->{name}} = $o;
    for $o (values %{$p->{public}{options}}) {
        syswrite $self->{fh}, "$o->{name}\n";
    }
    $game->broadcast(
        {   cmd     => 'options',
            player  => $p->{id},
            options => $p->{public}{options}
        }
    );
}

sub cmd_keys {
    my ( $self, $path ) = @_;
    return unless $path;
    my $game = $self->get_game || return;
    my ( $base, $expr ) = lookup( $game, $path );
    eval "\$base = \$base->$expr";
    syswrite $self->{fh}, Dumper [ sort keys %$base ];
}

sub cmd_players {
    my $self = shift;
    if ( $self->{instance} ) {
    }
    syswrite $self->{fh}, Dumper [ keys %{ $self->{game}{game} } ];
}

sub center {
    my ($str, $w) = @_;
    my $l = $w - length($str);
    my $r = int($l/2);
    $l = $w - $r;
    return sprintf "%*s%*s", $l, $str, $r, '';
}

sub cmd_registers {
    my ($self) = @_;
    my $game = $self->get_game || return;
    my @rows = [qw/Player 1 2 3 4 5/];
    for my $p ( values %{ $game->{player} } ) {
        my @row = $p->{name};
        for my $r ( @{ $p->{public}{registers} } ) {
            push @row,
              join( ' ', map {"($_->{name}:$_->{priority})"} @{ $r->{program} } );
        }
        push @rows, \@row;
    }
    my @w;
    for my $i (0..5) {
        $w[$i] = 0;
        for my $r (@rows) {
            my $l = length($r->[$i]);
            $w[$i] = $l if $w[$i] < $l;
        }
        for my $r (@rows) {
            $r->[$i] = center($r->[$i], $w[$i]);
        }
    }
    push @rows, [];
    syswrite $self->{fh}, join("\n", map { join(" | ", @$_) } @rows);
}

sub cmd_set {
    my ( $self, $ref, $value ) = @_;
    if ( looks_like_number($value) ) {
        $value += 0;
    }
}

sub cmd_use {
    my ( $self, $game ) = @_;
    if ( $self->{game}{game}{$game} ) {
        $self->{instance} = $game;
    }
    else {
        syswrite $self->{fh}, "No game named '$game'\n";
        syswrite $self->{fh}, Dumper [ keys %{ $self->{game}{game} } ];
    }
}

1;
