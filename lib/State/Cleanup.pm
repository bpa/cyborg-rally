package State::Cleanup;

use strict;
use warnings;
use parent 'State';

sub on_enter {
    my ( $self, $game ) = @_;
    for my $p ( values %{ $game->{player} } ) {
    }
}

1;
