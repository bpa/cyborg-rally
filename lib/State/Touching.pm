package State::Touching;

use strict;
use warnings;
use parent 'State';
use List::MoreUtils 'all';

use constant VALID => {
    'floor'   => [],
    'repair'  => [ \&heal ],
    'upgrade' => [ \&heal, \&upgrade ],
    'flag'    => [ \&heal ],
    'pit'     => [ \&die ],
    'off'     => [ \&die ],
};

sub on_enter {
    my ( $self, $game ) = @_;
    $game->{public}{register}++;

    for my $p ( values %{ $game->{player} } ) {
        if ( $p->{public}{lives} == 0 || $p->{public}{dead} ) {
            $self->{public}{ $p->{id} } = 'floor';
        }
    }

    $self->check_for_done($game);
}

sub do_touch {
    my ( $self, $game, $c, $msg ) = @_;

    my $tile = $msg->{tile};
    if ( !$tile ) {
        $c->err('Missing tile');
        return;
    }

    if ( !VALID->{$tile} ) {
        $c->err('Invalid tile');
        return;
    }

    if ( exists $self->{public}{ $c->{id} } ) {
        $c->err('Already declared');
        return;
    }

    $self->{public}{ $c->{id} } = $tile;
    $game->broadcast( touch => { player => $c->{id}, tile => $tile } );
    if ( $tile eq 'pit' || $tile eq 'off' ) {
        $self->die( $game, $c );
    }

    $self->check_for_done($game);
}

sub check_for_done {
    my ( $self, $game ) = @_;

    return
      if scalar( keys %{ $self->{public} } ) != scalar( keys %{ $game->{player} } );

    if ( $game->{public}{register} == 5
        || all { $_->{public}{dead} } values %{ $game->{player} } )
    {
        delete $game->{public}{register};
        $game->set_state('REVIVE');
        for my $p ( values %{ $game->{player} } ) {
            my $t = VALID->{ $self->{public}{ $p->{id} } };
            for my $f (@$t) {
                $f->( $self, $game, $p );
            }
        }
    }
    else {
        $game->set_state('MOVE');
    }
}

sub die {
    my ( $self, $game, $c ) = @_;
    return if $c->{public}{dead};

    $c->{public}{dead} = 1;
    $c->{public}{lives}--;
    $game->broadcast(
        {   cmd    => 'death',
            player => $c->{id},
            lives  => $c->{public}{lives}
        }
    );
}

sub heal {
    my ( $self, $game, $c ) = @_;
    if ( $c->{public}{damage} > 0 ) {
        $c->{public}{damage}--;
        $game->broadcast(
            heal => { player => $c->{id}, heal => 1, new => $c->{public}{damage} }
        );
    }
}

sub upgrade {
    my ( $self, $game, $c ) = @_;
    my $card = $game->{options}->deal;
    if ( defined $card ) {
        push @{ $c->{public}{options} }, $card;
        $game->broadcast( option => { player => $c->{id}, option => $card } );
    }
}

sub on_exit {
    my ( $self, $game ) = @_;
    $self->{public} = {};
}

1;
