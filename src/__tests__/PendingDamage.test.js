import React from 'react';
import { mounted, option } from '../setupTests';
import Playing from '../Playing';
import Modal from '../Modal';
import { Button } from '../UI';
import { ws } from '../Util';
import Icon from '../Icon';

let hasDamage = option('player1', 'Brakes');
hasDamage.state = { pending_damage: { player1: 1 } };

test('new damage', () => {
    let [component] = mounted(<Playing />, option('player1', 'Brakes'));
    expect(component.find(Modal).exists()).toBe(false);

    component.message({ cmd: 'pending_damage', damage: 1 });
    let pending = component.find(Modal);
    expect(pending.exists()).toBe(true);

    expect(pending.find(Icon).find('img').props().src).toBe('images/brakes.svg');
    expect(pending.find(Button).text()).toMatch(/Have robot take damage/i);
});

test('existing damage', () => {
    let [component] = mounted(<Playing />, hasDamage);
    let pending = component.find(Modal);
    expect(pending.exists()).toBe(true);

    expect(pending.find(Icon).find('img').props().src).toBe('images/brakes.svg');
    expect(pending.find(Button).text()).toMatch(/Have robot take damage/i);
});

test('damage robot', () => {
    let [component] = mounted(<Playing />, hasDamage);
    let modal = component.find(Modal);
    expect(modal.exists()).toBe(true);

    //Click have robot take damage
    let buttons = modal.find(Button);
    buttons.simulate('click');

    modal = component.find(Modal);
    expect(modal.exists()).toBe(true);
    expect(modal.text()).toMatch(/sure.*damage.*robot/i);

    buttons = modal.find(Button);
    expect(buttons).toHaveLength(2);
    expect(buttons.at(0).text()).toMatch(/yes/i);
    expect(buttons.at(1).text()).toBe('Nevermind');

    //Click Nevermind
    buttons.at(1).simulate('click');
    expect(ws.send).not.toHaveBeenCalled();
    modal = component.find(Modal);
    expect(modal.text()).toMatch(/Have robot take damage/i);

    //Click have robot take damage
    modal.find(Button).simulate('click');
    modal = component.find(Modal);
    expect(modal.text()).toMatch(/sure.*damage.*robot/i);

    //Confirm robot damage
    modal.find(Button).at(0).simulate('click');
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'damage', target: 'robot' })

    component.message({ cmd: 'damage', player: 'player1', damage: 1, registers: [] });
    component.message({ cmd: 'pending_damage', damage: 0 });
    expect(component.find(Modal).exists()).toBe(false);
});

test('discard option', () => {
    let [component] = mounted(<Playing />, hasDamage);
    let modal = component.find(Modal);
    expect(modal.exists()).toBe(true);

    //Click discard option
    modal.find(Icon).simulate('click');

    modal = component.find(Modal);
    expect(modal.exists()).toBe(true);
    expect(modal.text()).toMatch(/discard.*brakes/i);

    let buttons = modal.find(Button);
    expect(buttons).toHaveLength(2);
    expect(buttons.at(0).text()).toMatch(/yes/i);
    expect(buttons.at(1).text()).toBe('Nevermind');

    //Click Nevermind
    buttons.at(1).simulate('click');
    expect(ws.send).not.toHaveBeenCalled();
    modal = component.find(Modal);
    expect(modal.text()).toMatch(/Have robot take damage/i);

    //Click discard option
    modal.find(Icon).simulate('click');
    modal = component.find(Modal);
    expect(modal.text()).toMatch(/discard.*brakes/i);

    //Confirm discard
    modal.find(Button).at(0).simulate('click');
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'damage', target: 'Brakes' })

    component.message({ cmd: 'options', player: 'player1', options: {} });
    component.message({ cmd: 'pending_damage', damage: 0 });
    expect(component.find(Modal).exists()).toBe(false);
});