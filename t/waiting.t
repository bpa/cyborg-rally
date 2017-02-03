use strict;
use warnings;
use Test::More;
use CyborgTest;

my $p1 = Player('1');
my $p2 = Player('2');

subtest 'need at least two players' => sub {
    my $rally = $p1->create('test');
    is( ref( $rally->{state} ), 'State::Waiting' );
    $p1->broadcast( 'ready', { cmd => 'ready', player => $p1->{id} }, 'p1' );
    is( ref( $rally->{state} ), 'State::Waiting' );
    $p2->join('test');
    $p2->broadcast(
        'ready',
        { cmd => 'state', state => 'Setup' },
        { cmd => 'state', state => 'Programming' }
    );
    done;
};

subtest 'not ready' => sub {
    my $rally = $p1->create('test');
    $p2->join('test');
    is( ref( $rally->{state} ), 'State::Waiting' );
    $p1->broadcast( 'ready', { cmd => 'ready', player => $p1->{id} } );
    ok( $p1->{public}{ready} );
    is( ref( $rally->{state} ), 'State::Waiting' );
    $p1->broadcast( 'not_ready', { cmd => 'not_ready', player => $p1->{id} } );
    is( ref( $rally->{state} ), 'State::Waiting' );
    ok( !$p1->{public}{ready} );
    $p2->broadcast( 'ready', { cmd => 'ready', player => $p2->{id} } );
    $p1->broadcast(
        'ready',
        { cmd => 'state', state => 'Setup' },
        { cmd => 'state', state => 'Programming' }
    );
    done;
};

done_testing;
