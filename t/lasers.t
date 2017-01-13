use strict;
use warnings;
use Test::More;
use Test::Deep;
use CyborgTest;
use Data::Dumper;

subtest 'no hits' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;

    $p1->broadcast( 'ready', { cmd => 'ready', player => $p1->{id} } );
    $p2->broadcast( 'ready', { cmd => 'state', state  => 'Touching' } );

    done;
};

subtest 'hit first' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;

    is( $p2->{public}{damage}, 0 );
    $p1->game( fire => { target => $p2->{id}, type => 'laser', damage => 1 } );
    cmp_deeply( $p2->{packets},
        [ { cmd => 'fire', type => 'laser', bot => $p1->{id}, damage => 1 } ] );
    cmp_deeply( $rally->{state}{pending},
        { $p1->{id} => { laser => { target => $p2->{id}, damage => 1 } } } );
    $p2->broadcast(
        { cmd => 'confirm', type => 'laser', bot => $p1->{id} },
        {   cmd    => 'fire',
            type   => 'laser',
            bot    => $p1->{id},
            target => $p2->{id},
            damage => 1
        },
        { cmd => 'ready', player => $p1->{id} }
    );
    is( $p2->{public}{damage}, 1 );
    $p2->broadcast( 'ready', { cmd => 'state', state => 'Touching' } );

    done;
};

subtest 'hit second' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;

    is( $p2->{public}{damage}, 0 );
    $p1->game( fire => { type => 'laser', target => $p2->{id}, damage => 1 } );
    cmp_deeply( $p1->{packets},
        [ { cmd => 'fire', type => 'laser', bot => $p2->{id}, damage => 1 } ] );
    cmp_deeply( $rally->{state}{pending},
        { $p1->{id} => { laser => { target => $p2->{id}, damage => 1 } } } );
    $p2->broadcast(
        confirm => { type => 'laser', bot => $p1->{id} },
        { cmd => 'laser', bot   => $p1->{id}, target => $p2->{id}, damage => 1 },
        { cmd => 'state', state => 'Touching' }
    );
    is( $p2->{public}{damage}, 1 );

    done;
};

subtest 'invalid actions' => sub {
    my ( $rally, $p1, $p2, $p3 ) = Game( {} );
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;

    is( $p2->{public}{damage}, 0 );
    $p2->game( confirm => { type => 'laser', bot => $p1->{id} } );
    cmd_deeply( $p3->{packets}, [ { cmd => 'error', reason => 'Invalid shot' } ] );

    $p1->game( fire => { type => 'laser', target => $p2->{id}, damage => 1 } );
    cmp_deeply( $p1->{packets},
        [ { cmd => 'fire', type => 'laser', bot => $p2->{id}, damage => 1 } ] );
    cmp_deeply( $rally->{state}{pending},
        { $p1->{id} => { laser => { target => $p2->{id}, damage => 1 } } } );

    $p1->game( fire => { type => 'laser', target => $p1->{id}, damage => 1 } );
    cmd_deeply( $p1->{packets},
        [ { cmd => 'error', reason => 'Shot already pending' } ] );

    $p1->drop_packets;
    $p1->game( fire => { type => 'laser', target => $p3->{id}, damage => 1 } );
    cmd_deeply( $p1->{packets},
        [ { cmd => 'error', reason => 'Shot already pending' } ] );

    $p3->game( confirm => { type => 'laser', bot => $p1->{id} } );
    cmd_deeply( $p3->{packets}, [ { cmd => 'error', reason => 'Invalid shot' } ] );

    $p2->broadcast(
        confirm => { type => 'laser', bot => $p1->{id} },
        { cmd => 'laser', bot   => $p1->{id}, target => $p2->{id}, damage => 1 },
        { cmd => 'state', state => 'Touching' }
    );
    is( $p2->{public}{damage}, 1 );

    done;
};

subtest 'self resolve dispute' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;

    is( $p2->{public}{damage}, 0 );
    $p1->game( laser => { target => $p2->{id}, damage => 1 } );
    cmp_deeply( $p1->{packets},
        [ { cmd => 'laser', bot => $p2->{id}, damage => 1 } ] );
    $p2->broadcast( 'ready' => { cmd => 'state', state => 'Touching' } );
    $p1->drop_packets;
    $p2->game( deny => { type => 'laser', bot => $p1->{id} } );
    cmp_deeply( $p1->{packets}, { cmd => 'dispute', player => $p1->{id} } );
    $p1->game( fire => { type => 'laser', target => $p2->{id}, damage => 1 } );
    $p1->broadcast( 'ready' => { cmd => 'state', state => 'Touching' } );
    is( $p2->{public}{damage}, 0 );

    done;
};

