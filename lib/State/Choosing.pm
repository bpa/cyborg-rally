package State::Choosing;

use strict;
use warnings;
use parent 'State';

sub on_enter {
    my ($self, $game) = @_;
    $game->{movement}->reset;
    $game->{movement}->shuffle;
    for my $p (values %{$game->{player}}) {
        $p->{private} = [$game->{movement}->deal(9)];
    }
}

1;
