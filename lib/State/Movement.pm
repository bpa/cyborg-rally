package State::Movement;

use strict;
use warnings;
use parent 'State';
use List::Util 'all';

sub on_enter {
    my ( $self, $game ) = @_;

    $game->set_ready_to_dead_or_shutdown;
    if ( all { $_->{public}{ready} } values %{ $game->{player} } ) {
        $game->set_state('BOARD');
    }
    else {
        $self->broadcast_movement($game);
    }
}

sub broadcast_movement {
    my ( $self, $game ) = @_;

    my $r = $game->{public}{register};
    my @order = sort { $b->{priority} <=> $a->{priority} }
      map {
        my $p
          = { player => $_->{id}, program => $_->{public}{registers}[$r]{program} };
        $p->{priority} = $p->{program}[0]{priority};
        $p;
      } grep { !( $_->{public}{dead} || $_->{public}{shutdown} ) }
      values %{ $game->{player} };
    $self->{public} = \@order;
    $game->broadcast( { cmd => 'move', order => \@order } );
}

sub do_abort {
    my ( $self, $game, $c, $msg ) = @_;

    unless ( exists $c->{public}{options}{'Abort Switch'} ) {
        $c->err('Not available');
        return;
    }

    if ( $c->{public}{options}{'Abort Switch'}{triggered} ) {
        $c->err('Not available');
        return;
    }

    my $registers = $c->{public}{registers};
    for my $r ($game->{public}{register} .. 4) {
        $registers->[$r]{program} = [ $game->{movement}->deal ];
    }

    $c->{public}{options}{'Abort Switch'}{triggered} = 1;

    $self->broadcast_movement($game);
}

sub do_ready {
    my ( $self, $game, $c, $msg ) = @_;

    if ( $c->{public}{ready} ) {
        $c->err('Already moved');
        return;
    }

    $c->{public}{ready} = 1;
    if ( $game->ready ) {
        $game->set_state('BOARD');
    }
    else {
        $game->broadcast( { cmd => 'ready', player => $c->{id}, } );
    }
}

1;
