use strict;
use warnings;
use Card;
use Test::More;
use Test::Deep;
use CyborgTest;

use constant PERMUTATIONS =>
  [ [ 1, 2, 3 ], [ 1, 3, 2 ], [ 2, 1, 3 ], [ 2, 3, 1 ], [ 3, 1, 2 ], [ 3, 2, 1 ] ];
use constant CARD_NAME => [qw/u 1 2/];

# For simplicity, only works with 3 players
sub set_registers {
    for my $p ( 0 .. 2 ) {
        $_[$p]->{public}{ready} = 1;
        for my $r ( 0 .. 4 ) {
            next unless $_[$p]->{public}{lives};
            $_[$p]->{private}{registers}[$r]{program} = [
                Card->new(
                    {   priority => ( 10 * $r + PERMUTATIONS->[$r][$p] ) * 10,
                        name     => CARD_NAME->[$p],
                        id       => ( $p + 1 ) . ( $r + 1 ),
                    }
                )
            ];
        }
    }
}

sub move {
    my ( $player, $priority, @cards ) = @_;
    return {
        player   => $player->{id},
        priority => $priority,
        program  => noclass(
            [   map {
                    Card->new(
                        { name => $_->[0], id => $_->[1], priority => $_->[2] } )
                } @cards
            ]
        ),
    };
}

subtest 'reveal current registers' => sub {
    my ( $rally, @p ) = Game( {}, 3 );
    set_registers(@p);
    $rally->drop_packets;
    $rally->set_state('EXECUTE');
    $rally->update;
    is( ref( $rally->{state} ), 'State::Movement' );
    cmp_deeply(
        $rally->{packets},
        [   { cmd => 'state', state => 'Executing' },
            { cmd => 'state', state => 'ConditionalProgramming' },
            { cmd => 'state', state => 'Movement' },
            {   cmd   => 'move',
                order => [
                    move( $p[2], 30, [ '2', 31, 30 ] ),
                    move( $p[1], 20, [ '1', 21, 20 ] ),
                    move( $p[0], 10, [ 'u', 11, 10 ] ),
                ]
            },
        ]
    );

    $rally->drop_packets;
    $rally->{public}{register} = 3;
    $rally->{state}->on_enter($rally);
    cmp_deeply(
        $rally->{packets},
        [
            {   cmd   => 'move',
                order => [
                    move( $p[1], 330, [ '1', 24, 330 ] ),
                    move( $p[0], 320, [ 'u', 14, 320 ] ),
                    move( $p[2], 310, [ '2', 34, 310 ] ),
                ]
            },
        ]
    );

    done;
};

subtest 'move order' => sub {
    my ( $rally, $p1, $p2, $p3 ) = Game( {}, 3 );
    set_registers( $p1, $p2, $p3 );
    $rally->set_state('EXECUTE');
    $rally->update;
    $rally->drop_packets;

    $p1->broadcast(
        { cmd => 'ready' },
        { cmd => 'ready', player => $p1->{id}, },
        'Rotations can move any time'
    );
    $p1->game( { cmd => 'ready' }, { cmd => 'error', reason => 'Already moved' } );

    $p2->broadcast( { cmd => 'ready' }, { cmd => 'ready', player => $p2->{id}, } );
    $p3->broadcast( { cmd => 'ready' }, { cmd => 'state', state  => 'Firing' } );

    is( ref( $rally->{state} ), 'State::Firing' );

    done;
};

subtest 'player died' => sub {
    my ( $rally, $p1, $p2, $p3 ) = Game( {}, 3 );
    set_registers( $p1, $p2, $p3 );
    $p1->{public}{dead} = 1;
    $rally->drop_packets;
    $rally->set_state('EXECUTE');
    $rally->update;

    is( $p1->{public}{ready}, 1, 'dead players are ready' );
    cmp_deeply(
        $rally->{packets},
        [   { cmd => 'state', state => 'Executing' },
            { cmd => 'state', state => 'ConditionalProgramming' },
            { cmd => 'state', state => 'Movement' },
            {   cmd   => 'move',
                order => [
                    move( $p3, 30, [ '2', 31, 30 ] ),
                    move( $p2, 20, [ '1', 21, 20 ] ),
                ]
            },
        ]
    );

    $rally->drop_packets;
    $p1->game('ready');
    cmp_deeply( $p1->{packets}, [ { cmd => 'error', reason => 'Already moved' } ] );
    done;
};

