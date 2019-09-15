import React from 'react';
import { mounted, option, c, U } from '../setupTests';
import Configuring from '../Configuring';
import Waiting from '../Waiting';
import { Panel, Button, Content } from '../UI';
import { ws } from '../Util';
import Icon from '../Icon';

test('no options', () => {
    let [component] = mounted(<Configuring />);

    expect(component.find(Waiting)).toHaveLength(1);

    component.unmount();
});

test('Gyroscopic Stabilizer', () => {
    let [component] = mounted(<Configuring />, option("player1", "Gyroscopic Stabilizer"));

    expect(component.find(Panel)).toHaveLength(1);

    component.find(Button).at(2).simulate('click');
    expect(ws.send).toHaveBeenNthCalledWith(1, { cmd: 'configure', option: 'Gyroscopic Stabilizer', activate: false });

    component.unmount();
});

test('No Flywheel', () => {
    let [component] = mounted(<Configuring />, option("player1", "Flywheel"), cards(c(U, 20)));

    expect(component.find(Panel)).toHaveLength(1);

    component.find(Button).simulate('click');
    expect(ws.send).toHaveBeenNthCalledWith(1, { cmd: 'configure', option: 'Flywheel' });

    component.unmount();
});

test('Both card options', () => {
    let [component] = mounted(
        <Configuring />,
        option("player1", "Flywheel"),
        option("player1", "Conditional Program"),
        cards(c(U, 20), c(1, 280))
    );

    expect(component.find(Panel)).toHaveLength(2);

    expect(selectedInPanels(component)).toEqual(['#null', '#null']);

    clickCard(component, 0, 0);
    expect(selectedInPanels(component)).toEqual(['#u', '#null']);

    component.find(Button).simulate('click');

    expect(ws.send).toHaveBeenNthCalledWith(1, { cmd: 'configure', option: 'Flywheel', card: c(U, 20) });
    expect(ws.send).toHaveBeenNthCalledWith(2, { cmd: 'configure', option: 'Conditional Program' });

    component.unmount();
});

expect.extend({
    toBee(actual, expected, msg) {
        return {
            message: () => `${msg}: expected ${expected}, but was ${actual}`,
            pass: actual === expected,
        }
    }
});

test('Activate Gyroscope', () => {
    let [component] = mounted(
        <Configuring />,
        option("player1", "Gyroscopic Stabilizer"),
        cards(c(U, 20), c(1, 280))
    );

    let assertTiles = function (which, btn, a, b) {
        expect(component.find(Panel)).toHaveLength(1);
        let tiles = component.find('td');
        expect(tiles).toHaveLength(2);

        if (btn !== undefined) {
            tiles.at(btn).simulate('click');
            component.update();
            tiles = component.find('td');
        }

        expect(tiles.at(0).find(Button).prop('target')).toBee(a, which);
        expect(tiles.at(1).find(Button).prop('target')).toBee(b, which);
    }

    assertTiles(1, undefined, false, true);
    assertTiles(2, 1, false, true);
    assertTiles(3, 0, true, false);
    assertTiles(4, 1, false, true);

    component.unmount();
});

test("Can't duplicate card", () => {
    let [component] = mounted(
        <Configuring />,
        option("player1", "Flywheel"),
        option("player1", "Conditional Program"),
        cards(c(U, 20), c(1, 280))
    );

    expect(selectedInPanels(component)).toEqual(['#null', '#null']);

    clickCard(component, 0, 0);
    expect(selectedInPanels(component)).toEqual(['#u', '#null']);

    clickCard(component, 1, 0);
    expect(selectedInPanels(component)).toEqual(['#null', '#u']);

    clickCard(component, 0, 0);
    expect(selectedInPanels(component)).toEqual(['#u', '#null']);
});

function cards() {
    return { private: { cards: [...arguments] } };
}

function selectedInPanels(component) {
    let panels = component.find(Panel);
    return panels.map(p => p.find(Icon).filter(".selected").find("use").prop("href"));
}

function clickCard(component, panel, i) {
    return component.find(Panel).at(panel).find(Icon).at(i).simulate('click');
}