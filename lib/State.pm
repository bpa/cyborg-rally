package State;

use strict;
use warnings;

sub new {
    my $pkg = shift;
    my $self = bless { name => ( split( /::/, $pkg ) )[-1] }, $pkg;
    $self->BUILD(@_) if $self->can('BUILD');
    return $self;
}

sub on_enter { }

sub on_exit { }

1;
