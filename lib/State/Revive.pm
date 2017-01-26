package State::Revive;

use strict;
use warnings;
use parent 'State';

sub on_enter {
    my ( $self, $game ) = @_;
    for my $p ( values %{ $game->{player} } ) {
        if ( $p->{public}{dead} && $p->{public}{lives} ) {
            $p->{public}{dead}     = '';
            $p->{public}{damage}   = 2;
            $p->{public}{shutdown} = 1;
            $p->send('revive');
        }
        else {
            $self->{ready}{ $p->{id} } = 1;
        }
    }
    if (scalar(keys %{$self->{ready}}) == scalar(keys %{$game->{player}})) {
        $game->set_state('POWER');
    }
}

sub do_ready {
    my ($self, $game, $c, $msg) = @_;

    return if $self->{ready}{$c->{id}};
    $self->{ready}{$c->{id}} = 1;

    if (scalar(keys %{$self->{ready}}) == scalar(keys %{$game->{player}})) {
        $game->set_state('POWER');
    }
}

sub on_exit {
    my ($self, $game) = @_;
    delete $self->{ready};
}

1;
