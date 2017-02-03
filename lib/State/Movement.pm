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
      } values %{ $game->{player} };
    $self->{public} = \@order;
    $game->broadcast( { cmd => 'move', order => \@order } );
}

sub do_ready {
    my ( $self, $game, $c, $msg ) = @_;

    if ( $c->{public}{ready} ) {
        $c->err('Already moved');
        return;
    }

    my $register = $c->{public}{registers}[ $game->{public}{register} ];
    if ( $register->{program}[-1]{name} =~ /[rul]/ ) {
        my $idx = firstidx { $_->{player} eq $c->{id} } @{ $self->{public} };
        splice @{ $self->{public} }, $idx, 1;
    }
    elsif ( $c->{id} eq $self->{public}[0]{player} ) {
        shift @{ $self->{public} };
    }
    else {
        $c->err('Not your turn');
        return;
    }

    $c->{public}{ready} = 1;
    if ( @{ $self->{public} } ) {
        $game->broadcast(
            {   cmd    => 'ready',
                player => $c->{id},
                next   => $self->{public}[0]{player}
            }
        );
    }
    else {
        $game->set_state('BOARD');
    }
}

1;
