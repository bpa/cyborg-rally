use strict;
use warnings;
use Test::More;
use Test::Deep;
use CyborgTest;
use Storable 'dclone';

subtest 'abort' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->give_option( $p1, 'Abort Switch' );
    $rally->{public}{register} = 2;
    $rally->set_state('MOVE');
    $rally->update;
    $rally->drop_packets;

    is( ref( $rally->{state} ), 'State::Movement' );

    is( @{ $p1->{public}{registers}[4]{program} }, 1, 'Registers programmed' );

    $p2->game( { cmd => 'abort' } );
    cmp_deeply( $p2->{packets}, [ { cmd => 'error', reason => 'Not available' } ] );

    is($rally->{public}{option}{'Abort Switch'}{tapped}, undef);
    my $old = dclone( $p1->{public}{registers} );

    $p1->broadcast(
        { cmd => 'abort' },
        { cmd => 'move', order => ignore },
        {   cmd    => 'option',
            player => $p1->{id},
            option => {
                name   => 'Abort Switch',
                text   => ignore,
                tapped => $p1->{id},
                uses   => 0,
            }
        },
        'Get new moves after abort'
    );

    is($rally->{public}{option}{'Abort Switch'}{tapped}, $p1->{id});
    my $r = $p1->{public}{registers};
    cmp_deeply( $r->[0], $old->[0] );
    cmp_deeply( $r->[1], $old->[1] );
    for my $i ( 2 .. 4 ) {
        isnt(
            $r->[$i]{program}[0]{priority},
            $old->[$i]{program}[0]{priority},
            "Register " . ($i+1) . " has been changed"
        );
    }

    $rally->drop_packets;
    $p1->game( { cmd => 'abort' } );
    cmp_deeply( $p1->{packets}, [ { cmd => 'error', reason => 'Not available' } ] );

    done;
};

subtest 'abort' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->give_option( $p1, 'Abort Switch' );
    $rally->{public}{option}{'Abort Switch'}{tapped} = $p1->{id};
    $rally->set_state('EXECUTE');
    $rally->update;

    is( ref( $rally->{state} ), 'State::Movement' );
    is($rally->{public}{option}{'Abort Switch'}{tapped}, undef);

    done;
};

done_testing;
