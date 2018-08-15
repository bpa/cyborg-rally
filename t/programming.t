use strict;
use warnings;
use Test::More;
use Test::Deep;
use CyborgTest;
use List::MoreUtils 'firstidx';

use constant FULL => {
    damaged => ignore,
    program => [
        noclass(
            {   name     => ignore,
                priority => ignore,
                number   => ignore,
                total    => ignore
            }
        )
    ]
};

use constant EMPTY => {
    damaged => ignore,
    program => []
};

sub reg {
    my ( $damaged, $card ) = @_;
    return {
        damaged => $damaged,
        program => [ noclass($card) ]
    };
}

sub cnt {
    my $num = shift;
    return code(
        sub {
            my $actual = @{ $_[0] };
            return 1 if $actual == $num;
            return 0, "Expected Array with $num elements, found $actual";
        }
    );
}

subtest 'on_enter for two' => sub {
    my ( $rally, @p ) = Game( {} );
    is( ref( $rally->{state} ), 'State::Programming' );
    for my $p (@p) {
        is( $p->{private}{cards}->count, 9, 'Got cards' );
        cmp_deeply( $p->{private}{registers},
            [ EMPTY, EMPTY, EMPTY, EMPTY, EMPTY ] );
        cmp_deeply(
            $p->{packets},
            [
                {   cmd     => 'joined',
                    game    => 'Rally',
                    name    => 'test',
                    id      => $p->{id},
                    opts    => ignore,
                    private => ignore,
                    public  => ignore,
                    state   => ignore,
                    now     => ignore,
                },
                {   cmd       => 'programming',
                    cards     => cnt(9),
                    registers => ignore,
                }
            ]
        );
    }
    done;
};

subtest 'programming' => sub {
    my ( $rally, $p1 ) = Game( {} );
    is( ref( $rally->{state} ), 'State::Programming' );

    cmp_deeply(
        $p1->{public}{registers},
        [ EMPTY, EMPTY, EMPTY, EMPTY, EMPTY ],
        'public registers empty'
    );

    #Program only one register
    program( $rally, $p1, [0] );
    cmp_deeply( $p1->{private}{registers}, [ FULL, EMPTY, EMPTY, EMPTY, EMPTY ] );
    cmp_deeply(
        $p1->{public}{registers},
        [ EMPTY, EMPTY, EMPTY, EMPTY, EMPTY ],
        'public registers not modified'
    );

    #Deprogram
    program( $rally, $p1, [] );
    cmp_deeply( $p1->{private}{registers}, [ EMPTY, EMPTY, EMPTY, EMPTY, EMPTY ] );

    my @hand = @{ $p1->{private}{cards}{cards} };

    #Program must be array of arrays
    $p1->player(
        { cmd => 'program', registers => [ $hand[0] ] },
        { cmd => 'error',   reason    => "Invalid program" }
    );

    #Program must be array of arrays
    $p1->player(
        { cmd => 'program', registers => [ [ $hand[0] ] ] },
        { cmd => 'program', registers => ignore }
    );

    #Bad format errors before invalid cards
    $p1->player(
        { cmd => 'program', registers => ['3100'] },
        { cmd => 'error',   reason    => "Invalid program" }
    );

    #Must hold card to use
    $p1->player(
        { cmd => 'program', registers => [ ['3100'] ] },
        { cmd => 'error', reason => "Invalid card" }
    );

    #Can't use same card twice
    $p1->player( { cmd => 'program', registers => [ [ $hand[0] ], [ $hand[0] ] ] },
        { cmd => 'error', reason => "Invalid program" } );

    #No options to use multiple cards in a register
    $p1->player(
        { cmd => 'program', registers => [ $hand[ 0 .. 1 ] ] },
        { cmd => 'error',   reason    => "Invalid program" }
    );

    #Can't lock in programming without all registers programmed
    $p1->player(
        {   cmd       => 'program',
            registers => [ [ $hand[0] ], [ $hand[1] ], [ $hand[2] ], [ $hand[3] ] ]
        },
        { cmd => 'program', registers => ignore() }
    );
    $p1->player( { cmd => 'ready' },
        { cmd => 'error', reason => 'Programming incomplete' } );
    is( $p1->{public}{ready}, '', 'Ready not set after error' );

    #No phantom 6th register
    $p1->game(
        {   cmd       => 'program',
            registers => [
                [ $hand[0] ],
                [ $hand[1] ],
                [ $hand[2] ],
                [ $hand[3] ],
                [ $hand[4] ],
                [ $hand[5] ]
            ]
        },
        { cmd => 'error', reason => "Invalid program" }
    );

    #Happy path
    program( $rally, $p1, [ 0, 1, 2, 3, 4 ] );
    cmp_deeply( $p1->{private}{registers}, [ FULL, FULL, FULL, FULL, FULL ] );

    #Lock program
    program( $rally, $p1, [ 0, 1, 2, 3, 4 ] );
    $p1->broadcast(
        { cmd => 'ready' },
        { cmd => 'ready', player => $p1->{id} },
        { cmd => 'timer', duration => '30000', start => ignore }
    );
    program( $rally, $p1, [0], 'Registers are already programmed' );

    done;
};

