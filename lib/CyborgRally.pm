package CyborgRally;

use strict;
use warnings;
use Data::Dumper;
use Data::UUID;

my $uuid = Data::UUID->new;

use Rally;

my %playing;
my %waiting;
my %collective;

sub new {
    bless {}, shift;
};

sub on_connect {
    my ($self, $c) = @_;
    $c->send({cmd => 'welcome'});
}

sub do_login {
    my ($self, $c, $msg) = @_;
    my %res = (cmd => 'login');

    if ($msg->{token}) {
        $res{token} = $msg->{token};
        my $player = $playing{$msg->{token}};
        if ($player) {
            $res{game} = $player->{game};
            $c->{player} = $player;
        }
    }
    else {
        $c->{uuid} = $uuid->create_str();
        $waiting{$c->{uuid}} = $c;
    }
    $c->send(\%res);
}

sub on_message {
    my ($self, $c, $msg) = @_;
    return unless $msg->{cmd};
    my $f = "do_" . $msg->{cmd};
    my $rally = $c->{rally};

    $rally->$f($c, $msg) if $rally && $rally->can($f);
    $self->$f($c, $msg) if $self->can($f);
}

sub do_collectives {
    my ($self, $c, $msg) = @_;
    $c->send({cmd => 'collectives', collectives => [keys %collective]});
}

sub do_create_game {
    my ($self, $c, $msg) = @_;
    unless ($msg->{name}) {
        $c->err('Missing name');
        return;
    }
    if ($collective{$msg->{name}}) {
        $c->err('Game already exists');
        return;
    }
    $collective{$msg->{name}} = Rally->new($msg);
    for my $player (values %waiting) {
        $player->send({cmd => 'create', name => $msg->{name}});
    }
}

sub on_disconnect {
    my ($self) = shift;
}

1;