subtest 'shutdown' => sub {
    my ( $rally, $p1, $p2, $p3 ) = Game( {}, 3 );
    set_registers( $p1, $p2, $p3 );
    $p1->{public}{shutdown} = 1;
    $rally->drop_packets;
    $rally->set_state('EXECUTE');
    $rally->update;

    is( $p1->{public}{ready}, 1, 'shutdown players are ready' );
    cmp_deeply(
        $rally->{packets},
        [   { cmd => 'state', state => 'Executing' },
            { cmd => 'state', state => 'ConditionalProgramming' },
            { cmd => 'state', state => 'Movement' },
            {   cmd   => 'move',
                order => [
                    move( $p3, 30, [ '2', 31, 30 ] ),
                    move( $p2, 20, [ '1', 21, 20 ] ),
                ]
            },
        ]
    );
    done;
};

subtest 'recompile damage' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->{public}{option}{Recompile}{tapped} = $p1->{id};
    $rally->set_state('EXECUTE');
    $rally->drop_packets;
    $rally->update;

    cmp_deeply(
        $rally->{packets},
        [   { cmd => 'state', state => 'Executing' },
            { cmd => 'state', state => 'ConditionalProgramming' },
            { cmd => 'state', state => 'Movement' },
            { cmd => 'move',  order => ignore },
            {   cmd       => 'damage',
                damage    => 1,
                player    => $p1->{id},
                registers => ignore
            },
        ]
    );

    $p1->game( { cmd => 'shutdown', activate => 0 } );
    $p2->game( { cmd => 'shutdown', activate => 0 } );

    is( ref( $rally->{state} ),  'State::Movement' );
    is( $p1->{public}{shutdown}, '' );
    is( $p2->{public}{shutdown}, '' );

    done;
};

subtest 'Ramming Gear happy path' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->give_option( $p1, 'Ramming Gear' );
    $rally->set_state('EXECUTE');
    $rally->update;
    $rally->drop_packets;

    is( ref( $rally->{state} ), 'State::Movement' );

    is( $p2->{public}{damage}, 0 );
    $p1->game( ram => { target => $p2->{id} } );
    cmp_deeply( $p2->{packets}, [ { cmd => 'ram', player => $p1->{id} } ] );
    cmp_deeply( $rally->{state}{public}{shots},
        [ { player => $p1->{id}, target => $p2->{id}, type => 'Ramming Gear' } ] );

    $p2->broadcast(
        { cmd => 'confirm', type => 'Ramming Gear', player => $p1->{id} },
        {   cmd       => 'damage',
            player    => $p2->{id},
            damage    => 1,
            registers => ignore
        },
        { cmd => 'ready', player => $p1->{id} }
    );
    is( $p2->{public}{damage}, 1 );
    $p2->broadcast( 'ready', { cmd => 'state', state => 'Firing' } );

    done;
};

subtest 'Ramming Gear errors' => sub {
    my ( $rally, $p1, $p2, $p3 ) = Game( {}, 3 );
    $rally->give_option( $p1, 'Ramming Gear' );
    $rally->set_state('EXECUTE');
    $rally->update;
    $rally->drop_packets;

    is( ref( $rally->{state} ), 'State::Movement' );

    $p2->player(
        { cmd => 'ram',   target => $p2->{id} },
        { cmd => 'error', reason => 'Invalid command' }
    );
    $p2->drop_packets;

    $p2->player( { cmd => 'confirm', type => 'Fire Control', player => $p1->{id} },
        { cmd => 'error', reason => 'Invalid player' } );
    $p2->drop_packets;

    $p2->player(
        { cmd => 'confirm', player => $p1->{id} },
        { cmd => 'error',   reason => 'Invalid player' }
    );
    $p2->drop_packets;

    $p1->player( { cmd => 'ram', target => $p1->{id} },
        { cmd => 'error', reason => "Can't ram yourself" } );
    $p1->drop_packets;

    $p1->player( { cmd => 'ram', target => $p2->{id} } );
    cmp_deeply( $p2->{packets}, [ { cmd => 'ram', player => $p1->{id} } ] );
    cmp_deeply( $rally->{state}{public}{shots},
        [ { player => $p1->{id}, target => $p2->{id}, type => 'Ramming Gear' } ] );

    $p1->drop_packets;
    $p1->player( { cmd => 'ram', target => $p3->{id} },
        { cmd => 'error', reason => 'Ram already pending' } );

    $p2->broadcast(
        { cmd => 'confirm', type => 'Ramming Gear', player => $p1->{id} },
        {   cmd       => 'damage',
            player    => $p2->{id},
            damage    => 1,
            registers => ignore
        },
        { cmd => 'ready', player => $p1->{id} }
    );
    is( $p2->{public}{damage}, 1 );
    is( $p1->{public}{ready},  1 );

    $p1->player(
        { cmd => 'ram',   target => $p3->{id} },
        { cmd => 'error', reason => 'Invalid command' }
    );

    done;
};

done_testing;
