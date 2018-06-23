package State::Movement;

use strict;
use warnings;
use parent qw/State DamageHandler/;
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

    my $tapped = delete $game->{public}{option}{Recompile}{tapped};
    if ( defined $tapped ) {
        my $p = $game->{player}{$tapped};
        $self->damage( $game, $p, 1 ) if $p;
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
    $self->{public} = { order => \@order };
    $game->broadcast( { cmd => 'move', order => \@order } );
}

sub do_abort {
    my ( $self, $game, $c, $msg ) = @_;

    my $abort_switch = $c->{public}{options}{'Abort Switch'};
    unless ( defined $abort_switch && !$abort_switch->{tapped} ) {
        $c->err('Not available');
        return;
    }

    my $registers = $c->{public}{registers};
    for my $r ( $game->{public}{register} .. 4 ) {
        $registers->[$r]{program} = [ $game->{movement}->deal ];
    }

    $abort_switch->{tapped} = $c->{id};

    $self->broadcast_movement($game);
    $game->broadcast(
        { cmd => 'option', player => $c->{id}, option => $abort_switch } );
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

sub on_damage_resolved {
    my ( $self, $game ) = @_;
    $game->set_state('BOARD') if $game->ready;
}

1;
