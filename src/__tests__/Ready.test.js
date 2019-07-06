import React from 'react';
import { act } from 'react-dom/test-utils';
import Ready from '../Ready.js';
import { mounted } from '../setupTests';
import { ws } from '../Util';

test('waiting', () => {
    let [context, component] = mounted(<Ready />, { public: { state: 'Waiting' } });
    const ready = component.children();
    expect(ready.text()).toEqual('Ready');
    ready.simulate('click');

    expect(ws.send).toHaveBeenCalledWith({ cmd: 'ready' });
    act(() => { context.me.ready = 1 });
    expect(ready.text()).toEqual('Not Ready');

    ready.simulate('click');
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'not_ready' });

    component.unmount();
});

test('not waiting', () => {
    let [context, component] = mounted(<Ready />, {
        public: {
            state: 'Programming', player: {
                'player1': { ready: 1 }
            }
        },
    });
    const ready = component.children();

    act(() => { context.me.ready = 1 });
    expect(ready.text()).toEqual('Waiting...');

    ready.simulate('click');
    expect(ws.send).not.toHaveBeenCalled();

    component.unmount();
});