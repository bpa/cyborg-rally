use strict;
use warnings;
use Test::More;
use Test::Deep;
use Deck;
use Card;
use Option;
use JSON;

my $json = JSON->new->convert_blessed;
my $deck = Deck->new( 2, 3, Option->new( { name => 4 } ) );

is( $deck->count, 3, "count" );

ok( $deck->contains(2), "contains 2" );
ok( $deck->contains( Option->new( { name => 4 } ) ), "contains Card(4)" );
ok( !$deck->contains(5), "!contains 5" );

is( $deck->remove(3), 3, "remove 3" );
is( $deck->count, 2 );
cmp_deeply(
    $deck->remove( Option->new( { name => 4 } ) ),
    noclass( { name => 4 } ),
    "remove 4"
);
is( $deck->count, 1 );

my $two = $deck->deal;
is( $deck->count, 0 );
cmp_deeply( $two, 2, "dealt last card" );

my $card
  = $json->decode( $json->encode( Option->new( { name => 4, value => 'x' } ) ) );
cmp_deeply( $card, { name => 4, value => 'x' } );

# This ends up testing to see if the first card can be removed
my $left = Card->new( { 'total' => 5, 'number' => 5, 'priority' => 120, 'name' => 'l' } );
my $move = Deck->new( $left );
my $l = $move->remove($left);
cmp_deeply($l, $left);

done_testing;

1;

