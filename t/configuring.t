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

subtest 'All options' => sub {
    my ( $rally, @p ) = Game( {} );
    $rally->give_option( $p[0], 'Flywheel' );
    $rally->give_option( $p[0], 'Conditional Program' );
    $rally->give_option( $p[0], 'Gyroscopic Stabilizer' );
    $rally->set_state('CONFIGURE');
    $rally->update;
    $rally->drop_packets;
    is( ref( $rally->{state} ), 'State::Configuring' );

    $p[0]->player(
        { cmd => 'configure', option => 'Gyroscopic Stabilizer', activate => 1 },
        { cmd => 'error',     reason => re('Missing config for .*') }
    );

    done;
};

subtest 'Activate Gyroscopic Stabilizer' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->give_option( $p1, 'Gyroscopic Stabilizer' );
    $rally->set_state('CONFIGURE');
    $rally->update;
    is( ref( $rally->{state} ), 'State::Configuring' );

    ok( !$p1->{public}{ready}, 'Player 1 needs to make a choice' );
    ok( $p2->{public}{ready},  'Player 2 should be ready' );

    $p2->broadcast( { cmd => 'configure' },
        { cmd => 'options', player => $p2->{id}, options => {} } );

    $p1->broadcast(
        { cmd => 'configure', 'Gyroscopic Stabilizer' => 1 },
        { cmd => 'options',   player                  => $p1->{id}, options => ignore },
        { cmd => 'ready',     player                  => $p1->{id} },
        { cmd => 'state',     state                   => 'Executing' },
        { cmd => 'state',     state                   => 'ConditionalProgramming' },
        { cmd => 'state',     state                   => 'Movement' },
        { cmd => 'move',      order                   => ignore },
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
        { cmd => 'configure', 'Gyroscopic Stabilizer' => 0 },
        { cmd => 'options',   player                  => $p1->{id}, options => ignore },
        { cmd => 'ready',     player                  => $p1->{id} },
        { cmd => 'state',     state                   => 'Executing' },
        { cmd => 'state',     state                   => 'ConditionalProgramming' },
        { cmd => 'state',     state                   => 'Movement' },
        { cmd => 'move',      order                   => ignore },
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

    cmp_deeply(
        $p2->{packets},
        [
            {   cmd   => 'remaining',
                cards => noclass( $p2->{private}{cards}{cards} )
            }
        ]
    );
    $p2->drop_packets;

    $p1->broadcast(
        { cmd => 'configure', 'Gyroscopic Stabilizer' => 1 },
        {   cmd     => 'options',
            player  => $p1->{id},
            options => noclass( $p1->{public}{options} )
        },
        { cmd => 'ready', player => $p1->{id} }
    );
    ok( $p1->{public}{options}{'Gyroscopic Stabilizer'}{tapped},
        'Gyroscopic Stabilizer is tapped' );

    $p1->broadcast(
        { cmd => 'configure', 'Gyroscopic Stabilizer' => '' },
        {   cmd     => 'options',
            player  => $p1->{id},
            options => noclass( $p1->{public}{options} )
        }
    );
    ok( !exists $p1->{public}{options}{'Gyroscopic Stabilizer'}{tapped},
        'Gyroscopic Stabilizer is not tapped' );

    $p2->broadcast(
        {   cmd      => 'configure',
            Flywheel => $p2->{private}{cards}{cards}[0]
        },
        {   cmd     => 'options',
            player  => $p2->{id},
            options => noclass( $p2->{public}{options} )
        },
        { cmd => 'ready', player => $p2->{id} },
        { cmd => 'state', state  => 'Executing' },
        { cmd => 'state', state  => 'ConditionalProgramming' },
        { cmd => 'state', state  => 'Movement' },
        { cmd => 'move',  order  => ignore },
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

    $p1->player(
        { cmd => 'configure', Flywheel => $not_held },
        { cmd => 'error',     reason   => 'Invalid card' },
    );
    ok( !defined $p1->{public}{options}{Flywheel}{card} );

    my $held = $p1->{private}{cards}{cards}[0];
    $p1->broadcast(
        { cmd => 'configure', Flywheel => $held },
        { cmd => 'options',   player   => $p1->{id}, options => ignore },
        { cmd => 'ready',     player   => $p1->{id} },
        { cmd => 'state',     state    => 'Executing' },
        { cmd => 'state',     state    => 'ConditionalProgramming' },
        { cmd => 'state',     state    => 'Movement' },
        { cmd => 'move',      order    => ignore },
    );

    cmp_deeply( $p1->{public}{options}{Flywheel}{card}, $held );

    done;
};

subtest 'One card, two possible option card, set card then none' => sub {
    my ( $rally, $p1, $p2, $card, $options ) = setupOneCard();

    $p1->broadcast(
        {   cmd                   => 'configure',
            Flywheel              => 'null',
            'Conditional Program' => 'null'
        },
        optionMsg($p1),
        { cmd => 'ready', player => $p1->{id} },
    );

    $p1->broadcast(
        {   cmd                   => 'configure',
            Flywheel              => $card,
            'Conditional Program' => 'null'
        },
        optionMsg( $p1, $card, undef )
    );
    is( ref( $rally->{state} ), 'State::Configuring' );

    complete(
        $rally, $p1, $p2,
        {   cmd                   => 'configure',
            Flywheel              => 'null',
            'Conditional Program' => 'null',
        },
        optionMsg( $p1, undef, undef )
    );

    done;
};

subtest 'One card, two possible option card, set none then card' => sub {
    my ( $rally, $p1, $p2, $card, $options ) = setupOneCard();

    $p1->broadcast(
        {   cmd                   => 'configure',
            Flywheel              => 'null',
            'Conditional Program' => 'null',
        },
        optionMsg( $p1, undef, undef ),
        { cmd => 'ready', player => $p1->{id} }
    );

    complete(
        $rally, $p1, $p2,
        {   cmd                   => 'configure',
            Flywheel              => $card,
            'Conditional Program' => 'null',
        },
        optionMsg( $p1, $card, undef )
    );

    done;
};

subtest 'Flywheel and one card' => sub {
    my ( $rally, $p1 ) = Game( {} );

    $rally->give_option( $p1, 'Flywheel' );
    $p1->{private}{cards}->deal(3);
    $rally->drop_packets;
    $rally->set_state('CONFIGURE');
    $rally->update;

    is( ref( $rally->{state} ), 'State::Movement' );

    done;
};

subtest 'Flywheel, Gyroscopic Stabilizer and one card' => sub {
    my ( $rally, $p1 ) = Game( {} );

    $rally->give_option( $p1, 'Flywheel' );
    $rally->give_option( $p1, 'Gyroscopic Stabilizer' );
    $p1->{private}{cards}->deal(3);
    $rally->drop_packets;
    $rally->set_state('CONFIGURE');
    $rally->update;

    is( ref( $rally->{state} ), 'State::Configuring' );

    done;
};

subtest 'Conditional Program and one card' => sub {
    my ( $rally, $p1 ) = Game( {} );

    $rally->give_option( $p1, 'Conditional Program' );
    $p1->{private}{cards}->deal(3);
    $rally->drop_packets;
    $rally->set_state('CONFIGURE');
    $rally->update;

    is( ref( $rally->{state} ), 'State::Configuring' );

    done;
};

subtest 'One card, two possible option card, set none then none' => sub {
    my ( $rally, $p1, $p2, $card, $options ) = setupOneCard();

    $p1->broadcast(
        {   cmd                   => 'configure',
            'Flywheel'            => 'null',
            'Conditional Program' => 'null'
        },
        optionMsg($p1),
        { cmd => 'ready', player => $p1->{id} }
    );

    complete(
        $rally, $p1, $p2,
        {   cmd                   => 'configure',
            Flywheel              => 'null',
            'Conditional Program' => 'null'
        },
        optionMsg($p1)
    );

    done;
};

sub setupOneCard {
    local $Test::Builder::Level = $Test::Builder::Level + 1;
    my ( $rally, $p1, $p2 ) = Game( {} );

    $rally->give_option( $p1, 'Flywheel' );
    $rally->give_option( $p1, 'Conditional Program' );
    $rally->give_option( $p2, 'Gyroscopic Stabilizer' );
    $p1->{private}{cards}->deal(3);
    $rally->set_state('CONFIGURE');
    $rally->update;
    $rally->drop_packets;

    is( ref( $rally->{state} ), 'State::Configuring' );
    is( $p1->{private}{cards}->count, 1, 'Have one card for two options' );

    my $card    = $p1->{private}{cards}{cards}[0];
    my $options = $p1->{public}{options};

    return ( $rally, $p1, $p2, $card, $options );
}

sub optionMsg {
    my ( $p1, $flywheel, $conditional_programming ) = @_;
    return {
        cmd     => 'options',
        player  => $p1->{id},
        options => {
            'Flywheel' => {
                name => ignore,
                text => ignore,
                uses => 0,
                defined($flywheel) ? ( card => noclass($flywheel) ) : (),
            },
            'Conditional Program' => {
                name => ignore,
                text => ignore,
                uses => 0,
                defined($conditional_programming)
                ? ( card => noclass($conditional_programming) )
                : (),
            },
        }
    };
}

sub complete {
    local $Test::Builder::Level = $Test::Builder::Level + 1;
    my $rally = shift;
    my $p1    = shift;
    my $p2    = shift;
    $p1->broadcast(@_);
    $p2->broadcast(
        { cmd => 'configure', 'Gyroscopic Stabilizer' => 0 },
        { cmd => 'options',   player                  => $p2->{id}, options => ignore },
        { cmd => 'ready',     player                  => $p2->{id} },
        { cmd => 'state',     state                   => 'Executing' },
        { cmd => 'state',     state                   => 'ConditionalProgramming' },
        { cmd => 'state',     state                   => 'Movement' },
        { cmd => 'move',      order                   => ignore },
    );
    is( ref( $rally->{state} ), 'State::Movement' );
}

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

subtest 'Dead and shutdown' => sub {
    my ( $rally, $p1, $p2, $p3 ) = Game( {}, 3 );
    $p1->{public}{dead}     = 1;
    $p2->{public}{shutdown} = 1;
    $rally->give_option( $p1, 'Conditional Program' );
    $rally->give_option( $p2, 'Gyroscopic Stabilizer' );
    $rally->drop_packets;
    $rally->set_state('CONFIGURE');
    $rally->update;
    is( ref( $rally->{state} ), 'State::Movement' );

    done;
};

done_testing;
