package State::Touching;

use strict;
use warnings;
use parent 'State';

use constant VALID => {
    'floor'   => [],
    'repair'  => [ \&heal ],
    'upgrade' => [ \&heal, \&upgrade ],
    'flag'    => [ \&heal ]
};

sub on_enter {
    my ( $self, $game ) = @_;
    $game->{public}{register}++;

    for my $p ( values %{ $game->{player} } ) {
        if ( $p->{public}{lives} == 0 ) {
            $self->{public}{ $p->{id} } = 'floor';
        }
    }
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

    return
      if scalar( keys %{ $self->{public} } ) != scalar( keys %{ $game->{player} } );

    if ( $game->{public}{register} == 5 ) {
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
    delete $self->{public};
}

1;
