#!/usr/bin/env perl

use strict;
use warnings;
use FileHandle;
use POSIX 'ceil';

my ($rows, $columns, $state, $top, $left, $line, $lineno, @arrows);

use constant GUTTER => 20;
use constant HEADER_FONT_SIZE => 18;
use constant BODY_FONT_SIZE => 14;
use constant LINES => 4;

use constant BODY_LINE_MARGIN => ceil(BODY_FONT_SIZE / 3);
use constant HEADER_LINE_MARGIN => ceil(HEADER_FONT_SIZE / 3);
use constant HEADER_HEIGHT => HEADER_FONT_SIZE + HEADER_LINE_MARGIN;
use constant BODY_LINE_HEIGHT => BODY_FONT_SIZE + BODY_LINE_MARGIN;
use constant BODY_HEIGHT => BODY_LINE_HEIGHT * LINES + BODY_LINE_MARGIN * 2;
use constant HEIGHT => HEADER_HEIGHT + BODY_HEIGHT;
use constant WIDTH => ceil(HEIGHT * 1.5);

use constant ARROW => {
    'u' => [ WIDTH / 2, 0,      0, -1 ],
    'd' => [ WIDTH / 2, HEIGHT, 0,  1 ],
    'l' => [ 0, HEIGHT / 2,    -1,  0 ],
    'r' => [ WIDTH, HEIGHT / 2, 1,  0 ],
};

my %state = (
  Waiting => '
    Wait for players to join
    Requires 2+ players to
    change state
  ',
  Setup => '
    Sets lives, damage
    based on options.
    Gives out options cards
    as appropriate
  ',
  Programming => '
    Hand out cards, let
    players program.  Set
    timers according to
    options
  ',
  Announcing => '
    Declare shutdown, set
    timer to keep game
    moving.
  ',
  Executing => '
    Set game register to 0
    in preparation for
    movement.
  ',
  Movement => 'Players move around',
  '&lt;various&gt;' => '
    Whichever board
    elements were selected
  ',
  Lasers => 'Board lasers fire',
  Firing => '
    Players shoot at each
    other
  ',
  Touching => '
    Declare what tile type
    you ended on
  ',
  Revive => '
    Destroyed bots reenter
    play
  ',
  PowerDown => '
    Declare if you will stay
    powered down, or
    reenter play powered
    down
  ',
  Configuring => '
    Make choices for Flywheel,
    Gyroscopic Stabilizer,
    and Conditional Program
  ',
  ChoosingOption => '
    If the choose one of
    three options opt is
    set, have each player
    choose one
  ',
  GotOption => '
    If any player got an
    option, show everyone
    what it was
  ',
);

sub write_header {
    ($columns, $rows) = @_;
    format_name SVG "HEADER";
    write SVG;
}

sub write_state {
    my ($x, $y, $s, @state_arrows) = @_;
    $state = $s;
    $top = (HEIGHT + GUTTER) * $y;
    $left = (WIDTH + GUTTER) * $x;
    map { push(@arrows, [$left, $top, $_]) } @state_arrows;

    format_name SVG "STATE_HEADER";
    write SVG;

    $top += HEADER_HEIGHT + BODY_LINE_HEIGHT;
    my $text = $state{$s};
    $text =~ s/^\s+|\s+$//g;
    my @lines = split(/\n/, $text);
    format_name SVG "STATE_LINE";
    for my $l (0 .. $#lines) {
        $lineno = $l;
        $line = $lines[$lineno];
        $line =~ s/^\s+|\s+$//g;
        write SVG;
    }
    format_name SVG "STATE_FOOTER";
    write SVG;
}

