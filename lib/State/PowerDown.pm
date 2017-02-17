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

    $game->set_state('PROGRAM') if $game->ready;
}

1;
