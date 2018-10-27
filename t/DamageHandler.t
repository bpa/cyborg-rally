use strict;
use warnings;
use Test::More;
use Test::Deep;
use CyborgTest;
use Scalar::Util 'looks_like_number';
use List::Util;

use constant EMPTY => { damaged => '', locked => '', program => [] };
use constant LOCK => {
    damaged => 1,
    locked  => 1,
    program => code(
        sub {
            return ( 0, "No program" ) unless @{ $_[0] };
            return ( 0, "Program has invalid card" )
              if List::Util::any { ref($_) ne 'Card' } @{ $_[0] };
            return 1;
        }
    )
};

subtest 'normal damage' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );

    $p1->{public}{registers} = [ r(0), r(1), r(2), r(3), r(4) ];

    $p1->drop_packets;
    $rally->{state} = bless( {}, 'DamageState' );

    $rally->{state}->damage( $rally, $p1, 4 );
    cmp_deeply(
        $rally->{packets},
        [
            {   cmd       => 'damage',
                player    => $p1->{id},
                damage    => 4,
                registers => [ N, N, N, N, N ]
            }
        ]
    );

    $p1->drop_packets;
    $rally->{state}->damage( $rally, $p1, 1 );
    cmp_deeply(
        $rally->{packets},
        [
            {   cmd       => 'damage',
                player    => $p1->{id},
                damage    => 5,
                registers => [ N, N, N, N, D ]
            }
        ]
    );

    $p1->drop_packets;
    $rally->{state}->damage( $rally, $p1, 4 );
    cmp_deeply(
        $rally->{packets},
        [
            {   cmd       => 'damage',
                player    => $p1->{id},
                damage    => 9,
                registers => [ D, D, D, D, D ]
            }
        ]
    );

    $p1->drop_packets;
    $rally->{state}->damage( $rally, $p1, 1 );
    cmp_deeply(
        $rally->{packets},
        [
            {   cmd    => 'death',
                player => $p1->{id},
                lives  => 2
            }
        ]
    );
};

subtest 'over damage' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );

    $p1->{public}{registers} = [ r(0), r(1), r(2), r(3), r(4) ];

    $rally->{state} = bless( {}, 'DamageState' );
    $p1->drop_packets;
    $rally->{state}->damage( $rally, $p1, 8 );
    cmp_deeply(
        $rally->{packets},
        [
            {   cmd       => 'damage',
                player    => $p1->{id},
                damage    => 8,
                registers => [ N, D, D, D, D ]
            }
        ]
    );

    $p1->drop_packets;
    $rally->{state}->damage( $rally, $p1, 4 );
    cmp_deeply(
        $rally->{packets},
        [
            {   cmd    => 'death',
                player => $p1->{id},
                lives  => 2
            }
        ]
    );

    done;
};

subtest 'lock registers when shutdown' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->{state} = bless( {}, 'DamageState' );
    cmp_deeply( $p1->{public}{registers}, [ EMPTY, EMPTY, EMPTY, EMPTY, EMPTY ] );
    $rally->{state}->damage( $rally, $p1, 5 );
    cmp_deeply( $p1->{public}{registers}, [ EMPTY, EMPTY, EMPTY, EMPTY, LOCK ] );
    $rally->{state}->damage( $rally, $p1, 3 );
    cmp_deeply( $p1->{public}{registers}, [ EMPTY, LOCK, LOCK, LOCK, LOCK ] );
    done;
};

subtest 'option for damage' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->drop_packets;
    $rally->{state} = bless( {}, 'DamageState' );
    $rally->give_option( $p1, 'Brakes' );
    $p1->{public}{ready} = 1;
    $p2->{public}{ready} = 1;
    is( $rally->ready, 1 );

    $rally->{state}->damage( $rally, $p1, 1 );
    is( $rally->ready, '' );

    cmp_deeply( $rally->{packets}, [] );
    cmp_deeply( $p1->{packets}, [ { cmd => 'pending_damage', damage => 1 } ] );

    $p2->player(
        { cmd => 'damage', target => 'robot' },
        { cmd => 'error',  reason => 'No damage' }
    );

    $p1->broadcast(
        { cmd => 'damage', target => 'Brakes' },
        {   cmd     => 'options',
            player  => $p1->{id},
            options => {}
        }
    );

    cmp_deeply( $p1->{packets}, [ { cmd => 'pending_damage', damage => 0 } ] );

    is( $rally->ready, 1 );

    done;
};

subtest 'keep damage' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->drop_packets;
    $rally->{state} = bless( {}, 'DamageState' );
    $rally->give_option( $p1, 'Brakes' );

    $rally->{state}->damage( $rally, $p1, 1 );
    cmp_deeply( $p1->{packets}, [ { cmd => 'pending_damage', damage => 1 } ] );
    cmp_deeply( $rally->{state}{public}{pending_damage}, { $p1->{id} => 1 } );

    $p1->broadcast(
        { cmd => 'damage', target => 'robot' },
        {   cmd       => 'damage',
            player    => $p1->{id},
            damage    => 1,
            registers => [ N, N, N, N, N ]
        }
    );

    cmp_deeply( $p1->{packets}, [ { cmd => 'pending_damage', damage => 0 } ] );
    cmp_deeply( $rally->{state}{public}{pending_damage}, {} );

    done;
};

