import React from 'react';
import Damage from '../Damage';
import { mounted, message, player } from '../setupTests';
import { ws } from '../Util';
import ConfirmShot from '../ConfirmShot';
import { Button } from '../UI';
import Deny from '../Deny';
import Dispute from '../Dispute';

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

test('vote yes', () => disputedShot(true, true));
test('vote no', () => disputedShot(true, false));
test('reloaded vote yes', () => disputedShot(false, true));
test('reloaded vote no', () => disputedShot(false, false));

function disputedShot(useMessage, vote) {
    let shot = { player: 'player2', target: 'player3', type: 'laser' };
    let initialContext = { public: { player: { player3: player('Player 3') } } };
    if (!useMessage) {
        shot.dispute = 1;
        shot.voted = { player2: 1, player3: 0 };
        initialContext.state = { shots: [shot] };
    }
    let [context, component] = mounted(<Damage />, initialContext);
    expect(component.find(Dispute).exists()).toBe(!useMessage);

    if (useMessage) {
        shot.cmd = 'dispute';
        component.message(shot);
    }

    let dispute = component.find(Dispute);
    expect(dispute.exists()).toBe(true);
    let buttons = dispute.find(Button);

    buttons.at(vote ? 0 : 1).simulate('click');
    expect(component.find(Dispute).exists()).toBe(false);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'vote', type: 'laser', target: 'player3', player: 'player2', hit: vote });
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