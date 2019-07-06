import React from 'react';
import { act } from 'react-dom/test-utils';
import Firing from '../Firing';
import { mounted } from '../setupTests';
import { ws } from '../Util';

test('No shots', () => {
    let [component, context] = mounted(<Firing />, { public: { state: 'Firing' } });

    let buttons = component.find('a');
    expect(buttons.at(0).text()).toEqual('No one in line of sight');
    buttons.at(0).simulate('click');

    expect(ws.send).toHaveBeenCalledWith({ cmd: 'ready' });
    act(() => { context.me.ready = 1 });
    expect(buttons.at(0).text()).toEqual('Waiting...');

    component.unmount();
});

test('Shoot p2', () => {
    let [component] = mounted(<Firing />, { public: { state: 'Firing' } });

    let buttons = component.find('a');
    expect(buttons).toHaveLength(2);
    expect(buttons.at(1).text()).toEqual(expect.stringContaining('Player 2'));
    buttons.at(1).simulate('click');
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'fire', type: 'laser', target: 'player2' });

    component.unmount();
});

test('Shoot alternate weapon', () => {
    let [component] = mounted(<Firing />, {
        public: {
            state: 'Firing',
            player: {
                player1: {
                    options: {
                        Brakes: { name: 'Brakes', text: 'Brakes' },
                        'Double Barreled Laser': { name: 'DBL', text: 'Boom' },
                        'Fire Control': { name: 'FC', text: 'Fire Control' },
                        'Scrambler': { name: 'Scrambler', text: 'It Scrambles' },
                    }
                }
            }
        }
    });

    let buttons = component.find('a');
    let weapons = component.find('span.button');
    expect(weapons).toHaveLength(3);

    buttons.at(1).simulate('click');
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'fire', type: 'laser', target: 'player2' });

    weapons.at(1).simulate('click');
    buttons.at(1).simulate('click');
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'fire', type: 'Fire Control', target: 'player2' });

    weapons.at(2).simulate('click');
    buttons.at(1).simulate('click');
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'fire', type: 'Scrambler', target: 'player2' });

    weapons.at(0).simulate('click');
    buttons.at(1).simulate('click');
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'fire', type: 'laser', target: 'player2' });

    component.unmount();
});
