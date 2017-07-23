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

#### Data
None

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

#### Data
None

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

#### Data
None

#### Commands
|cmd|Source|Elements|Notes|
|---|------|--------|-----|
|laser|Client|`n` - Int, damage from forward<br>`e` - Int, damage from right<br>`s` - Int, damage from behind<br>`w` - Int, damage from left|Self report board damage, directions not specified assumed to be 0|

#### Transitions
[FIRE](#Firing) triggered after all players are ready
