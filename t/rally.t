use strict;
use warnings;
use Test::More;
use Test::Deep;
use CyborgTest;
use Scalar::Util 'looks_like_number';
use List::Util;

use constant EMPTY => { damaged => '', program => [] };
use constant LOCK => {
    damaged => 1,
    program => code(
        sub {
            return ( 0, "No program" ) unless @{ $_[0] };
            return ( 0, "Program has invalid card" )
              if List::Util::any { ref($_) ne 'Card' } @{ $_[0] };
            return 1;
        }
    )
};

subtest 'normal damage' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );

    $p1->{public}{registers} = [ r(0), r(1), r(2), r(3), r(4) ];

    $p1->drop_packets;
    $rally->damage( $p1, 4 );
    cmp_deeply(
        $rally->{packets},
        [
            {   cmd       => 'damage',
                player    => $p1->{id},
                damage    => 4,
                registers => [ N, N, N, N, N ]
            }
        ]
    );

    $p1->drop_packets;
    $rally->damage( $p1, 1 );
    cmp_deeply(
        $rally->{packets},
        [
            {   cmd       => 'damage',
                player    => $p1->{id},
                damage    => 5,
                registers => [ N, N, N, N, L ]
            }
        ]
    );

    $p1->drop_packets;
    $rally->damage( $p1, 4 );
    cmp_deeply(
        $rally->{packets},
        [
            {   cmd       => 'damage',
                player    => $p1->{id},
                damage    => 9,
                registers => [ L, L, L, L, L ]
            }
        ]
    );

    $p1->drop_packets;
    $rally->damage( $p1, 1 );
    cmp_deeply(
        $rally->{packets},
        [
            {   cmd    => 'death',
                player => $p1->{id},
                lives  => 2
            }
        ]
    );
};

subtest 'over damage' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );

    $p1->{public}{registers} = [ r(0), r(1), r(2), r(3), r(4) ];

    $p1->drop_packets;
    $rally->damage( $p1, 8 );
    cmp_deeply(
        $rally->{packets},
        [
            {   cmd       => 'damage',
                player    => $p1->{id},
                damage    => 8,
                registers => [ N, L, L, L, L ]
            }
        ]
    );

    $p1->drop_packets;
    $rally->damage( $p1, 4 );
    cmp_deeply(
        $rally->{packets},
        [
            {   cmd    => 'death',
                player => $p1->{id},
                lives  => 2
            }
        ]
    );

    done;
};

subtest 'lock registers when shutdown' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    cmp_deeply( $p1->{public}{registers}, [ EMPTY, EMPTY, EMPTY, EMPTY, EMPTY ] );
    $rally->damage( $p1, 5 );
    cmp_deeply( $p1->{public}{registers}, [ EMPTY, EMPTY, EMPTY, EMPTY, LOCK ] );
    $rally->damage( $p1, 3 );
    cmp_deeply( $p1->{public}{registers}, [ EMPTY, LOCK, LOCK, LOCK, LOCK ] );
    done;
};

done_testing;
