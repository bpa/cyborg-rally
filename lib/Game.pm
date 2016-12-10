package Game;

use Data::Dumper;
use Data::UUID;
use Carp;
use State;

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
        state   => State->new, },
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
        $self->{public}{player}{$id} = { id => $id, name => $c->{name} };
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
            public  => $self->{public},
            private => $c->{private} } );

    if ($new_player) {
        $self->broadcast(
            { cmd => 'join', uuid => $p->{uuid}, public => $c->{public} } );
    }

}

sub rename {
    my ( $self, $c, $name ) = @_;
    my $p = $self->{player}{ $c->{uuid} };
    $self->broadcast(
        { cmd => 'set_name', uuid => $p->{uuid}, name => $name } );
}

sub set_state {
    my ( $self, $state ) = @_;
    my $next = $self->{states}{$state};
    if ($next) {
        $self->{next_state} = $next;
    }
    else {
        carp "Unknown state '$state', options are: "
          . join( ", ", keys %{ $self->{states} } );
    } }

sub update {
    my $self = shift;
    if ( my $next = delete $self->{next_state} ) {
        $self->{state}->on_exit($self);
        $self->{state} = $next;
        $self->broadcast( { cmd => 'state', state => $next->{name} } );
        $next->on_enter($self);
    } }

sub quit {
    my ( $self, $c ) = @_;
    my $p = $self->{player}{ $c->{uuid} };
    $self->on_quit($c) if $self->can('on_quit');
    delete $self->{player}{ $c->{uuid} };
    $self->broadcast(
        { cmd => 'quit', uuid => $p->{uuid}, name => $c->{name} } );
}

sub broadcast {
    my ( $self, $msg ) = @_;
    for my $p ( values %{ $self->{player} } ) {
        $p->send($msg);
    } }

package Lobby;

use parent Game;

1;