subtest 'dispute majority call hit' => sub {
    my ( $rally, @p ) = Game( {}, 5 );
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;
    is( $p[1]->{public}{damage}, 0 );

    $p[0]
      ->game( dispute => { type => 'laser', target => $p[1]->{id}, damage => 1 } );
    cmp_deeply(
        $rally->{state}{pending},
        {   $p[0]->{id} => {
                laser => {
                    target  => $p[1]->{id},
                    dispute => 1,
                    damage  => 1,
                    voted   => { $p[0]->{id} => 1, $p[1] => 0 },
                    hit     => 1,
                    miss    => 1
                }
            }
        }
    );
    for my $p ( @p[ 2 .. 4 ] ) {
        cmp_deeply(
            $p->{packets},
            [
                {   cmd     => 'laser',
                    dispute => 1,
                    player  => $p[0]->{id},
                    target  => $p[1]->{id},
                    damage  => 1
                }
            ]
        );
    }
    $rally->drop_packets;
    $p[2]->game(
        { cmd => 'vote', player => $p[0]->{id}, target => $p[1]->{id}, hit => 1 } );
    cmp_deeply(
        $rally->{state}{pending},
        {   $p[0]->{id} => {
                laser => {
                    target  => $p[1]->{id},
                    dispute => 1,
                    damage  => 1,
                    voted   => { $p[0]->{id} => 1, $p[1] => 0, $p[2] => 1 },
                    hit     => 2,
                    miss    => 1
                }
            }
        }
    );
    is( $p[0]->{public}{ready}, undef );
    $p[4]->broadcast(
        { cmd => 'vote', player => $p[0]->{id}, target => $p[1]->{id}, hit => 1 },
        {   cmd    => 'laser',
            player => $p[0]->{id},
            target => $p[1]->{id},
            damage => 1
        }
    );
    cmp_deeply( $rally->{state}{pending}, {} );
    is( $p[0]->{public}{ready},  1 );
    is( $p[1]->{public}{damage}, 1 );

    done;
};

subtest 'dispute majority call miss' => sub {
    my ( $rally, @p ) = Game( {}, 5 );
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;
    is( $p[1]->{public}{damage}, 0 );

    $p[0]
      ->game( dispute => { type => 'laser', target => $p[1]->{id}, damage => 1 } );
    cmp_deeply(
        $rally->{state}{pending},
        {   $p[0]->{id} => {
                laser => {
                    target  => $p[1]->{id},
                    dispute => 1,
                    type    => 'laser',
                    damage  => 1,
                    voted   => { $p[0]->{id} => 1, $p[1] => 0 },
                    hit     => 1,
                    miss    => 1
                }
            }
        }
    );
    for my $p ( @p[ 2 .. 4 ] ) {
        cmp_deeply(
            $p->{packets},
            [
                {   cmd    => 'dispute',
                    type   => 'laser',
                    player => $p[0]->{id},
                    target => $p[1]->{id},
                    damage => 1
                }
            ]
        );
    }
    $rally->drop_packets;
    $p[2]->game(
        { cmd => 'vote', player => $p[0]->{id}, target => $p[1]->{id}, hit => 0 } );
    cmp_deeply(
        $rally->{state}{pending},
        {   $p[0]->{id} => {
                laser => {
                    target  => $p[1]->{id},
                    dispute => 1,
                    type    => 'laser',
                    damage  => 1,
                    voted   => { $p[0]->{id} => 1, $p[1] => 0, $p[2] => 0 },
                    hit     => 1,
                    miss    => 2
                }
            }
        }
    );
    is( $p[0]->{public}{ready}, undef );
    $p[4]->game(
        { cmd => 'vote', player => $p[0]->{id}, target => $p[1]->{id}, hit => 0 } );
    cmp_deeply( $rally->{state}{pending}, {} );
    is( $p[0]->{public}{ready},  1 );
    is( $p[1]->{public}{damage}, 0 );

    done;
};

subtest 'dispute tie goes to miss' => sub {
    my ( $rally, @p ) = Game( {}, 4 );
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;
    is( $p[1]->{public}{damage}, 0 );

    $p[0]
      ->game( dispute => { type => 'laser', target => $p[1]->{id}, damage => 1 } );
    cmp_deeply(
        $rally->{state}{pending},
        {   $p[0]->{id} => {
                laser => {
                    target  => $p[1]->{id},
                    dispute => 1,
                    type    => 'laser',
                    damage  => 1,
                    voted   => { $p[0]->{id} => 1, $p[1] => 0 },
                    hit     => 1,
                    miss    => 1
                }
            }
        }
    );
    for my $p ( @p[ 2 .. 3 ] ) {
        cmp_deeply(
            $p->{packets},
            [
                {   cmd    => 'dispute',
                    type   => 'laser',
                    player => $p[0]->{id},
                    target => $p[1]->{id},
                    damage => 1
                }
            ]
        );
    }
    $rally->drop_packets;
    $p[2]->game(
        { cmd => 'vote', player => $p[0]->{id}, target => $p[1]->{id}, hit => 0 } );
    cmp_deeply(
        $rally->{state}{pending},
        {   $p[0]->{id} => {
                laser => {
                    target  => $p[1]->{id},
                    dispute => 1,
                    type    => 'laser',
                    damage  => 1,
                    voted   => { $p[0]->{id} => 1, $p[1] => 0, $p[2] => 0 },
                    hit     => 1,
                    miss    => 2
                }
            }
        }
    );
    is( $p[0]->{public}{ready}, undef );
    $p[3]->game(
        { cmd => 'vote', player => $p[0]->{id}, target => $p[1]->{id}, hit => 1 } );
    cmp_deeply( $rally->{state}{pending}, {} );
    is( $p[0]->{public}{ready},  0, 'Tie means miss' );
    is( $p[1]->{public}{damage}, 0, 'No damage on tie' );

    done;
};

done_testing;
