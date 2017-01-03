package State::Announcing;

use strict;
use warnings;
use parent 'State';
use List::Util 'all';
use AnyEvent;

sub on_enter {
    my ( $self, $game ) = @_;
    $game->broadcast( { cmd => 'time', limit => '10s' } );
    $self->{timer} = $game->timer( 10, \&Game::change_state, $game, 'MOVE' );
}

sub do_shutdown {
    my ( $self, $game, $c, $msg ) = @_;
    $c->{public}{shutdown} = !!$msg->{activate};
    if ( all { exists $_->{public}{shutdown} } values %{ $game->{player} } ) {
        $game->set_state('MOVE');
    }
}

sub on_exit {
    my ( $self, $game ) = @_;
    undef $self->{timer};
}

1;
