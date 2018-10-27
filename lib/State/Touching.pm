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

    if ( $c->{public}{shutdown} && grep { $_ eq $msg->{tile} }
        qw/repair upgrade flag/ )
    {
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
        for my $p ( values %{ $game->{player} } ) {
            my $t = VALID->{ $self->{public}{ $p->{id} } };
            for my $f (@$t) {
                $f->( $self, $game, $p );
            }
        }
        $game->set_state('REVIVE');
    }
    else {
        $game->set_state('MOVE');
    }
}

sub die {
    my ( $self, $game, $c ) = @_;
    return if $c->{public}{dead};

    $c->{public}{dead} = 1;
    $c->{public}{lives}-- unless $game->{opts}{lives} eq 'Inf';
    $game->broadcast(
        {   cmd    => 'death',
            player => $c->{id},
            lives  => $c->{public}{lives}
        }
    );
}

sub heal {
    my ( $self, $game, $c ) = @_;
    for my $r (@{$c->{public}{registers}}) {
        if ($r->{locked}) {
            my $heal = 0;
            if ($r->{damaged}) {
                $r->{damaged} = '';
                $c->{public}{damage}--;
                $heal++;
            }
            $r->{locked} = '';
            $game->broadcast(
                heal => {
                    player    => $c->{id},
                    heal      => $heal,
                    damage    => $c->{public}{damage},
                    registers => $c->{public}{registers}
                }
            );
            return;
        }
    }

    if ( $c->{public}{damage} > 0 ) {
        $c->{public}{damage}--;
        $game->broadcast(
            heal => {
                player    => $c->{id},
                heal      => 1,
                damage    => $c->{public}{damage},
                registers => $c->{public}{registers}
            }
        );
    }
}

sub upgrade {
    my ( $self, $game, $c ) = @_;
    my $card = $game->{options}->deal;
    if ( defined $card ) {
        $c->{public}{options}{ $card->{name} } = $card;
        $game->broadcast( option => { player => $c->{id}, option => $card } );
    }
}

sub on_exit {
    my ( $self, $game ) = @_;
    for my $c ( values %{ $game->{player} } ) {
        my $tile = $self->{public}{ $c->{id} };
        if ( grep { $tile eq $_ } qw/repair upgrade flag/ ) {
            if ( exists $c->{public}{options}{'Superior Archive'} ) {
                $c->{public}{archive} = 'superior';
            }
            else {
                $c->{public}{archive} = 'standard';
            }
        }
    }
    $self->{public} = {};
}

1;
