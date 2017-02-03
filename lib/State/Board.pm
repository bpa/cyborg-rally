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

    if ( $game->ready ) {
        $game->set_state( $self->{next} );
    }
    else {
        $game->broadcast( ready => { player => $c->{id} } );
    }
}

1;