subtest 'locked registers' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );

    $rally->{state}->on_exit($rally);
    $p1->{public}{damage}                = 5;
    $p1->{public}{registers}[4]{damaged} = 1;
    $p2->{public}{damage}                = 2;
    $rally->drop_packets;
    my $locked = $p1->{public}{registers}[4];
    $rally->{state}->on_enter($rally);

    # Did p1 get set up correctly?
    cmp_deeply( $p1->{private}{registers}, [ N, N, N, N, $locked ] );

    cmp_deeply(
        $p1->{packets},
        [
            {   cmd       => 'programming',
                cards     => cnt(4),
                registers => [ EMPTY, EMPTY, EMPTY, EMPTY, noclass( j($locked) ) ]
            }
        ]
    );
    cmp_deeply(
        $p2->{packets},
        [
            {   cmd       => 'programming',
                cards     => cnt(7),
                registers => [ EMPTY, EMPTY, EMPTY, EMPTY, EMPTY ]
            }
        ]
    );

    # Register 5 is locked
    program( $rally, $p1, [ 0, 1, 2, [], 3 ], "Invalid program" );
    program( $rally, $p1, [ [], [], [], [], j( $locked->{program} ) ] );
    program( $rally, $p1, [ 2,  [], [], [], j( $locked->{program} ) ] );
    program( $rally, $p1, [ 0, 1, 2, 3, j( $locked->{program} ) ] );
    program( $rally, $p1, [ 0, 1, 2, 3 ] );

    done;
};

subtest 'dead' => sub {
    my ( $rally, $dead, $alive ) = Game( {} );
    $rally->drop_packets;

    $dead->{public}{dead}  = 1;
    $dead->{public}{lives} = 0;
    $rally->{state}->on_enter($rally);

    cmp_deeply( $dead->{public}{registers}, State::Setup::CLEAN );
    cmp_deeply( $dead->{public}{ready},     1 );
    cmp_deeply( $dead->{packets}, [ { cmd => 'programming' } ] );

    cmp_deeply( $alive->{private}{registers}, State::Setup::CLEAN );
    cmp_deeply(
        $alive->{packets},
        [
            {   cmd       => 'programming',
                cards     => cnt(9),
                registers => ignore,
            }
        ]
    );

    done;
};

subtest 'time up' => sub {
    my ( $rally, @p ) = Game( {} );

    my @r;
    my $n = 0;
    for my $p (@p) {
        push @r, $n++;
        program( $rally, $p, \@r );
    }

    $rally->{state}->on_exit($rally);

    for my $p (@p) {
        is( $p->{private}{registers}, undef, "private registers no longer exist" );
        cmp_deeply( $p->{public}{registers}, [ FULL, FULL, FULL, FULL, FULL ] );
    }

    done;
};

