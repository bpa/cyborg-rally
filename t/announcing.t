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
    is( ref( $rally->{state} ), 'State::Announcing' );
    is( $p1->{public}{shutdown}, undef );
    is( $p2->{public}{shutdown}, undef );
    cmp_deeply(
        $rally->{packets},
        [   { cmd => 'state', state => 'Announcing' },
            { cmd => 'time',  limit => '10s' }
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
    is( ref( $rally->{state} ), 'State::Announcing' );
    $p2->game( { cmd => 'shutdown', activate => 1 } );
    is( ref( $rally->{state} ), 'State::Movement' );

    is( $p1->{public}{shutdown}, '' );
    is( $p2->{public}{shutdown}, 1 );

    done;
};

subtest 'no shutdown' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->set_state('ANNOUNCE');
    $rally->update;
    $rally->drop_packets;

    $p1->game( { cmd => 'shutdown', activate => 0 } );
    $p2->game( { cmd => 'shutdown', activate => 0 } );

    is( ref( $rally->{state} ), 'State::Movement' );
    is( $p1->{public}{shutdown}, '' );
    is( $p2->{public}{shutdown}, '' );

    done;
};

done_testing;