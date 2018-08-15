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
        {   cmd     => 'options',
            player  => $p1->{id},
            options => noclass( $p1->{public}{options} ),
        },
        { cmd => 'state', state => 'Executing' },
        { cmd => 'state', state => 'Movement' },
        { cmd => 'move',  order => ignore },
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
        {   cmd     => 'options',
            player  => $p1->{id},
            options => noclass( $p1->{public}{options} ),
        },
        { cmd => 'state', state => 'Executing' },
        { cmd => 'state', state => 'Movement' },
        { cmd => 'move',  order => ignore },
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

    cmp_deeply(
        $p2->{packets},
        [
            {   cmd   => 'remaining',
                cards => noclass( $p2->{private}{cards}{cards} )
            }
        ]
    );
    $p2->drop_packets;

    $p2->player(
        { cmd => 'stabilizer', activate => 1 },
        { cmd => 'error',      reason   => 'Invalid Option' }
    );

    $p1->broadcast(
        { cmd => 'stabilizer', activate => 1 },
        {   cmd     => 'options',
            player  => $p1->{id},
            options => noclass( $p1->{public}{options} ),
        }
    );
    ok( $p1->{public}{options}{'Gyroscopic Stabilizer'}{tapped},
        'Gyroscopic Stabilizer is tapped' );
    is( keys %{ $rally->{state}{choices} }, 1 );

    $p1->broadcast(
        { cmd => 'stabilizer', activate => '' },
        {   cmd     => 'options',
            player  => $p1->{id},
            options => noclass( $p1->{public}{options} ),
        }
    );
    ok( !defined $p1->{public}{options}{'Gyroscopic Stabilizer'}{tapped},
        'Gyroscopic Stabilizer is not tapped' );
    is( keys %{ $rally->{state}{choices} }, 1 );

    $p2->broadcast(
        { cmd => 'flywheel', card  => $p2->{private}{cards}{cards}[0] },
        { cmd => 'state',    state => 'Executing' },
        { cmd => 'state',    state => 'Movement' },
        { cmd => 'move',     order => ignore },
    );
    done;
};

subtest 'Flywheel' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->give_option( $p1, 'Flywheel' );
    my $not_held = $rally->{movement}->deal;

    $rally->drop_packets;
    $rally->set_state('CONFIGURE');
    $rally->update;
    $rally->drop_packets;
    is( ref( $rally->{state} ), 'State::Configuring' );

    ok( !$p1->{public}{ready} );
    ok( $p2->{public}{ready} );
    is( keys %{ $rally->{state}{choices} }, 1 );

    $p2->player( { cmd => 'flywheel' },
        { cmd => 'error', reason => 'Invalid Option' } );

    $p1->player(
        { cmd => 'flywheel', card   => $not_held },
        { cmd => 'error',    reason => 'Invalid card' },
    );
    ok( !defined $p1->{public}{options}{Flywheel}{card} );

    my $held = $p1->{private}{cards}{cards}[0];
    $p1->broadcast(
        { cmd => 'flywheel', card  => $held },
        { cmd => 'state',    state => 'Executing' },
        { cmd => 'state',    state => 'Movement' },
        { cmd => 'move',     order => ignore },
    );

    cmp_deeply( $p1->{public}{options}{Flywheel}{card}, $held );

    done;
};

subtest 'Flywheel but no extra cards' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->give_option( $p1, 'Flywheel' );
    $p1->{private}{cards}->deal(4);

    $rally->drop_packets;
    $rally->set_state('CONFIGURE');
    $rally->update;
    is( ref( $rally->{state} ), 'State::Movement' );

    done;
};

done_testing;
