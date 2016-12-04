package Game;

use Data::UUID;

my $uuid = Data::UUID->new;

sub new {
    my ( $pkg, $opts ) = @_;
    my $self = bless {
        game    => $pkg,
        name    => $opts->{name},
        opts    => {},
        player  => {},
        public  => {},
        private => {}, },
      shift;
    $self->BUILD($opts) if $self->can('BUILD');
    return $self;
}

sub join {
    my ( $self, $c ) = @_;

    $c->{game} = $self;

    my $p = $self->{player}{ $c->{uuid} };
    if ($p) {    #Rejoin
        $p->{sock} = $c;
    }
    else {       #Normal
        $self->{player}{ $c->{uuid} } = $p
          = { sock => $c, data => {}, uuid => $uuid->create_str };
        $self->on_join($c) if $self->can('on_join');
    }

    $c->send(
        {   cmd     => 'joined',
            game    => $self->{game},
            name    => $self->{name},
            public  => $self->{public},
            private => $p->{data} } );

    $self->broadcast(
        { cmd => 'join', uuid => $p->{uuid}, name => $c->{name} } );
}

sub rename {
    my ( $self, $c, $name ) = @_;
    my $p = $self->{player}{ $c->{uuid} };
    $self->broadcast({cmd => 'set_name', uuid => $p->{uuid}, name => $name });
}

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
        $p->{sock}->send($msg);
    } }

package Lobby;

use parent Game;

1;
