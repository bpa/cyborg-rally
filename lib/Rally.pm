package Rally;

use strict;
use warnings;
use parent 'Game';
use State::Announcing;
use State::Board;
use State::Configuring;
use State::ConditionalProgramming;
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
use Storable 'dclone';

sub BUILD {
    my ( $self, $opts ) = @_;
    $self->{opts}{timer}                 = $opts->{timer} || '1st+30s';
    $self->{opts}{lives}                 = $opts->{lives} || '3';
    $self->{opts}{options}               = $opts->{options} || '0';
    $self->{opts}{board_lasers}          = !!$opts->{board_lasers};
    $self->{opts}{conveyors}             = !!$opts->{conveyors};
    $self->{opts}{express_conveyors}     = !!$opts->{express_conveyors};
    $self->{opts}{pushers}               = !!$opts->{pushers};
    $self->{opts}{gears}                 = !!$opts->{gears};
    $self->{opts}{start_with_2_damage}   = !!$opts->{start_with_2_damage};
    $self->{opts}{no_power_down}         = !!$opts->{no_power_down};
    $self->{opts}{option_for_heal}       = !!$opts->{option_for_heal};

    $self->{states} = {
        INITIAL   => State::Waiting->new,
        SETUP     => State::Setup->new,
        PROGRAM   => State::Programming->new,
        CONFIGURE => State::Configuring->new,
        ANNOUNCE  => State::Announcing->new,
        EXECUTE   => State::Executing->new,
        COND_PROG => State::ConditionalProgramming->new,
        MOVE      => State::Movement->new,
        LASER     => State::Lasers->new,
        FIRE      => State::Firing->new,
        TOUCH     => State::Touching->new,
        REVIVE    => State::Revive->new,
        POWER     => State::PowerDown->new,
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

sub broadcast_options {
    my ($self, $c) = @_;
    $self->broadcast(
        {   cmd     => 'options',
            player  => $c->{id},
            options => $c->{public}{options},
        }
    );
}

sub on_disconnect {
    my ( $self, $c ) = @_;

    #TODO
}

1;
