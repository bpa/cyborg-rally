use strict;
use warnings;
use Test::More;
use Deck::Options;

my $deck = Deck::Options->new;
is(@{$deck->{cards}}, 26, 'Options deck has 26 cards');

my @hand = $deck->deal(6);
is(@hand, 6, 'Dealt 6 cards');

$deck->reset;
is(@{$deck->{cards}}, 26, 'Options deck still has 26 cards');

done_testing;

1;

