package Secret;

use FindBin '$Bin';
use File::Slurp;

my $secret_file = catfile( $Bin, ".secret" );
our $secret;
if ( -r $secret_file && -s _ ) {
    $secret = read_file($secret_file);
}
else {
    my @chars = ( 33 .. 126 );
    for ( 1 .. 64 ) {
        $secret .= chr( $chars[ rand @chars ] );
    }
    write_file( $secret_file, $secret );
}

1;
