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
            $self->{tile}{ $p->{id} } = 'floor';
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

    if ( exists $self->{tile}{$c->{id}} ) {
        $c->err('Already declared');
        return;
    }

    $self->{tile}{$c->{id}} = $tile;
    $game->broadcast( touch => { bot => $c->{id}, tile => $tile } );

    return
      if scalar( keys %{ $self->{tile} } ) != scalar( keys %{ $game->{player} } );

    if ( $game->{public}{register} == 5 ) {
        delete $game->{public}{register};
        $game->set_state('CLEANUP');
        for my $p ( values %{ $game->{player} } ) {
            my $t = VALID->{ $self->{tile}{ $p->{id} } };
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
            heal => { bot => $c->{id}, heal => 1, new => $c->{public}{damage} } );
    }
}

sub upgrade {
    my ( $self, $game, $c ) = @_;
    my $card = $game->{options}->deal;
    if (defined $card) {
        push @{ $c->{public}{options} }, $card;
        $game->broadcast( option => { bot => $c->{id}, option => $card } );
    }
}

sub on_exit {
    my ( $self, $game ) = @_;
    delete $self->{tile};
}

1;
