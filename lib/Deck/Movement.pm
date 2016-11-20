package Deck::Movement;

use strict;
use warnings;

use parent 'Deck';
use POSIX;

my @ratios = (
    [  .75 => 'u' ],
    [ 2.25 => 'r' ],
    [ 2.25 => 'l' ],
    [  .75 => 'b' ],
    [ 2.25 => '1' ],
    [ 1.5  => '2' ],
    [  .75 => '3' ],
);
   
sub build {
    my ($self, $players) = @_;
    $self->{players} = $players;
}

sub generate_cards {
    my $self = shift;
    my @cards;
    for my $ratio (@ratios) {
        my $count = ceil($ratio->[0] * $self->{players});
        my $type = $ratio->[1];
	    for ( 1 .. $count ) { push @cards, $type . (@cards+1) . "0" }
    }
    return \@cards;
}

1;
