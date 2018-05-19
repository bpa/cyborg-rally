package State::DisputeHandler;

use strict;
use warnings;
use parent 'State';

sub do_confirm {
    my ( $self, $game, $c, $msg ) = @_;

    $msg->{target} = $c->{id};
    my ( $bot, $beam ) = $self->resolve_beam( $game, $c, $msg );
    return unless $bot;

    $self->on_hit( $game, $bot, $c, $beam );
}

sub do_deny {
    my ( $self, $game, $c, $msg ) = @_;

    $msg->{target} = $c->{id};
    my ( $bot, $beam, $dir ) = $self->resolve_beam( $game, $c, $msg );
    if ($bot) {
        delete $self->{shot}{ $bot->{id} }{ $msg->{target} };
        $self->{shot}{ $bot->{id} }{used}--;
        $self->remove($beam);
        $bot->send( { cmd => 'deny', player => $c->{id}, type => $beam->{type} } );
    }
}

sub do_dispute {
    my ( $self, $game, $c, $msg ) = @_;

    if (scalar( keys( %{ $game->{player} } ) ) < 3) {
        $c->err('Disputes only allowed with more than 2 players');
        return;
    }

    my ( $target, $beam ) = $self->on_shot( $game, $c, $msg );
    return unless $target;

    $beam->{dispute} = 1;
    $beam->{hit}     = 1;
    $beam->{miss}    = 1;
    $beam->{voted}   = { $c->{id} => 1, $target->{id} => '' };

    for my $p ( values %{ $game->{player} } ) {
        $p->send(
            {   cmd    => 'dispute',
                type   => $msg->{type},
                player => $c->{id},
                target => $target->{id},
            }
        ) unless exists $beam->{voted}{ $p->{id} };
    }
}

sub do_vote {
    my ( $self, $game, $c, $msg ) = @_;

    if ( !exists $msg->{hit} ) {
        $c->err('Missing hit (boolean)');
        return;
    }

    my ( $bot, $beam, $dir ) = $self->resolve_beam( $game, $c, $msg );
    return unless $bot;

    if ( exists $beam->{voted}{ $c->{id} } ) {
        $c->err('Already voted');
        return;
    }

    my $vote    = !!$msg->{hit};
    my $players = scalar( keys( %{ $game->{player} } ) );
    my $box     = $vote ? 'hit' : 'miss';
    $beam->{voted}{ $c->{id} } = $vote;
    my $count = ++$beam->{$box};
    my $hit   = $beam->{hit};
    my $miss  = $beam->{miss};
    my $total = $hit + $miss;
    if ( $total == $players || $count == int( $players / 2 ) + 1 ) {
        $game->broadcast(
            {   cmd    => 'resolution',
                type   => $msg->{type},
                player => $msg->{player},
                target => $beam->{target},
                hit    => $hit > $miss,
            }
        );
        if ( $hit > $miss ) {
            my $target = $game->{player}{ $beam->{target} };
            $self->on_hit( $game, $bot, $target, $beam );
        }
        else {
            $beam->{invalid} = 1;
            delete $self->{shot}{ $bot->{id} }{ $msg->{target} };
            $self->{shot}{ $bot->{id} }{used}--;
            $self->remove($beam);
        }
    }
    else {
        $game->broadcast(
            {   cmd    => 'vote',
                type   => $msg->{type},
                player => $msg->{player},
                target => $msg->{target},
                hit    => $beam->{hit},
                miss   => $beam->{miss},
            }
        );
    }
}

1;
