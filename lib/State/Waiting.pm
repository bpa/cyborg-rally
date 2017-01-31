package State::Waiting;

use strict;
use warnings;
use parent 'State';
use Deck::Options;
use Deck::Movement;

sub do_ready {
    my ( $self, $game, $c, $msg ) = @_;

    $c->{public}{ready} = 1;

    my $players = keys %{ $game->{player} };
    my $ready = grep { $_->{public}{ready} } values %{ $game->{player} };

    if ( $players > 1 && $players == $ready ) {
        $game->set_state('SETUP');
    }
    else {
        $game->broadcast( { cmd => 'ready', player => $c->{id} } );
    }
}

sub do_not_ready {
    my ( $self, $game, $c, $msg ) = @_;
    $c->{public}{ready} = 0;
    $game->broadcast( { cmd => 'not_ready', player => $c->{id} } );
}

sub on_exit {
    my ( $self, $game ) = @_;
    for my $p ( values %{ $game->{player} } ) {
        delete $p->{ready};
    }
}

1;
