import React, { useLayoutEffect } from 'react';
import Socket from "./Socket";

const SPACE = new RegExp(' ', 'g');

export let GameContext = React.createContext({});
export let ws = new Socket();

export let LASER_OPTION = { name: 'Laser', text: 'Standard issue laser cannon.  Fires one shot.' };
export function getFile(option) {
  let file = "images/" + option.name.toLowerCase().replace(SPACE, "-");
  if (option.uses > 0) {
    file += option.uses;
  }
  return file + ".svg";
}

export function useMessages(callbacks) {
  useLayoutEffect(() => {
    Object.keys(callbacks).forEach(prop => ws.subscribe(callbacks, prop, callbacks[prop]));

    return () => {
      Object.keys(callbacks).forEach(prop => ws.unsubscribe(callbacks, prop));
    }
  }, [callbacks]);
}
