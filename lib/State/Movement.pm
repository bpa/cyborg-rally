package State::Movement;

use strict;
use warnings;
use parent qw/State DamageHandler DisputeHandler/;
use List::Util 'all';

sub on_enter {
    my ( $self, $game ) = @_;

    $self->{public} = { shots => [], order => [] };
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
    $self->{public}{order} = \@order;
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

sub do_ram {
    my ( $self, $game, $c, $msg ) = @_;

    if ( $c->{public}{ready} || !defined $c->{public}{options}{'Ramming Gear'} ) {
        $c->err('Invalid command');
        return;
    }

    if ( scalar( @{ $self->{public}{shots} } ) ) {
        $c->err('Ram already pending');
        return;
    }

    unless ( defined $msg->{target} ) {
        $c->err('Invalid target');
        return;
    }

    my $target = $game->{player}{ $msg->{target} };
    unless ($target) {
        $c->err('Invalid target');
        return;
    }

    if ( $target->{id} eq $c->{id} ) {
        $c->err("Can't ram yourself");
        return;
    }

    $self->{public}{shots}
      = [
        { player => $c->{id}, target => $msg->{target}, type => 'Ramming Gear' }
      ];
    $target->send( { cmd => 'ram', player => $c->{id} } );
}

sub on_shot {
    my ( $self, $game, $c, $msg ) = @_;

    if ( $c->{public}{ready} ) {
        $c->err('Invalid command');
        return;
    }

    unless ( $msg->{type} eq 'Ramming Gear'
        && exists $c->{public}{options}{ $msg->{type} } )
    {
        $c->err("$msg->{type} not held");
        return;
    }

    my $target = $game->{player}{ $msg->{target} };
    if ( !$target ) {
        $c->err('Missing target');
        return;
    }

    if ( $c->{id} eq $msg->{target} ) {
        $c->err("Can't shoot yourself");
        return;
    }

    if ( @{ $self->{public}{shots} } ) {
        $c->err('Shot already pending');
        return;
    }

    my $beam
      = { player => $c->{id}, target => $msg->{target}, type => $msg->{type} };
    push( @{ $self->{public}{shots} }, $beam );

    return $target, $beam;
}

sub resolve_bots {
    my ( $self, $game, $c, $msg ) = @_;

    my $ram = $self->{public}{shots}[0];
    unless ( defined $ram ) {
        $c->err('Invalid player');
        return;
    }

    if ( !defined( $msg->{player} ) || $ram->{player} ne $msg->{player} ) {
        $c->err('Invalid player');
        return;
    }

    if ( !defined( $msg->{target} ) || $ram->{target} ne $msg->{target} ) {
        $c->err('Invalid target');
        return;
    }

    if ( !defined( $msg->{type} ) || $msg->{type} ne 'Ramming Gear' ) {
        $c->err('Invalid type');
        return;
    }

    my $player = $game->{player}{ $ram->{player} };
    return ( $player, $ram );
}

sub remove {
    my ( $self, $bot, $beam ) = @_;
    $self->{public}{shots} = [];
}

sub on_hit {
    my ( $self, $game, $player, $target, $beam ) = @_;
    $self->damage( $game, $target, 1 );
    $self->do_ready( $game, $player );
}

sub on_damage_resolved {
    my ( $self, $game ) = @_;
    $game->set_state('BOARD') if $game->ready;
}

1;
