package CyborgRally;

use strict;
use warnings;
use Data::Dumper;

use Cyborg;
use Rally;

my %borg;
my %rally;

sub new {
    bless {}, shift;
};

sub on_connect {
    my ($self, $c) = @_;
    my $cyborg = Cyborg->new({sock => $c});
    $c->send({cmd => 'login'});
    return $cyborg;
}

sub on_message {
    my ($self, $cyborg, $msg) = @_;
    $cyborg->send({re => $msg});
}

sub on_disconnect {
    my ($self) = shift;
}

1;
