use strict;
use warnings;
use Test::More;
use Test::Deep ':all';
use CyborgTest;

my $p1 = Player('1');
my $p2 = Player('2');

#TODO start_with_2_damage
#TODO choose_1_of_3_options
#TODO start_with_option

subtest 'No game options' => sub {
    my ( $rally, @p ) = Game( {} );
    is( ref( $rally->{state} ),
        'State::Choosing', "Don't wait for input if none is required" );
    cmp_deeply(
        $rally->{packets},
        [   { cmd => 'state', state => 'Waiting' },
            { cmd => 'join', id => $p[0]->{id}, player => { name => '1' } },
            { cmd => 'join', id => $p[1]->{id}, player => { name => '2' } },
            { cmd => 'state', state => 'Setup' },
            { cmd => 'state', state => 'Choosing' },
        ]
    );
    for my $p (@p) {
        is( $p->{public}{lives},  3 );
        is( $p->{public}{memory}, 9 );
        is( $p->{public}{damage}, 0 );
        is( @{ $p->{public}{options} }, 0, 'No options by default' );
        is( @{ $p->{private} },         9, 'Got cards' );
    }
    done();
};

done_testing();
