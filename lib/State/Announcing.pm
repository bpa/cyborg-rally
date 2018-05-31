package State::Announcing;

use strict;
use warnings;
use parent qw/State DamageHandler/;

sub on_enter {
    my ( $self, $game ) = @_;

    my $p = $game->{player}{$game->{public}{recompiled}};
    $self->damage($game, $p, 1) if $p;

    $game->set_ready_to_dead_or_shutdown;

    if ( $game->ready ) {
        $game->set_state('EXECUTE');
    }
    else {
        $game->timer( 10, \&Game::set_state, $game, 'EXECUTE' );
    }
}

sub do_shutdown {
    my ( $self, $game, $c, $msg ) = @_;
    if ( $c->{public}{ready} ) {
        $c->err('Already declared');
        return;
    }
    $c->{public}{ready}         = 1;
    $c->{public}{will_shutdown} = !!$msg->{activate};

    $game->broadcast(
        {   cmd      => 'announce',
            player   => $c->{id},
            shutdown => $c->{public}{will_shutdown}
        }
    );

    $game->set_state('EXECUTE') if $game->ready;
}

1;
