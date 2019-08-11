import React from 'react';
import { act } from 'react-dom/test-utils';
import { mounted, r, c, U, R, L, option } from '../setupTests';
import { ws } from '../Util';
import Programming from '../Programming';
import { Panel, Content, Button } from '../UI';
import Icon from '../Icon';
import Modal from '../Modal';

const UA = c(U, 30), UB = c(U, 20), UC = c(U, 10),
    _R = c(R, 40), _L = c(L, 50),
    _1A = c(1, 105), _1B = c(1, 100),
    _2A = c(2, 205), _2B = c(2, 200),
    _3A = c(3, 305), _3B = c(3, 300);

let normal = {
    private: {
        cards: [UA, _1A, _1B, _R, _2B, _2A, _L, _3A, _3B],
        registers: [r(), r(), r(), r(), r()],
    }
};

let uturns = {
    private: {
        cards: [UB, _1A, _1B, UC, _2A, _2B, UA, _3A, _3B],
        registers: [r(), r(), r(), r(), r()],
    }
};

function cardData(panel) {
    let x = 0;
    return panel.find(Icon).map(i => {
        let card = i.prop('card');
        return {
            card: card ? card.name : i.prop('name'),
            className: i.prop('className') || '',
        };
    });
}

const STATUS = {
    i: 'inactive',
    s: 'selected',
    a: 'add-on',
    l: 'locked',
    h: 'help',
};

function cardStatus() {
    return [...arguments].map(a => {
        let card = "" + a;
        let s = (card.length > 1 && STATUS[card.charAt(0)]) || '';
        return { card: card.substring(s ? 1 : 0), className: s };
    });
}

function expectDisplay(component, ...expected) {
    let panels = component.find(Panel);
    expect(panels).toHaveLength(expected.length);
    for (var i = 0, ii = expected.length; i < ii; i++) {
        expect(cardData(panels.at(i))).toEqual(cardStatus(...expected[i]));
    }
}

function clickOption(component, ind) {
    ws.send.mockClear();
    let panels = component.find(Panel);
    expect(panels).toHaveLength(3);
    panels.at(0).find(Icon).at(ind).simulate('click');
}

function clickRegister(component, ind) {
    ws.send.mockClear();
    let panels = component.find(Panel);
    panels.at(panels.length - 2).find(Icon).at(ind).simulate('click');
}

function clickCard(component, ...ind) {
    ws.send.mockClear();
    ind.forEach(i => component.find(Panel).last().find(Icon).at(i).simulate('click'));
}

test('Standard', () => {
    let [component, context] = mounted(<Programming />, normal);

    expectDisplay(component,
        ['inull', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 2, 2, 1, 1, L, R, U]);

    clickCard(component, 2);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_2A], [], [], [], []] });
    expectDisplay(component,
        ['2', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 'i2', 2, 1, 1, L, R, U]);

    clickRegister(component, 0);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[], [], [], [], []] });
    expectDisplay(component,
        ['inull', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 2, 2, 1, 1, L, R, U]);

    clickCard(component, 6);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_L], [], [], [], []] });
    clickCard(component, 7);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_L], [_R], [], [], []] });
    expectDisplay(component,
        [L, R, 'inull', 'inull', 'inull'],
        [3, 3, 2, 2, 1, 1, 'il', 'ir', U]);

    act(() => {
        context.private.registers = [
            { name: 'l', program: [_L] },
            { name: 'r', program: [_R] },
            { name: 'u', program: [UA] },
            { name: '1', program: [_1A] },
            { name: '2', program: [_2B] },
        ]
    });
    component.update();
    expectDisplay(component,
        [L, R, U, 1, 2],
        [3, 3, 2, 'i2', 'i1', 1, 'il', 'ir', 'iu']);

    clickRegister(component, 2);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_L], [_R], [], [_1A], [_2B]] });

    expectDisplay(component,
        [L, R, 'inull', 1, 2],
        [3, 3, 2, 'i2', 'i1', 1, 'il', 'ir', U]);

    clickCard(component, 0);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_L], [_R], [_3A], [_1A], [_2B]] });
    expectDisplay(component,
        [L, R, 3, 1, 2],
        ['i3', 3, 2, 'i2', 'i1', 1, 'il', 'ir', U]);

    clickCard(component, 1);
    expect(ws.send).not.toHaveBeenCalled();
    expectDisplay(component,
        [L, R, 3, 1, 2],
        ['i3', 3, 2, 'i2', 'i1', 1, 'il', 'ir', U]);

    component.unmount();
});

