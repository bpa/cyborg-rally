use strict;
use warnings;
use Test::More;
use Test::Deep;
use CyborgTest;

subtest 'conveyors only' => sub {
    my ( $rally, $p1, $p2 ) = Game(
        {   conveyors         => 1,
            express_conveyors => 0,
            pushers           => 0,
            gears             => 0,
        }
    );
    is( ref( $rally->{states}{BOARD} ), 'State::Board' );
    is( $rally->{states}{BOARD}{name},  'conveyors' );
    is( $rally->{states}{BOARD}{next},  'FIRE' );
    $rally->drop_packets;

    $rally->set_state('BOARD');
    $rally->update;
    is( ref( $rally->{state} ), 'State::Board' );
    cmp_deeply( $rally->{packets}, [ { cmd => 'state', state => 'conveyors' }, ] );

    $rally->drop_packets;
    $p1->broadcast( { cmd => 'ready' }, { cmd => 'ready', player => $p1->{id} } );
    $p2->broadcast( { cmd => 'ready' }, { cmd => 'state', state  => 'Firing' } );
    is( ref( $rally->{state} ), 'State::Firing' );

    done;
};

subtest 'all' => sub {
    my ( $rally, $p1, $p2 ) = Game(
        {   conveyors         => 1,
            express_conveyors => 1,
            pushers           => 1,
            gears             => 1,
        }
    );
    is( ref( $rally->{states}{BOARD} ), 'State::Board' );
    is( $rally->{states}{BOARD}{name},  'express_conveyors' );
    is( $rally->{states}{BOARD}{next},  'BOARD1' );
    is( $rally->{states}{BOARD1}{name}, 'conveyors' );
    is( $rally->{states}{BOARD1}{next}, 'BOARD2' );
    is( $rally->{states}{BOARD2}{name}, 'pushers' );
    is( $rally->{states}{BOARD2}{next}, 'BOARD3' );
    is( $rally->{states}{BOARD3}{name}, 'gears' );
    is( $rally->{states}{BOARD3}{next}, 'FIRE' );

    done;
};

subtest 'none' => sub {
    my ( $rally, $p1, $p2 ) = Game(
        {   conveyors         => 0,
            express_conveyors => 0,
            pushers           => 0,
            gears             => 0,
        }
    );
    is( ref( $rally->{states}{BOARD} ), 'State::Firing' );

    done;
};

done_testing;
