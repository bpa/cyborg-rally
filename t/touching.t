use strict;
use warnings;
use Test::More;
use Test::Deep;
use CyborgTest;

subtest 'normal' => sub {
    my ( $rally, @p ) = Game( {}, 4 );
    $rally->set_state('TOUCH');
    $rally->update;
    $rally->drop_packets;

    for my $p (@p) {
        $p->{public}{damage} = 3;
    }

    $p[0]->game( touch => { tile => 'conveyor' } );
    cmp_deeply( $p[0]->{packets}, [ { cmd => 'error', reason => 'Invalid tile' } ] );
    $p[0]->drop_packets;

    $p[0]->broadcast( { cmd => 'touch', tile => 'floor' },
        { cmd => 'touch', player => $p[0]->{id}, tile => 'floor' } );

    $p[0]->game( touch => { tile => 'upgrade' } );
    cmp_deeply( $p[0]->{packets}, [ { cmd => 'error', reason => 'Already declared' } ] );

    $p[1]->broadcast( { cmd => 'touch', tile => 'repair' },
        { cmd => 'touch', player => $p[1]->{id}, tile => 'repair' } );
    $p[2]->broadcast( { cmd => 'touch', tile => 'upgrade' },
        { cmd => 'touch', player => $p[2]->{id}, tile => 'upgrade' } );
    $p[3]->broadcast(
        { cmd => 'touch', tile   => 'flag' },
        { cmd => 'touch', player => $p[3]->{id}, tile => 'flag' },
        { cmd => 'state', state  => 'ConditionalProgramming' },
        { cmd => 'state', state  => 'Movement' },
        { cmd => 'move',  order  => ignore },
    );

    for my $p (@p) {
        is( $p->{public}{damage}, 3 );
    }

    done;
};

subtest 'fifth register phase' => sub {
    my ( $rally, @p ) = Game( {}, 4 );
    $rally->{public}{register} = 4;
    $rally->set_state('TOUCH');
    $rally->update;
    $rally->drop_packets;

    for my $p (@p) {
        $p->{public}{damage} = 3;
    }

    $p[0]->broadcast( { cmd => 'touch', tile => 'floor' },
        { cmd => 'touch', player => $p[0]->{id}, tile => 'floor' } );
    $p[1]->broadcast( { cmd => 'touch', tile => 'repair' },
        { cmd => 'touch', player => $p[1]->{id}, tile => 'repair' } );
    $p[2]->broadcast( { cmd => 'touch', tile => 'upgrade' },
        { cmd => 'touch', player => $p[2]->{id}, tile => 'upgrade' } );
    $p[3]->game( { cmd => 'touch', tile => 'flag' } );
    cmp_deeply(
        $rally->{packets},
        bag({ cmd => 'touch', player => $p[3]->{id}, tile => 'flag' },
            {   cmd       => 'heal',
                player    => $p[1]->{id},
                heal      => 1,
                damage    => 2,
                registers => [ N, N, N, N, N ]
            },
            {   cmd       => 'heal',
                player    => $p[2]->{id},
                heal      => 1,
                damage    => 2,
                registers => [ N, N, N, N, N ]
            },
            { cmd => 'option', player => $p[2]->{id}, option => ignore },
            {   cmd       => 'heal',
                player    => $p[3]->{id},
                heal      => 1,
                damage    => 2,
                registers => [ N, N, N, N, N ]
            },
            { cmd => 'state',       state   => 'Revive' },
            { cmd => 'state',       state   => 'PowerDown' },
            { cmd => 'state',       state   => 'NewCard' },
            { cmd => 'new_options', options => ignore },
        )
    );

    is( $p[0]->{public}{damage}, 3 );
    is( $p[1]->{public}{damage}, 2 );
    is( $p[2]->{public}{damage}, 2 );
    is( $p[3]->{public}{damage}, 2 );

    is( scalar keys %{ $p[0]->{public}{options} }, 0 );
    is( scalar keys %{ $p[1]->{public}{options} }, 0 );
    is( scalar keys %{ $p[2]->{public}{options} }, 1 );
    is( scalar keys %{ $p[3]->{public}{options} }, 0 );

    done;
};

subtest 'healing unlocks registers' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->{public}{register} = 4;
    $rally->set_state('TOUCH');
    $rally->update;
    $rally->drop_packets;

    $p1->{public}{damage} = 5;
    $p2->{public}{damage} = 7;

    $p1->{public}{registers} = [ r(0), r(1), r(2), r(3), r( 4, 1 ) ];
    $p2->{public}{registers} = [ r(5), r(6), r(7), r( 8, 1 ), r( 9, 1 ) ];

    $p1->broadcast( { cmd => 'touch', tile => 'repair' },
        { cmd => 'touch', player => $p1->{id}, tile => 'repair' } );
    $p2->game( { cmd => 'touch', tile => 'repair' } );

    cmp_deeply(
        $rally->{packets},
        bag({ cmd => 'touch', player => $p2->{id}, tile => 'repair' },
            {   cmd       => 'heal',
                player    => $p1->{id},
                heal      => 1,
                damage    => 4,
                registers => [ N, N, N, N, N ]
            },
            {   cmd       => 'heal',
                player    => $p2->{id},
                heal      => 1,
                damage    => 6,
                registers => [ N, N, N, N, D ]
            },
            { cmd => 'state', state => 'Revive' },
            { cmd => 'state', state => 'PowerDown' },
            { cmd => 'state', state => 'NewCard' },
            { cmd => 'state', state => 'Programming' },
        )
    );

    is( $p1->{public}{damage}, 4 );
    is( $p2->{public}{damage}, 6 );
    cmp_deeply( $p1->{public}{registers}, [ N, N, N, N, N ] );
    cmp_deeply( $p2->{public}{registers}, [ N, N, N, N, D ] );

    done;
};

