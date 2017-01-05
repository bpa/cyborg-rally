package State::Board;

use strict;
use warnings;
use parent 'State';
use List::Util 'all';

sub BUILD {
    my ( $self, $name, $next ) = @_;
    $self->{name} = $name;
    $self->{next} = $next;
}

sub do_ready {
    my ( $self, $game, $c, $msg ) = @_;

    return if $c->{public}{ready}; 
    $c->{public}{ready} = 1;
    if ( all { exists $_->{public}{ready} } values %{ $game->{player} } ) {
        $game->set_state( $self->{next} );
    }
    else {
        $game->broadcast( ready => { player => $c->{id} } );
    }
}

sub on_exit {
    my ( $self, $game ) = @_;
    for my $p ( values %{ $game->{player} } ) {
        delete $p->{public}{ready};
    }
}

1;
