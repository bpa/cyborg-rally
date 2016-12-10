package Rally;

use parent Game;
use State::Waiting;
use State::Choosing;
use State::Announcing;
use State::Executing;
use State::Cleanup;

sub BUILD {
    my ( $self, $opts ) = @_;
    $self->{opts}{timer}             = $opts{timer}             || '1st+30s';
    $self->{opts}{conveyors}         = $opts{conveyors}         || 1;
    $self->{opts}{express_conveyors} = $opts{express_conveyors} || 1;
    $self->{opts}{pushers}           = $opts{pushers}           || 0;
    $self->{opts}{gears}             = $opts{gears}             || 1;
    $self->{opts}{start_with_2_damage}   = $opts{start_with_2_damage}   || 0;
    $self->{opts}{choose_1_of_3_options} = $opts{choose_1_of_3_options} || 0;
    $self->{opts}{start_with_option}     = $opts{start_with_option}     || 0;
    $self->{opts}{no_power_down}         = $opts{no_power_down}         || 0;
    $self->{opts}{option_for_heal}       = $opts{option_for_heal}       || 0;

    $self->{states} = {
        INITIAL  => State::Waiting->new,
        CHOOSE   => State::Choosing->new,
        ANNOUNCE => State::Announcing->new,
        EXECUTE  => State::Executing->new,
        CLEANUP  => State::Cleanup->new,
    };
}

1;
