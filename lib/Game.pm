package Game;

use strict;
use warnings;
use Data::UUID;
use Carp;
use State;
use List::MoreUtils 'false';
use EV;
use Time::HiRes 'time';

my $uuid = Data::UUID->new;

sub new {
    my ( $pkg, $opts ) = @_;
    my $self = bless {
        game    => $pkg,
        map     => {},
        name    => $opts->{name},
        opts    => {},
        player  => {},
        private => { player => {} },
        public  => { player => {} },
        states  => { INITIAL => State->new },
        state   => State->new,
      },
      shift;
    $self->BUILD($opts) if $self->can('BUILD');
    $self->set_state('INITIAL');
    $self->update;
    return $self;
}

sub join {
    my ( $self, $c ) = @_;

    $c->{game} = $self;

    my $id         = $self->{map}{ $c->{uuid} };
    my $new_player = !$id;

    if ( !$id ) {
        $id = $uuid->create_str;
        $self->{map}{ $c->{uuid} } = $id;
    }

    if ($new_player) {
        $self->{public}{player}{$id} = { name => $c->{name} };
        $self->{private}{player}{$id} = {};
    }

    $c->{public}         = $self->{public}{player}{$id};
    $c->{private}        = $self->{private}{player}{$id};
    $c->{id}             = $id;
    $self->{player}{$id} = $c;

    if ($new_player) {
        $self->on_join($c) if $self->can('on_join');
    }

    $c->send(
        {   cmd     => 'joined',
            game    => $self->{game},
            name    => $self->{name},
            opts    => $self->{opts},
            public  => $self->{public},
            private => $c->{private},
            state   => $self->{state}{public},
            id      => $c->{id},
            now     => int( time * 1000 )
        }
    );

    if ($new_player) {
        $self->broadcast(
            { cmd => 'join', id => $c->{id}, player => $c->{public} } );
    }
}

sub on_disconnect {
    my ( $self, $c ) = @_;
    $self->quit($c);
}

sub on_rename {
    my ( $self, $c, $name ) = @_;
    $c->{public}{name} = $name;
    $self->broadcast( { cmd => 'set_name', id => $c->{id}, name => $name } );
}

sub set_state {
    my ( $self, $state ) = @_;
    my $next = $self->{states}{$state};
    if ($next) {
        $self->{next_state} = $next;
    }
    else {
        carp "Unknown state '$state', options are: "
          . CORE::join( ", ", keys %{ $self->{states} } );
    }
}

sub ready {
    my $self = shift;

    return !false { $_->{public}{ready} } values %{ $self->{player} };
}

sub set_ready_to_dead_or_shutdown {
    my $self = shift;
    for my $p ( values %{ $self->{player} } ) {
        $p->{public}{ready} = !!( $p->{public}{dead} || $p->{public}{shutdown} );
    }
}

sub set_ready_to_dead {
    my $self = shift;
    for my $p ( values %{ $self->{player} } ) {
        $p->{public}{ready} = $p->{public}{dead};
    }
}

sub timer {
    my ( $self, $duration, $f, @args ) = @_;
    undef $self->{timer};
    $self->{timer} = EV::timer $duration, 0, sub {
        delete $self->{public}{timer};
        $f->(@args);
        $self->update;
    };
    my $now = int( time * 1000 );
    $duration *= 1000;
    $self->{public}{timer} = { start => $now, duration => $duration };
    $self->broadcast( { cmd => 'timer', start => $now, duration => $duration } );
}

sub update {
    my $self = shift;
    while ( my $next = delete $self->{next_state} ) {
        undef $self->{timer};
        $self->{state}->on_exit($self);
        $self->{state} = $next;
        $self->{public}{state} = $next->{name};
        $self->broadcast( { cmd => 'state', state => $next->{name} } );
        $next->on_enter($self);
    }
}

sub quit {
    my ( $self, $c ) = @_;
    my $p = $self->{player}{ $c->{uuid} };
    $self->on_quit($c) if $self->can('on_quit');
    delete $self->{map}{ $c->{uuid} };
    delete $self->{player}{ $c->{id} };
    delete $self->{public}{player}{ $c->{id} };
    delete $self->{private}{player}{ $c->{id} };
    $self->broadcast( { cmd => 'quit', id => $c->{id}, name => $c->{name} } );
}

sub broadcast {
    my ( $self, $cmd, $msg ) = @_;
    if ( ref($cmd) eq 'HASH' ) {
        $msg = $cmd;
    }
    else {
        $msg->{cmd} = $cmd;
    }
    for my $p ( values %{ $self->{player} } ) {
        $p->send($msg);
    }
}

package Lobby;

use parent 'Game';

1;
