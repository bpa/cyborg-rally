package Cyborg;

sub new {
    my ($pkg, $data) = @_;
    bless $data, $pkg;
}

sub send {
    my ($self, $msg) = @_;
    $self->{sock}->send($msg);
}

1;
