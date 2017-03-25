package CyborgTest;

use strict;
use warnings;
use Test::More;
use Test::Deep;

require Exporter;
our @ISA    = 'Exporter';
our @EXPORT = qw/clone done Player Game r j c L N/;

use CyborgRally;
use JSON;

my $json  = JSON->new->convert_blessed;
my $rally = CyborgRally->new;
my $cards = Deck::Movement->new(4);

use constant L => { damaged => 1,  program => ignore() };
use constant N => { damaged => '', program => ignore() };

undef &Game::broadcast;
*Game::broadcast = sub {
    my ( $self, $cmd, $msg ) = @_;
    if ( ref($cmd) eq 'HASH' ) {
        $msg = $cmd;
    }
    else {
        $msg->{cmd} = $cmd;
    }
    push @{ $self->{packets} }, $json->decode( $json->encode($msg) );
};

*Game::drop_packets = sub {
    my $self = shift;
    $self->{packets} = [];
    map { $_->{packets} = [] } values %{ $self->{player} };
};

sub clone {
    return $json->decode( $json->encode(shift) );
}

sub Game {
    my ( $opts, $players ) = @_;
    $opts->{name} = 'test';
    $players ||= 2;
    my @ret = $rally->{game}{test} = Rally->new($opts);
    for my $n ( 1 .. $players ) {
        my $p = TestPlayer->new($n);
        $p->join('test');
        push @ret, $p;
    }
    $ret[0]->set_state('SETUP');
    $ret[0]->update;
    return @ret;
}

sub Player {
    my ($pkg, $name) = @_;
    return TestPlayer->new($name);
}

sub done {
    for my $p ( values %{ $rally->{game}{test}{player} } ) {
        $rally->do_quit($p);
        undef $p->{game};
        undef $p->{public};
        undef $p->{private};
    }
    $rally->{game}   = {};
    $rally->{cyborg} = {};
    done_testing;
}

sub j {
    return $json->decode( $json->encode(shift) );
}

sub c {
    return $cards->{card}[shift];
}

sub r {
    my ( $r, $dmg ) = @_;
    if ( defined $r && !ref($r) ) {
        $r = c($r);
    }
    if ( defined $r ) {
        return { program => [$r], damaged => !!$dmg };
    }
    else {
        return { program => [], damaged => !!$dmg };
    }
}

package TestPlayer;

use strict;
use warnings;
use Test::More;
use Test::Deep ':all';
use Data::Dumper;

sub new {
    my ( $pkg, $name ) = @_;
    my $self = bless { packets => [], }, $pkg;
    $rally->on_message( $self, { cmd => 'login', name => $name } );
    $self->{packets} = [];
    return $self;
}

sub drop_packets {
    my $self = shift;
    $self->{game}{packets} = [];
    map { $_->{packets} = [] } values %{ $self->{game}{player} };
}

sub create {
    my ( $self, $game ) = @_;
    $rally->on_message( $self, { cmd => 'create_game', name => $game } );
    $self->join($game);
    return $self->{game};
}

sub join {
    my ( $self, $game ) = @_;
    $rally->{game}{$game}->join( $self, { cmd => 'join', name => $game } );
}

sub game {
    my ( $self, $cmd, $msg ) = @_;
    if ( ref($cmd) eq '') {
        $msg->{cmd} = $cmd;
    }
    else {
        $msg = $cmd;
    }
    $rally->on_message( $self, $msg );
}

sub player {
    local $Test::Builder::Level = $Test::Builder::Level + 1;
    my $self = shift;
    $self->{game}{packets} = [];
    my $msg = shift;
    if ( ref($msg) ne 'HASH' ) {
        $msg = { cmd => $msg };
    }
    my $comment;
    if ( ref( $_[-1] ) eq '' ) {
        $comment = pop @_;
    }
    $rally->on_message( $self, $msg );
    if ($comment && $comment =~ /DEBUG/) {
        print STDERR Data::Dumper->Dump([$msg, $self->{game}{packets}, $self->{packets}], ['Message', 'Game', 'Player']);
    }
    cmp_deeply( $self->{packets}, \@_, $comment );
    $self->{packets} = [];
}

sub broadcast {
    local $Test::Builder::Level = $Test::Builder::Level + 1;
    my $self = shift;
    $self->{game}{packets} = [];
    my $msg = shift;
    if ( ref($msg) ne 'HASH' ) {
        $msg = { cmd => $msg };
    }
    my $comment;
    if ( ref( $_[-1] ) eq '' ) {
        $comment = pop @_;
    }
    $rally->on_message( $self, $msg );
    if ($comment && $comment =~ /DEBUG/) {
        print STDERR Data::Dumper->Dump([$msg, $self->{game}{packets}, $self->{packets}], ['Message', 'Game', 'Player']);
    }
    cmp_deeply( $self->{game}{packets}, \@_, $comment );
    $self->{game}{packets} = [];
}

sub send {
    my ( $self, $cmd, $msg ) = @_;
    if ( ref($cmd) eq '') {
        $msg->{cmd} = $cmd;
    }
    else {
        $msg = $cmd;
    }
    push @{ $self->{packets} }, $json->decode( $json->encode($msg) );
}

sub err {
    my ( $self, $msg ) = @_;
    $self->send( { cmd => 'error', reason => $msg } );
}

1;
