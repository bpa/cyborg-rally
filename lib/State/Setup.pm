package State::Setup;

use strict;
use warnings;
use parent 'State';
use List::Util 'shuffle';

# Don't have this be a constant because we need a new copy of each empty program
sub EMPTY { return { damaged => '', program => [] } }
sub CLEAN { return [ EMPTY, EMPTY, EMPTY, EMPTY, EMPTY ] }

sub on_enter {
    my ( $self, $game ) = @_;
    $game->{options} = Deck::Options->new;
    $game->{options}->shuffle;
    $game->{movement}
      = Deck::Movement->new( scalar( keys %{ $game->{player} } ) + 1 );
    my $dock = 1;
    for my $p ( shuffle values %{ $game->{player} } ) {
        $p->{public}{dock}      = $dock++;
        $p->{public}{dead}      = '';
        $p->{public}{lives}     = $game->{opts}{start_with_4_lives} ? 4 : 3;
        $p->{public}{memory}    = 9;
        $p->{public}{damage}    = $game->{opts}{start_with_2_damage} ? 2 : 0;
        $p->{public}{options}   = {};
        $p->{public}{shutdown}  = '';
        $p->{public}{registers} = CLEAN;
        $p->{private}{cards}    = [];

        if ( $game->{opts}{start_with_option} ) {
            my $opt = $game->{options}->deal;
            $p->{public}{options}{$opt->{name}} = $opt;
        }
    }

    if ( $game->{opts}{choose_1_of_3_options} ) {
        for my $p ( values %{ $game->{player} } ) {
            push @{ $p->{private}{options} }, $game->{options}->deal(3);
        }
    }
    else {
        $game->set_state('PROGRAM');
    }
}

sub do_choose {
    my ( $self, $game, $c, $msg ) = @_;
    if ( !$c->{private}{options} ) {
        $c->err("Already chose option");
        return;
    }

    if ( !$msg->{option} ) {
        $c->err("Missing option");
        return;
    }

    my $card
      = first { $_->{name} eq $msg->{option} } @{ $c->{private}{options} };
    if ( !$card ) {
        $c->err("Invalid option");
        return;
    }

    $c->{public}{options}{$card->{name}} = $card;
    undef $c->{private}{options};
    $c->send( { cmd => 'choose', options => $c->{public}{options} } );

    if ( !grep { $_->{private}{options} } values %{ $game->{player} } ) {
        $game->set_state('CHOOSE');
    }
}

sub on_exit {
    my ( $self, $game ) = @_;
    $game->broadcast( { cmd => 'setup', public => $game->{public} } );
}

1;
