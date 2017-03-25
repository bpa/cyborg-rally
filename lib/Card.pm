package Card;

use overload
  eq  => \&streq,
  cmp => \&strcmp;

sub new {
    my ( $pkg, $data ) = @_;
    bless $data, $pkg;
}

sub TO_JSON {
    return { %{ $_[0] } };
}

sub streq {
    my ( $self, $other ) = @_;
    return $self->{priority} == $other->{priority};
}

sub strcmp {
    my ( $self, $other, $swap ) = @_;
    return $other->{priority} <=> $self->{priority};
}

1;
