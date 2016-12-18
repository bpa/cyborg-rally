package TcpSock;

use strict;
use warnings;

sub new {
    my ( $pkg, $fh ) = @_;
    bless { fh => $fh }, $pkg;
}

sub send {
    my ( $self, $msg ) = @_;
    syswrite $self->{fh}, $msg;
}

1;
