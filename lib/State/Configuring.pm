package State::Configuring;

use strict;
use warnings;
use parent 'State';

my @OPTS = (
    ['Conditional Program'  , 1, 0],
    ['Flywheel'             , 1, 0],
    ['Gyroscopic Stabilizer', 0, 1],
);

sub on_enter {
    my ( $self, $game ) = @_;
    $self->{public} = {};
    my $not_ready                = 0;
    my $can_auto_assign_flywheel = '';
    for my $p ( values %{ $game->{player} } ) {
        my $held = 0;
        $p->{public}{ready} = 1;
        next if $p->{public}{dead} || $p->{public}{shutdown};
        for my $opt (@OPTS) {
            my ($name, $cards, $tap) = @$opt;
            my $option = $p->{public}{options}{$name};
            if ( defined $option && $p->{private}{cards}->count >= $cards ) {
                $self->{public}{ $p->{id} } = $p->{public}{damage};
                $p->{public}{ready} = '';
                $held++;
            }
        }

        if ( !$p->{public}{ready} ) {
            $not_ready++;
            $p->send( { cmd => 'remaining', cards => $p->{private}{cards} } );
            if (   exists $p->{public}{options}{Flywheel}
                && $p->{private}{cards}->count == 1
                && $held == 1 )
            {
                $can_auto_assign_flywheel = 1;
            }
        }
    }

    if ( $not_ready == 0 || ( $not_ready == 1 && $can_auto_assign_flywheel ) ) {
        $game->set_state('EXECUTE');
    }
    else {
        $game->broadcast( { cmd => 'configuring', players => $self->{public} } );
    }
}

sub do_configure {
    my ( $self, $game, $c, $msg ) = @_;

    my %used;
    for my $opt (@OPTS) {
        my ( $name, $cards, $tap) = @$opt;
        my $option = $c->{public}{options}{$name};
        next unless defined $option;

        my $config = $msg->{$name};
        if ( !defined $config ) {
            $c->err("Missing config for $name");
            return;
        }

        if ( $cards ) {
            if ( $config eq 'null' ) {
                delete $option->{card};
                next;
            }

            my $card = $c->{private}{cards}->getMatch( $config );
            unless ( defined $card ) {
                $c->err("Invalid card");
                return;
            }
            if ( exists $used{ $card->{priority} } ) {
                $c->err("Attempt to use card twice");
                return;
            }

            $used{ $card->{priority} } = ();
            $option->{card} = $card;
        }

        if ( $tap ) {
            if ($config) {
                $option->{tapped} = 1;
            }
            else {
                delete $option->{tapped};
            }
        }
    }

    $game->broadcast(
        { cmd => 'options', player => $c->{id}, options => $c->{public}{options} } );

    unless ( $c->{public}{ready} ) {
        $c->{public}{ready} = 1;
        $game->broadcast( { cmd => 'ready', player => $c->{id} } );
    }

    if ( $game->ready ) {
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
