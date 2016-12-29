package Option;

use parent 'Card';

use overload
  eq  => \&streq,
  cmp => \&strcmp;

sub streq {
    my ( $self, $other, $swap ) = @_;
    if ( ref($other) ) {
        return $self->{name} eq $other->{name};
    }
    else {
        return $self->{name} eq $other;
    }
}

sub strcmp {
    my ( $self, $other, $swap ) = @_;
    if ( ref($other) ) {
        return $self->{name} <=> $other->{name};
    }
    else {
        return $self->{name} <=> $other;
    }
}

1;
