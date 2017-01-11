package State::Firing;

use strict;
use warnings;
use parent 'State';
use List::Util 'all';

use constant FIRE_TYPE => {
    laser => 'x'
};

sub do_ready {
    my ( $self, $game, $c, $msg ) = @_;

    return if $c->{public}{ready};
    $c->{public}{ready} = 1;
    if ( all { exists $_->{public}{ready} } values %{ $game->{player} } ) {
        $game->set_state('TOUCH');
    }
    else {
        $game->broadcast( ready => { player => $c->{id} } );
    }
    $self->{pending} = {};
}

sub do_fire {
    my ( $self, $game, $c, $msg ) = @_;

    my $action = FIRE_TYPE->{$msg->{type}};
    if (!$action) {
        $c->err('Invalid fire type');
        return;
    }

    if ($self->{pending}{$c->{id}}{$msg->{type}}) {
        $c->err('Shot already pending');
        return;
    }

    my $target = $game->{player}{$msg->{target}};
    if (!$target) {
        $c->err('Missing target');
        return;
    }

    $target->send({cmd => 'fire', type => $msg->{type}, bot => $c->{id}, damage => $msg->{damage}});
}

sub do_confirm {
    my ( $self, $game, $c, $msg ) = @_;
}

sub do_deny {
    my ( $self, $game, $c, $msg ) = @_;
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
