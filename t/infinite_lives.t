use strict;
use warnings;
use Test::More;
use Test::Deep;
use CyborgTest;

subtest 'Normal death' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;
    $rally->{state}->damage( $rally, $p1, 10 );
    is( $p1->{public}{damage}, 10 );
    is( $p1->{public}{dead}, 1 );
    is( $p1->{public}{lives}, 2 );

    cmp_deeply(
        $rally->{packets},
        [
            {   cmd       => 'death',
                player    => $p1->{id},
                lives    => 2,
            }
        ]
    );

    done;
};

subtest 'Infinite lives' => sub {
    my ( $rally, $p1, $p2 ) = Game( { lives => 'Inf' } );
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;
    $rally->{state}->damage( $rally, $p1, 10 );
    is( $p1->{public}{damage}, 10 );
    is( $p1->{public}{dead}, 1 );
    is( $p1->{public}{lives}, 1 );

    cmp_deeply(
        $rally->{packets},
        [
            {   cmd       => 'death',
                player    => $p1->{id},
                lives    => 1,
            }
        ]
    );

    done;
};

done_testing;
