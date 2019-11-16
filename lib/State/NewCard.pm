package State::NewCard;

use strict;
use warnings;
use parent 'State';

sub on_enter {
    my ( $self, $game ) = @_;
    my $new = 0;
    $self->{public} = {};
    for my $p ( values %{ $game->{player} } ) {
        my $options_from_last_round = $p->{previously_held_options} || {};
        foreach my $o (keys %{$p->{public}{options}}) {
            $p->{public}{ready} = '';
            if (!exists $options_from_last_round->{$o}) {
                $self->{public}{$o} = 1;
                $new++;
            }
        }
    }

    if ( $new ) {
        $game->broadcast({cmd => "new_options", options => [keys %{$self->{public}}]});
    } else {
        $game->set_state("PROGRAM");
    }
}

sub do_ready {
    my ( $self, $game, $c, $msg ) = @_;

    $c->{public}{ready} = 1;

    if ( $game->ready ) {
        $game->set_state('PROGRAM');
    }
    else {
        $game->broadcast( { cmd => 'ready', player => $c->{id} } );
    }
}

sub on_exit {
    my ( $self, $game ) = @_;

    for my $p ( values %{ $game->{player} } ) {
        my %held;
        foreach my $o (keys %{$p->{public}{options}}) {
            $held{$o} = ();
        }
        $p->{previously_held_options} = \%held;
    }
}

1;