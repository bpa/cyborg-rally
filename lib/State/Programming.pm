package State::Programming;

use strict;
use warnings;
use Card;
use Deck;
use List::MoreUtils qw/false none/;
use Storable 'dclone';
use State::Setup;

use parent 'State';

sub on_enter {
    my ( $self, $game ) = @_;
    my $ready = 0;
    my $total = 0;
    delete $game->{public}{option}{'Recompile'}{tapped};
    $game->{movement}->reset->shuffle;
    for my $p ( values %{ $game->{player} } ) {
        if ( $p->{public}{shutdown} ) {
            $p->{public}{damage} = 0;
            $total++;
            $ready++;
        }

        if ( $p->{public}{dead} || $p->{public}{shutdown} ) {
            $p->{public}{ready}      = 1;
            $p->{private}{registers} = State::Setup::CLEAN;
            $p->send( { cmd => 'programming' } );
            next;
        }

        $total++;
        $p->{public}{ready} = '';
        my $cards = $p->{public}{memory} - $p->{public}{damage};
        $cards++ if exists $p->{public}{options}{'Extra Memory'};

        my $flywheel = $p->{public}{options}{'Flywheel'};
        if ( defined $flywheel ) {
            $self->{flywheel} = delete $flywheel->{card};
        }

        my $cnd_program = $p->{public}{options}{'Conditional Program'};
        if ( defined $cnd_program ) {
            delete $cnd_program->{card};
        }

        map { $_->{program} = [] unless $_ && $_->{locked} } @{ $p->{public}{registers} };
        $self->give_cards( $game, $p, $cards );

        if ( $p->{private}{cards}->count < 2 && !exists $p->{public}{options}{'Recompile'} ) {
            $p->{public}{ready} = 1;
            $game->broadcast( ready => { player => $p->{id} } );
            $ready++;
        }
    }

    if ( $game->ready ) {
        $game->set_state('ANNOUNCE');
    }
    elsif ( $ready && $game->{opts}{timer} eq '1st+30s' ) {
        $game->timer( 30, \&Game::set_state, $game, 'ANNOUNCE' );
    }
    elsif ( $ready == $total - 1 && $game->{opts}{timer} eq 'standard' ) {
        $game->timer( 30, \&Game::set_state, $game, 'ANNOUNCE' );
    }
    elsif ( $game->{opts}{timer} eq '30s' ) {
        $game->timer( 30, \&Game::set_state, $game, 'ANNOUNCE' );
    }
    elsif ( $game->{opts}{timer} eq '1m' ) {
        $game->timer( 60, \&Game::set_state, $game, 'ANNOUNCE' );
    }
}

sub give_cards {
    my ( $self, $game, $p, $cards ) = @_;
    $p->{private}{cards} = Deck->new( $game->{movement}->deal($cards) );
    if ( defined $self->{flywheel} && defined $p->{public}{options}{'Flywheel'} ) {
        $p->{private}{cards}->add( $self->{flywheel} );
    }
    $p->{private}{registers}
      = [ map { dclone($_) } @{ $p->{public}{registers} } ];
    $p->send(
        {   cmd       => 'programming',
            cards     => $p->{private}{cards},
            registers => $p->{private}{registers},
        }
    );
}

sub do_program {
    my ( $self, $game, $c, $msg ) = @_;

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
            || ( @$r > 1 && invalid_combo( $r, $c ) ) )
        {
            $c->err("Invalid program");
            return;
        }

        push @cards, @$r unless $c->{public}{registers}[$i]{locked};
    }

    if ( too_many_doubles( $msg->{registers}, $c ) ) {
        $c->err("Invalid program");
        return;
    }

    for my $card (@cards) {
        unless ( $c->{private}{cards}->contains($card) ) {
            $c->err("Invalid card");
            return;
        }
    }

    my %id;
    for my $card (@cards) {
        my $ref = ref($card);
        if ( ( $ref ne 'HASH' && $ref ne 'Card' )
            || exists $id{ $card->{priority} } )
        {
            $c->err("Invalid program");
            return;
        }
        $id{ $card->{priority} } = ();
    }

    for my $i ( 0 .. 4 ) {
        my $r = $c->{private}{registers}[$i];
        next if $r->{locked};

        if ( defined $msg->{registers}[$i] ) {
            $r->{program} = $msg->{registers}[$i];
        }
        else {
            $r->{program} = [];
        }
    }
    $c->send( program => { registers => $c->{private}{registers} } );
}

