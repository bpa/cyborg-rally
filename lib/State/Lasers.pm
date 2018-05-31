package State::Lasers;

use strict;
use warnings;
use parent qw/State DamageHandler/;

use constant DIR => qw/n e s w/;

sub on_enter {
    my ($self, $game) = @_;
    $game->set_ready_to_dead;
    $game->set_state('FIRE') if $game->ready;
}

sub do_laser {
    my ( $self, $game, $c, $msg ) = @_;

    if ($c->{public}{ready}) {
        $c->err('Already declared');
        return;
    }

    $c->{public}{ready} = 1;
    for my $d (DIR) {
        if ($msg->{$d}) {
            $self->damage( $game, $c, $msg->{$d});
        }
    }

    if ($game->ready) {
        $game->set_state('FIRE');
    }
}

1;
