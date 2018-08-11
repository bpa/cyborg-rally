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
        if ( defined $flywheel ) {
            $self->{choices}{flywheel} = ();
            $p->{public}{ready}        = '';
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

    if ( defined $msg->{card} ) {
        $flywheel->{card} = $msg->{card};
    }
    else {
        $c->err('Missing card');
    }
    delete $self->{choices}{flywheel};

    if ( !%{ $self->{choices} } ) {
        $game->set_state('EXECUTE');
    }
}

1;