sub do_recompile {
    my ( $self, $game, $c, $msg ) = @_;

    if ( $c->{public}{ready} ) {
        $c->err('Registers are already programmed');
        return;
    }

    my $recompile = $c->{public}{options}{'Recompile'};
    unless ( defined $recompile ) {
        $c->err('Invalid Option');
        return;
    }

    if ( $recompile->{tapped} ) {
        $c->err('Already recompiled');
        return;
    }

    $recompile->{tapped} = $c->{id};
    my $cards = $c->{public}{memory} - $c->{public}{damage};
    $cards++ if exists $c->{public}{options}{'Extra Memory'};
    $self->give_cards( $game, $c, $cards );
    $game->broadcast( { cmd => 'option', player => $c->{id}, option => $recompile } );
}

sub too_many_doubles {
    my ( $program, $player ) = @_;
    my ( $used, $needed ) = ( 0, 0 );
    my $registers = $player->{public}{registers};
    for my $i ( 0 .. 4 ) {
        next if $registers->[$i]{locked};
        if ( $program->[$i] ) {
            $used += @{ $program->[$i] };
        }
        else {
            $needed++;
        }
    }
    my $have = $player->{private}{cards}->count;
    return $player->{private}{cards}->count - $used < $needed;
}

sub invalid_combo {
    my ( $register, $player ) = @_;
    my ( $move, $rot ) = map { $_->{name} } @$register;
    if ( exists $player->{public}{options}{'Crab Legs'} ) {
        if ( $move eq '1' ) {
            return none { $_ eq $rot } qw/r l/;
        }
    }
    if ( exists $player->{public}{options}{'Dual Processor'} ) {
        if ( $move eq '2' ) {
            return none { $_ eq $rot } qw/r l/;
        }
        if ( $move eq '3' ) {
            return none { $_ eq $rot } qw/r l u/;
        }
    }
    return 1;
}

sub do_ready {
    my ( $self, $game, $c, $msg ) = @_;

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

    return if $game->{timer};

    if ( $game->{opts}{timer} eq '1st+30s' || $not_ready == 1 ) {
        $game->timer( 30, \&Game::set_state, $game, 'ANNOUNCE' );
    }
}

sub locked_but_not_matching {
    my ( $i, $cards, $registers ) = @_;

    return unless $registers->[$i]{locked};

    my $locked = $registers->[$i]{program};

    return 1 unless @$cards == @$locked;
    for my $j ( 0 .. $#$cards ) {
        return 1 unless $cards->[$j]{priority} == $locked->[$j]{priority};
    }

    return;
}

sub on_exit {
    my ( $self, $game ) = @_;

    for my $p ( values %{ $game->{player} } ) {
        my $cards     = $p->{private}{cards};
        my $registers = delete $p->{private}{registers};

        for my $r (@$registers) {
            map { $cards->remove($_) } @{ $r->{program} } if !$r->{locked};
        }
        if ( $p->{public}{ready} ) {
            $p->{public}{registers} = $registers;
        }
        else {
            $cards->shuffle;
            for my $i ( 0 .. 4 ) {
                my $r = $registers->[$i];
                $r->{program}[0] = $cards->deal unless @{ $r->{program} };
                $p->{public}{registers}[$i]{program} = $r->{program};
            }
        }
    }
}

1;