test('Dual Processor unselect initial choice', () => {
    let [component] = mounted(<Programming />, normal, option('player1', 'Dual Processor'));

    expectDisplay(component,
        ['Dual Processor'],
        ['inull', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 2, 2, 1, 1, L, R, U]);

    clickOption(component, 0);
    expect(ws.send).not.toHaveBeenCalled();
    expectDisplay(component,
        ['sDual Processor'],
        ['inull', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 2, 2, 'i1', 'i1', 'il', 'ir', 'iu']);

    clickCard(component, 2);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_2A], [], [], [], []] })
    expectDisplay(component,
        ['sDual Processor'],
        ['a2', 'inull', 'inull', 'inull', 'inull'],
        ['i3', 'i3', 'i2', 'i2', 'i1', 'i1', L, R, 'iu']);

    clickRegister(component, 0);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[], [], [], [], []] })
    expectDisplay(component,
        ['Dual Processor'],
        ['inull', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 2, 2, 1, 1, L, R, U]);

    component.unmount();
});

test('Dual Processor cancel with option click', () => {
    let [component] = mounted(<Programming />, normal, option('player1', 'Dual Processor'));

    clickOption(component, 0);
    expect(ws.send).not.toHaveBeenCalled();
    expectDisplay(component,
        ['sDual Processor'],
        ['inull', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 2, 2, 'i1', 'i1', 'il', 'ir', 'iu']);

    clickOption(component, 0);
    expect(ws.send).not.toHaveBeenCalled();
    expectDisplay(component,
        ['Dual Processor'],
        ['inull', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 2, 2, 1, 1, L, R, U]);

    clickOption(component, 0);
    expect(ws.send).not.toHaveBeenCalled();
    expectDisplay(component,
        ['sDual Processor'],
        ['inull', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 2, 2, 'i1', 'i1', 'il', 'ir', 'iu']);

    clickCard(component, 0);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_3A], [], [], [], []] })
    expectDisplay(component,
        ['sDual Processor'],
        ['a3', 'inull', 'inull', 'inull', 'inull'],
        ['i3', 'i3', 'i2', 'i2', 'i1', 'i1', L, R, U]);

    clickOption(component, 0);
    expect(ws.send).not.toHaveBeenCalled();
    expectDisplay(component,
        ['Dual Processor'],
        [3, 'inull', 'inull', 'inull', 'inull'],
        ['i3', 3, 2, 2, 1, 1, L, R, U]);

    component.unmount();
});

test('Dual Processor complete', () => {
    let [component] = mounted(<Programming />, normal, option('player1', 'Dual Processor'));

    clickOption(component, 0);
    expect(ws.send).not.toHaveBeenCalled();
    expectDisplay(component,
        ['sDual Processor'],
        ['inull', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 2, 2, 'i1', 'i1', 'il', 'ir', 'iu']);

    clickCard(component, 2);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_2A], [], [], [], []] })
    expectDisplay(component,
        ['sDual Processor'],
        ['a2', 'inull', 'inull', 'inull', 'inull'],
        ['i3', 'i3', 'i2', 'i2', 'i1', 'i1', L, R, 'iu']);

    clickCard(component, 6);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_2A, _L], [], [], [], []] })
    expectDisplay(component,
        ['Dual Processor'],
        ['2l', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 'i2', 2, 1, 1, 'il', R, U]);

    component.unmount();
});

test('Dual Processor first card already programmed', () => {
    let [component] = mounted(<Programming />, normal, option('player1', 'Dual Processor'));

    clickCard(component, 2);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_2A], [], [], [], []] })
    expectDisplay(component,
        ['Dual Processor'],
        [2, 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 'i2', 2, 1, 1, L, R, U]);

    clickOption(component, 0);
    expect(ws.send).not.toHaveBeenCalled();
    expectDisplay(component,
        ['sDual Processor'],
        [2, 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 'i2', 2, 'i1', 'i1', 'il', 'ir', 'iu']);

    clickRegister(component, 0);
    expect(ws.send).not.toHaveBeenCalled();
    expectDisplay(component,
        ['sDual Processor'],
        ['a2', 'inull', 'inull', 'inull', 'inull'],
        ['i3', 'i3', 'i2', 'i2', 'i1', 'i1', L, R, 'iu']);

    clickCard(component, 7);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_2A, _R], [], [], [], []] })
    expectDisplay(component,
        ['Dual Processor'],
        ['2r', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 'i2', 2, 1, 1, L, 'ir', U]);

    component.unmount();
});

