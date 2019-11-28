package State::Configuring;

use strict;
use warnings;
use parent 'State';

use constant OPTS => {
    'Conditional Program'   => { cards => 1 },
    'Flywheel'              => { cards => 1 },
    'Gyroscopic Stabilizer' => { cards => 0, tap => 1 },
};

sub on_enter {
    my ( $self, $game ) = @_;
    $self->{choices} = {};
    my $not_ready                = 0;
    my $can_auto_assign_flywheel = '';
    for my $p ( values %{ $game->{player} } ) {
        my $held = 0;
        $p->{public}{ready} = 1;
        next if $p->{public}{dead} || $p->{public}{shutdown};
        while ( my ( $name, $opt ) = each %{ OPTS() } ) {
            my $option = $p->{public}{options}{$name};
            if ( defined $option && $p->{private}{cards}->count >= $opt->{cards} ) {
                $self->{choices}{$name} = ();
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
}

sub do_configure {
    my ( $self, $game, $c, $msg ) = @_;

    my $name = $msg->{option};
    if ( !defined $name ) {
        $c->err('Missing Option');
        return;
    }

    my $option = $c->{public}{options}{$name};
    my $config = OPTS->{$name};
    if ( !( defined $option && defined $config ) ) {
        $c->err('Invalid Option');
        return;
    }

    if ( $config->{cards} ) {
        if ( !defined $msg->{card} ) {
            delete $c->{public}{options}{$name}{card};
        }
        else {
            my $card = $c->{private}{cards}->getMatch( $msg->{card} );
            unless ( defined $card ) {
                $c->err("Invalid card");
                return;
            }

            for my $opt ( keys( %{ OPTS() } ) ) {
                my $o = $c->{public}{options}{$opt};
                if (   defined $o
                    && defined $o->{card}
                    && $o->{card}{priority} == $card->{priority} )
                {
                    delete $o->{card};
                    $self->{choices}{$opt} = ();
                }
            }

            $c->{public}{options}{$name}{card} = $card;
        }
    }

    if ( $config->{tap} ) {
        if ( $msg->{activate} ) {
            $option->{tapped} = 1;
        }
        else {
            delete $option->{tapped};
        }
    }

    delete $self->{choices}{$name};
    $c->send( { cmd => 'options', player => $c->{id}, options => $c->{public}{options} } );

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