subtest 'time up partial program' => sub {
    my ( $rally, @p ) = Game( {} );

    my @r;
    my $n = 0;
    for my $p (@p) {
        push @r, $n++;
        program( $rally, $p, \@r );
    }

    $rally->{state}->on_exit($rally);

    for my $p (@p) {
        is( $p->{private}{registers}, undef, "private registers no longer exist" );
        cmp_deeply( $p->{public}{registers}, [ FULL, FULL, FULL, FULL, FULL ] );
    }
    my $reg = $p[1]->{public}{registers};
    cmp_deeply( $p[0]->{program},
        noclass( [ $p[0]->{public}{registers}[0]{program} ] ) );
    cmp_deeply( $p[1]->{program},
        noclass( [ $reg->[0]{program}, $reg->[1]{program} ] ) );

    done;
};

subtest 'time up with locked' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );

    my ( $d1, $d2 ) = $rally->{movement}->deal(2);

    $p1->{public}{damage}    = 5;
    $p1->{public}{locked}    = [ 0, 0, 0, 0, 1 ];
    $p1->{public}{registers} = [
        { damaged => '', program => [] },
        { damaged => '', program => [] },
        { damaged => '', program => [] },
        { damaged => '', program => [] },
        {   damaged => 1,
            program => [$d1]
        }
    ];

    # Simulating a player that has had 'Fire Control' used on them
    $p2->{public}{locked} = [ 0, 0, 1, 0, 0 ];
    $p2->{public}{registers} = [
        { damaged => '', program => [] },
        { damaged => '', program => [] },
        {   damaged => 1,
            program => [$d2]
        },
        { damaged => '', program => [] },
        { damaged => '', program => [] }
    ];

    $rally->{state}->on_enter($rally);

    program( $rally, $p1, [0] );
    program( $rally, $p2, [ 0, 1 ] );

    $rally->{state}->on_exit($rally);

    cmp_deeply( $p1->{public}{registers}, [ FULL, FULL, FULL, FULL, FULL ] );
    cmp_deeply( $p2->{public}{registers}, [ FULL, FULL, FULL, FULL, FULL ] );
    cmp_deeply( $p1->{public}{registers}[4], reg( 1, $d1 ) );
    cmp_deeply( $p2->{public}{registers}[2], reg( 1, $d2 ) );

    done;
};

subtest 'powered down' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->{state}->on_exit($rally);
    my @c = $rally->{movement}->deal(5);

    $p1->{public}{shutdown} = 1;
    $p1->{public}{damage}   = 5;
    $p1->{public}{registers}
      = [ r( $c[0] ), r( $c[1] ), r( $c[2] ), r( $c[3] ), r( $c[4], 1 ), ];
    $p2->{public}{damage} = 2;

    $rally->drop_packets;
    $rally->{state}->on_enter($rally);

    cmp_deeply( $p1->{public}{ready}, 1 );
    cmp_deeply( $p1->{private}{registers},
        State::Setup::CLEAN, 'Registers filled with NOP' );
    is( $p1->{public}{damage},   0, 'Damage cleared' );
    is( $p1->{public}{shutdown}, 1, 'Stay shutdown until cleanup' );

    cmp_deeply( $p1->{packets}, [ { cmd => 'programming' } ] );
    cmp_deeply(
        $p2->{packets},
        [
            {   cmd       => 'programming',
                cards     => cnt(7),
                registers => ignore,
            }
        ]
    );
    cmp_deeply( $p2->{private}{registers}, State::Setup::CLEAN );
    is( $p2->{public}{damage}, 2, 'Player 2 not affected by p1 shutdown' );

    $rally->{state}->on_exit($rally);
    cmp_deeply( $p1->{public}{registers},
        State::Setup::CLEAN, 'Leave NOP registers alone on exit' );

    $p1->{public}{shutdown} = '';
    $rally->drop_packets;
    $rally->{state}->on_enter($rally);

    cmp_deeply( $p1->{private}{registers}, State::Setup::CLEAN );
    cmp_deeply(
        $p1->{packets},
        [
            {   cmd       => 'programming',
                cards     => cnt(9),
                registers => ignore,
            }
        ]
    );

    done;
};

