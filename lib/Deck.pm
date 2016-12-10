package Deck;

use List::Util;

sub new {
    my $pkg   = shift;
    my @cards = map { ref eq 'ARRAY' ? @$_ : $_ } @_;
    my $self  = bless { _cards => \@cards }, $pkg;
    $self->build(@_) if $self->can('build');
    return $self;
}

sub reset {
    my $self = shift;
    $self->{cards} = $self->generate_cards;
    return $self;
}

sub generate_cards {
    my $self = shift;
    $self->{cards} = [ @{ $self->{_cards} } ];
}

sub shuffle {
    my $self = shift;
    @{ $self->{cards} } = List::Util::shuffle @{ $self->{cards} };
}

sub deal {
    my ( $self, $cards ) = @_;
    $cards ||= 1;
    return splice( @{ $self->{cards} }, 0, $cards );
}

1;
