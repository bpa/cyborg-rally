import React from 'react';
import { act } from 'react-dom/test-utils';
import Damage from '../Damage';
import { mounted, message } from '../setupTests';
import { ws } from '../Util';

beforeEach(() => {
    ws.send = jest.fn();
});

test('got shot', () => {
    let [context, component] = mounted(<Damage />);

    message({ cmd: 'fire', type: 'laser', player: 'player2' });
});