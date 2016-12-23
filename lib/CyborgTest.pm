package CyborgTest;

use strict;
use warnings;
use Test::More;
use Test::Deep;

require Exporter;
our @ISA    = 'Exporter';
our @EXPORT = qw/done Player Game/;

use CyborgRally;
use JSON::XS;

my $json = JSON::XS->new;
my $rally = CyborgRally->new;
my %player;

undef &Game::broadcast;
*Game::broadcast = sub {
    my ( $self, $cmd, $msg ) = @_;
    if ( ref($cmd) eq 'HASH') {
        $msg = $cmd;
    }
    else {
        $msg->{cmd} = $cmd;
    }
    push @{ $self->{packets} }, $json->decode( $json->encode($msg) );
};

sub Player {
    my $name = shift;
    return $player{$name} if defined $player{$name};
    $player{$name} = TestPlayer->new($name);
}

sub Game {
    my ($opts, $players) = @_;
    $players ||= 2;
    my @ret = $rally->{game}{test} = Rally->new($opts);
    for my $n (1 .. $players) {
        my $p = Player($n);
        $p->join('test');
        push @ret, $p;
    }
    $ret[0]->set_state('SETUP');
    $ret[0]->update;
    return @ret;
}

sub done {
    map { $rally->do_quit($_) } values %player;
    map { $_->{packets} = [] } values %player;
    $rally->{game} = {};
    done_testing();
}

package TestPlayer;

use Test::More;
use Test::Deep ':all';

sub new {
    my ( $pkg, $name ) = @_;
    my $self = bless { packets => [], }, $pkg;
    $rally->on_message( $self, { cmd => 'login', name => $name } );
    $self->drop_packets;
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
    $rally->on_message( $self, { cmd => 'join', name => $game } );
}

sub game {
    my ( $self, $msg ) = @_;
    $rally->on_message( $self, $msg );
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
    cmp_deeply( $self->{game}{packets}, \@_, $comment );
    $self->{game}{packets} = [];
}

sub send {
    my ( $self, $msg ) = @_;
    push @{ $self->{packets} }, $json->decode( $json->encode($msg) );
}

sub err {
    my ( $self, $msg ) = @_;
    print STDERR "ERROR: $msg\n";
    $self->send( { cmd => 'error', msg => $msg } );
}

1;
