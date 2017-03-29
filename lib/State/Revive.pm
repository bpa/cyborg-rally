package State::Revive;

use strict;
use warnings;
use parent 'State';
use State::Setup;

sub on_enter {
    my ( $self, $game ) = @_;
    my $all_ready = 1;
    for my $p ( values %{ $game->{player} } ) {
        if ( $p->{public}{dead} && $p->{public}{lives} ) {
            $p->{public}{dead}      = '';
            $p->{public}{ready}     = '';
            $p->{public}{shutdown}  = 1;
            $p->{public}{damage}    = 2;
            $p->{public}{registers} = State::Setup::CLEAN();
            delete $p->{public}{will_shutdown};
            $game->broadcast(
                {   cmd    => 'revive',
                    player => $p->{id},
                    damage => $p->{public}{damage}
                }
            );
            $all_ready = 0;
        }
        else {
            $p->{public}{ready} = 1;
        }
    }
    $game->set_state('POWER') if $all_ready;
}

sub do_ready {
    my ( $self, $game, $c, $msg ) = @_;

    return if $c->{public}{ready};
    $c->{public}{ready} = 1;

    $game->broadcast( ready => { player => $c->{id} } );
    $game->set_state('POWER') if $game->ready;
}

1;
