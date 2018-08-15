package State::Configuring;

use strict;
use warnings;
use parent 'State';

sub on_enter {
    my ( $self, $game ) = @_;
    $self->{choices} = {};
    for my $p ( values %{ $game->{player} } ) {
        $p->{public}{ready} = 1;
        my $stabilizer = $p->{public}{options}{'Gyroscopic Stabilizer'};
        my $flywheel   = $p->{public}{options}{'Flywheel'};
        if ( defined $stabilizer ) {
            $self->{choices}{stabilizer} = ();
            $p->{public}{ready}          = '';
        }
        if ( defined $flywheel && $p->{private}{cards}->count > 0 ) {
            $self->{choices}{flywheel} = ();
            $p->{public}{ready}        = '';
            $p->send( { cmd => 'remaining', cards => $p->{private}{cards} } );
        }
    }

    if ( $game->ready ) {
        $game->set_state('EXECUTE');
    }
}

sub do_stabilizer {
    my ( $self, $game, $c, $msg ) = @_;
    my $stabilizer = $c->{public}{options}{'Gyroscopic Stabilizer'};
    if ( !defined $stabilizer ) {
        $c->err('Invalid Option');
        return;
    }

    if ( $msg->{activate} ) {
        $stabilizer->{tapped} = 1;
    }
    else {
        delete $stabilizer->{tapped};
    }
    delete $self->{choices}{'stabilizer'};
    $game->broadcast_options($c);

    if ( !%{ $self->{choices} } ) {
        $game->set_state('EXECUTE');
    }
}

sub do_flywheel {
    my ( $self, $game, $c, $msg ) = @_;
    my $flywheel = $c->{public}{options}{'Flywheel'};
    if ( !defined $flywheel ) {
        $c->err('Invalid Option');
        return;
    }

    if ( !defined $msg->{card} ) {
        $c->err('Missing card');
        return;
    }

    my $card = $c->{private}{cards}->getMatch( $msg->{card} );
    unless ( defined $card ) {
        $c->err("Invalid card");
        return;
    }

    $c->{public}{options}{Flywheel}{card} = $card;
    delete $self->{choices}{flywheel};

    if ( !%{ $self->{choices} } ) {
        $game->set_state('EXECUTE');
    }
}

sub on_exit {
    my ( $self, $game ) = @_;

    for my $p ( values %{ $game->{player} } ) {
        delete $p->{private}{cards};
    }
}

1;
