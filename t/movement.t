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
    for my $r ( 0 .. 4 ) {
        for my $p ( 0 .. 2 ) {
            next unless $_[$p]->{public}{lives};
            $_[$p]->{public}{registers}[$r]{program} = [
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
        { cmd => 'ready', player => $p1->{id}, next => $p3->{id} },
        'Rotations can move any time'
    );
    $p1->game( { cmd => 'ready' }, { cmd => 'error', reason => 'Already moved' } );

    $p2->game( { cmd => 'ready' }, { cmd => 'error', reason => 'Not your turn' } );
    $p3->broadcast( { cmd => 'ready' },
        { cmd => 'ready', player => $p3->{id}, next => $p2->{id} } );
    $p2->broadcast( { cmd => 'ready' },
        { cmd => 'state', state => 'Firing' } );

    is( ref( $rally->{state} ), 'State::Firing' );

    done;
};

done_testing;
