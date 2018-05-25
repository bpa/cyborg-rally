use strict;
use warnings;
use Test::More;
use Test::Deep;
use CyborgTest;

subtest 'powered down decision' => sub {
    my ( $rally, $p1, $p2, $p3 ) = Game( {}, 3 );
    $rally->drop_packets;
    $p2->{public}{shutdown} = 1;
    $p3->{public}{shutdown} = 1;
    $rally->set_state('POWER');
    $rally->update;
    is( ref( $rally->{state} ), 'State::PowerDown' );

    cmp_deeply( $p1->{packets}, [] );
    cmp_deeply( $p2->{packets}, [ { cmd => 'declare_shutdown' } ] );
    $p2->drop_packets;

    $p1->game( shutdown => { activate => 1 } );
    cmp_deeply( $p1->{packets}, [] );
    is( !!$p1->{public}{shutdown}, '' );

    $p2->game( shutdown => { activate => 1 } );
    is( $p2->{public}{shutdown}, 1 );

    $p3->broadcast(
        { cmd => 'shutdown', activate => 1 },
        { cmd => 'shutdown', activate => 1, player => $p3->{id} },
        { cmd => 'state',    state    => 'Programming' }
    );

    is( ref( $rally->{state} ), 'State::Programming' );

    done;
};

subtest 'skip phase if no powered down' => sub {
    my ( $rally, $p1, $p2, $p3 ) = Game( {} );
    $p2->{public}{lives} = 0;
    $p2->{public}{dead}  = 1;
    $rally->set_state('POWER');
    $rally->update;
    is( ref( $rally->{state} ), 'State::Programming' );

    done;
};

subtest 'Emergency Shutdown' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->drop_packets;
    $rally->give_option($p2, 'Emergency Shutdown');
    $p2->{public}{damage}  = 3;
    $rally->set_state('POWER');
    $rally->update;
    is( ref( $rally->{state} ), 'State::PowerDown' );
    cmp_deeply( $p1->{packets}, [] );
    cmp_deeply( $p2->{packets}, [ { cmd => 'declare_shutdown' } ] );

    done;
};

subtest 'Emergency Shutdown, two damage' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->give_option($p2, 'Emergency Shutdown');
    $p2->{public}{damage}  = 2;
    $rally->set_state('POWER');
    $rally->update;
    is( ref( $rally->{state} ), 'State::Programming' );
    is( $p2->{public}{shutdown}, '', 'No Shutdown' );

    done;
};

done_testing();
