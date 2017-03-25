use strict;
use warnings;
use Test::More;
use Test::Deep;
use CyborgTest;

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

done_testing;
