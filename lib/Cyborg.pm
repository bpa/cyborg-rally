package Cyborg;

use strict;
use warnings;
use JSON;

my $json = JSON->new;

sub new {
    my ( $pkg, $c ) = @_;
    return bless { sock => $c }, $pkg;
}

sub send {
    my ( $self, $cmd, $msg ) = @_;
    if ( ref($cmd) eq 'HASH') {
        $msg = $cmd;
    }
    else {
        $msg->{cmd} = $cmd;
    }
    $self->{sock}->send( $json->encode($msg) );
}

sub err {
    my ( $self, $msg ) = @_;
    $self->send( { cmd => 'error', msg => $msg } );
}

1;
