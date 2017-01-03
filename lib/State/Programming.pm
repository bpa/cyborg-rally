package State::Programming;

use strict;
use warnings;
use Card;
use Deck;
use List::MoreUtils 'false';

use parent 'State';

use constant NOP => {
    damaged => 0,
    program =>
      [ Card->new( { name => '0', priority => 0, number => 1, total => 1 } ) ]
};
use constant DEAD => [ NOP, NOP, NOP, NOP, NOP ];

sub on_enter {
    my ( $self, $game ) = @_;
    $game->{movement}->reset->shuffle;
    for my $p ( values %{ $game->{player} } ) {
        if ( $p->{public}{lives} > 0 && !$p->{public}{shutdown} ) {
            $p->{public}{ready} = 0;
            my $cards = $p->{public}{memory} - $p->{public}{damage};
            $p->{private}{cards} = Deck->new( $game->{movement}->deal($cards) );
            map { $_->{program} = [] unless $_ && $_->{damaged} }
              @{ $p->{public}{registers} };
            $p->{private}{registers} = [ @{ $p->{public}{registers} } ];
            $p->send( { cmd => 'programming', cards => $p->{private}{cards} } );
        }
        else {
            $p->{public}{ready}      = 1;
            $p->{private}{registers} = DEAD;
            $p->send( { cmd => 'programming' } );
        }
    }

    if ( $game->{opts}{timer} eq '30s' ) {
        $self->{timer}
          = $game->timer( 30, \&Game::change_state, $game, 'ANNOUNCE' );
    }
    elsif ( $game->{opts}{timer} eq '1m' ) {
        $self->{timer}
          = $game->timer( 60, \&Game::change_state, $game, 'ANNOUNCE' );
    }
}

sub do_program {
    my ( $self, $c, $game, $msg ) = @_;

    if ( $c->{public}{ready} ) {
        $c->err('Registers are already programmed');
        return;
    }

    if ( ref( $msg->{registers} ) ne 'ARRAY' || @{ $msg->{registers} } > 5 ) {
        $c->err("Invalid program");
        return;
    }

    my @cards;
    for my $i ( 0 .. $#{ $msg->{registers} } ) {
        my $r = $msg->{registers}[$i];
        if (   ref($r) ne 'ARRAY'
            || locked_but_not_matching( $i, $r, $c->{public}{registers} )
            || @$r > 1 )
        {
            $c->err("Invalid program");
            return;
        }
        push @cards, @$r unless $c->{public}{registers}[$i]{damaged};
    }

    for my $card (@cards) {
        unless ( $c->{private}{cards}->contains($card) ) {
            $c->err("Invalid card");
            return;
        }
    }

    for my $i ( 0 .. 4 ) {
        my $r = $c->{private}{registers}[$i];
        next if $r->{damaged};

        if ( $msg->{registers}[$i] ) {
            $r->{program} = $msg->{registers}[$i];
        }
        else {
            $r->{program} = [];
        }
    }
    $c->send( program => { registers => $c->{private}{registers} } );
}

sub do_ready {
    my ( $self, $c, $game, $msg ) = @_;

    if ( false { @{ $_->{program} } } @{ $c->{private}{registers} } ) {
        $c->err('Programming incomplete');
        return;
    }

    $c->{public}{ready} = 1;
    $game->broadcast( ready => { player => $c->{id} } );

    my $not_ready = false { $_->{public}{ready} } values %{ $game->{player} };
    if ( $not_ready == 0 ) {
        $game->set_state('ANNOUNCE');
        return;
    }

    return if $self->{timer};

    if ( $game->{opts}{timer} eq '1st+30s' || $not_ready == 1 ) {
        $self->{timer} = $game->timer( 30, \&Game::set_state, $game, 'ANNOUNCE' );
    }
}

sub locked_but_not_matching {
    my ( $i, $card, $registers ) = @_;

    return unless $registers->[$i]{damaged};

    my $locked = $registers->[$i]{program};

    return 1 unless @$card == @$locked;
    for my $j ( 0 .. $#$card ) {
        return 1 unless $card->[$j] eq $locked->[$j];
    }

    return;
}

sub on_exit {
    my ( $self, $game ) = @_;
    undef $self->{timer};
    for my $p ( values %{ $game->{player} } ) {
        my $cards = delete $p->{private}{cards};

        next if $p->{ready};

        $cards->shuffle;
        my $registers = delete $p->{private}{registers};
        for my $i ( 0 .. 4 ) {
            my $r = $registers->[$i];
            map { $cards->remove($_) } @{ $r->{program} } if !$r->{damaged};
            $r->{program}[0] = $cards->deal unless @{$r->{program}};
            $p->{public}{registers}[$i]{program} = $r->{program};
        }
    }
}

1;