subtest 'player has no cards' => sub {
    my ( $rally, $p1, $p2, $p3 ) = Game( { timer => 'standard' }, 3 );

    dmg( $rally, $p1, 9 );
    $rally->drop_packets;
    $rally->{state}->on_enter($rally);
    is( $p1->{public}{ready},    1 );
    is( $p2->{public}{ready},    '' );
    is( $p3->{public}{ready},    '' );
    is( $rally->{public}{timer}, undef );
};

subtest 'player has one card' => sub {
    my ( $rally, $p1, $p2, $p3 ) = Game( { timer => 'standard' }, 3 );

    dmg( $rally, $p1, 8 );
    $rally->drop_packets;
    $rally->{state}->on_enter($rally);
    is( $p1->{public}{ready},    1 );
    is( $p2->{public}{ready},    '' );
    is( $p3->{public}{ready},    '' );
    is( $rally->{public}{timer}, undef );
};

subtest 'player has one card, 1st+30s' => sub {
    my ( $rally, $p1, $p2, $p3 ) = Game( { timer => '1st+30s' }, 3 );

    dmg( $rally, $p1, 8 );
    $rally->drop_packets;
    $rally->{state}->on_enter($rally);
    is( $p1->{public}{ready}, 1 );
    is( $p2->{public}{ready}, '' );
    is( $p3->{public}{ready}, '' );
    cmp_deeply( $rally->{public}{timer}, { start => ignore, duration => 30000 } );
};

subtest 'player has one card, standard' => sub {
    my ( $rally, $p1, $p2, $p3 ) = Game( { timer => 'standard' }, 3 );

    dmg( $rally, $p1, 8 );
    $rally->drop_packets;
    $rally->{state}->on_enter($rally);
    is( $p1->{public}{ready}, 1 );
    is( $p2->{public}{ready}, '' );
    is( $p3->{public}{ready}, '' );
    cmp_deeply( $rally->{public}{timer}, undef );
};

subtest 'players have one card, standard' => sub {
    my ( $rally, $p1, $p2, $p3 ) = Game( { timer => 'standard' }, 3 );

    dmg( $rally, $p1, 8 );
    dmg( $rally, $p2, 9 );
    $rally->drop_packets;
    $rally->{state}->on_enter($rally);
    is( $p1->{public}{ready}, 1 );
    is( $p2->{public}{ready}, 1 );
    is( $p3->{public}{ready}, '' );
    cmp_deeply( $rally->{public}{timer}, { start => ignore, duration => 30000 } );
};

sub combo_program {
    my ( $rally, $player, $mv, $dir, $reason ) = @_;
    local $Test::Builder::Level = $Test::Builder::Level + 1;
    my $hand    = $player->{private}{cards}{cards};
    my $mi      = firstidx { $_->{name} eq $mv } @$hand;
    my $di      = firstidx { $_->{name} eq $dir } @$hand;
    my $program = [ [ $hand->[$mi], $hand->[$di] ] ];
    program( $rally, $player, $program, $reason );
}

subtest 'Crab Legs' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );

    $rally->drop_packets;
    $rally->give_option( $p1, 'Crab Legs' );
    $rally->{state}->on_enter($rally);
    $rally->set_hand( $p1, qw/1 2 3 l r u b/ );

    combo_program( $rally, $p1, '1', '2', "Invalid program" );
    combo_program( $rally, $p1, '1', '3', "Invalid program" );
    combo_program( $rally, $p1, '1', 'l' );
    combo_program( $rally, $p1, '1', 'r' );
    combo_program( $rally, $p1, '1', 'u', "Invalid program" );
    combo_program( $rally, $p1, '1', 'b', "Invalid program" );
    combo_program( $rally, $p1, '2', 'l', "Invalid program" );
    combo_program( $rally, $p1, '3', 'l', "Invalid program" );
    combo_program( $rally, $p1, 'l', '1', "Invalid program" );
};

