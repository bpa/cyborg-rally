package Cyborg;

use strict;
use warnings;
use JSON;

my $json = JSON->new->convert_blessed;

sub new {
    my ( $pkg, $c ) = @_;
    return bless { sock => $c }, $pkg;
}

sub send {
    my ( $self, $cmd, $msg ) = @_;
    if ( ref($cmd) eq '') {
        $msg->{cmd} = $cmd;
    }
    else {
        $msg = $cmd;
    }
    $self->{sock}->send( $json->encode($msg) );
}

sub err {
    my ( $self, $msg ) = @_;
    $self->send( { cmd => 'error', reason => $msg } );
}

1;