subtest 'healing fire controlled registers' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->{public}{register} = 4;
    $rally->set_state('TOUCH');
    $rally->update;
    $rally->drop_packets;

    $p1->{public}{damage} = 5;
    $p2->{public}{damage} = 5;

    $p1->{public}{registers} = [ r(0), r(1), r(2), r(3), r( 4, 1 ) ];
    $p2->{public}{registers} = [ r(0), r(1), r(2), r(3), r( 4, 1 ) ];
    $p2->{public}{registers}[2]{locked} = 1;

    $p1->broadcast( { cmd => 'touch', tile => 'repair' },
        { cmd => 'touch', player => $p1->{id}, tile => 'repair' } );
    $p2->game( { cmd => 'touch', tile => 'repair' } );

    cmp_deeply(
        $rally->{packets},
        bag({ cmd => 'touch', player => $p2->{id}, tile => 'repair' },
            {   cmd       => 'heal',
                player    => $p1->{id},
                heal      => 1,
                damage    => 4,
                registers => [ N, N, N, N, N ]
            },
            {   cmd       => 'heal',
                player    => $p2->{id},
                heal      => 0,
                damage    => 5,
                registers => [ N, N, N, N, D ]
            },
            { cmd => 'state', state => 'Revive' },
            { cmd => 'state', state => 'PowerDown' },
            { cmd => 'state', state => 'NewCard' },
            { cmd => 'state', state => 'Programming' },
        )
    );

    is( $p1->{public}{damage}, 4 );
    cmp_deeply( $p1->{public}{registers}, [ N, N, N, N, N ] );

    is( $p2->{public}{damage}, 5 );
    cmp_deeply( $p2->{public}{registers}, [ N, N, N, N, D ] );

    done;
};

subtest "shutdown players don't trigger" => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->set_state('TOUCH');
    $rally->update;
    $rally->drop_packets;

    $p1->{public}{shutdown} = 1;

    $p1->player(
        { cmd => 'touch', tile   => 'repair' },
        { cmd => 'error', reason => 'Invalid tile' }
    );

    $p1->player(
        { cmd => 'touch', tile   => 'upgrade' },
        { cmd => 'error', reason => 'Invalid tile' }
    );

    $p1->player( { cmd => 'touch', tile => 'flag' },
        { cmd => 'error', reason => 'Invalid tile' } );

    $p1->broadcast( { cmd => 'touch', tile => 'floor' },
        { cmd => 'touch', player => $p1->{id}, tile => 'floor' } );

    done;
};

subtest "Death" => sub {
    my ( $rally, $p1, $p2, $p3 ) = Game( {}, 3 );
    $rally->set_state('TOUCH');
    $rally->update;
    $rally->drop_packets;

    $p1->broadcast(
        { cmd => 'touch', tile   => 'pit' },
        { cmd => 'touch', player => $p1->{id}, tile => 'pit' },
        { cmd => 'death', player => $p1->{id}, lives => 2 },
    );

    $p2->broadcast(
        { cmd => 'touch', tile   => 'off' },
        { cmd => 'touch', player => $p2->{id}, tile => 'off' },
        { cmd => 'death', player => $p2->{id}, lives => 2 },
    );

    $p3->broadcast(
        { cmd => 'touch', tile   => 'floor' },
        { cmd => 'touch', player => $p3->{id}, tile => 'floor' },
        { cmd => 'state', state  => 'ConditionalProgramming' },
        { cmd => 'state', state  => 'Movement' },
        { cmd => 'move',  order  => ignore },
    );

    is( $p1->{public}{lives}, 2 );
    is( $p2->{public}{lives}, 2 );
    is( $p3->{public}{lives}, 3 );
    done;
};

subtest "Infinite lives" => sub {
    my ( $rally, $p1, $p2, $p3 ) = Game( { lives => 'Inf' }, 3 );
    $rally->set_state('TOUCH');
    $rally->update;
    $rally->drop_packets;

    $p1->broadcast(
        { cmd => 'touch', tile   => 'pit' },
        { cmd => 'touch', player => $p1->{id}, tile => 'pit' },
        { cmd => 'death', player => $p1->{id}, lives => 1 },
    );

    $p2->broadcast(
        { cmd => 'touch', tile   => 'off' },
        { cmd => 'touch', player => $p2->{id}, tile => 'off' },
        { cmd => 'death', player => $p2->{id}, lives => 1 },
    );

    $p3->broadcast(
        { cmd => 'touch', tile   => 'floor' },
        { cmd => 'touch', player => $p3->{id}, tile => 'floor' },
        { cmd => 'state', state  => 'ConditionalProgramming' },
        { cmd => 'state', state  => 'Movement' },
        { cmd => 'move',  order  => ignore },
    );

    is( $p1->{public}{lives}, 1 );
    is( $p2->{public}{lives}, 1 );
    is( $p3->{public}{lives}, 1 );
    done;
};

done_testing;
