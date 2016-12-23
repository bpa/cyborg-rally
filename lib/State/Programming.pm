package State::Programming;

use strict;
use warnings;
use List::MoreUtils;

use parent 'State';

sub on_enter {
    my ( $self, $game ) = @_;
    $game->{movement}->reset->shuffle;
    for my $p ( values %{ $game->{player} } ) {
        if ( $p->{public}{lives} > 0 && !$p->{public}{shutdown} ) {
            $p->{public}{ready} = 0;
            my $cards = $p->{public}{memory} - $p->{public}{damage};
            $p->{private}{cards} = [ $game->{movement}->deal($cards) ];
        }
        else {
            $p->{public}{ready}  = 1;
            $p->{private}{cards} = [];
        }
        $p->send( { cmd => 'programming', cards => $p->{private}{cards} } );
    }

    if ( $game->{opts}{timer} eq '30s' ) {
        $self->{timer} = $game->timer( 30, &Game::change_state, $game, 'ANNOUNCE' );
    }
    elsif ( $game->{opts}{timer} eq '1m' ) {
        $self->{timer} = $game->timer( 60, &Game::change_state, $game, 'ANNOUNCE' );
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
            || locked_but_not_matching( $i, $r, $c )
            || @$r > 1 )
        {
            $c->err("Invalid program");
            return;
        }
        push @cards, @$r unless $c->{public}{registers}[$i]{damaged};
    }

    for my $c (@cards) {
        unless ( $c->{private}{cards}->contains($c) ) {
            $c->err("Invalid card");
            return;
        }
    }

    $c->{private}{registers} = $msg->{registers};
    $c->send( program => { registers => $msg->{registers} } );
};

sub do_ready {
    my ( $self, $c, $game, $msg ) = @_;

    if ( grep ( @$_ > 0, @{ $c->{private}{registers} } ) != 5 ) {
        $c->err('Programming incomplete');
        return;
    }

    $c->{public}{ready} = 1;
    $game->broadcast( ready => { player => $c->{id} } );
    $game->change_state('ANNOUNCING')
      unless grep { !$_->{public}{ready} } values %{ $game->{players} };

    my $not_ready = false { $_->{public}{ready} } values %{ $game->{player} };
    if ( $not_ready == 0 ) {
        $game->set_state('ANNOUNCE');
        return;
    }

    return if $self->{timer};

    if ( $game->{opts}{timer} eq '1st+30s' || $not_ready == 1 ) {
        $self->{timer} = $game->timer( 30, &Game::change_state, $game, 'ANNOUNCE' );
    }
}

sub locked_but_not_matching {
    my ( $i, $register, $c ) = @_;
    return unless $c->{public}{registers}[$i]{damaged};

    my $locked = $c->{public}{registers}[$i]{program};

    return 1 unless @$register == @$locked;
    for my $j ( 0 .. $#$register ) {
        return 1 unless $register->[$j] eq $locked->[$j];
    }

    return;
}

sub on_exit {
    my ( $self, $game ) = @_;
    undef $self->{timer};
    for my $p ( values %{ $game->{players} } ) {
        next if $p->{ready};

        my $cards = Deck->new( $p->{private}{cards}->values );
        for my $i ( 0 .. 4 ) {
            $cards->remove( $p->{private}{registers}[$i] )
              unless $p->{public}{registers}[$i]{damaged};
        }

        my @available = shuffle $cards->values;
        for my $i ( 0 .. 4 ) {
            $p->{private}{registers}[$i] ||= [];
            my $r = $p->{private}{registers}[$i];
            if ( @$r == 0 ) {
                if ( $p->{public}{registers}[$i]{damaged} ) {
                    push @$r, @{ $p->{public}{registers}[$i]{program} };
                }
                else {
                    push @$r, shift @available;
                }
            }
        }
    }
}

1;