test('Dual Processor only u turns', () => {
    let [component] = mounted(<Programming />, uturns, option('player1', 'Dual Processor'));

    clickOption(component, 0);
    expect(ws.send).not.toHaveBeenCalled();
    expectDisplay(component,
        ['sDual Processor'],
        ['inull', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 'i2', 'i2', 'i1', 'i1', 'iu', 'iu', 'iu']);

    clickCard(component, 0);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_3A], [], [], [], []] })
    expectDisplay(component,
        ['sDual Processor'],
        ['a3', 'inull', 'inull', 'inull', 'inull'],
        ['i3', 'i3', 'i2', 'i2', 'i1', 'i1', U, U, U]);

    clickCard(component, 6);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_3A, UA], [], [], [], []] })
    expectDisplay(component,
        ['Dual Processor'],
        ['3u', 'inull', 'inull', 'inull', 'inull'],
        ['i3', 3, 2, 2, 1, 1, 'iu', U, U]);

    component.unmount();
});

test('Dual Processor no combo available', () => {
    let [component] = mounted(<Programming />, uturns, option('player1', 'Dual Processor'));
    component.message({ cmd: 'program', registers: [r(UA), r(UB), r(UC), r(), r()] });

    expectDisplay(component,
        ['iDual Processor'],
        [U, U, U, 'inull', 'inull'],
        [3, 3, 2, 2, 1, 1, 'iu', 'iu', 'iu']);

    component.unmount();
});

test('Dual Processor use available combo', () => {
    let [component] = mounted(<Programming />, normal, option('player1', 'Dual Processor'));

    clickCard(component, 6);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_L], [], [], [], []] })
    expectDisplay(component,
        ['Dual Processor'],
        [L, 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 2, 2, 1, 1, 'il', R, U]);

    clickCard(component, 7);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_L], [_R], [], [], []] })
    expectDisplay(component,
        ['Dual Processor'],
        [L, R, 'inull', 'inull', 'inull'],
        [3, 3, 2, 2, 1, 1, 'il', 'ir', U]);

    clickOption(component, 0);
    expect(ws.send).not.toHaveBeenCalled();
    expectDisplay(component,
        ['sDual Processor'],
        ['il', 'ir', 'inull', 'inull', 'inull'],
        [3, 3, 'i2', 'i2', 'i1', 'i1', 'il', 'ir', 'iu']);

    component.unmount();
});

test("Recompile", () => {
    let [component] = mounted(<Programming />, normal, option('player1', 'Recompile'));

    clickOption(component, 0);
    let modal = component.find(Modal);
    expect(modal.find(Content).text()).toMatch(/Are you sure?/);

    let buttons = modal.find(Button);
    expect(buttons).toHaveLength(2);
    expect(buttons.at(0).text()).toBe('Yes');
    expect(buttons.at(1).text()).toBe('Cancel');
    expect(ws.send).not.toHaveBeenCalled();

    buttons.at(1).simulate('click');
    expect(component.find(Modal)).toHaveLength(0);
    expect(ws.send).not.toHaveBeenCalled();

    clickOption(component, 0);
    modal = component.find(Modal);
    buttons = modal.find(Button);
    buttons.at(0).simulate('click');
    expect(component.find(Modal)).toHaveLength(0);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'recompile' });

    component.unmount();
});

