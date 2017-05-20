## Communication
All communication is done over websocket connections, where JSON documents are exchanged between client and server.

Each packet will be a document and must contain a `cmd` element.  

## State Machine
![States](../images/states.png)

States will most often reset ready flag for all players on enter.

## Internal game data

|Member |Type  |Usage                                           |
|-------|------|------------------------------------------------|
|game   |String|Game subclass, will be 'Rally' or 'Lobby'       |
|map    |Hash  |Mapping of identity token to in game identifier |
|name   |String|Name of the game, as displayed                  |
|opts   |Hash  |Game options selected at creation               |
|player |Hash  |Players by in game identifier                   |
|private|Hash  |Private player data by in game identifier       |
|public |Hash  |Public data                                     |
|states |Hash  |State instances by alias                        |
|state  |State |Instance of current state                       |

## Player data

|Member           |Type             |Usage                                               |
|-----------------|-----------------|----------------------------------------------------|
|id               |UUID             |In game identifier                                  |
|private          |Hash             |Data for the player's eyes only                     |
|private.cards    |Hash of Card     |Cards the player holds                              |
|private.options  |Hash of Option   |Options previewed during setup if pick 1 of 3       |
|private.registers|Array of Register|Registers as programmed during the programming state|
|public           |Hash             |Public data about the player                        |
|public.dead      |Bool             |Is the player currently dead?                       |
|public.dock      |Int              |Starting dock position                              |
|public.lives     |Int              |How many lives remaining                            |
|public.memory    |Int              |Max number of cards player can hold                 |
|public.name      |String           |User defined name of player                         |
|public.options   |Array of Option  |Option cards held by player                         |
|public.ready     |Bool             |Is the player ready?                                |
|public.registers |Array of Register|Finalized registers                                 |
|public.shutdown  |Bool             |Is player shutdown?                                 |

## Messages common to all states (handled by Game)

|cmd     |Required elements|Purpose                       |
|--------|-----------------|------------------------------|
|state   |state            |Signify game has changed state|
|set_name|name             |Change name of player         |
|quit    |                 |Exit the current game         |

## Data for individual states

When a game starts, an instance of each state is created and will persist until the game is destroyed.  Each state is responsible for cleaning up after itself.

If a state has a `public` member, that will be available for clients.  All other members are considered private.

States are allowed to modify game data, but it is preferable to keep data out if possible.

Please check the [State directory](State) for documentation relating to individual states.