subtest 'Dual Processor' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );

    $rally->drop_packets;
    $rally->give_option( $p1, 'Dual Processor' );
    $rally->{state}->on_enter($rally);
    $rally->set_hand( $p1, qw/1 2 3 l r u b/ );

    combo_program( $rally, $p1, '1', '2', "Invalid program" );
    combo_program( $rally, $p1, '1', '3', "Invalid program" );
    combo_program( $rally, $p1, '1', 'l', "Invalid program" );
    combo_program( $rally, $p1, '1', 'r', "Invalid program" );
    combo_program( $rally, $p1, '1', 'u', "Invalid program" );
    combo_program( $rally, $p1, '1', 'b', "Invalid program" );
    combo_program( $rally, $p1, '2', 'l' );
    combo_program( $rally, $p1, '2', 'r' );
    combo_program( $rally, $p1, '2', 'u', "Invalid program" );
    combo_program( $rally, $p1, '3', 'l' );
    combo_program( $rally, $p1, '3', 'r' );
    combo_program( $rally, $p1, '3', 'u' );
    combo_program( $rally, $p1, 'l', '2', "Invalid program" );
};

subtest 'Dual register option but not enough cards' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );

    $rally->drop_packets;
    $rally->give_option( $p1, 'Crab Legs' );
    $rally->{state}->on_enter($rally);
    $rally->set_hand( $p1, qw/1 2 3 l r/ );
    $rally->drop_packets;

    my $err = { cmd => 'error', reason => 'Invalid program' };
    my ( $_1, $_2, $_3, $_L, $_R ) = @{ $p1->{private}{cards}{cards} };
    $p1->player(
        {   cmd       => 'program',
            registers => [ [ $_1, $_L ] ]
        },
        $err
    );
    $p1->player(
        {   cmd       => 'program',
            registers => [ [$_2], [ $_1, $_L ] ]
        },
        $err
    );
    $p1->player(
        {   cmd       => 'program',
            registers => [ [$_2], [$_3], [ $_1, $_L ] ]
        },
        $err
    );
    $p1->player(
        {   cmd       => 'program',
            registers => [ [$_2], [$_3], [$_R], [ $_1, $_L ] ]
        },
        $err
    );
    $p1->player(
        {   cmd       => 'program',
            registers => [ [$_2], [$_3], [$_R], [$_R], [ $_1, $_L ] ]
        },
        $err
    );
};

subtest 'Extra Memory' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );

    $rally->drop_packets;
    $rally->give_option( $p1, 'Extra Memory' );
    $rally->{state}->on_enter($rally);

    is( $p1->{private}{cards}->count, 10, 'Got extra card' );
    is( $p2->{private}{cards}->count, 9,  'No extra card' );
};

subtest 'programming after shutdown' => sub {
    my ( $rally, $p1 ) = Game( {} );

    $p1->{public}{registers} = State::Setup::CLEAN;
    $p1->drop_packets;
    $rally->{state}->on_enter($rally);

    program( $rally, $p1, [ 0, 1, 2, 3, 4 ] );
    cmp_deeply( $p1->{private}{registers}, [ FULL, FULL, FULL, FULL, FULL ] );

    done;
};

