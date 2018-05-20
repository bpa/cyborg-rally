use strict;
use warnings;
use Test::More;
use Test::Deep;
use CyborgTest;
use Storable 'dclone';

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
    $rally->{public}{register} = 0;
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;

    is( $p2->{public}{damage}, 0 );
    $p1->game( fire => { target => $p2->{id}, type => 'laser' } );
    cmp_deeply( $p2->{packets},
        [ { cmd => 'fire', type => 'laser', player => $p1->{id} } ] );
    cmp_deeply( $rally->{state}{public},
        [ { player => $p1->{id}, target => $p2->{id}, type => 'laser' } ] );
    $p2->broadcast(
        { cmd => 'confirm', type => 'laser', player => $p1->{id} },
        {   cmd       => 'damage',
            player    => $p2->{id},
            damage    => 1,
            registers => ignore
        },
        { cmd => 'ready', player => $p1->{id} }
    );
    is( $p2->{public}{damage}, 1 );
    $p2->broadcast( 'ready', { cmd => 'state', state => 'Touching' } );

    done;
};

subtest 'hit second' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->{public}{register} = 0;
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;

    is( $p2->{public}{damage}, 0 );
    $p2->broadcast( 'ready', { cmd => 'ready', player => $p2->{id} } );

    $p1->game( fire => { type => 'laser', target => $p2->{id}, damage => 1 } );
    cmp_deeply( $p2->{packets},
        [ { cmd => 'fire', type => 'laser', player => $p1->{id} } ] );
    cmp_deeply( $rally->{state}{public},
        [ { player => $p1->{id}, target=> $p2->{id}, type => 'laser' } ] );
    $p2->broadcast(
        { cmd => 'confirm', type => 'laser', player => $p1->{id} },
        {   cmd       => 'damage',
            player    => $p2->{id},
            damage    => 1,
            registers => ignore
        },
        { cmd => 'state', state => 'Touching' }
    );
    is( $p2->{public}{damage}, 1 );

    done;
};

subtest 'invalid actions' => sub {
    my ( $rally, $p1, $p2, $p3 ) = Game( {}, 3 );
    $rally->{public}{register} = 0;
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;

    is( $p2->{public}{damage}, 0 );
    $p2->game( confirm => { type => 'laser', player => $p1->{id} } );
    cmp_deeply( $p2->{packets}, [ { cmd => 'error', reason => 'Invalid player' } ] );
    $p2->drop_packets;

    $p2->game( confirm => { player => $p1->{id} } );
    cmp_deeply( $p2->{packets}, [ { cmd => 'error', reason => 'Invalid player' } ] );
    $p2->drop_packets;

    $p1->game( fire => { type => 'laser', target => $p2->{id} } );
    cmp_deeply( $p2->{packets},
        [ { cmd => 'fire', type => 'laser', player => $p1->{id} } ] );
    cmp_deeply(
        $rally->{state}{shot},
        {   $p1->{id} => { max => 1, used => 1, $p2->{id} => { player=>$p1->{id}, target => $p2->{id}, type => 'laser' } },
            $p2->{id} => { max => 1, used => 0, },
            $p3->{id} => { max => 1, used => 0, },
        }
    );

    $p1->game( fire => { type => 'laser', target => $p1->{id} } );
    cmp_deeply( $p1->{packets},
        [ { cmd => 'error', reason => "Can't shoot yourself" } ] );

    $p1->drop_packets;
    $p1->game( fire => { type => 'laser', target => $p2->{id} } );
    cmp_deeply( $p1->{packets},
        [ { cmd => 'error', reason => 'Shot already pending' } ] );

    $p1->drop_packets;
    $p1->game( fire => { type => 'laser', target => $p3->{id} } );
    cmp_deeply( $p1->{packets},
        [ { cmd => 'error', reason => 'Shot already pending' } ] );

    $p3->broadcast( 'ready', { cmd => 'ready', player => $p3->{id} } );
    $p3->game( fire => { type => 'laser', target => $p1->{id} } );
    cmp_deeply( $p3->{packets},
        [ { cmd => 'error', reason => 'Invalid command' } ] );

    $p2->broadcast(
        { cmd => 'confirm', type => 'laser', player => $p1->{id} },
        {   cmd       => 'damage',
            player    => $p2->{id},
            damage    => 1,
            registers => ignore
        },
        { cmd => 'ready', player => $p1->{id} }
    );
    is( $p2->{public}{damage}, 1 );

    done;
};

