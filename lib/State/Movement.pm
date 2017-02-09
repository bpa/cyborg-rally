package State::Movement;

use strict;
use warnings;
use parent 'State';
use List::MoreUtils 'firstidx';

sub on_enter {
    my ( $self, $game ) = @_;

    my $r = $game->{public}{register};
    my @order = sort { $b->{priority} <=> $a->{priority} }
      map {
        my $p
          = { player => $_->{id}, program => $_->{public}{registers}[$r]{program} };
        $p->{priority} = $p->{program}[0]{priority};
        $p;
      } grep { !$_->{public}{dead} } values %{ $game->{player} };
    $self->{public} = \@order;
    if (@order) {
        $game->broadcast( { cmd => 'move', order => \@order } );
    }
    else {
        $game->set_state('BOARD');
    }
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

1;
