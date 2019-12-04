package State::Revive;

use strict;
use warnings;
use parent 'State';
use State::Setup;

sub on_enter {
    my ( $self, $game ) = @_;
    $self->{public} = {};
    my $all_ready = 1;
    for my $p ( values %{ $game->{player} } ) {
        if ( $p->{public}{dead} && $p->{public}{lives} ) {
            $p->{public}{dead}     = '';
            $p->{public}{ready}    = '';
            $p->{public}{shutdown} = 1;
            if ( $p->{public}{archive} eq 'superior' ) {
                $p->{public}{damage} = 0;
            }
            else {
                $p->{public}{damage} = 2;
            }
            $self->{public}{ $p->{id} } = $p->{public}{damage};
            $p->{public}{registers} = State::Setup::CLEAN();
            delete $p->{public}{will_shutdown};
            $all_ready = 0;
        }
        else {
            $p->{public}{ready} = 1;
        }
    }

    if ($all_ready) {
        $game->set_state('POWER');
    }
    else {
        $game->broadcast( { cmd => 'revive', players => $self->{public} } );
    }
}

sub do_ready {
    my ( $self, $game, $c, $msg ) = @_;

    return if $c->{public}{ready};
    $c->{public}{ready} = 1;

    $game->broadcast( ready => { player => $c->{id} } );
    $game->set_state('POWER') if $game->ready;
}

1;
