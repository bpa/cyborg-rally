package State::Revive;

use strict;
use warnings;
use parent 'State';

sub on_enter {
    my ( $self, $game ) = @_;
    my $all_ready = 1;
    for my $p ( values %{ $game->{player} } ) {
        if ( $p->{public}{dead} && $p->{public}{lives} ) {
            $p->{public}{dead}     = '';
            $p->{public}{damage}   = 2;
            $p->{public}{shutdown} = 1;
            $p->send('revive');
            $all_ready = 0;
        }
        else {
            $p->{public}{ready} = 1;
        }
    }
    $game->set_state('POWER') if $all_ready;
}

sub do_ready {
    my ($self, $game, $c, $msg) = @_;

    return if $c->{public}{ready};
    $c->{public}{ready} = 1;

    $game->set_state('POWER') if $game->ready;
}

1;
