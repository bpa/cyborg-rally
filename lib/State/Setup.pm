package State::Setup;

use strict;
use warnings;
use parent 'State';

sub on_enter {
    my ($self, $game) = @_;
    $game->{options} = Deck::Options->new;
    $game->{options}->shuffle;
    $game->{movement} = Deck::Movement->new(scalar(keys %{$game->{player}}));
    for my $p (values %{$game->{player}}) {
        $p->{public}{lives} = 3;
        $p->{public}{memory} = 9;
        $p->{public}{damage} = 0;
        $p->{public}{options} = [];
        $p->{private} = [];
    }
    $game->set_state('CHOOSE');
}

1;
