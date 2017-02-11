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

done_testing();