subtest 'recompile' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );

    $rally->drop_packets;
    $rally->give_option( $p1, 'Recompile' );
    $rally->{state}->on_enter($rally);
    $p1->drop_packets;

    is( $p1->{private}{cards}->count, 9, 'Got cards' );

    $p2->game( { cmd => 'recompile' } );
    cmp_deeply( $p2->{packets},
        [ { cmd => 'error', reason => 'Invalid Option' } ] );
    $p2->drop_packets;

    my $cards = join( "", map { $_->{name} } @{ $p1->{private}{cards}{cards} } );
    $p1->broadcast(
        { cmd => 'recompile' },
        {   cmd    => 'option',
            player => $p1->{id},
            option => {
                name   => 'Recompile',
                tapped => $p1->{id},
                text   => ignore,
                uses   => 0,
            }
        }
    );
    cmp_deeply(
        $p1->{packets},
        [
            {   cmd       => 'programming',
                cards     => cnt(9),
                registers => ignore,
            }
        ]
    );
    is( $p1->{public}{options}{Recompile}{tapped}, $p1->{id} );
    my $new = join( "", map { $_->{name} } @{ $p1->{private}{cards}{cards} } );
    isnt( $cards, $new, 'Got new cards' );
    $p1->drop_packets;

    $p1->game( { cmd => 'recompile' } );
    cmp_deeply(
        $p1->{packets},
        [ { cmd => 'error', reason => "Already recompiled" } ],
        "Can't recompile twice"
    );
    $p1->drop_packets;

    is( $p1->{public}{damage}, 0, 'No damage until after ready' );
    program( $rally, $p1, [ 0, 1, 2, 3, 4 ] );
    $p1->broadcast(
        { cmd => 'ready' },
        { cmd => 'ready', player => $p1->{id} },
        { cmd => 'timer', start => ignore, duration => 30000 },
    );
    is( $p1->{public}{damage}, 0, 'Damage is delayed until state change' );

    $rally->drop_packets;
    $rally->{state}->on_exit($rally);
    cmp_deeply( $rally->{packets}, [] );
    is( $p1->{public}{damage}, 0, 'Damage will come later' );

    done;
};

subtest 'recompile with programmed' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );

    $rally->drop_packets;
    $rally->give_option( $p1, 'Recompile' );
    $rally->{state}->on_enter($rally);
    $p1->drop_packets;

    program( $rally, $p1, [0] );
    cmp_deeply( $p1->{private}{registers}, [ N, EMPTY, EMPTY, EMPTY, EMPTY ] );
    $p1->game( { cmd => 'recompile' },
        { cmd => 'programming', cards => cnt(9), registers => ignore } );
    cmp_deeply( $p1->{private}{registers}, [ EMPTY, EMPTY, EMPTY, EMPTY, EMPTY ] );

    $rally->drop_packets;
    $rally->{state}->on_exit($rally);
    is( $rally->{public}{option}{'Recompile'}{tapped}, $p1->{id} );

    done;
};

subtest 'recompile with locked' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );

    $rally->give_option( $p1, 'Recompile' );
    $rally->{state}->on_exit($rally);
    $p1->{public}{damage}                = 5;
    $p1->{public}{registers}[4]{damaged} = 1;
    $p2->{public}{damage}                = 2;
    $rally->drop_packets;
    my $locked = $p1->{public}{registers}[4];
    $rally->{state}->on_enter($rally);

    program( $rally, $p1, [0] );
    cmp_deeply( $p1->{private}{registers}, [ N, N, N, N, $locked ] );
    $p1->game( { cmd => 'recompile' },
        { cmd => 'programming', cards => cnt(9), registers => ignore } );
    cmp_deeply( $p1->{private}{registers},
        [ EMPTY, EMPTY, EMPTY, EMPTY, $locked ] );

    is( $p1->{private}{cards}->count, 4, 'Got cards' );
    program( $rally, $p1, [ 0, 1, 2, 3 ] );
    $p1->broadcast(
        { cmd => 'ready' },
        { cmd => 'ready', player => $p1->{id} },
        { cmd => 'timer', start => ignore, duration => 30000 },
    );
    is( $p1->{public}{damage}, 5, 'No damage from ready' );
    cmp_deeply( $p1->{private}{registers}, [ N, N, N, N, $locked ] );

    $rally->drop_packets;
    $rally->{state}->on_exit($rally);
    is( $rally->{public}{option}{Recompile}{tapped}, $p1->{id} );
    is( $p1->{public}{damage}, 5, 'Damage will come later' );

    done;
};

