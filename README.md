## CyborgRally

Webapp to facilitate humans playing as the robots in RoboRally.  Will hand out cards, resolve play order, and keep track of various stats.

## Running

### Debian Linux

Install NodeJS (I've been running 4.2.6, I'm guessing any recent version will do)

    $ curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
    $ sudo apt-get install nodejs
Install the crazy pile of modules required to run webpack + babel (Last count for me was 165M in node_modules)

    $ npm install
Build frontend

    $ npm run build
Install perl modules required for backend 

    $ sudo apt-get install libanyevent-perl libdata-uuid-perl libfile-slurp-perl libjson-perl libjson-xs-perl liblist-moreutils-perl libmojolicious-perl libtest-deep-perl
Go

    $ ./cyborg-rally
Browse to http://localhost:3000/

### Windows
Install NodeJS via the [Windows installer](http://nodejs.org/#download) from http://nodejs.org

    npm install
Build frontend

    npm run build
Download and install [Strawberry perl](http://strawberryperl.com/)

    cpan Mojolicious::Lite EV AnyEvent JSON JSON:XS Data::UUID List::MoreUtils Test::Deep
Go

    perl cyborg-rally
Browse to http://localhost:3000/

## Development

Run webpack in watch mode

    npm run watch
Run development server (optional, if you intend to modify files there)

    morbo cyborg-rally
    
Run your editor of choice

Use whatever developer tools you are comfortable in your browser.  Note: react has React Developer Tools for Chrome and Firefox.  I reccommend installing the extension.  In chrome, it often shows up under >> because it is the far right tab in developer tools.

The page is purposely very talky because I haven't taken the time to figure out web tests for react.  There are plenty of tests for the backend, but none for the UI.

If you want to run the backend tests: ```prove -l```

## Documentation

All documentation will be markdown files in the [lib](lib) and [js](js) directories covering the backend api and React frontend respectively.

