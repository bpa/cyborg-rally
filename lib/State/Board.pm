package State::Board;

use strict;
use warnings;
use parent 'State';

sub BUILD {
    my ( $self, $name, $next ) = @_;
    $self->{name} = $name;
    $self->{next} = $next;
}

sub on_enter {
    my ($self, $game) = @_;
    $game->set_ready_to_dead;
    $game->set_state($self->{next}) if $game->ready;
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