subtest 'unused recompile' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );

    $rally->drop_packets;
    $rally->give_option( $p1, 'Recompile' );
    $rally->{state}->on_enter($rally);
    $p1->drop_packets;

    $rally->drop_packets;
    $rally->{state}->on_exit($rally);
    is( $rally->{public}{option}{Recompile}{tapped}, undef );

    done;
};

subtest 'Flywheel' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );

    $rally->drop_packets;
    $rally->give_option($p1, 'Flywheel');
    my $flywheel_card = $rally->{movement}->deal(1);
    my $flywheel = $p1->{public}{options}{Flywheel};
    $flywheel->{card} = $flywheel_card;
    $rally->{state}->on_enter($rally);
    ok(!defined $flywheel->{card}, 'Card is cleared from Flywheel');

    is( $p1->{private}{cards}->count, 10, 'Got cards + flywheel' );
    cmp_deeply(
        $p1->{packets},
        [
            {   cmd       => 'programming',
                cards     => cnt(10),
                registers => ignore,
            }
        ]
    );

    done;
};

subtest 'Empty Flywheel' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );

    $rally->drop_packets;
    $rally->give_option($p1, 'Flywheel');
    $rally->{state}->on_enter($rally);

    is( $p1->{private}{cards}->count, 9, 'Got cards' );
    cmp_deeply(
        $p1->{packets},
        [
            {   cmd       => 'programming',
                cards     => cnt(9),
                registers => ignore,
            }
        ]
    );

    done;
};

sub dmg {
    my ( $rally, $p, $dmg ) = @_;
    my @c = $rally->{movement}->deal(5);
    $p->{public}{damage}    = $dmg;
    $p->{public}{registers} = [
        r( $c[0], $dmg > 8 ),
        r( $c[1], $dmg > 7 ),
        r( $c[2], $dmg > 6 ),
        r( $c[3], $dmg > 5 ),
        r( $c[4], $dmg > 4 ),
    ];
}

sub card {
    my ( $n, $p ) = split( //, shift, 2 );

    return Card->new(
        { name => $n, priority => int($p), number => 1, total => 1 } );
}

sub program {
    my ( $rally, $player, $cards, $reason ) = @_;

    local $Test::Builder::Level = $Test::Builder::Level + 1;
    $player->{packets} = [];
    my $hand = $player->{private}{cards}{cards};
    my ( @program, @expected );
    for my $c (@$cards) {
        if ( ref($c) eq 'ARRAY' ) {
            push @program, $c;
            push @expected,
              { program => noclass( j($c) ),
                damaged => $player->{public}{registers}[@expected]{damaged}
              };
        }
        elsif ( ref($c) ) {
            push @program, [$c];
            push @expected,
              { program => [ noclass( {%$c} ) ],
                damaged => $player->{public}{registers}[@expected]{damaged}
              };
        }
        else {
            push @program, [ $hand->[$c] ];
            push @expected,
              { program => [ noclass( { %{ $hand->[$c] } } ) ],
                damaged => $player->{public}{registers}[@expected]{damaged}
              };
        }
    }
    push @expected, noclass( j( $player->{public}{registers}[@expected] ) )
      while @expected < 5;

    $player->{program} = clone( \@program );
    $player->game( { cmd => 'program', registers => \@program } );
    if ($reason) {
        cmp_deeply( $player->{packets}, [ { cmd => 'error', reason => $reason } ],
            $reason );
    }
    else {
        cmp_deeply(
            $player->{packets},
            [
                {   cmd       => 'program',
                    registers => noclass( $player->{private}{registers} )
                }
            ],
            'packets'
        );

        cmp_deeply( $player->{private}{registers}, \@expected, 'program' );
    }
    $player->drop_packets;
}

done_testing;
