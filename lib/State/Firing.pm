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

    $self->{pending}{ $c->{id} }[$dir]
      = { target => $msg->{target}, type => $msg->{type} };

    $target->send(
        {   cmd  => 'fire',
            type => $msg->{type},
            bot  => $c->{id},
        }
    );
}

sub resolve_beam {
    my ( $self, $game, $c, $msg ) = @_;

    my $bot_id = $msg->{bot};
    my $beams  = $self->{pending}{$bot_id};

    if ( !$beams ) {
        $c->err('Invalid bot');
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
    if ( $bot ) {
        $self->{pending}{$bot->{id}}[$dir] = {};
        $bot->send( { cmd => 'dispute', player => $c->{id} } );
    }
}

sub do_dispute {
    my ( $self, $game, $c, $msg ) = @_;
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
