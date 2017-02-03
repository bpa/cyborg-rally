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
    cmp_deeply( $p[0]->{packets},
        [ { cmd => 'error', reason => 'Invalid tile' } ] );
    $p[0]->drop_packets;

    $p[0]->broadcast( { cmd => 'touch', tile => 'floor' },
        { cmd => 'touch', player => $p[0]->{id}, tile => 'floor' } );

    $p[0]->game( touch => { tile => 'upgrade' } );
    cmp_deeply( $p[0]->{packets},
        [ { cmd => 'error', reason => 'Already declared' } ] );

    $p[1]->broadcast( { cmd => 'touch', tile => 'repair' },
        { cmd => 'touch', player => $p[1]->{id}, tile => 'repair' } );
    $p[2]->broadcast( { cmd => 'touch', tile => 'upgrade' },
        { cmd => 'touch', player => $p[2]->{id}, tile => 'upgrade' } );
    $p[3]->broadcast(
        { cmd => 'touch', tile   => 'flag' },
        { cmd => 'touch', player => $p[3]->{id}, tile => 'flag' },
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
        bag({ cmd => 'touch',  player => $p[3]->{id}, tile   => 'flag' },
            { cmd => 'heal',   player => $p[1]->{id}, heal   => 1, new => 2 },
            { cmd => 'heal',   player => $p[2]->{id}, heal   => 1, new => 2 },
            { cmd => 'option', player => $p[2]->{id}, option => ignore },
            { cmd => 'heal',   player => $p[3]->{id}, heal   => 1, new => 2 },
            { cmd => 'state', state => 'Revive' },
            { cmd => 'state', state => 'PowerDown' },
            { cmd => 'state', state => 'Programming' },
        )
    );

    is( $p[0]->{public}{damage}, 3 );
    is( $p[1]->{public}{damage}, 2 );
    is( $p[2]->{public}{damage}, 2 );
    is( $p[3]->{public}{damage}, 2 );

    is( scalar @{ $p[0]->{public}{options} }, 0 );
    is( scalar @{ $p[1]->{public}{options} }, 0 );
    is( scalar @{ $p[2]->{public}{options} }, 1 );
    is( scalar @{ $p[3]->{public}{options} }, 0 );

    done;
};

done_testing;
