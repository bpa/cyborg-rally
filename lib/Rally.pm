package Rally;

use strict;
use warnings;
use parent 'Game';
use State::Announcing;
use State::BoardElements;
use State::Cleanup;
use State::Executing;
use State::Firing;
use State::Movement;
use State::Programming;
use State::Setup;
use State::Touching;
use State::Waiting;

sub BUILD {
    my ( $self, $opts ) = @_;
    $self->{opts}{timer}               = $opts->{timer}               || '1st+30s';
    $self->{opts}{conveyors}           = $opts->{conveyors}           || 1;
    $self->{opts}{express_conveyors}   = $opts->{express_conveyors}   || 1;
    $self->{opts}{pushers}             = $opts->{pushers}             || 0;
    $self->{opts}{gears}               = $opts->{gears}               || 1;
    $self->{opts}{start_with_4_lives}  = $opts->{start_with_4_lives}  || 0;
    $self->{opts}{start_with_2_damage} = $opts->{start_with_2_damage} || 0;
    $self->{opts}{choose_1_of_3_options} = $opts->{choose_1_of_3_options} || 0;
    $self->{opts}{start_with_option}     = $opts->{start_with_option}     || 0;
    $self->{opts}{no_power_down}         = $opts->{no_power_down}         || 0;
    $self->{opts}{option_for_heal}       = $opts->{option_for_heal}       || 0;

    $self->{states} = {
        INITIAL  => State::Waiting->new,
        SETUP    => State::Setup->new,
        PROGRAM  => State::Programming->new,
        ANNOUNCE => State::Announcing->new,
        EXECUTE  => State::Executing->new,
        MOVE     => State::Movement->new,
        BOARD    => State::BoardElements->new,
        FIRE     => State::Firing->new,
        TOUCH    => State::Touching->new,
        CLEANUP  => State::Cleanup->new,
    };
}

1;
