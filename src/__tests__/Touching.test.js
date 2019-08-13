import React from 'react';
import { mounted, option } from '../setupTests';
import Touching from '../Touching';
import { ws } from '../Util';
import { Tile } from '../TileSet';
import Watermark from '../Watermark';

const all = ['None', 'Repair', 'Upgrade', 'Flag', 'Fell in pit', 'Off the board'];
const shutdown = ['None', 'Fell in pit', 'Off the board'];

function assertTiles(component, labels, active) {
    let selected = undefined;
    let tiles = component.find(Tile);
    let seen = [];

    tiles.forEach((t, i) => {
        if (t.children().exists()) {
            if (t.children().prop('target') === true) {
                selected = t.prop('id');
            }
            seen.push(t.find('div').text());
        }
    });
    expect(seen).toEqual(labels);
    expect(selected).toEqual(active);
}

test('initial', () => {
    let [component] = mounted(<Touching />);

    assertTiles(component, all, undefined);
    expect(component.find('img')).toHaveLength(0);

    component.unmount();
});

test('select tile', () => {
    let [component] = mounted(<Touching />);

    component.find('td').at(1).simulate('click');
    expect(ws.send).toHaveBeenCalledWith({ cmd: 'touch', tile: 'repair' });

    component.message({ cmd: 'touch', player: 'player1', tile: 'flag' });
    assertTiles(component, all, 'flag');

    component.unmount();
});

test('shutdown', () => {
    let [component] = mounted(<Touching />, { public: { player: { player1: { shutdown: 1 } } } });

    assertTiles(component, shutdown, undefined);
    expect(component.find('img')).toHaveLength(0);

    component.unmount();
});

test('Mechanical Arm', () => {
    let [component] = mounted(<Touching />, option('player1', 'Mechanical Arm', 0));

    expect(component.find(Watermark).text()).toBe('Mechanical Arm');

    component.unmount();
});