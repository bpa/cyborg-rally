import React from 'react';
import { mounted, option } from '../setupTests';
import Configuring from '../Configuring';
import Waiting from '../Waiting';
import { Panel } from '../UI';

test('no options', () => {
    let [component] = mounted(<Configuring />);

    expect(component.find(Waiting)).toHaveLength(1);

    component.unmount();
});

test('Gyroscopic Stabilizer', () => {
    let [component] = mounted(<Configuring />, option("player1", "Gyroscopic Stabilizer"));

    expect(component.find(Panel)).toHaveLength(1);

    component.unmount();
});