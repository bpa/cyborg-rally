package State::Firing;

use strict;
use warnings;
use parent 'State';
use List::Util 'all';

use constant FIRE_TYPE => { laser => \&on_laser };

sub on_enter {
    my ( $self, $game ) = @_;

    $self->{pending} = {};
    for my $p ( values %{ $game->{player} } ) {
        $self->{pending}{ $p->{id} } = [ {}, {} ];
    }
}

sub do_ready {
    my ( $self, $game, $c, $msg ) = @_;

    return if $c->{public}{ready};
    $c->{public}{ready} = 1;
    delete $self->{pending}{ $c->{id} };
    if ( all { exists $_->{public}{ready} } values %{ $game->{player} } ) {
        $game->set_state('TOUCH');
    }
    else {
        $game->broadcast( ready => { player => $c->{id} } );
    }
}

sub do_fire {
    my ( $self, $game, $c, $msg ) = @_;

    my ($target) = $self->on_shot( $game, $c, $msg );
    if ($target) {
        $target->send(
            {   cmd  => 'fire',
                type => $msg->{type},
                bot  => $c->{id},
            }
        );
    }
}

sub resolve_beam {
    my ( $self, $game, $c, $msg ) = @_;

    my $bot_id = $msg->{bot};
    if (!$bot_id) {
        $c->err('Invalid bot');
        return;
    }

    my $beams  = $self->{pending}{$bot_id};
    if ( !$beams ) {
        $c->err('Invalid bot');
        return;
    }

    if ( !$msg->{type} ) {
        $c->err('Invalid type');
        return;
    }

    my $dir = $msg->{type} eq 'rear' ? 1 : 0;
    my $beam = $beams->[$dir];

    if ( !exists $beam->{target} || exists $beam->{confirmed} ) {
        $c->err('Invalid shot');
        return;
    }

    my $player = $game->{player}{$bot_id};
    return ( $player, $beam, $dir );
}

sub do_confirm {
    my ( $self, $game, $c, $msg ) = @_;

    my ( $bot, $beam ) = $self->resolve_beam( $game, $c, $msg );
    return unless $bot;

    FIRE_TYPE->{ $msg->{type} }( $self, $game, $bot, $c, $beam );
    $self->do_ready( $game, $bot );
}

sub do_deny {
    my ( $self, $game, $c, $msg ) = @_;

    my ( $bot, $beam, $dir ) = $self->resolve_beam( $game, $c, $msg );
    if ($bot) {
        $self->{pending}{ $bot->{id} }[$dir] = {};
        $bot->send( { cmd => 'dispute', player => $c->{id} } );
    }
}

sub do_dispute {
    my ( $self, $game, $c, $msg ) = @_;

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
                bot    => $c->{id},
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

    my $vote = !!$msg->{hit};
    my $players = scalar( keys( %{ $game->{player} } ) );
    my $box = $vote ? 'hit' : 'miss';
    $beam->{voted}{ $c->{id} } = $vote;
    my $count = ++$beam->{$box};
    my $hit = $beam->{hit};
    my $miss = $beam->{miss};
    my $total = $hit + $miss;
    if ( $total == $players || $count == int( $players / 2 ) + 1) {
        if ($hit > $miss) {
            my $target = $game->{player}{ $beam->{target} };
            FIRE_TYPE->{ $msg->{type} }( $self, $game, $bot, $target, $beam );
            $self->do_ready( $game, $bot );
        }
        else {
            $self->{pending}{$msg->{bot}}[$dir] = {};
            $game->broadcast(
                {   cmd    => 'vote',
                    type   => $msg->{type},
                    bot    => $msg->{bot},
                    target => $msg->{target},
                    hit    => 0,
                    final  => 1,
                }
            );
        }
    }
    else {
        $game->broadcast(
            {   cmd    => 'vote',
                type   => $msg->{type},
                bot    => $msg->{bot},
                target => $msg->{target},
                hit    => $beam->{hit},
                miss   => $beam->{miss},
            }
        );
    }
}

sub on_shot {
    my ( $self, $game, $c, $msg ) = @_;

    if ( $c->{public}{ready} ) {
        $c->err('Invalid command');
        return;
    }

    my $action = FIRE_TYPE->{ $msg->{type} };
    if ( !$action ) {
        $c->err('Invalid fire type');
        return;
    }

    my $dir = 0;
    if ( $msg->{type} eq 'rear' ) {
        if ( !$c->{public}{option}{'Rear-Firing Laser'} ) {
            $c->err('No rear laser');
            return;
        }
        $dir = 1;
    }

    my $beam = $self->{pending}{ $c->{id} }[$dir];
    if ( exists $beam->{target} ) {
        $c->err('Shot already pending');
        return;
    }

    if ( exists $beam->{confirmed} ) {
        $c->err('Shot already resolved');
        return;
    }

    my $target = $game->{player}{ $msg->{target} };
    if ( !$target ) {
        $c->err('Missing target');
        return;
    }

    $beam = $self->{pending}{ $c->{id} }[$dir]
      = { target => $msg->{target}, type => $msg->{type} };

    return $target, $beam;
}

sub on_laser {
    my ( $self, $game, $bot, $target, $beam ) = @_;
    my $damage = 1;
    $target->{public}{damage} += $damage;
    $game->broadcast(
        {   cmd    => 'fire',
            type   => 'laser',
            bot    => $bot->{id},
            target => $target->{id},
            damage => $damage
        }
    );
}

sub on_exit {
    my ( $self, $game ) = @_;
    for my $p ( values %{ $game->{player} } ) {
        delete $p->{public}{ready};
    }
}

1;