subtest 'self resolve dispute' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->{public}{register} = 0;
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;

    is( $p2->{public}{damage}, 0 );
    $p1->game( fire => { type => 'laser', target => $p2->{id} } );
    cmp_deeply( $p2->{packets},
        [ { cmd => 'fire', type => 'laser', player => $p1->{id} } ] );
    $p2->broadcast( 'ready', { cmd => 'ready', player => $p2->{id} } );
    $p1->drop_packets;
    $p2->game( deny => { type => 'laser', player => $p1->{id} } );
    cmp_deeply( $p1->{packets},
        [ { cmd => 'deny', player => $p2->{id}, type => 'laser' } ] );
    $p1->game( fire => { type => 'laser', target => $p2->{id}, damage => 1 } );
    $p1->broadcast( 'ready' => { cmd => 'state', state => 'Touching' } );
    is( $p2->{public}{damage}, 0 );

    done;
};

subtest 'dispute majority call hit' => sub {
    my ( $rally, @p ) = Game( {}, 5 );
    $rally->{public}{register} = 0;
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;
    is( $p[1]->{public}{damage}, 0 );

    $p[0]->game(
        vote => {
            type   => 'laser',
            player => $p[0]->{id},
            target => $p[1]->{id},
            hit    => 1
        }
    );
    cmp_deeply( $p[0]->{packets},
        [ { cmd => 'error', reason => 'Invalid player' } ] );
    $p[0]->drop_packets;

    $p[0]
      ->game( dispute => { type => 'laser', target => $p[1]->{id}, damage => 1 } );
    cmp_deeply(
        $rally->{state}{public},
        [
            {   player  => $p[0]->{id},
                target  => $p[1]->{id},
                type    => 'laser',
                dispute => 1,
                voted   => { $p[0]->{id} => 1, $p[1]->{id} => '' },
                hit     => 1,
                miss    => 1
            }
        ]
    );
    $p[0]->game(
        vote => {
            type   => 'laser',
            player => $p[0]->{id},
            target => $p[1]->{id},
            hit    => 1
        }
    );
    cmp_deeply( $p[0]->{packets},
        [ { cmd => 'error', reason => 'Already voted' } ] );

    for my $p ( @p[ 2 .. 4 ] ) {
        cmp_deeply(
            $p->{packets},
            [
                {   cmd    => 'dispute',
                    type   => 'laser',
                    player => $p[0]->{id},
                    target => $p[1]->{id},
                }
            ]
        );
    }
    $rally->drop_packets;
    $p[2]->game(
        {   cmd    => 'vote',
            type   => 'laser',
            player => $p[0]->{id},
            target => $p[1]->{id},
            hit    => 1
        }
    );
    cmp_deeply(
        $rally->{state}{public},
        [
            {   player  => $p[0]->{id},
                target  => $p[1]->{id},
                type    => 'laser',
                dispute => 1,
                voted => { $p[0]->{id} => 1, $p[1]->{id} => '', $p[2]->{id} => 1 },
                hit   => 2,
                miss  => 1
            }
        ]
    );
    is( $p[0]->{public}{ready}, '' );
    $p[4]->broadcast(
        {   cmd    => 'vote',
            type   => 'laser',
            player => $p[0]->{id},
            target => $p[1]->{id},
            hit    => 1
        },
        {   cmd    => 'resolution',
            player => $p[0]->{id},
            target => $p[1]->{id},
            type   => 'laser',
            hit    => 1,
        },
        {   cmd       => 'damage',
            player    => $p[1]->{id},
            damage    => 1,
            registers => ignore
        },
        {   cmd    => 'ready',
            player => $p[0]->{id},
        }
    );
    cmp_deeply( $rally->{state}{public}, [] );
    is( $p[0]->{public}{ready},  1 );
    is( $p[1]->{public}{damage}, 1 );

    done;
};

