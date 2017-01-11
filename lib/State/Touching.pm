package State::Touching;

use strict;
use warnings;
use parent 'State';

sub on_enter {
    my ( $self, $game ) = @_;
    $game->{public}{register}++;
}

sub do_touching {
    my ( $self, $game, $c, $msg ) = @_;
    if ( $game->{public}{register} == 5 ) {
        delete $game->{public}{register};
        $game->set_state('CLEANUP');
    }
    else {
        $game->set_state('MOVE');
    }
}

1;
