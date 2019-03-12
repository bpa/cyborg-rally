use strict;
use warnings;
use Card;
use Test::More;
use Test::Deep;
use CyborgTest;

sub program;

subtest 'Conditional Program errors' => sub {
    my ( $rally, $p1, $p2, $current, $card ) = program;

    $p2->player( { cmd => 'conditional_program' },
        { cmd => 'error', reason => 'Invalid command' } );

    done;
};

subtest 'Conditional Program no replace' => sub {
    my ( $rally, $p1, $p2, $current, $card ) = program;

    $p1->broadcast(
        { cmd => 'conditional_program' },
        { cmd => 'state', state => 'Movement' },
        { cmd => 'move', order => ignore },
    );

    cmp_deeply( $p1->{public}{registers}[0]{program}[0], $current );

    done;
};

subtest 'Conditional Program replacement' => sub {
    my ( $rally, $p1, $p2, $current, $card ) = program;

    $p1->broadcast(
        { cmd => 'conditional_program', replace => 1 },
        { cmd => 'state',               state   => 'Movement' },
        { cmd => 'move',                order   => ignore },
    );

    cmp_deeply( $p1->{public}{registers}[0]{program}[0], $card );
};

subtest 'Option without card' => sub {
    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->give_option( $p1, 'Conditional Program' );
    $rally->drop_packets;
    $rally->set_state('EXECUTE');
    $rally->update;

    is( ref( $rally->{state} ), 'State::Movement' );
    cmp_deeply(
        $rally->{packets},
        [   { cmd => 'state', state => 'Executing' },
            { cmd => 'state', state => 'ConditionalProgramming' },
            { cmd => 'state', state => 'Movement' },
            { cmd => 'move',  order => ignore },
        ]
    );
};

sub program {
    my $no_program = shift;
    local $Test::Builder::Level = $Test::Builder::Level + 1;

    my ( $rally, $p1, $p2 ) = Game( {} );
    $rally->give_option( $p1, 'Conditional Program' );
    $rally->drop_packets;

    my $card = $rally->{movement}->deal;
    if ( !$no_program ) {
        $p1->{public}{options}{'Conditional Program'}{card} = $card;
    }
    $rally->set_state('EXECUTE');
    $rally->update;
    my $current = $p1->{public}{registers}[0]{program}[0];

    is( ref( $rally->{state} ), 'State::ConditionalProgramming' );
    cmp_deeply(
        $rally->{packets},
        [   { cmd => 'state', state    => 'Executing' },
            { cmd => 'state', state    => 'ConditionalProgramming' },
            { cmd => 'timer', duration => 10000, start => ignore },
        ]
    );
    $rally->drop_packets;

    return $rally, $p1, $p2, $current, $card;
}

done_testing;