test("Error resets registers", () => {
    let [component] = mounted(<Programming />, normal);

    clickCard(component, 3);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_2B], [], [], [], []] });
    expectDisplay(component,
        ['2', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 2, 'i2', 1, 1, L, R, U]);

    component.message({ cmd: 'error', reason: 'Invalid program' });
    expectDisplay(component,
        ['inull', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 2, 2, 1, 1, L, R, U]);

    clickCard(component, 3);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_2B], [], [], [], []] });
    expectDisplay(component,
        ['2', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 2, 'i2', 1, 1, L, R, U]);

    send(component, [_2B]);
    expectDisplay(component,
        ['2', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 2, 'i2', 1, 1, L, R, U]);

    clickCard(component, 0);
    expectDisplay(component,
        ['2', '3', 'inull', 'inull', 'inull'],
        ['i3', 3, 2, 'i2', 1, 1, L, R, U]);

    component.message({ cmd: 'error', reason: 'Invalid program' });
    expectDisplay(component,
        ['2', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 2, 'i2', 1, 1, L, R, U]);

    component.message({ cmd: 'error', reason: 'Invalid program' });
    expectDisplay(component,
        ['2', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 2, 'i2', 1, 1, L, R, U]);

    component.unmount();
});

test("Response is late", () => {
    let [component] = mounted(<Programming />, normal);

    clickCard(component, 3);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_2B], [], [], [], []] });
    expectDisplay(component,
        ['2', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 2, 'i2', 1, 1, L, R, U]);

    clickCard(component, 0);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_2B], [_3A], [], [], []] });
    expectDisplay(component,
        ['2', '3', 'inull', 'inull', 'inull'],
        ['i3', 3, 2, 'i2', 1, 1, L, R, U]);

    clickCard(component, 8);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_2B], [_3A], [UA], [], []] });
    expectDisplay(component,
        ['2', '3', U, 'inull', 'inull'],
        ['i3', 3, 2, 'i2', 1, 1, L, R, 'iu']);

    send(component, [_2B]);
    expectDisplay(component,
        ['2', '3', U, 'inull', 'inull'],
        ['i3', 3, 2, 'i2', 1, 1, L, R, 'iu']);

    send(component, [_2B], [_3A]);
    expectDisplay(component,
        ['2', '3', U, 'inull', 'inull'],
        ['i3', 3, 2, 'i2', 1, 1, L, R, 'iu']);

    clickCard(component, 7);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_2B], [_3A], [UA], [_R], []] });
    expectDisplay(component,
        ['2', '3', U, R, 'inull'],
        ['i3', 3, 2, 'i2', 1, 1, L, 'ir', 'iu']);

    clickCard(component, 1);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_2B], [_3A], [UA], [_R], [_3B]] });
    expectDisplay(component,
        ['2', '3', U, R, '3'],
        ['i3', 'i3', 2, 'i2', 1, 1, L, 'ir', 'iu']);

    send(component, [_2B], [_3A], [UA], [_R], [_3B]);
    expectDisplay(component,
        ['2', '3', U, R, '3'],
        ['i3', 'i3', 2, 'i2', 1, 1, L, 'ir', 'iu']);

    component.message({ cmd: 'error', reason: 'Invalid program' });
    expectDisplay(component,
        ['2', '3', U, R, '3'],
        ['i3', 'i3', 2, 'i2', 1, 1, L, 'ir', 'iu']);

    component.unmount();
});

test("Program doesn't match", () => {
    let [component] = mounted(<Programming />, normal);

    clickCard(component, 3);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_2B], [], [], [], []] });
    expectDisplay(component,
        ['2', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 2, 'i2', 1, 1, L, R, U]);

    clickCard(component, 0);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[_2B], [_3A], [], [], []] });
    expectDisplay(component,
        ['2', '3', 'inull', 'inull', 'inull'],
        ['i3', 3, 2, 'i2', 1, 1, L, R, U]);

    send(component, [_3A]);
    expectDisplay(component,
        ['3', 'inull', 'inull', 'inull', 'inull'],
        ['i3', 3, 2, 2, 1, 1, L, R, U]);

    component.message({ cmd: 'error', reason: 'Invalid program' });
    expectDisplay(component,
        ['3', 'inull', 'inull', 'inull', 'inull'],
        ['i3', 3, 2, 2, 1, 1, L, R, U]);

    component.unmount();
});

function send(component) {
    let registers = [];
    for (var i = 1, ii = arguments.length; i < ii; i++) {
        registers.push({ damaged: '', locked: '', program: arguments[i] });
    }
    for (i = arguments.length - 1; i < 5; i++) {
        registers.push({ damaged: '', locked: '', program: [] });
    }
    component.message({ cmd: 'program', registers: registers });
}