package DamageHandler;

use strict;
use warnings;

use List::Util 'min';

sub damage {
    my ( $self, $game, $target, $damage ) = @_;
    $damage = int($damage);
    return unless $damage > 0;

    my $public = $target->{public};
    return if $public->{dead};

    if ( $public->{shutdown} && exists $public->{options}{'Power-Down Shield'} ) {
        $damage -= 1;
        return unless $damage > 0;
    }

    my $shield = $public->{options}{'Ablative Coat'};
    if ( defined $shield ) {
        if ( $damage >= $shield->{uses} ) {
            $damage -= $shield->{uses};
            delete $public->{options}{'Ablative Coat'};
        }
        else {
            $shield->{uses} -= $damage;
            $damage = 0;
        }

        $game->broadcast(
            {   cmd     => 'options',
                player  => $target->{id},
                options => $public->{options},
            }
        );
    }

    return unless $damage;
    my $options = keys %{ $public->{options} };
    my $avoidable = min( $options, $damage );

    my $apply_now = $damage - $avoidable;
    $self->apply_damage( $game, $target, $apply_now ) if $apply_now > 0;

    if ($avoidable) {
        $self->{public}{pending_damage}{ $target->{id} } += $avoidable;
        $target->send( { cmd => 'pending_damage', damage => $avoidable } );
    }
}

sub apply_damage {
    my ( $self, $game, $target, $damage ) = @_;
    $target->{public}{damage} += $damage;
    if ( $target->{public}{damage} > 9 ) {
        $target->{public}{dead} = 1;
        $target->{public}{lives}-- unless $game->{opts}{lives} eq 'Inf';
        $game->broadcast(
            {   cmd    => 'death',
                player => $target->{id},
                lives  => $target->{public}{lives}
            }
        );
    }
    else {
        my $locked = $target->{public}{damage} - 4;
        if ( $locked > 0 ) {
            for my $i ( 5 - $locked .. 4 ) {
                my $r = $target->{public}{registers}[$i];
                $r->{damaged} = 1;
                $r->{locked}  = 1;
                if ( !@{ $r->{program} } ) {
                    my $card = dclone $game->{movement}->deal;
                    $card->{priority} += $i;
                    $r->{program} = [$card];
                }
            }
        }
        $game->broadcast(
            {   cmd       => 'damage',
                player    => $target->{id},
                damage    => $target->{public}{damage},
                registers => $target->{public}{registers}
            }
        );
    }
}

sub do_damage {
    my ( $self, $game, $c, $msg ) = @_;

    if ( !exists $self->{public}{pending_damage}{ $c->{id} } ) {
        $c->err('No damage');
        return;
    }

    if ( !exists $msg->{target} ) {
        $c->err('Missing target');
        return;
    }

    my @target = ref( $msg->{target} ) eq '' ? $msg->{target} : @{ $msg->{target} };
    my $damage = 0;
    my %option;

    for my $t (@target) {
        if ( $t eq 'robot' ) {
            $damage++;
        }
        elsif ( exists $c->{public}{options}{$t} ) {
            $option{$t} = ();
        }
        else {
            $c->err("Invalid Option");
            return;
        }
    }

    my $pending = $self->{public}{pending_damage}{ $c->{id} };
    if ( scalar( keys %option ) + $damage > $pending ) {
        $c->err('Too many targets');
        return;
    }

    $self->apply_damage( $game, $c, $damage ) if $damage;

    if ( $c->{public}{dead} ) {
        delete $self->{public}{pending_damage}{ $c->{id} };
        $c->send( { cmd => 'pending_damage', damage => 0 } );
        $self->on_damage_resolved($game);
        return;
    }

    my $remaining = $pending - scalar( keys %option ) - $damage;
    if ($remaining) {
        $self->{public}{pending_damage}{ $c->{id} } = $remaining;
    }
    else {
        delete $self->{public}{pending_damage}{ $c->{id} };
    }

    if ( scalar( keys %option ) ) {
        for my $o ( keys %option ) {
            delete $c->{public}{options}{$o};
        }

        $game->broadcast(
            {   cmd     => 'options',
                player  => $c->{id},
                options => $c->{public}{options}
            }
        );
    }
    $c->send( { cmd => 'pending_damage', damage => $remaining } );
    $self->on_damage_resolved($game);
}

1;
