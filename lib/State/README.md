## States

|State|Alias|Documentation|
|-----|-----|-------------|
|Announcing|ANNOUNCE|[Announcing](#Announcing)|
|conveyors|BOARD[1-3]?|[Board](#Board)|
|Executing|EXECUTE|[Executing](#Executing)|
|express_conveyors|BOARD[1-3]?|[Board](#Board)|
|Firing|FIRE|[Firing](#Firing)|
|gears|BOARD[1-3]?|[Board](#Board)|
|Lasers|LASER|[Lasers](#Lasers)|
|Movement|MOVE|[Movement](#Movement)|
|PowerDown|POWER|[PowerDown](#PowerDown)|
|Programming|PROGRAM|[Programming](#Programming)|
|pushers|BOARD[1-3]?|[Board](#Board)|
|Revive|REVIVE|[Revive](#Revive)|
|Setup|SETUP|[Setup](#Setup)|
|Touching|TOUCH|[Touching](#Touching)|
|Waiting|INITIAL|[Waiting](#Waiting)|

## Common Commands
|cmd|Source|Elements|Notes|
|---|------|--------|-----|
|ready|Client||Player is waiting for the next state and has no further actions to perform|
|ready|Server|`player` - `id` of player who is ready|Informational|
|not_ready|Client||Player signals not ready for next state|
|not_ready|Server|`player` - `id` of player who is not ready|Informational|

## <a name="Announcing"></a> Announcing
Waiting for players to declare if they will shutdown after this round.

#### Commands
|cmd|Source|Elements|Notes|
|---|------|--------|-----|
|shutdown|Client|`activate` - Boolean|True if player wishes to shutdown at end of round|
|announce|Server|`player` - `id` of player<br>`shutdown` - Boolean|Informational|

#### Transitions
[EXECUTE](#Execute) triggered after 10 seconds or when all players are ready, whichever comes first.

## <a name="Board"></a> Board
Display board action reminders

#### Data
Next - String containing key of next State

#### Transitions
Next state triggered once all players are ready.

## <a name="Executing"></a> Executing
Transitional state for initializing the round

#### Transitions
[MOVE](#Movement) triggered immediately

## <a name="Firing"></a> Firing
Players weapons fire

#### Data
|Key|Type|Notes|
|---|----|-----|
|shot|Map|State of weapons fire|
|shot/`player-id`|State of individual player's weapons fire|
|public|Map|Public data|

#### Commands
|cmd|Source|Elements|Notes|
|---|------|--------|-----|
|fire|Client|`target` - `id` of player in line of sight<br>`type` - 'laser' or option name|Fire a weapon|
|fire|Server|`player` - `id` of player shooting<br>`type` - 'laser' or option name|Notify player they are targeted|
|confirm|Client|`player` - `id` of player originating discharge|Player acknowledges they have been hit|
|deny|Client|`player` - `id` of player originating discharge|Player denies line of sight|
|deny|Server|`target` - `id` of player originally targeted|Notify player the target disagrees|
|dispute|Client|`target` - `id` of player in disputed line of sight<br>`type` - 'laser' or option name|Ask for other players to resolve displute|
|dispute|Server|`player` - `id` of originator<br>`target` - `id` of player targeted<br>`type` - 'laser' or option name|Request vote on whether `player` shot `target`|
|vote|Client|`hit` - Boolean<br>`player` - source of the discharge<br>`target` - target of discharge|Register player's input on disputed shot|
|vote|Server|`voter` - `id` of player who voted<br>`player` - `id` of originator<br>`target` - `id` of player targeted<br>|Meant to allow client to follow progress|
|resolution|Server|`player` - `id` of originator<br>`target` - `id` of player targeted<br>`type` - 'laser' or option name<br>`hit` - Boolean|Announce results of vote|

#### Transitions
[TOUCH](#Touching) triggered when all players are ready

## <a name="Lasers"></a> Lasers
Board lasers fire

#### Commands
|cmd|Source|Elements|Notes|
|---|------|--------|-----|
|laser|Client|`n` - Int, damage from forward<br>`e` - Int, damage from right<br>`s` - Int, damage from behind<br>`w` - Int, damage from left|Self report board damage, directions not specified assumed to be 0|

#### Transitions
[FIRE](#Firing) triggered after all players are ready

## <a name="Movement"></a> Movement
Waiting for players to move.

#### Transitions
[BOARD](#Board) triggered when all players are ready.

## <a name="PowerDown"></a> PowerDown
Waiting for currently inactive players to declare if they will remain shutdown.

#### Commands
|cmd|Source|Elements|Notes|
|---|------|--------|-----|
|shutdown|Client|`activate` - Boolean|True if player wishes to remain shutdown for the next round|
|announce|Server|`player` - `id` of player<br>`shutdown` - Boolean|Informational|

#### Transitions
[PROGRAM](#Programming) triggered when all players are ready.

## <a name="Programming"></a> Programming
Programming for the next round.  Timer is set based on game preferences.  Could be 30 seconds, one minute, or happen when the first or second to last person is ready.

#### Commands
|cmd|Source|Elements|Notes|
|---|------|--------|-----|
|program|Client|`registers` - Array of Array of String(card name)|The full or partial program desired|
|program|Server|`registers` - Array of Array of [Card](../Deck/README.md#Card)|Informational on what the server actually has|

#### Transitions
[ANNOUNCE](#Announcing) triggered when timer runs out or all players are ready.

## <a name="Revive"></a> Revive
Waiting for players to move back into position

#### Transitions
[POWER](#PowerDown) triggered when timer runs out or all players are ready.

## <a name="Setup"></a> Setup
Setup game data, initialize players

#### Commands
|cmd|Source|Elements|Notes|
|---|------|--------|-----|
|choose|Client|`options` - String|Option chosen to keep|

#### Transitions
[PROGRAM](#Programming) triggered immediately unless players have to choose one of three options.

## <a name="Touching"></a> Touching
Determine where people are and if touching a flag, checkpoint, etc.

#### Data
|Key|Type|Notes|
|---|----|-----|
|public|Map|Tile type by `id` of player|

#### Commands
|cmd|Source|Elements|Notes|
|---|------|--------|-----|
|touch|Client|`tile` - String|Tile type player is on|
|touch|Server|`tile` - String<br>`player` - `id` of player|Informational|

#### Transitions
[MOVE](#Moving) when everyone has declared and no one is dead or shutdown
[REVIVE](#Revive) when everyone has declared and there are dead or shutdown people

## <a name="Waiting"></a> Waiting
Wait for all players to join

#### Transitions
[SETUP](#Setup) when everyone is ready
