package Deck::Options;

use strict;
use warnings;
use Option;
use Storable 'dclone';
use parent 'Deck';

my @cards;
while (<DATA>) {
    chomp;
    my ( $name, $uses, $text ) = split /:/, $_, 3;
    push @cards, Option->new( { name => $name, uses => $uses, text => $text } );
}

sub generate_cards {
    my $self = shift;
    my @copy = @cards;
    return dclone(\@copy);
}

1;

__DATA__
Ablative Coat:3:Ablative Coat absorbs the next 3 Damage your robot receives.  Put those Damage tokens onto this card instead of onto your Program Sheet.  Discard this card and the tokens when you put the third one on.
Brakes:0:Whenever you execute a Move 1, you may move your robot 0 spaces instead of 1.  Priority is that of the Move 1.
Conditional Program:0:After you program your registers each turn, you may put one of the Program cards left in your hand face down onto this Option instead of discarding it.  Later that turn, you can substitute that card for one you had programmed in any register, discarding the original card.  Announce the change before anyone reveals Program cards for that register.  If you put a card on this Option and don't use it, discard it at the end of the turn.
Crab Legs:0:When programming your registers, you may put a Move 1 card in the same register as a Rotate Left or Rotate Right card.  If you do, during that register your robot will move 1 space to the left or right, respectively, without rotating.  Priortiy is that of the Move 1.
Double Barreled Laser:0:Whenever your robot fires its main laser, it fires two shots instead of one.  You may use this Option with Fire Control and/or High-Powered Laser.
Dual Processor:0:When programming your registers, you may put both a Move card (Move 1, Move 2, Move 3, or Back Up) and a Rotate Left, Rotate Right, or U-Turn) in the same register.  If you do, during that phase your robot will move 1 space less than the Move card says to move and then execute the Rotate card.  If the Rotate card is a U-Turn, move 2 spaces less than the Move card says if possible.
Emergency Shutdown:0:If you have 3 or more Damage tokens on your Program Sheet at the end of your turn, you may choose to begin the next turn with your robot powered down.
Extra Memory:0:You receive one extra Program card each turn.  (You still discard all unused Program cards when you're done programming your registers.)
Fire Control:0:Whenever your robot hits another robot with its main laser, instead of doing damage you may choose one of the target robot's registers and lock it or choose one of that player's Options and destroy it.  (The player can't discard an option to avoid this effect.)
Flywheel:0:After all players are done programming their registers each turn, you may put one of your remaining Program cards face down onto this card.  You can add that Program card to those dealt to you on any subsequent turn.  You can have only one card on Flywheel at a time.
Fourth Gear:0:Whenever you execute a Move 3, you may move your robot 4 spaces instead of 3.  Priority is that of the Move 3.
Gyroscopic Stabilizer:0:Before players reveal the cards in their first registers each turn, state whether this Option is active.  When it is, your robot isn't rotated by gears or rotating conveyor belts for that entire turn.
High-Power Laser:0:Your robot's main laser can shoot through one wall or robot to get to a target robot.  If you shoot through a robot, that robot also receives full damage.  You may use this Option with Fire Control and/or Double-Barreled Laser.
Mechanical Arm:0:Your robot can touch a flag or repair site from 1 space away (diagonally or orthogonally), as long as there isn't a wall between it and the flag or repair site.
Mini Howitzer:5:Whenever you could fire your main laser at a robot, you may fire the Mini Howitzer instead.  This pushes the target robot 1 space away from your robot, and the target robot receives 1 Damage token.  (Robots can't be pushed through walls.)  You may use this Option five times.  Put a Damage token on this card each time you use it and discard this card and the tokens when you put the fifth one on.
Power-Down Shield:0:As long as your robot is powered down, each register phase you can prevent up to 1 Damage to it from each of the four directions.
Pressor Beam:0:Whenever you could fire your main laser at a robot, you may instead fire the Pressor Beam.  This moves the target robot 1 space away from your robot.
Radio Control:0:Whenever you could fire your main laser at a robot, you may instead fire the Radio Control beam.  It causes the target robot to execute your robot's program for the rest of the turn.  In the cases of card priority, the target robot moves immediately after your robot.
Ramming Gear:0:Whenever your robot pushes or bumps into another robot, that robot receives 1 Damage token.
Rear-Firing Laser:0:Your robot has a rear-firing laser in addition to its main laser.  This laser follows all the same rules as the main laser.
Recompile:0:Once each turn, you may discard the hand of Program cards dealt to you and draw a new hand from the deck.  Your robot then receives 1 Damage token.
Reverse Gear:0:Whenever you execute a Back Up, you may move your robot back 2 spaces instead of 1.  Priority is that of the Back Up.
Scrambler:0:Whenever you could fire your main laser at a robot, you may instead fire the Scrambler.  This replaces the target robot's next programmed card with the top Program card from the deck.  You can't use this Option on the fifth register phase.
Superior Archive:0:When reentering play after being destroyed, your robot doesn't receive the normal 2 Damage tokens.
Tractor Beam:0:Whenever you could fire your main laser at a robot that isn't in an adjacent space, you may instead fire the Tractor Beam.  This pulls the target robot 1 space toward your robot.
