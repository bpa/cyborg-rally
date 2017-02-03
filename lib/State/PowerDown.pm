package State::PowerDown;

use strict;
use warnings;
use parent 'State';

sub on_enter {
    my ( $self, $game ) = @_;
    for my $p ( values %{ $game->{player} } ) {
        if ( $p->{public}{shutdown} ) {
            $p->{public}{shutdown} = '';
            $p->send('declare_shutdown');
        }
        else {
            $self->{ready}{ $p->{id} } = 1;
        }
    }

    if ( scalar( keys %{ $self->{ready} } ) == scalar( keys %{ $game->{player} } ) )
    {
        $game->set_state('PROGRAM');
    }
    else {
        $game->timer( 10, \&Game::change_state, $game, 'PROGRAM' );
    }
}

sub do_shutdown {
    my ( $self, $game, $c, $msg ) = @_;

    return if $self->{ready}{ $c->{id} };
    $self->{ready}{ $c->{id} } = 1;
    $c->{public}{shutdown} = !!$msg->{activate};

    if ( scalar( keys %{ $self->{ready} } ) == scalar( keys %{ $game->{player} } ) )
    {
        $game->set_state('PROGRAM');
    }
}

sub on_exit {
    my ( $self, $game ) = @_;
    delete $self->{ready};
}

1;