sub write_arrows {
    format_name SVG "ARROW_HEADER";
    write SVG;
    for my $a (@arrows) {
        my ($dir, $path) = split(//, $a->[2], 2);
        my $entry = ARROW->{$dir};
        $left = $a->[0] + $entry->[0];
        $top  = $a->[1] + $entry->[1];
        my $x = GUTTER * $entry->[2];
        my $y = GUTTER * $entry->[3];
        print SVG "      <path d=\"M$left,$top l$x,$y";
        my @paths;
        while ($path =~ /(\d*)(\w)/g) {
            my $e = ARROW->{$2};
            push(@paths, [$1 || 1, $e->[2], $e->[3]]);
        }
        my $last = pop(@paths);
        for my $path (@paths) {
            my ($dist, $h, $v) = @$path;
            $x = (WIDTH  + GUTTER) * $h * $dist;
            $y = (HEIGHT + GUTTER) * $v * $dist;
            print SVG " l$x,$y";
        }
        if ($last) {
            my ($dist, $h, $v) = @$last;
            $x = GUTTER * $h;
            $y = GUTTER * $v;
            print SVG " l$x,$y";
        }
        print SVG "\"/>\n";
    }
    format_name SVG "ARROW_FOOTER";
    write SVG;
}

sub write_footer {
    my ($x, $y) = @_;
    format_name SVG "FOOTER";
    write SVG;
}

format HEADER =
<svg xmlns="http://www.w3.org/2000/svg" baseProfile="full" width="@*" height="@*" version="1.1">
(WIDTH + GUTTER) * $columns, (HEIGHT + GUTTER) * $rows
  <defs>
    <marker id="from" markerWidth="5" markerHeight="5" refX="3" refY="3">
      <circle cx="3" cy="3" r="2"/>
    </marker>

    <marker id="to" markerWidth="21" markerHeight="21" refX="14" refY="11" orient="auto">
      <path d="M14,11 L5,7 L8,11 L5,15 z"/>
    </marker>

    <pattern id="state" width="1" height="1">
      <g stroke="black" fill="transparent">
        <rect x=".5" y=".5" width="@*" height="@*"/>
WIDTH - 1, HEIGHT - 1
        <rect x=".5" y=".5" width="@*" height="@*"/>
WIDTH - 1, HEADER_HEIGHT
      </g>
    </pattern>
  </defs>
.

format STATE_HEADER =

  <rect x="@*" y="@*" width="@*" height="@*" fill="url(#state)"/>
$left, $top, WIDTH, HEIGHT
  <text x="@*" y="@*" text-anchor="middle" font-weight="bold" font-size="@*">
$left + WIDTH/2, $top + HEADER_FONT_SIZE, HEADER_FONT_SIZE
    @*
$state
  </text>
  <g font-size="@*">
BODY_FONT_SIZE
.

format STATE_LINE =
    <text x="@*" y="@*">@*</text>
$left + BODY_LINE_MARGIN, $top + BODY_LINE_HEIGHT * $lineno, $line
.

format STATE_FOOTER =
  </g>
.

format ARROW_HEADER =
  <g stroke="black" fill="transparent">
    <g marker-start="url(#from)" marker-end="url(#to)">
.

format ARROW_FOOTER =
    </g>
  </g>
.

format FOOTER =
</svg>
.

my $filename = "images/states.svg";
open(SVG, ">", $filename) || die "Can't open $filename for writing: $!\n";

write_header(5,4);
write_state(0, 0, 'Waiting', 'r');
write_state(1, 0, 'Setup', 'r');
write_state(2, 0, 'ChoosingOption', 'd');
write_state(0, 1, 'Revive', 'r');
write_state(1, 1, 'PowerDown', 'r');
write_state(2, 1, 'Programming', 'r');
write_state(3, 1, 'Announcing', 'r');
write_state(4, 1, 'Configuring', 'd');
write_state(4, 2, 'Executing', 'd');
write_state(0, 2, 'GotOption', 'u');
write_state(0, 3, 'Touching', 'u', 'd4ru');
write_state(1, 3, 'Firing', 'l');
write_state(2, 3, 'Lasers', 'l');
write_state(3, 3, '&lt;various&gt;', 'l');
write_state(4, 3, 'Movement', 'l');
write_arrows;
write_footer;

