import { GameContext, ws } from './Util';
import { subscriptions } from './Socket';
import React from 'react';
import Enzyme, { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { extendObservable } from 'mobx';
import Adapter from 'enzyme-adapter-react-16';
let deepmerge = require('deepmerge');

Enzyme.configure({ adapter: new Adapter() });

export function message(msg) {
   act(() => {
      let callbacks = subscriptions.get(msg.cmd);
      if (callbacks) {
         callbacks.forEach((f) => f(msg));
      }
   });
}

export function mounted(children, props) {
   let context = extendObservable({
      get me() {
         return this.public.player[this.id];
      }
   }, deepmerge(game(), props || {}));

   return [context, mount(
      <GameContext.Provider value={context}>
         {children}
      </GameContext.Provider>)];
}

function game() {
   return {
      "name": "test",
      "opts": {
         "option_for_heal": "",
         "start_with_2_damage": "",
         "express_conveyors": "",
         "gears": "",
         "options": "0",
         "no_power_down": "",
         "timer": "1m",
         "conveyors": "1",
         "board_lasers": "",
         "pushers": "",
         "lives": "3"
      },
      "timediff": 2,
      "game": "Rally",
      "id": "player1",
      "private": {},
      "state": {},
      "now": new Date().getTime(),
      "public": {
         "register": 0,
         "option": {},
         "state": "Waiting",
         "player": {
            "player1": player("Player 1"),
            "player2": player("Player 2")
         }
      }
   };
}

export function player(name) {
   return {
      "name": name,
      "shutdown": "",
      "dead": "",
      "registers": [],
      "lives": 3,
      "options": {},
      "archive": "standard",
      "ready": "",
      "dock": 2,
      "damage": 0,
      "memory": 9
   };
}

export function register(c) {
   return {
      "program": [
         {
            "number": 4,
            "priority": 140,
            "name": "l",
            "total": 7
         }
      ],
      "damaged": "",
      "locked": ""
   }
}