use strict;
use warnings;
use Test::More;
use Test::Deep ':all';
use CyborgTest;

my $p1 = Player('1');
my $p2 = Player('2');

subtest 'No game options' => sub {
    my ( $rally, @p ) = Game( {} );
    is( ref( $rally->{state} ),
        'State::Programming', "Don't wait for input if none is required" );
    cmp_deeply(
        $rally->{packets},
        [   { cmd => 'state', state => 'Waiting' },
            { cmd => 'join', id => $p[0]->{id}, player => { name => '1' } },
            { cmd => 'join', id => $p[1]->{id}, player => { name => '2' } },
            { cmd => 'state', state => 'Setup' },
            { cmd => 'state', state => 'Programming' },
        ]
    );
    for my $p (@p) {
        is( $p->{public}{lives},  3 );
        is( $p->{public}{memory}, 9 );
        is( $p->{public}{damage}, 0 );
        is( @{ $p->{public}{options} }, 0, 'No options by default' );
        is( @{ $p->{private}{cards} },  9, 'Got cards' );
    }
    done();
};

subtest 'Start with 4 lives' => sub {
    my ( $rally, @p ) = Game( { start_with_4_lives => 1 } );
    for my $p (@p) {
        is( $p->{public}{lives},  4 );
    }
    done();
};

subtest 'Start with 2 damage' => sub {
    my ( $rally, @p ) = Game( { start_with_2_damage => 1 } );
    is( ref( $rally->{state} ),
        'State::Programming', "Don't wait for input if none is required" );
    for my $p (@p) {
        is( $p->{public}{lives},  3 );
        is( $p->{public}{memory}, 9 );
        is( $p->{public}{damage}, 2 );
        is( @{ $p->{public}{options} }, 0, 'No options by default' );
        is( @{ $p->{private}{cards} }, 7,
            'Got less cards because of damage' );
    }
    done();
};

subtest 'Start with option' => sub {
    my ( $rally, @p ) = Game( { start_with_option => 1 } );
    is( ref( $rally->{state} ),
        'State::Programming', "Don't wait for input if none is required" );
    for my $p (@p) {
        is( $p->{public}{lives},  3 );
        is( $p->{public}{memory}, 9 );
        is( $p->{public}{damage}, 0 );
        is( @{ $p->{public}{options} }, 1, 'Start with an option card' );
        is( @{ $p->{private}{cards} },  9, 'Got cards' );
    }
    done();
};

subtest 'Choose 1 of 3 options' => sub {
    my ( $rally, @p ) = Game( { choose_1_of_3_options => 1 } );
    is( ref( $rally->{state} ), 'State::Setup', "Have to wait for input" );
    for my $p (@p) {
        is( $p->{public}{lives},  3 );
        is( $p->{public}{memory}, 9 );
        is( $p->{public}{damage}, 0 );
        is( @{ $p->{public}{options} },  0, 'Start with 0 public options' );
        is( @{ $p->{private}{options} }, 3, 'Start with 3 private options' );
        is( @{ $p->{private}{cards} },   0, 'No cards yet' );
    }
    done();
};

done_testing();
