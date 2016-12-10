package State;

sub new {
    my ($pkg) = @_;
    my $self = bless { name => ( split( /::/, $pkg ) )[-1] }, shift;
    $self->BUILD if $self->can('BUILD');
    return $self;
}

sub on_enter { }

sub on_exit { }

1;
