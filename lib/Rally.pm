package Rally;

use strict;
use warnings;
use parent 'Game';
use State::Announcing;
use State::Board;
use State::Executing;
use State::Firing;
use State::Lasers;
use State::Movement;
use State::Programming;
use State::PowerDown;
use State::Revive;
use State::Setup;
use State::Touching;
use State::Waiting;

sub BUILD {
    my ( $self, $opts ) = @_;
    $self->{opts}{timer}                 = $opts->{timer} || '1st+30s';
    $self->{opts}{board_lasers}          = !!$opts->{board_lasers};
    $self->{opts}{conveyors}             = !!$opts->{conveyors};
    $self->{opts}{express_conveyors}     = !!$opts->{express_conveyors};
    $self->{opts}{pushers}               = !!$opts->{pushers};
    $self->{opts}{gears}                 = !!$opts->{gears};
    $self->{opts}{start_with_4_lives}    = !!$opts->{start_with_4_lives};
    $self->{opts}{start_with_2_damage}   = !!$opts->{start_with_2_damage};
    $self->{opts}{choose_1_of_3_options} = !!$opts->{choose_1_of_3_options};
    $self->{opts}{start_with_option}     = !!$opts->{start_with_option};
    $self->{opts}{no_power_down}         = !!$opts->{no_power_down};
    $self->{opts}{option_for_heal}       = !!$opts->{option_for_heal};

    $self->{states} = {
        INITIAL  => State::Waiting->new,
        SETUP    => State::Setup->new,
        PROGRAM  => State::Programming->new,
        ANNOUNCE => State::Announcing->new,
        EXECUTE  => State::Executing->new,
        MOVE     => State::Movement->new,
        LASER    => State::Lasers->new,
        FIRE     => State::Firing->new,
        TOUCH    => State::Touching->new,
        REVIVE   => State::Revive->new,
        POWER    => State::PowerDown->new,
    };

    my $last;
    my $num = '';
    for my $s (qw/express_conveyors conveyors pushers gears/) {
        if ( $opts->{$s} ) {
            my $board = "BOARD$num";
            $self->{states}{$board} = $last
              = State::Board->new( $s, "BOARD" . ++$num );
        }
    }

    my $next = $self->{opts}{board_lasers} ? 'LASER' : 'FIRE';

    if ($last) {
        $last->{next} = $next;
    }
    else {
        $self->{states}{BOARD} = $self->{states}{$next};
    }
}

sub damage {
    my ( $self, $target, $damage ) = @_;
    $damage = int($damage);
    return unless $damage;
    return if $target->{public}{dead};

    $target->{public}{damage} += $damage;
    if ( $target->{public}{damage} >= $target->{public}{memory} ) {
        $target->{public}{dead} = 1;
        $target->{public}{lives}--;
        $self->broadcast(
            {   cmd    => 'death',
                player => $target->{id},
                lives  => $target->{public}{lives}
            }
        );
    }
    else {
        $self->broadcast(
            {   cmd    => 'damage',
                player => $target->{id},
                damage => $damage
            }
        );
    }
}

1;