subtest 'dispute majority call miss' => sub {
    my ( $rally, @p ) = Game( {}, 5 );
    $rally->{public}{register} = 0;
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;
    is( $p[1]->{public}{damage}, 0 );

    $p[0]->game( dispute => { type => 'laser', target => $p[1]->{id} } );
    cmp_deeply(
        $rally->{state}{public},
        [
            {   player  => $p[0]->{id},
                target  => $p[1]->{id},
                type    => 'laser',
                voted   => { $p[0]->{id} => 1, $p[1]->{id} => '' },
                dispute => 1,
                hit     => 1,
                miss    => 1
            }
        ]
    );

    for my $p ( @p[ 2 .. 4 ] ) {
        cmp_deeply(
            $p->{packets},
            [
                {   cmd    => 'dispute',
                    type   => 'laser',
                    player => $p[0]->{id},
                    target => $p[1]->{id},
                }
            ]
        );
    }
    $rally->drop_packets;
    $p[2]->game(
        {   cmd    => 'vote',
            type   => 'laser',
            player => $p[0]->{id},
            target => $p[1]->{id},
            hit    => 0
        }
    );
    cmp_deeply(
        $rally->{state}{public},
        [
            {   player  => $p[0]->{id},
                target  => $p[1]->{id},
                type    => 'laser',
                voted => { $p[0]->{id} => 1, $p[1]->{id} => '', $p[2]->{id} => '' },
                dispute => 1,
                hit   => 1,
                miss  => 2
            }
        ]
    );
    is( $p[0]->{public}{ready}, '' );
    $p[4]->game(
        {   cmd    => 'vote',
            type   => 'laser',
            player => $p[0]->{id},
            target => $p[1]->{id},
            hit    => 0
        }
    );
    cmp_deeply( $rally->{state}{public}, [] );
    is( $p[0]->{public}{ready},  '' );
    is( $p[1]->{public}{damage}, 0 );

    done;
};

subtest 'dispute tie goes to miss' => sub {
    my ( $rally, @p ) = Game( {}, 4 );
    $rally->{public}{register} = 0;
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;
    is( $p[1]->{public}{damage}, 0 );

    $p[0]
      ->game( dispute => { type => 'laser', target => $p[1]->{id}, damage => 1 } );
    cmp_deeply(
        $rally->{state}{public},
        [
            {   player  => $p[0]->{id},
                target  => $p[1]->{id},
                type    => 'laser',
                dispute => 1,
                voted   => { $p[0]->{id} => 1, $p[1]->{id} => '' },
                hit     => 1,
                miss    => 1
            }
        ]
    );

    for my $p ( @p[ 2 .. 3 ] ) {
        cmp_deeply(
            $p->{packets},
            [
                {   cmd    => 'dispute',
                    type   => 'laser',
                    player => $p[0]->{id},
                    target => $p[1]->{id},
                }
            ]
        );
    }
    $rally->drop_packets;
    $p[2]->game(
        {   cmd    => 'vote',
            type   => 'laser',
            player => $p[0]->{id},
            target => $p[1]->{id},
            hit    => 0
        }
    );
    cmp_deeply(
        $rally->{state}{public},
        [
            {   player => $p[0]->{id},
                target  => $p[1]->{id},
                type    => 'laser',
                dispute => 1,
                voted => { $p[0]->{id} => 1, $p[1]->{id} => '', $p[2]->{id} => '' },
                hit   => 1,
                miss  => 2
            }
        ]
    );
    is( $p[0]->{public}{ready}, '' );
    $p[3]->game(
        {   cmd    => 'vote',
            type   => 'laser',
            player => $p[0]->{id},
            target => $p[1]->{id},
            hit    => 1
        }
    );
    cmp_deeply( $rally->{state}{public}, [] );
    is( $p[0]->{public}{ready},  '', 'Tie means miss' );
    is( $p[1]->{public}{damage}, 0,  'No damage on tie' );

    done;
};