subtest 'split damage' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->drop_packets;
    $rally->{state} = bless( {}, 'DamageState' );
    $rally->give_option( $p1, 'Brakes' );
    $rally->give_option( $p1, 'Flywheel' );

    $rally->{state}->damage( $rally, $p1, 2 );
    cmp_deeply( $p1->{packets}, [ { cmd => 'pending_damage', damage => 2 } ] );
    cmp_deeply( $rally->{state}{public}{pending_damage}, { $p1->{id} => 2 } );

    $p1->broadcast(
        { cmd => 'damage', target => [ 'robot', 'Brakes' ] },
        {   cmd       => 'damage',
            player    => $p1->{id},
            damage    => 1,
            registers => [ N, N, N, N, N ]
        },
        {   cmd     => 'options',
            player  => $p1->{id},
            options => { Flywheel => ignore }
        },
    );

    cmp_deeply( $p1->{packets}, [ { cmd => 'pending_damage', damage => 0 } ] );
    cmp_deeply( $rally->{state}{public}{pending_damage}, {} );

    done;
};

subtest 'one of two damage' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->drop_packets;
    $rally->{state} = bless( {}, 'DamageState' );
    $rally->give_option( $p1, 'Brakes' );
    $rally->give_option( $p1, 'Flywheel' );

    $rally->{state}->damage( $rally, $p1, 2 );
    cmp_deeply( $p1->{packets}, [ { cmd => 'pending_damage', damage => 2 } ] );
    cmp_deeply( $rally->{state}{public}{pending_damage}, { $p1->{id} => 2 } );

    $p1->broadcast(
        { cmd => 'damage', target => ['Brakes'] },
        {   cmd     => 'options',
            player  => $p1->{id},
            options => { Flywheel => ignore }
        },
    );

    cmp_deeply( $p1->{packets}, [ { cmd => 'pending_damage', damage => 1 } ] );
    cmp_deeply( $rally->{state}{public}{pending_damage}, { $p1->{id} => 1 } );

    done;
};

subtest 'three damage' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->drop_packets;
    $rally->{state} = bless( {}, 'DamageState' );
    $rally->give_option( $p1, 'Brakes' );
    $rally->give_option( $p1, 'Flywheel' );
    $rally->give_option( $p1, 'Recompile' );

    $rally->{state}->damage( $rally, $p1, 3 );
    cmp_deeply( $p1->{packets}, [ { cmd => 'pending_damage', damage => 3 } ] );
    cmp_deeply( $rally->{state}{public}{pending_damage}, { $p1->{id} => 3 } );

    $p1->broadcast(
        { cmd => 'damage', target => [ 'robot', 'Brakes', 'robot' ] },
        {   cmd       => 'damage',
            player    => $p1->{id},
            damage    => 2,
            registers => [ N, N, N, N, N ]
        },
        {   cmd     => 'options',
            player  => $p1->{id},
            options => { Flywheel => ignore, Recompile => ignore }
        }
    );

    cmp_deeply( $p1->{packets}, [ { cmd => 'pending_damage', damage => 0 } ] );
    cmp_deeply( $rally->{state}{public}{pending_damage}, {} );

    done;
};

subtest 'corner case where damage taken kills' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->drop_packets;
    $rally->{state} = bless( {}, 'DamageState' );
    $rally->give_option( $p1, 'Brakes' );
    $rally->give_option( $p1, 'Flywheel' );
    $rally->give_option( $p2, 'Recompile' );
    $rally->give_option( $p2, 'Scrambler' );
    $p1->{public}{damage} = 9;
    $p2->{public}{damage} = 9;

    $rally->{state}->damage( $rally, $p1, 2 );
    $rally->{state}->damage( $rally, $p2, 2 );

    $p1->broadcast(
        { cmd => 'damage', target => [ 'Brakes', 'robot' ] },
        {   cmd    => 'death',
            player => $p1->{id},
            lives  => 2
        }
    );

    cmp_deeply( $p1->{packets}, [ { cmd => 'pending_damage', damage => 0 } ] );
    cmp_deeply( $p1->{public}{options}, { Brakes => ignore, Flywheel => ignore } );
    cmp_deeply( $rally->{state}{public}{pending_damage}, { $p2->{id} => 2 } );

    $p2->broadcast(
        { cmd => 'damage', target => ['robot'] },
        {   cmd    => 'death',
            player => $p2->{id},
            lives  => 2
        }
    );

    cmp_deeply( $p2->{packets}, [ { cmd => 'pending_damage', damage => 0 } ] );
    cmp_deeply( [ sort keys %{ $p2->{public}{options} } ],
        [ 'Recompile', 'Scrambler' ] );
    cmp_deeply( $rally->{state}{public}{pending_damage}, {} );

    done;
};

subtest 'damage locked register' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );

    $p1->{public}{registers} = [ r(0), r(1), r(2), r(3), r(4) ];
    $p1->{public}{registers}[4]{locked} = 1;

    $p1->drop_packets;
    $rally->{state} = bless( {}, 'DamageState' );

    cmp_deeply( $p1->{public}{registers}, [ N, N, N, N, L ]);

    $rally->{state}->damage( $rally, $p1, 5 );
    cmp_deeply(
        $rally->{packets},
        [
            {   cmd       => 'damage',
                player    => $p1->{id},
                damage    => 5,
                registers => [ N, N, N, N, D ]
            }
        ]
    );

    cmp_deeply( $p1->{public}{registers}, [ N, N, N, N, D ]);

    done;
};

done_testing;

package DamageState;
use parent qw/State DamageHandler/;

sub on_damage_resolved {}
