package State::ConditionalProgramming;

use strict;
use warnings;
use parent 'State';

sub on_enter {
    my ( $self, $game ) = @_;

    my $option_exists = '';
    for my $p ( values %{ $game->{player} } ) {
        if (   defined $p->{public}{options}{'Conditional Program'}
            && defined $p->{public}{options}{'Conditional Program'}{card} )
        {
            $option_exists = 1;
            last;
        }
    }

    if ($option_exists) {
        $game->timer( 10, \&Game::set_state, $game, 'MOVE' );
    }
    else {
        $game->set_state('MOVE');
    }
}

sub do_conditional_program {
    my ( $self, $game, $c, $msg ) = @_;

    if ( !defined $c->{public}{options}{'Conditional Program'} ) {
        $c->err("Invalid command");
        return;
    }

    if ( $msg->{replace} ) {
        my $r = $game->{public}{register};
        my $card = delete $c->{public}{options}{'Conditional Program'}{card};
        $c->{public}{registers}[$r]{program} = [$card];
    }

    $game->set_state('MOVE');
}

1;
