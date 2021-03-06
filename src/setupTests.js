import { GameContext, ws } from './Util';
import { subscriptions } from './Socket';
import React from 'react';
import Enzyme, { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { extendObservable } from 'mobx';
import Adapter from 'enzyme-adapter-react-16';
let deepmerge = require('deepmerge');

Enzyme.configure({ adapter: new Adapter() });

function message(msg) {
   act(() => {
      let callbacks = subscriptions.get(msg.cmd);
      if (callbacks) {
         let functions = Array.from(callbacks.values());
         functions.forEach((f) => f(msg));
      }
   });
   this.update();
}

export function mounted(children, ...extraState) {
   let data = game();
   if (extraState.length) {
      data = deepmerge.all([data, ...extraState]);
   }

   let context = extendObservable({
      get me() {
         return this.public.player[this.id];
      }
   }, data);

   subscriptions.clear();
   ws.send = jest.fn();

   let component = mount(
      <GameContext.Provider value={context}>
         {children}
      </GameContext.Provider>);
   component.message = message.bind(component);
   return [component, context];
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

export function c(name, priority) {
   return {
      number: 4,
      priority: priority,
      name: "" + name,
      total: 7
   };
}

export const DAMAGED = 'damaged';
export const LOCKED = 'locked';
export const U = 'u';
export const R = 'r';
export const L = 'l';

export function r() {
   let r = {
      program: [],
   };

   for (let a of arguments) {
      if (a === DAMAGED) {
         r.damaged = true;
         r.locked = true;
      }
      else if (a === LOCKED) {
         r.locked = true;
      }
      else {
         r.program.push(a);
      }
   }
   return r;
}

export function option(player, option, uses, tapped) {
   return {
      public: {
         player: {
            [player]: {
               options: {
                  [option]: {
                     name: option,
                     uses: uses || 0,
                     tapped: tapped || 0,
                     text: `${option} text`,
                  }
               }
            }
         }
      }
   }
}