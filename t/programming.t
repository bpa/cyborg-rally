use strict;
use warnings;
use Test::More;
use Test::Deep;
use CyborgTest;

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
                    private => ignore,
                    public  => ignore
                },
                { cmd => 'programming', cards => cnt(9) }
            ]
        );
    }

    done;
};

subtest 'programming' => sub {
    my ( $rally, $p1 ) = Game( {} );
    is( ref( $rally->{state} ), 'State::Programming' );

    #Program only one register
    program( $rally, $p1, [0] );
    cmp_deeply( $p1->{private}{registers}, [ FULL, EMPTY, EMPTY, EMPTY, EMPTY ] );

    #Deprogram
    program( $rally, $p1, [] );
    cmp_deeply( $p1->{private}{registers}, [ EMPTY, EMPTY, EMPTY, EMPTY, EMPTY ] );

    my @hand = @{ $p1->{private}{cards}{cards} };

    #Program must be array of arrays
    $p1->game(
        { cmd => 'program', registers => [ $hand[0] ] },
        { cmd => 'error',   reason    => "Invalid program" }
    );

    #Bad format errors before invalid cards
    $p1->game(
        { cmd => 'program', registers => ['3100'] },
        { cmd => 'error',   reason    => "Invalid program" }
    );

    #Must hold card to use
    $p1->game(
        { cmd => 'program', registers => [ ['3100'] ] },
        { cmd => 'error', reason => "Invalid card" }
    );

    #No options to use multiple cards in a register
    $p1->game(
        { cmd => 'program', registers => [ $hand[ 0 .. 1 ] ] },
        { cmd => 'error',   reason    => "Invalid program" }
    );

    #Can't lock in programming without all registers programmed
    $p1->game(
        {   cmd       => 'program',
            registers => [ [ $hand[0] ], [ $hand[1] ], [ $hand[2] ], [ $hand[3] ] ]
        },
        { cmd => 'program', registers => ignore() }
    );
    $p1->game( { cmd => 'ready' },
        { cmd => 'error', reason => 'Programming incomplete' } );
    is( $p1->{public}{ready}, 0, 'Ready not set after error' );

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
    $p1->broadcast( { cmd => 'ready' }, { cmd => 'ready', player => $p1->{id} } );
    program( $rally, $p1, [0], 'Registers are already programmed' );

    done;
};

subtest 'locked registers' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );

    $p1->{public}{damage}    = 5;
    $p1->{public}{registers} = [
        { damaged => 0, program => ['3330'] },
        { damaged => 0, program => ['2100'] },
        { damaged => 0, program => ['r40'] },
        { damaged => 0, program => ['l80'] },
        { damaged => 1, program => ['u20'] }
    ];
    $p2->{public}{damage} = 2;

    $rally->drop_packets;
    $rally->{state}->on_enter($rally);

    # Did p1 get set up correctly?
    cmp_deeply(
        $p1->{private}{registers},
        [   { damaged => 0, program => [] },
            { damaged => 0, program => [] },
            { damaged => 0, program => [] },
            { damaged => 0, program => [] },
            { damaged => 1, program => ['u20'] }
        ]
    );

    cmp_deeply( $p1->{packets}, [ { cmd => 'programming', cards => cnt(4) } ] );
    cmp_deeply( $p2->{packets}, [ { cmd => 'programming', cards => cnt(7) } ] );

    # Add a card to simulate 'Extra Memory' option
    push @{ $p1->{private}{cards}{cards} }, 'b0';

    # Register 5 is locked
    program( $rally, $p1, [ 0, 1, 2, 3, 4 ], "Invalid program" );
    program( $rally, $p1, [ 0, 1, 2, 3, 'u20' ] );
    program( $rally, $p1, [ 0, 1, 2, 3 ] );

    done;
};

subtest 'dead' => sub {
    my ( $rally, $dead, $alive ) = Game( {} );
    $rally->drop_packets;

    $dead->{public}{lives} = 0;
    $rally->{state}->on_enter($rally);

    cmp_deeply( $dead->{public}{registers}, State::Programming::DEAD );
    cmp_deeply( $dead->{public}{ready}, 1 );
    cmp_deeply( $dead->{packets}, [ { cmd => 'programming' } ] );

    cmp_deeply( $alive->{private}{registers}, State::Setup::CLEAN );
    cmp_deeply( $alive->{packets}, [ { cmd => 'programming', cards => cnt(9) } ] );

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

subtest 'time up with locked' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );

    my ( $d1, $d2 ) = $rally->{movement}->deal(2);

    $p1->{public}{damage}    = 5;
    $p1->{public}{locked}    = [ 0, 0, 0, 0, 1 ];
    $p1->{public}{registers} = [
        { damaged => 0, program => [] },
        { damaged => 0, program => [] },
        { damaged => 0, program => [] },
        { damaged => 0, program => [] },
        {   damaged => 1,
            program => [$d1]
        }
    ];

    # Simulating a player that has had 'Fire Control' used on them
    $p2->{public}{locked} = [ 0, 0, 1, 0, 0 ];
    $p2->{public}{registers} = [
        { damaged => 0, program => [] },
        { damaged => 0, program => [] },
        {   damaged => 1,
            program => [$d2]
        },
        { damaged => 0, program => [] },
        { damaged => 0, program => [] }
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

    $p1->{public}{shutdown}  = 1;
    $p1->{public}{damage}    = 5;
    $p1->{public}{registers} = [
        { damaged => 0, program => ['3330'] },
        { damaged => 0, program => ['2100'] },
        { damaged => 0, program => ['r40'] },
        { damaged => 0, program => ['l80'] },
        { damaged => 1, program => ['u20'] }
    ];
    $p2->{public}{damage} = 2;

    $rally->drop_packets;
    $rally->{state}->on_enter($rally);

    cmp_deeply( $p1->{public}{ready}, 1 );
    cmp_deeply( $p1->{public}{registers}, State::Programming::DEAD, 'Registers filled with NOP' );
    ok( !exists($p1->{private}{registers}), 'private registers not defined' );
    is( $p1->{public}{damage}, 0, 'Damage cleared' );
    is( $p1->{public}{shutdown}, '', 'Shutdown cleared' );

    cmp_deeply( $p1->{packets}, [ { cmd => 'programming' } ] );
    cmp_deeply( $p2->{packets}, [ { cmd => 'programming', cards => cnt(7) } ] );
    cmp_deeply( $p2->{private}{registers}, State::Setup::CLEAN );
    is( $p2->{public}{damage}, 2, 'Player 2 not affected by p1 shutdown' ); 

    $rally->{state}->on_exit($rally);
    cmp_deeply( $p1->{public}{registers}, State::Programming::DEAD, 'Leave NOP registers alone on exit' );

    $rally->drop_packets;
    $rally->{state}->on_enter($rally);

    cmp_deeply( $p1->{private}{registers}, State::Setup::CLEAN );
    cmp_deeply( $p1->{packets}, [ { cmd => 'programming', cards => cnt(9) } ] );

    done;
};

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
    my @program;
    for my $c (@$cards) {
        if ( length($c) > 1 ) {
            push @program, [$c];
        }
        else {
            push @program, [ $hand->[$c] ];
        }
    }
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
            ]
        );
    }
}

done_testing;
