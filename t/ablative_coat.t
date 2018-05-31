use strict;
use warnings;
use Test::More;
use Test::Deep;
use CyborgTest;

subtest 'Normal damage' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;
    $rally->{state}->damage( $rally, $p1, 1 );
    is( $p1->{public}{damage}, 1 );

    cmp_deeply(
        $rally->{packets},
        [
            {   cmd       => 'damage',
                player    => $p1->{id},
                damage    => 1,
                registers => ignore
            }
        ]
    );

    done;
};

subtest 'One damage saved' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->give_option( $p1, 'Ablative Coat' );
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;

    is( $p1->{public}{damage}, 0 );
    cmp_deeply(
        $p1->{public}{options},
        {   'Ablative Coat' => noclass(
                {   name => 'Ablative Coat',
                    text => ignore,
                    uses => 3
                }
            )
        }
    );

    $rally->{state}->damage( $rally, $p1, 1 );
    is( $p1->{public}{damage},                         0 );
    is( $p1->{public}{options}{'Ablative Coat'}{uses}, 2 );

    cmp_deeply(
        $rally->{packets},
        [
            {   cmd     => 'options',
                player  => $p1->{id},
                options => {
                    'Ablative Coat' => {
                        name => 'Ablative Coat',
                        text => ignore,
                        uses => 2
                    }
                }
            }
        ]
    );

    done;
};

subtest 'Two damage saved' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->give_option( $p1, 'Ablative Coat' );
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;

    #Also tests to see if options are reset
    is( $p1->{public}{options}{'Ablative Coat'}{uses}, 3 );
    $rally->{state}->damage( $rally, $p1, 2 );
    is( $p1->{public}{damage},                         0 );
    is( $p1->{public}{options}{'Ablative Coat'}{uses}, 1 );

    cmp_deeply(
        $rally->{packets},
        [
            {   cmd     => 'options',
                player  => $p1->{id},
                options => {
                    'Ablative Coat' => {
                        name => 'Ablative Coat',
                        text => ignore,
                        uses => 1
                    }
                }
            }
        ]
    );

    done;
};

subtest 'Shield breaks' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->give_option( $p1, 'Ablative Coat' );
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;
    $p1->{public}{options}{'Ablative Coat'}{uses} = 1;

    $rally->{state}->damage( $rally, $p1, 1 );
    is( $p1->{public}{damage}, 0 );
    cmp_deeply( $p1->{public}{options}, {} );

    cmp_deeply(
        $rally->{packets},
        [
            {   cmd     => 'options',
                player  => $p1->{id},
                options => {}
            }
        ]
    );

    done;
};

subtest 'More damage than shield' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->give_option( $p1, 'Ablative Coat' );
    $rally->set_state('FIRE');
    $rally->update;
    $rally->drop_packets;
    $p1->{public}{options}{'Ablative Coat'}{uses} = 1;

    $rally->{state}->damage( $rally, $p1, 2 );
    is( $p1->{public}{damage}, 1 );
    cmp_deeply( $p1->{public}{options}, {} );

    cmp_deeply(
        $rally->{packets},
        [
            {   cmd     => 'options',
                player  => $p1->{id},
                options => {}
            },
            {   cmd       => 'damage',
                player    => $p1->{id},
                damage    => 1,
                registers => ignore
            },
        ]
    );

    done;
};

done_testing;
