package State::Setup;

use strict;
use warnings;
use parent 'State';
use List::Util 'shuffle';

sub on_enter {
    my ( $self, $game ) = @_;
    $game->{options} = Deck::Options->new;
    $game->{options}->shuffle;
    $game->{movement}
      = Deck::Movement->new( scalar( keys %{ $game->{player} } ) );
    my $dock = 1;
    for my $p ( shuffle values %{ $game->{player} } ) {
        $p->{public}{dock}    = $dock++;
        $p->{public}{lives}   = $game->{opts}{start_with_4_lives} ? 4 : 3;
        $p->{public}{memory}  = 9;
        $p->{public}{damage}  = $game->{opts}{start_with_2_damage} ? 2 : 0;
        $p->{public}{options} = [];
        $p->{private}{cards}  = [];
        if ( $game->{opts}{start_with_option} ) {
            push @{ $p->{public}{options} }, $game->{options}->deal;
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
    my ( $self, $c, $game, $msg ) = @_;
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

    push @{ $c->{public}{options} }, $card;
    undef $c->{private}{options};
    $c->send( { cmd => 'choose', options => $c->{public}{options} } );

    if ( !grep { $_->{private}{options} } values %{ $game->{player} } ) {
        $game->set_state('CHOOSE');
    }
}

1;
