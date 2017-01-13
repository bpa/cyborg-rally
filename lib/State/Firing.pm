package State::Firing;

use strict;
use warnings;
use parent 'State';
use List::Util 'all';

use constant FIRE_TYPE => { laser => \&on_laser };

sub do_ready {
    my ( $self, $game, $c, $msg ) = @_;

    return if $c->{public}{ready};
    $c->{public}{ready} = 1;
    delete $self->{pending}{$c->{id}};
    if ( all { exists $_->{public}{ready} } values %{ $game->{player} } ) {
        $game->set_state('TOUCH');
    }
    else {
        $game->broadcast( ready => { player => $c->{id} } );
    }
}

sub do_fire {
    my ( $self, $game, $c, $msg ) = @_;

    my $action = FIRE_TYPE->{ $msg->{type} };
    if ( !$action ) {
        $c->err('Invalid fire type');
        return;
    }

    if ( $self->{pending}{ $c->{id} }{ $msg->{type} } ) {
        $c->err('Shot already pending');
        return;
    }

    my $target = $game->{player}{ $msg->{target} };
    if ( !$target ) {
        $c->err('Missing target');
        return;
    }

    $self->{pending}{ $c->{id} }{ $msg->{type} }
      = { target => $msg->{target}, damage => $msg->{damage} };

    $target->send(
        {   cmd    => 'fire',
            type   => $msg->{type},
            bot    => $c->{id},
            damage => $msg->{damage}
        }
    );
}

sub do_confirm {
    my ( $self, $game, $c, $msg ) = @_;

    my $bot = $msg->{bot};
    if ( !$bot ) {
        $c->err('Invalid bot');
        return;
    }

    $bot = $self->{pending}{$bot};
    my $beam = delete $bot->{ $msg->{type} };
    if ( !$beam ) {
        $c->err('Invalid shot');
        return;
    }

    my $player = $game->{player}{ $msg->{bot} };
    FIRE_TYPE->{ $msg->{type} }( $self, $game, $player, $c, $beam );
    $self->do_ready($game, $player);
}

sub on_laser {
    my ( $self, $game, $bot, $target, $beam ) = @_;
    my $damage = $beam->{damage};
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

sub do_deny {
    my ( $self, $game, $c, $msg ) = @_;

    my $bot = $msg->{bot};
    if ( !$bot ) {
        $c->err('Invalid bot');
        return;
    }

    $bot = $self->{pending}{$bot};
    my $beam = delete $bot->{ $msg->{type} };
    if ( !$beam ) {
        $c->err('Invalid shot');
        return;
    }

    my $player = $game->{player}{ $msg->{bot} };
    $player->send( { cmd => 'dispute', player => $c->{id} } );
}

sub do_dispute {
    my ( $self, $game, $c, $msg ) = @_;
}

sub on_exit {
    my ( $self, $game ) = @_;
    for my $p ( values %{ $game->{player} } ) {
        delete $p->{public}{ready};
    }
}

1;
