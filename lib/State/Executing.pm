package State::Executing;

use strict;
use warnings;
use parent 'State';

sub on_enter {
    my ( $self, $game ) = @_;
    $game->{public}{register} = 0;
    $game->set_state('MOVE');
    for my $p ( values %{ $game->{player} } ) {
        if ( exists $p->{public}{options}{'Abort Switch'} ) {
            delete $p->{public}{options}{'Abort Switch'}{triggered};
        }
    }
}

1;
