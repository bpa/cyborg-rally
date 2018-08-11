use strict;
use warnings;
use Test::More;
use Test::Deep;
use CyborgTest;
use List::MoreUtils 'firstidx';

subtest 'No options' => sub {
    my ( $rally, @p ) = Game( {} );
    $rally->drop_packets;
    $rally->set_state('CONFIGURE');
    $rally->update;
    is( ref( $rally->{state} ), 'State::Movement' );

    done;
};

subtest 'Activate Gyroscopic Stabilizer' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->give_option( $p1, 'Gyroscopic Stabilizer' );
    $rally->drop_packets;
    $rally->set_state('CONFIGURE');
    $rally->update;
    is( ref( $rally->{state} ), 'State::Configuring' );

    ok( !$p1->{public}{ready}, 'Player 1 needs to make a choice' );
    ok( $p2->{public}{ready},  'Player 2 should be ready' );

    $p2->player(
        { cmd => 'stabilizer', activate => 1 },
        { cmd => 'error',      reason   => 'Invalid Option' }
    );

    $p1->broadcast(
        { cmd => 'stabilizer', activate => 1 },
        { cmd => 'state',      state    => 'Executing' },
        { cmd => 'state',      state    => 'Movement' },
        { cmd => 'move',       order    => ignore },
    );

    ok( $p1->{public}{options}{'Gyroscopic Stabilizer'}{tapped},
        'Gyroscopic Stabilizer is tapped' );

    done;
};

subtest 'Inactive Gyroscopic Stabilizer' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->give_option( $p1, 'Gyroscopic Stabilizer' );
    $rally->drop_packets;
    $rally->set_state('CONFIGURE');
    $rally->update;
    is( ref( $rally->{state} ), 'State::Configuring' );

    ok( !$p1->{public}{ready}, 'Player 1 needs to make a choice' );
    ok( $p2->{public}{ready},  'Player 2 should be ready' );

    $p1->broadcast(
        { cmd => 'stabilizer', activate => 0 },
        { cmd => 'state',      state    => 'Executing' },
        { cmd => 'state',      state    => 'Movement' },
        { cmd => 'move',       order    => ignore },
    );

    ok( !defined $p1->{public}{options}{'Gyroscopic Stabilizer'}{tapped},
        'Gyroscopic Stabilizer is not tapped' );

    done;
};

subtest 'Limited reconfigure' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->give_option( $p1, 'Gyroscopic Stabilizer' );
    $rally->give_option( $p2, 'Flywheel' );
    $rally->drop_packets;
    $rally->set_state('CONFIGURE');
    $rally->update;
    is( ref( $rally->{state} ), 'State::Configuring' );

    ok( !$p1->{public}{ready} );
    ok( !$p2->{public}{ready} );
    is( keys %{ $rally->{state}{choices} }, 2 );

    $p2->player(
        { cmd => 'stabilizer', activate => 1 },
        { cmd => 'error',      reason   => 'Invalid Option' }
    );

    $p1->broadcast( { cmd => 'stabilizer', activate => 1 } );
    ok( $p1->{public}{options}{'Gyroscopic Stabilizer'}{tapped},
        'Gyroscopic Stabilizer is tapped' );
    is( keys %{ $rally->{state}{choices} }, 1 );

    $p1->broadcast( { cmd => 'stabilizer', activate => '' } );
    ok( !defined $p1->{public}{options}{'Gyroscopic Stabilizer'}{tapped},
        'Gyroscopic Stabilizer is not tapped' );
    is( keys %{ $rally->{state}{choices} }, 1 );

    $p2->{private}{cards} = Deck->new( $rally->{movement}->deal );
    $p2->broadcast(
        { cmd => 'flywheel', card  => $p2->{private}{cards}{cards}[0] },
        { cmd => 'state',    state => 'Executing' },
        { cmd => 'state',    state => 'Movement' },
        { cmd => 'move',     order => ignore },
    );
    done;
};

done_testing;
