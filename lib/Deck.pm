package Deck;

use strict;
use warnings;
use List::Util;
use List::MoreUtils;

sub new {
    my $pkg   = shift;
    my @cards = map { ref eq 'ARRAY' ? @$_ : $_ } @_;
    my $self  = bless { _cards => \@cards }, $pkg;
    $self->build(@_) if $self->can('build');
    $self->reset;
    return $self;
}

sub contains {
    my ($self, $card) = @_;
    return any { $_->{name} eq $card->{name} } @{$self->{cards}};
}

sub remove {
    my ($self, $name) = @_;
    my $idx = firstidx { $_->{name} eq $name } @{$self->{cards}};
    if ($idx) {
        return splice @{$self->{cards}}, $idx;
    }
    return;
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
    return $self;
}

sub deal {
    my ( $self, $cards ) = @_;
    $cards ||= 1;
    return splice( @{ $self->{cards} }, 0, $cards );
}

1;
