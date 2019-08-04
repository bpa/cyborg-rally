import React from 'react';
import { act } from 'react-dom/test-utils';
import { mounted, r, c, U, R, L, option } from '../setupTests';
import { ws } from '../Util';
import Programming from '../Programming';
import { Panel } from '../UI';
import Icon from '../Icon';

let normal = {
    private: {
        cards: [
            c(U, 10), c(1, 100), c(1, 105),
            c(R, 20), c(2, 200), c(2, 205),
            c(L, 30), c(3, 300), c(3, 305),
        ],
        registers: [r(), r(), r(), r(), r()],
    }
};

let uturns = {
    private: {
        cards: [
            c(U, 10), c(1, 100), c(1, 105),
            c(U, 20), c(2, 200), c(2, 205),
            c(U, 30), c(3, 300), c(3, 305),
        ],
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
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [['2'], [], [], [], []] });
    expectDisplay(component,
        ['2', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 'i2', 2, 1, 1, L, R, U]);

    clickRegister(component, 0);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[], [], [], [], []] });
    expectDisplay(component,
        ['inull', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 2, 2, 1, 1, L, R, U]);

    clickCard(component, 6);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[L], [], [], [], []] });
    clickCard(component, 7);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[L], [R], [], [], []] });
    expectDisplay(component,
        [L, R, 'inull', 'inull', 'inull'],
        [3, 3, 2, 2, 1, 1, 'il', 'ir', U]);

    act(() => {
        context.private.registers = [
            { name: 'l', program: [c(L, 30)] },
            { name: 'r', program: [c(R, 20)] },
            { name: 'u', program: [c(U, 10)] },
            { name: '1', program: [c(1, 100)] },
            { name: '2', program: [c(2, 200)] },
        ]
    });
    component.update();
    expectDisplay(component,
        [L, R, U, 1, 2],
        [3, 3, 2, 'i2', 1, 'i1', 'il', 'ir', 'iu']);

    clickRegister(component, 2);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[L], [R], [], ['1'], ['2']] });

    expectDisplay(component,
        [L, R, 'inull', 1, 2],
        [3, 3, 2, 'i2', 1, 'i1', 'il', 'ir', U]);

    clickCard(component, 0);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[L], [R], ['3'], ['1'], ['2']] });
    expectDisplay(component,
        [L, R, 3, 1, 2],
        ['i3', 3, 2, 'i2', 1, 'i1', 'il', 'ir', U]);

    clickCard(component, 1);
    expect(ws.send).not.toHaveBeenCalled();
    expectDisplay(component,
        [L, R, 3, 1, 2],
        ['i3', 3, 2, 'i2', 1, 'i1', 'il', 'ir', U]);

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
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [['2'], [], [], [], []] })
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
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [['3'], [], [], [], []] })
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
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [['2'], [], [], [], []] })
    expectDisplay(component,
        ['sDual Processor'],
        ['a2', 'inull', 'inull', 'inull', 'inull'],
        ['i3', 'i3', 'i2', 'i2', 'i1', 'i1', L, R, 'iu']);

    clickCard(component, 6);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [['2', 'l'], [], [], [], []] })
    expectDisplay(component,
        ['Dual Processor'],
        ['2l', 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 'i2', 2, 1, 1, 'il', R, U]);

    component.unmount();
});

test('Dual Processor first card already programmed', () => {
    let [component] = mounted(<Programming />, normal, option('player1', 'Dual Processor'));

    clickCard(component, 2);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [['2'], [], [], [], []] })
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
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [['2', 'r'], [], [], [], []] })
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
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [['3'], [], [], [], []] })
    expectDisplay(component,
        ['sDual Processor'],
        ['a3', 'inull', 'inull', 'inull', 'inull'],
        ['i3', 'i3', 'i2', 'i2', 'i1', 'i1', U, U, U]);

    clickCard(component, 6);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [['3', 'u'], [], [], [], []] })
    expectDisplay(component,
        ['Dual Processor'],
        ['3u', 'inull', 'inull', 'inull', 'inull'],
        ['i3', 3, 2, 2, 1, 1, 'iu', U, U]);

    component.unmount();
});

test('Dual Processor no combo available', () => {
    let [component] = mounted(<Programming />, uturns, option('player1', 'Dual Processor'));
    component.message({ cmd: 'program', registers: [r(c(U, 10)), r(c(U, 20)), r(c(U, 30)), r(), r()] });

    expectDisplay(component,
        ['iDual Processor'],
        [U, U, U, 'inull', 'inull'],
        [3, 3, 2, 2, 1, 1, 'iu', 'iu', 'iu']);

    component.unmount();
});

test('Dual Processor use available combo', () => {
    let [component] = mounted(<Programming />, normal, option('player1', 'Dual Processor'));

    clickCard(component, 6);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[L], [], [], [], []] })
    expectDisplay(component,
        ['Dual Processor'],
        [L, 'inull', 'inull', 'inull', 'inull'],
        [3, 3, 2, 2, 1, 1, 'il', R, U]);

    clickCard(component, 7);
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'program', registers: [[L], [R], [], [], []] })
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

test.todo("Error resets registers");
test.todo("Programming with slow responses");
test.todo("Recompile");