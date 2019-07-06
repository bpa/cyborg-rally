import React from 'react';
import Damage from '../Damage';
import { mounted, message, player } from '../setupTests';
import { ws } from '../Util';
import ConfirmShot from '../ConfirmShot';
import { Button } from '../UI';
import Deny from '../Deny';

test('got shot', () => {
    let [context, component] = mounted(<Damage />);
    component.message({ cmd: 'fire', type: 'laser', player: 'player2' });
    testConfirm(component);
});

test('reload page after shot', () => {
    let [context, component] = mounted(<Damage />, shot('laser'));
    testConfirm(component);
});

test('deny shot', () => {
    let [context, component] = mounted(<Damage />, shot('laser'));
    let confirm = component.find(ConfirmShot);
    expect(confirm.exists()).toBe(true);

    let buttons = confirm.find(Button);
    buttons.at(1).simulate('click');
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'deny', type: 'laser', player: 'player2' });
    expect(component.find(ConfirmShot).exists()).toBe(false);
});

function testConfirm(component) {
    let confirm = component.find(ConfirmShot);
    expect(confirm.exists()).toBe(true);

    let buttons = confirm.find(Button);
    buttons.at(0).simulate('click');
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'confirm', type: 'laser', player: 'player2' });
    expect(component.find(ConfirmShot).exists()).toBe(false);
}

test('shot denied, accept', () => {
    let [buttons, component] = denyShot();
    buttons.at(1).simulate('click');
    expect(component.find(Deny).exists()).toBe(false);
    expect(ws.send).not.toHaveBeenCalled();
});

test('shot denied, dispute', () => {
    let [buttons, component] = denyShot();
    buttons.at(0).simulate('click');
    expect(component.find(Deny).exists()).toBe(false);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'dispute', type: 'laser', target: 'player2' });
});

function denyShot() {
    let [context, component] = mounted(<Damage />, { public: { player: { player3: player('Player 3') } } });

    expect(component.find(Deny).exists()).toBe(false);
    component.message({ cmd: 'deny', player: 'player2', type: 'laser' });
    let denied = component.find(Deny);
    expect(denied.exists()).toBe(true);
    let buttons = denied.find(Button);

    return [buttons, component];
}

function shot(type) {
    return {
        state: {
            shots: [
                { player: 'player2', target: 'player1', type: type }
            ]
        },
        public: {
            player: {
                player3: player('Player 3')
            }
        }
    };
}