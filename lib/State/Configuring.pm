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
    for my $p ( values %{ $game->{player} } ) {
        $p->{public}{ready} = 1;
        while ( my ( $name, $opt ) = each %{ OPTS() } ) {
            my $option = $p->{public}{options}{$name};
            if ( defined $option && $p->{private}{cards}->count >= $opt->{cards} ) {
                $self->{choices}{$name} = ();
                $p->{public}{ready} = '';
            }
        }

        if ( !$p->{public}{ready} ) {
            $p->send( { cmd => 'remaining', cards => $p->{private}{cards} } );
        }
    }

    if ( $game->ready ) {
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
            $c->err('Missing card');
            return;
        }

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

    if ( $config->{tap} ) {
        if ( $msg->{activate} ) {
            $option->{tapped} = 1;
        }
        else {
            delete $option->{tapped};
        }
    }

    delete $self->{choices}{$name};
    $c->send( { cmd => 'options', options => $c->{public}{options} } );

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
