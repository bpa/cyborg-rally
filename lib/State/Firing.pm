package State::Firing;

use strict;
use warnings;
use parent qw/State DisputeHandler DamageHandler/;
use List::MoreUtils 'firstidx';
use Storable 'dclone';

use constant FIRE_TYPE => {
    'Fire Control'      => \&on_main_laser,
    'High-Power Laser'  => \&on_main_laser,
    'laser'             => \&on_main_laser,
    'Mini Howitzer'     => \&on_howitzer,
    'Pressor Beam'      => \&nop,
    'Radio Control'     => \&on_radio_control,
    'Rear-Firing Laser' => \&on_rear_laser,
    'Scrambler'         => \&on_scrambler,
    'Tractor Beam'      => \&nop,
};

sub on_enter {
    my ( $self, $game ) = @_;

    $self->{shot}   = {};
    $self->{public} = { shots => [] };
    for my $p ( values %{ $game->{player} } ) {
        if ( $p->{public}{dead} || $p->{public}{shutdown} ) {
            $p->{public}{ready} = 1;
        }
        else {
            $p->{public}{ready} = '';
            my $shot = $self->{shot}{ $p->{id} } = { max => 1, used => 0 };
            $shot->{max}++ if exists $p->{public}{options}{'Rear-Firing Laser'};
            $shot->{max}++ if exists $p->{public}{options}{'High-Power Laser'};
        }
    }
    $game->set_state('TOUCH') if $game->ready;
}

sub do_ready {
    my ( $self, $game, $c, $msg ) = @_;

    return if $c->{public}{ready};
    $c->{public}{ready} = 1;
    delete $self->{shot}{ $c->{id} };
    if ( $game->ready ) {
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
            {   cmd    => 'fire',
                type   => $msg->{type},
                player => $c->{id},
            }
        );
    }
}

sub resolve_beam {
    my ( $self, $game, $c, $msg ) = @_;

    my $bot_id = $msg->{player};
    if ( !$bot_id ) {
        $c->err('Invalid bot');
        return;
    }

    my $beams = $self->{shot}{$bot_id};
    if ( !( defined $beams && exists $beams->{ $msg->{target} } ) ) {
        $c->err('Invalid player');
        return;
    }

    if ( !$msg->{type} ) {
        $c->err('Invalid type');
        return;
    }

    my $beam = $beams->{ $msg->{target} };

    if ( !defined $beam || exists $beam->{confirmed} ) {
        $c->err('Invalid shot');
        return;
    }

    my $player = $game->{player}{$bot_id};
    return ( $player, $beam );
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

    unless ( $msg->{type} eq 'laser'
        || exists $c->{public}{options}{ $msg->{type} } )
    {
        $c->err("$msg->{type} not held");
        return;
    }

    if ( $game->{public}{register} == 4 && grep { $_ eq $msg->{type} }
        ( 'Scrambler', 'Radio Control' ) )
    {
        $c->err("$msg->{type} cannot be used during register 5");
        return;
    }

    my $target = $game->{player}{ $msg->{target} };
    if ( !$target ) {
        $c->err('Missing target');
        return;
    }

    if ( $c->{id} eq $msg->{target} ) {
        $c->err("Can't shoot yourself");
        return;
    }

    my $weapon = $self->{shot}{ $c->{id} };
    if ( exists $weapon->{ $msg->{target} } || $weapon->{used} eq $weapon->{max} ) {
        $c->err('Shot already pending');
        return;
    }

    my $beam = $weapon->{ $msg->{target} }
      = { player => $c->{id}, target => $msg->{target}, type => $msg->{type} };
    push( @{ $self->{public}{shots} }, $beam );
    $self->{shot}{ $c->{id} }{used}++;

    return $target, $beam;
}

sub on_hit {
    my ( $self, $game, $player, $target, $beam ) = @_;
    FIRE_TYPE->{ $beam->{type} }( $self, $game, $player, $target, $beam );
    $beam->{confirmed} = 1;
    $self->remove($beam);
    my $shot = $self->{shot}{ $player->{id} };
    if ( $shot->{max} == grep { ref($_) eq 'HASH' && $_->{confirmed} }
        values %$shot )
    {
        $self->do_ready( $game, $player );
    }
}

sub remove {
    my ( $self, $beam ) = @_;
    splice(
        @{ $self->{public}{shots} },
        firstidx {
            $_->{player} eq $beam->{player} && $_->{target} eq $beam->{target};
        }
        @{ $self->{public}{shots} },
        1
    );
}

sub nop { }

sub on_damage_resolved {
    my ($self, $game) = @_;
    $game->set_state('TOUCH') if $game->ready;
}

sub on_main_laser {
    my ( $self, $game, $bot, $target, $beam ) = @_;
    my $damage = exists $bot->{public}{options}{'Double Barreled Laser'} ? 2 : 1;
    $self->damage( $game, $target, $damage );
}

sub on_rear_laser {
    my ( $self, $game, $bot, $target, $beam ) = @_;
    $self->damage( $game, $target, 1 );
}

sub on_howitzer {
    my ( $self, $game, $bot, $target, $beam ) = @_;
    my $howitzer = $bot->{public}{options}{'Mini Howitzer'};
    $howitzer->{uses}--;
    if ($howitzer->{uses} == 0) {
        delete $bot->{public}{options}{'Mini Howitzer'};
    }
    $game->broadcast(
        {   cmd     => 'options',
            player  => $bot->{id},
            options => $bot->{public}{options}
        }
    );
    $self->damage( $game, $target, 1 );
}

sub on_radio_control {
    my ( $self, $game, $bot, $target, $beam ) = @_;
    $target->{public}{registers} = dclone( $bot->{public}{registers} );
    for my $r ( @{ $target->{public}{registers} } ) {
        for my $program (@{$r->{program}}) {
            $program->{priority} -= $game->{public}{register} + 1;
        }
    }
}

sub on_scrambler {
    my ( $self, $game, $bot, $target, $beam ) = @_;
    $target->{public}{registers}[ $game->{public}{register} + 1 ]{program}
      = [ $game->{movement}->deal ];
}

1;
