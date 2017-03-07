use 5.022001;
use ExtUtils::MakeMaker;
# See lib/ExtUtils/MakeMaker.pm for details of how to influence
# the contents of the Makefile that is written.
WriteMakefile(
    NAME              => 'CyborgRally',
    VERSION_FROM      => 'lib/CyborgRally.pm', # finds $VERSION, requires EU::MM from perl >= 5.5
    PREREQ_PM    => {
        'AnyEvent'           => 0,
        'Data::UUID'         => 0,
        'EV'                 => 0,
        'File::Slurp'        => 0,
        'JSON'               => 0,
        'JSON::XS'           => 0,
        'List::Util'         => 0,
        'List::MoreUtils'    => 0,
        'Mojolicious::Lite'  => 0,
    },
    ABSTRACT_FROM     => 'lib/CyborgRally.pm', # retrieve abstract from module
    AUTHOR            => 'Bruce Armstrong <bruce@fortressofgeekdom.org>',
    #LICENSE           => 'perl',
    #Value must be from legacy list of licenses here
    #http://search.cpan.org/perldoc?Module%3A%3ABuild%3A%3AAPI
);