subtest 'Rear-Firing Laser' => sub {
    my ( $rally, $p1, $p2, $p3 ) = Game( {}, 3 );
    $rally->give_option($p1, 'Rear-Firing Laser');
    $rally->{public}{register} = 0;
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;

    cmp_deeply( $rally->{state}{shot}{$p1->{id}}, { max => 2, used => 0 });
    $p1->game( fire => { type => 'laser', target => $p2->{id}, damage => 1 } );
    cmp_deeply( $p2->{packets},
        [ { cmd => 'fire', type => 'laser', player => $p1->{id} } ] );
    cmp_deeply( $rally->{state}{public},
        [ { player => $p1->{id}, target=> $p2->{id}, type => 'laser' } ] );
    $p2->broadcast(
        { cmd => 'confirm', type => 'laser', player => $p1->{id} },
        {   cmd       => 'damage',
            player    => $p2->{id},
            damage    => 1,
            registers => ignore
        },
    );
    is( $p2->{public}{damage}, 1 );
    cmp_deeply( $rally->{state}{shot}{$p1->{id}}, { max => 2, used => 1, $p2->{id} => ignore });

    $p1->game( fire => { type => 'laser', target => $p2->{id}, damage => 1 } );
    cmp_deeply( $p1->{packets},
        [ { cmd => 'error', reason => "Shot already pending" } ],
        "Can't shoot player twice" );
    $rally->drop_packets;

    $p1->game( fire => { type => 'laser', target => $p3->{id}, damage => 1 } );
    cmp_deeply( $p3->{packets},
        [ { cmd => 'fire', type => 'laser', player => $p1->{id} } ] );
    cmp_deeply( $rally->{state}{public},
        [ { player => $p1->{id}, target=> $p3->{id}, type => 'laser' } ] );
    $p3->broadcast(
        { cmd => 'confirm', type => 'laser', player => $p1->{id} },
        {   cmd       => 'damage',
            player    => $p3->{id},
            damage    => 1,
            registers => ignore
        },
        {   cmd    => 'ready',
            player => $p1->{id},
        }
    );
    is( $p3->{public}{damage}, 1 );
    is( $rally->{state}{shot}{$p1->{id}}, undef, 'shots cleared out when ready');

    done;
};

subtest 'Radio Control' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->give_option( $p1, 'Radio Control' );
    $rally->{public}{register} = 1;
    $rally->set_state('FIRE');
    is($rally->{public}{register}, 1);
    $rally->update;
    $rally->drop_packets;

    $p1->game(
        fire => { type => 'Radio Control', target => $p2->{id}, damage => 1 } );
    cmp_deeply( $p2->{packets},
        [ { cmd => 'fire', type => 'Radio Control', player => $p1->{id} } ] );
    cmp_deeply( $rally->{state}{public},
        [ { player => $p1->{id}, target => $p2->{id}, type => 'Radio Control' } ] );
    $p2->game( { cmd => 'confirm', type => 'Radio Control', player => $p1->{id} },
    );

    is( $p2->{public}{damage}, 0 );
    cmp_deeply( $rally->{state}{shot}, { $p2->{id} => { max => 1, used => 0 } }, );

    my @expected = map {
        my $r = dclone($_);
        $r->{program}[0]{priority}-=2;
        $r;
    } @{$p1->{public}{registers}};
    cmp_deeply( $p2->{public}{registers}, \@expected);

    done;
};

done_testing;
