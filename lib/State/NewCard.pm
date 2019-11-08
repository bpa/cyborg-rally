package State::NewCard;

use strict;
use warnings;
use parent 'State';

sub on_enter {
    my ( $self, $game ) = @_;
    $self->{public} = {};
    for my $p ( values %{ $game->{player} } ) {
        my $new = 0;
        foreach my $o (keys %{$p->{public}{options}}) {
            if (!defined $p->{shown_options}) {
                $p->{shown_options}{$o} = ();
                $self->{public}{$o} = 1;
                $new++;
            }
        }
        $p->{public}{ready} = !$new;
    }

    if ( $game->ready ) {
        $game->set_state("PROGRAM");
    } else {
        $game->broadcast({cmd => "new_options", options => [keys %{$self->{public}}]});
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

1;