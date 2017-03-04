package State::Announcing;

use strict;
use warnings;
use parent 'State';
use List::Util 'all';

sub on_enter {
    my ( $self, $game ) = @_;

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
    $c->{public}{ready}    = 1;
    $c->{public}{shutdown} = !!$msg->{activate};

    $game->broadcast(
        {   cmd      => 'shutdown',
            player   => $c->{id},
            activate => $c->{public}{shutdown}
        }
    );

    $game->set_state('EXECUTE') if $game->ready;
}

1;
