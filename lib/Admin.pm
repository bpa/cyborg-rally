package Admin;

use strict;
use warnings;
use JSON;
use Data::Dumper;
use Scalar::Util qw(looks_like_number);

my $json = JSON->new->convert_blessed;

my %command = (
    dec     => \&cmd_decr,
    e       => \&cmd_eval,
    inc     => \&cmd_incr,
    games   => \&cmd_games,
    p       => \&cmd_print,
    players => \&cmd_players,
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
    $loc =~ s#/(\w+)#{$1}#g;

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
    $d->Seen( { '*game' => $game } ) if !(ref($base) && $game == $base);
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

sub cmd_players {
    my $self = shift;
    if ( $self->{instance} ) {
    }
    syswrite $self->{fh}, Dumper [ keys %{ $self->{game}{game} } ];
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