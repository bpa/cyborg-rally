package DamageHandler;

use strict;
use warnings;

sub damage {
    my ( $self, $game, $target, $damage ) = @_;
    $damage = int($damage);
    return unless $damage;
    return if $target->{public}{dead};

    my $shield = $target->{public}{options}{'Ablative Coat'};
    if (defined $shield) {
        if ($damage >= $shield->{uses}) {
            $damage -= $shield->{uses};
            delete $target->{public}{options}{'Ablative Coat'};
        }
        else {
            $shield->{uses} -= $damage;
            $damage = 0;
        }

        $game->broadcast(
            {   cmd     => 'options',
                player  => $target->{id},
                options => $target->{public}{options}
            }
        );
    }

    return unless $damage;
    $target->{public}{damage} += $damage;
    if ( $target->{public}{damage} > 9 ) {
        $target->{public}{dead} = 1;
        $target->{public}{lives}--;
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

1;
