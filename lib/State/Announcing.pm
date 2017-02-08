package State::Announcing;

use strict;
use warnings;
use parent 'State';
use List::Util 'all';

sub on_enter {
    my ( $self, $game ) = @_;
    $game->timer( 10, \&Game::set_state, $game, 'EXECUTE' );
}

sub do_shutdown {
    my ( $self, $game, $c, $msg ) = @_;
    $c->{public}{shutdown} = !!$msg->{activate};
    if ( all { exists $_->{public}{shutdown} } values %{ $game->{player} } ) {
        $game->set_state('EXECUTE');
    }
}

1;
