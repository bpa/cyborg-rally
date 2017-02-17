use strict;
use warnings;
use Test::More;
use Test::Deep;
use CyborgTest;
use Data::Dumper;

subtest 'Everyone shutdown' => sub {
    my ( $rally, $p1, $p2 ) = Game( { conveyors => 1, board_lasers => 1 } );
    $p1->{public}{shutdown} = 1;
    $p2->{public}{shutdown} = 1;
    $rally->drop_packets;

    $rally->set_state('PROGRAM');
    $rally->update;

    is( ref( $rally->{state} ), 'State::Board' );
    is( $rally->{state}{name},  'conveyors' );

    $p1->game('ready');
    $p2->game('ready');

    is( ref( $rally->{state} ), 'State::Lasers' );

    $p1->game('laser');
    $p2->game('laser');

    is( ref( $rally->{state} ), 'State::Touching' );

    $p1->game( { cmd => 'touch', tile => 'floor' } );
    $p2->game( { cmd => 'touch', tile => 'floor' } );

    is( ref( $rally->{state} ), 'State::Board' );
    is( $rally->{state}{name},  'conveyors' );

    done;
};

subtest 'shutdown or dead' => sub {
    my ( $rally, $p1, $p2 ) = Game( { conveyors => 1, board_lasers => 1 } );
    $p1->{public}{dead} = 1;
    $p2->{public}{shutdown} = 1;
    $rally->drop_packets;

    $rally->set_state('PROGRAM');
    $rally->update;

    is( ref( $rally->{state} ), 'State::Board' );
    is( $rally->{state}{name},  'conveyors' );

    $p2->game('ready');

    is( ref( $rally->{state} ), 'State::Lasers' );

    $p2->game('laser');

    is( ref( $rally->{state} ), 'State::Touching' );

    $p2->game( { cmd => 'touch', tile => 'floor' } );

    is( ref( $rally->{state} ), 'State::Board' );
    is( $rally->{state}{name},  'conveyors' );

    done;
};

subtest 'shutdown or out' => sub {
    my ( $rally, $p1, $p2 ) = Game( { conveyors => 1, board_lasers => 1 } );
    $p1->{public}{dead} = 1;
    $p1->{public}{lives} = 0;
    $p2->{public}{shutdown} = 1;
    $rally->drop_packets;

    $rally->set_state('PROGRAM');
    $rally->update;

    is( ref( $rally->{state} ), 'State::Board' );
    is( $rally->{state}{name},  'conveyors' );

    $p2->game('ready');

    is( ref( $rally->{state} ), 'State::Lasers' );

    $p2->game('laser');

    is( ref( $rally->{state} ), 'State::Touching' );

    $p2->game( { cmd => 'touch', tile => 'floor' } );

    is( ref( $rally->{state} ), 'State::Board' );
    is( $rally->{state}{name},  'conveyors' );

    done;
};

subtest 'everyone dead' => sub {
    my ( $rally, $p1, $p2 ) = Game( { conveyors => 1, board_lasers => 1 } );
    $p1->{public}{dead} = 1;
    $p2->{public}{dead} = 1;
    $rally->drop_packets;

    $rally->set_state('PROGRAM');
    $rally->update;

    is( ref( $rally->{state} ), 'State::Revive' );

    done;
};

done_testing;
