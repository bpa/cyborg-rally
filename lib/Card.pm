package Card;

use overload
  eq  => \&eq_priority,
  cmp => \&cmp_priority;

sub new {
    my ( $pkg, $data ) = @_;
    bless $data, $pkg;
}

sub TO_JSON {
    return { %{ $_[0] } };
}

sub eq_priority {
    my ( $self, $other ) = @_;
    return $self->{priority} == $other->{priority};
}

sub cmp_priority {
    my ( $self, $other, $swap ) = @_;
    return $other->{priority} <=> $self->{priority};
}

1;
