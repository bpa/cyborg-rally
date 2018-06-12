use strict;
use warnings;
use Test::More;
use Test::Deep;
use CyborgTest;

subtest 'on_enter for two' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->drop_packets;
    $rally->set_state('ANNOUNCE');
    $rally->update;
    is( ref( $rally->{state} ),  'State::Announcing' );
    is( $p1->{public}{shutdown}, '' );
    is( $p2->{public}{shutdown}, '' );
    cmp_deeply(
        $rally->{packets},
        [   { cmd => 'state', state    => 'Announcing' },
            { cmd => 'timer', duration => '10000', start => ignore }
        ]
    );

    done;
};

subtest 'want shutdown' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->set_state('ANNOUNCE');
    $rally->update;
    $rally->drop_packets;

    is( ref( $rally->{state} ), 'State::Announcing' );
    $p1->game( { cmd => 'shutdown', activate => 0 } );
    is( $p1->{public}{shutdown}, '' );
    is( ref( $rally->{state} ),  'State::Announcing' );
    $p2->game( { cmd => 'shutdown', activate => 1 } );
    is( $p1->{public}{shutdown}, '' );
    is( ref( $rally->{state} ),  'State::Movement' );

    is( $p1->{public}{shutdown},      '' );
    is( $p2->{public}{will_shutdown}, 1 );

    done;
};

subtest 'no shutdown' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->set_state('ANNOUNCE');
    $rally->update;
    $rally->drop_packets;

    $p1->game( { cmd => 'shutdown', activate => 0 } );
    $p2->game( { cmd => 'shutdown', activate => 0 } );

    is( ref( $rally->{state} ),  'State::Movement' );
    is( $p1->{public}{shutdown}, '' );
    is( $p2->{public}{shutdown}, '' );

    done;
};

done_testing;
