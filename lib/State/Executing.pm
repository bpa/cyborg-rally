package State::Executing;

use strict;
use warnings;
use parent 'State';

sub on_enter {
    my ( $self, $game ) = @_;
    $game->{public}{register} = 0;
    $game->set_state('MOVE');
    delete $game->{public}{option}{'Abort Switch'}{tapped};
}

1;
