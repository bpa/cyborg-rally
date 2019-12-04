package State::PowerDown;

use strict;
use warnings;
use parent 'State';

sub on_enter {
    my ( $self, $game ) = @_;
    $self->{public} = {};
    for my $p ( values %{ $game->{player} } ) {
        if (( $p->{public}{shutdown} && !$p->{public}{will_shutdown} )
            || ( exists $p->{public}{options}{'Emergency Shutdown'}
                && $p->{public}{damage} > 2 )
          )
        {
            $p->{public}{shutdown}      = '';
            $p->{public}{ready}         = '';
            $self->{public}{ $p->{id} } = $p->{public}{damage};
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
        $game->set_state('NEW_CARD');
    }
    else {
        $game->broadcast( { cmd => 'power_down', players => $self->{public} } );
        $game->timer( 10, \&Game::set_state, $game, 'NEW_CARD' );
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

    $game->set_state('NEW_CARD') if $game->ready;
}

1;
