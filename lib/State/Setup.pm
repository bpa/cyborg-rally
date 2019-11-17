package State::Setup;

use strict;
use warnings;
use parent 'State';
use List::Util qw/first shuffle/;
use List::MoreUtils qw/all/;

# Don't have this be a constant because we need a new copy of each empty program
sub EMPTY { return { damaged => '', locked => '', program => [] } }
sub CLEAN { return [ EMPTY, EMPTY, EMPTY, EMPTY, EMPTY ] }

sub on_enter {
    my ( $self, $game ) = @_;
    $game->{accepting_players} = '';
    $game->{public}{option}    = {};
    $game->{options}           = Deck::Options->new;
    $game->{options}->shuffle;
    for my $o ( @{ $game->{options}{cards} } ) {
        $game->{public}{option}{ $o->{name} } = $o;
    }
    $game->{movement}
      = Deck::Movement->new( scalar( keys %{ $game->{player} } ) + 1 );
    my $dock  = 1;
    my $lives = validate_lives($game);

    for my $p ( shuffle values %{ $game->{player} } ) {
        $p->{public}{dock}      = $dock++;
        $p->{public}{dead}      = '';
        $p->{public}{lives}     = $lives;
        $p->{public}{memory}    = 9;
        $p->{public}{damage}    = $game->{opts}{start_with_2_damage} ? 2 : 0;
        $p->{public}{options}   = {};
        $p->{public}{archive}   = 'standard';
        $p->{public}{shutdown}  = '';
        $p->{public}{registers} = CLEAN;
        $p->{private}{cards}    = [];

        if ( $game->{opts}{options} eq '1' ) {
            my $opt = $game->{options}->deal;
            $p->{public}{options}{ $opt->{name} } = $opt;
        }
    }

    if ( $game->{opts}{options} eq '1of3' ) {
        for my $p ( values %{ $game->{player} } ) {
            $p->{public}{ready} = 0;
            push @{ $p->{private}{options} }, $game->{options}->deal(3);
            $p->send( { cmd => 'pick', options => $p->{private}{options} } );
        }
    }
    else {
        $game->set_state('NEW_CARD');
    }
}

sub validate_lives {
    my $lives = $_[0]->{opts}{lives};
    return
        $lives == 4     ? 4
      : $lives == 'Inf' ? 1
      :                   3;
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

    my $card = first { $_->{name} eq $msg->{option} } @{ $c->{private}{options} };
    if ( !defined($card) ) {
        $c->err("Invalid option");
        return;
    }

    $c->{public}{options}{ $card->{name} } = $card;
    undef $c->{private}{options};
    $game->broadcast(
        {   cmd     => 'options',
            player  => $c->{id},
            options => $c->{public}{options}
        }
    );
    $game->broadcast( { cmd => 'ready', player => $c->{id} } );
    $c->{public}{ready} = 1;

    if ( all { $_->{public}{ready} } values %{ $game->{player} } ) {
        $game->set_state('NEW_CARD');
    }
}

sub on_exit {
    my ( $self, $game ) = @_;
    $game->broadcast( { cmd => 'setup', public => $game->{public} } );
}

1;
