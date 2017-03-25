use strict;
use warnings;
use Test::More;
use Deck::Movement;

my $deck = Deck::Movement->new(8);
is( scalar( @{ $deck->{cards} } ), 84, 'Movement deck for 8 has 84 cards' );

$deck = Deck::Movement->new(4);
is( scalar( @{ $deck->{cards} } ), 42, 'Movement deck for 4 has 42 cards' );

my ($a, $b) = $deck->deal(2);

ok($a ne $b);
ok($a eq $a);

done_testing;

1;

