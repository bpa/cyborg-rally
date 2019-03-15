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
    my ( $rally, $p1, $p2 ) = setup();

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
    my ( $rally, $p1, $p2 ) = setup();

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
    my ( $rally, $p1, $p2 ) = setup();

    cmp_deeply( $p1->{public}{registers}, [ EMPTY, EMPTY, EMPTY, EMPTY, EMPTY ] );
    $rally->{state}->damage( $rally, $p1, 5 );
    cmp_deeply( $p1->{public}{registers}, [ EMPTY, EMPTY, EMPTY, EMPTY, LOCK ] );
    $rally->{state}->damage( $rally, $p1, 3 );
    cmp_deeply( $p1->{public}{registers}, [ EMPTY, LOCK, LOCK, LOCK, LOCK ] );
    done;
};

subtest 'option for damage' => sub {
    my ( $rally, $p1, $p2 ) = setup('Brakes');

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

subtest 'Normal damage with no shield' => sub {
    my ( $rally, $p1 ) = setup();

    $p1->{public}{shutdown} = '';
    $rally->{state}->damage( $rally, $p1, 1 );
    is( $p1->{public}{damage}, 1 );

    done;
};

subtest 'Power-Down Shield' => sub {
    my %cases = (
        0 => { dmg => 0, pending => 0 },
        1 => { dmg => 0, pending => 0 },
        2 => { dmg => 0, pending => 1 },
        3 => { dmg => 1, pending => 1 },
    );
    while ( my ( $give, $test ) = each %cases ) {
        my ( $rally, $p1 ) = setup('Power-Down Shield');

        $p1->{public}{shutdown} = 1;
        $rally->{state}{public}{pending_damage}{ $p1->{id} } = 0;

        $rally->{state}->damage( $rally, $p1, $give );
        my $name = "Hit for $give produces";
        is( $p1->{public}{damage}, $test->{dmg}, "$name $test->{dmg} damage" );
        is( $rally->{state}{public}{pending_damage}{ $p1->{id} },
            $test->{pending}, "$name $test->{pending} pending" );
    }

    done;
};

subtest "Power-Down Shield + Ablative Coat" => sub {
    my %cases = (
        1 => { dmg => 0, uses => 3, pending => 0 },
        2 => { dmg => 0, uses => 2, pending => 0 },
        3 => { dmg => 0, uses => 1, pending => 0 },
        4 => { dmg => 0, uses => 0, pending => 0 },
        5 => { dmg => 0, uses => 0, pending => 1 },
        6 => { dmg => 1, uses => 0, pending => 1 },
        7 => { dmg => 2, uses => 0, pending => 1 },
    );

    while ( my ( $give, $test ) = each %cases ) {
        my ( $rally, $p1 ) = setup( 'Power-Down Shield', 'Ablative Coat' );
        $p1->{public}{shutdown} = 1;
        $rally->{state}{public}{pending_damage}{ $p1->{id} } = 0;

        $rally->{state}->damage( $rally, $p1, $give );
        my $ablative_coat = $p1->{public}{options}{'Ablative Coat'};
        unless ( defined $ablative_coat ) {
            $ablative_coat = { uses => 0, text => '', name => 'Ablative Coat' };
        }

        my $name = "Hit for $give produces";
        is( $p1->{public}{damage}, $test->{dmg}, "$name $test->{dmg} damage" );
        is( $rally->{state}{public}{pending_damage}{$p1->{id}}, $test->{pending}, "$name $test->{uses} uses of Ablative Coat");
        cmp_deeply( $ablative_coat,
            noclass( { uses => $test->{uses}, text => ignore, name => ignore } ),
            "$name $test->{pending} pending");
    }

    done;
};

sub setup {
    my ( $rally, $p1, $p2 ) = Game( {} );

    $p1->{public}{registers} = [ r(0), r(1), r(2), r(3), r(4) ];

    for my $option (@_) {
        $rally->give_option($p1, $option);
    }

    $rally->{state} = bless( {}, 'DamageState' );
    $p1->drop_packets;

    return $rally, $p1, $p2;
};

done_testing;

package DamageState;
use parent qw/State DamageHandler/;

sub on_damage_resolved {}
