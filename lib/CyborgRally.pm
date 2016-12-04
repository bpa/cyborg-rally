package CyborgRally;

use strict;
use warnings;
use Data::Dumper;
use Data::UUID;

my $uuid = Data::UUID->new;

use Rally;

my %cyborg;
my %game;
my $lobby = Lobby->new;

sub new {
    bless {}, shift;
};

sub on_connect {
    my ($self, $c) = @_;
    $c->send({cmd => 'welcome'});
}

sub on_disconnect {
    my ($self) = shift;
}

sub on_message {
    my ($self, $c, $msg) = @_;
    return unless $msg->{cmd};
    my $f = "do_" . $msg->{cmd};
    my $rally = $c->{rally};

    $rally->$f($c, $msg) if $rally && $rally->can($f);
    $self->$f($c, $msg) if $self->can($f);
}

sub do_create_game {
    my ($self, $c, $msg) = @_;
    unless ($msg->{name}) {
        $c->err('Missing name');
        return;
    }
    if ($game{$msg->{name}}) {
        $c->err('Game already exists');
        return;
    }
    my $g = $game{$msg->{name}} = Rally->new($msg);
    $lobby->broadcast({cmd => 'create_game', name => $msg->{name},
    opts => $g->{opts}});
}

sub do_games {
    my ($self, $c, $msg) = @_;
    my @games;
    while (my ($k, $g) = each %game) {
        push @games, { name => $k, players => scalar(%{$g->{player}}), opts => $g->{opts}};
    }
    $c->send({cmd => 'games', games => \@games });
}

sub do_join {
    my ($self, $c, $msg) = @_;
    if (!$msg->{name}) {
        $c->err("Missing name");
        return;
    }

    my $g = $game{$msg->{name}};
    if (!$g) {
        $c->err("Game does not exist");
        return;
    }

    $c->{game}->quit($c);
    $g->join($c);
}

sub do_login {
    my ($self, $c, $msg) = @_;
    my %res = (cmd => 'login');

    my $token;
    if ($msg->{token}) {
        $token = $msg->{token};
        my $cyborg = $cyborg{$token};
        if ($cyborg) {
            $cyborg->{game}->join($c);
            $cyborg{$token} = $c;
            return;
        }
    }

    $c->{uuid} = $token = $uuid->create_str();
    $cyborg{$token} = $c;
    $c->send({cmd => 'login', token => $token});
    $lobby->join($c);
}

sub do_quit {
    my ($self, $c, $msg) = @_;

    $c->{game}->quit($c);
    $lobby->join($c);
}

1;
