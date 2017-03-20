package State::PowerDown;

use strict;
use warnings;
use parent 'State';

sub on_enter {
    my ( $self, $game ) = @_;
    for my $p ( values %{ $game->{player} } ) {
        if ( $p->{public}{shutdown} ) {
            $p->{public}{shutdown} = '';
            $p->{public}{ready}    = '';
            $p->send('declare_shutdown');
        }
        else {
            $p->{public}{ready} = 1;
        }

        if ( $p->{public}{will_shutdown} ) {
            $p->{public}{shutdown} = 1;
            delete $p->{public}{will_shutdown};
            $game->broadcast(
                {   cmd      => 'shutdown',
                    player   => $p->{id},
                    activate => 1
                }
            );
        }
    }

    if ( $game->ready ) {
        $game->set_state('PROGRAM');
    }
    else {
        $game->timer( 10, \&Game::set_state, $game, 'PROGRAM' );
    }
}

sub do_shutdown {
    my ( $self, $game, $c, $msg ) = @_;

    return if $c->{public}{ready};
    $c->{public}{ready}    = 1;
    $c->{public}{shutdown} = !!$msg->{activate};

    $game->broadcast(
        {   cmd      => 'shutdown',
            player   => $c->{id},
            activate => $c->{public}{shutdown}
        }
    );

    $game->set_state('PROGRAM') if $game->ready;
}

1;
