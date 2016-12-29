package Deck;

use strict;
use warnings;
use List::Util 'any';
use List::MoreUtils 'firstidx';

sub new {
    my $pkg   = shift;
    my @cards = map { ref eq 'ARRAY' ? @$_ : $_ } @_;
    my $self  = bless { _cards => \@cards }, $pkg;
    $self->build(@_) if $self->can('build');
    $self->reset;
    return $self;
}

sub TO_JSON {
    my $self = shift;
    return $self->{cards};
}

sub contains {
    my ( $self, $card ) = @_;
    return any { $_ eq $card } @{ $self->{cards} };
}

sub count {
    my $self = shift;
    return scalar( @{ $self->{cards} } );
}

sub remove {
    my ( $self, $card ) = @_;
    my $idx = firstidx { $_ eq $card } @{ $self->{cards} };
    if ($idx != -1) {
        return splice @{ $self->{cards} }, $idx, 1;
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
