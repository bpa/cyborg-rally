package CyborgRally;

use strict;
use warnings;
use Data::UUID;

my $uuid = Data::UUID->new;

use Rally;
use NullSock;

sub new {
    bless { cyborg => {}, game => {}, lobby => Lobby->new, }, shift;
}

sub on_connect {
    my ( $self, $c ) = @_;
    $c->send( { cmd => 'welcome' } );
}

sub on_disconnect {
    my ( $self, $c ) = @_;
    my $g = $c->{game};
    $c->{sock} = NullSock->new;
    $g->on_disconnect($c) if $g;
}

sub on_message {
    my ( $self, $c, $msg ) = @_;
    return unless $msg->{cmd};
    my $f     = "do_" . $msg->{cmd};
    my $rally = $c->{rally};
    my $g     = $c->{game};

    if ($g) {
        $g->{state}->$f( $g, $c, $msg ) if $g->{state}->can($f);
        $g->$f( $c, $msg ) if $g->can($f);
        $g->update;
    }

    $rally->$f( $c, $msg ) if $rally && $rally->can($f);
    $self->$f( $c, $msg ) if $self->can($f);
}

sub do_create_game {
    my ( $self, $c, $msg ) = @_;
    unless ( $msg->{name} ) {
        $c->err('Missing name');
        return;
    }
    if ( $self->{game}{ $msg->{name} } ) {
        $c->err('Game already exists');
        return;
    }
    my $g = $self->{game}{ $msg->{name} } = Rally->new($msg);
    $self->{lobby}->broadcast(
        {   cmd  => 'create_game',
            name => $msg->{name},
            opts => $g->{opts}
        }
    );
}

sub do_error {
    my ( $self, $c, $msg ) = @_;
    print STDERR "Error from ", $c->{public}{name}, "\n", $msg->{message}, "\n";
}

sub do_games {
    my ( $self, $c, $msg ) = @_;
    my @games;
    while ( my ( $k, $g ) = each %{ $self->{game} } ) {
        push @games,
          { name    => $k,
            players => scalar( %{ $g->{player} } ),
            opts    => $g->{opts}
          };
    }
    $c->send( { cmd => 'games', games => \@games } );
}

sub do_join {
    my ( $self, $c, $msg ) = @_;
    if ( !$msg->{name} ) {
        $c->err("Missing name");
        return;
    }

    my $g = $self->{game}{ $msg->{name} };
    if ( !$g ) {
        $c->err("Game does not exist");
        return;
    }

    if ( !$g->{accepting_players} ) {
        $c->err("Game is not accepting new players");
        return;
    }

    $c->{game}->quit($c);
    $g->join($c);
}

sub do_login {
    my ( $self, $c, $msg ) = @_;

    $c->{name} = $msg->{name} || 'Somebody';

    my $token = $msg->{token};
    if ($token) {
        $c->{uuid} = $token;
        my $cyborg = $self->{cyborg}{$token};
        if ($cyborg) {
            $c->{game} = $cyborg->{game};
            $self->{cyborg}{$token} = $c;
            $c->{game}->join($c);
            return;
        }
    }

    $c->{uuid} = $token = $uuid->create_str();
    $self->{cyborg}{$token} = $c;
    $c->send( { cmd => 'login', token => $token } );
    $self->{lobby}->join($c);
}

sub do_set_name {
    my ( $self, $c, $msg ) = @_;
    if ( !$msg->{name} ) {
        $c->err('Missing name');
    }

    return if $msg->{name} eq $c->{name};

    my $g = $c->{game};
    $g->on_rename( $c, $msg->{name} ) if $g;
    $c->{name} = $msg->{name};
}

sub do_quit {
    my ( $self, $c, $msg ) = @_;

    my $g = $c->{game};
    $c->{game}->quit($c);
    $self->{lobby}->join($c);

    if ( !keys %{ $g->{player} } ) {
        undef $g->{timer};
        delete $self->{game}{ $g->{name} };
        $self->{lobby}->broadcast(
            {   cmd  => 'delete_game',
                name => $g->{name},
            }
        );
    }
}

1;
