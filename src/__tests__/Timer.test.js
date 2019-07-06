import React from 'react';
import { act } from 'react-dom/test-utils';
import { mounted } from '../setupTests';
import Timer from '../Timer';

beforeEach(() => jest.useFakeTimers());

test('timer', () => {
    let [component] = mounted(<Timer />);
    let timer = component.children();
    expect(component.children().name()).toEqual('div');

    let now = new Date().getTime();
    component.message({ cmd: 'timer', start: now, duration: 10000 });
    expect(clearInterval).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledTimes(1);

    // component.update();
    timer = component.children();
    expect(timer.name()).toEqual('Meter');
    let values = timer.prop('values')[0];
    expect(values.value).toBeCloseTo(0, 0);
    expect(values.color).toBe('white');

    now = new Date().getTime() - 6100;
    component.message({ cmd: 'timer', start: now, duration: 9000 });

    expect(clearInterval).toHaveBeenCalledTimes(2);
    expect(setInterval).toHaveBeenCalledTimes(2);
    act(() => jest.runOnlyPendingTimers());
    component.update();

    timer = component.children();
    expect(timer.name()).toEqual('Meter');
    values = timer.prop('values')[0];
    expect(values.value).toBeCloseTo(68, 0);
    expect(values.color).toBe('orange');

    now = new Date().getTime() - 7600;
    component.message({ cmd: 'timer', start: now, duration: 9000 });
    expect(clearInterval).toHaveBeenCalledTimes(3);
    expect(setInterval).toHaveBeenCalledTimes(3);
    act(() => jest.runOnlyPendingTimers());
    component.update();

    timer = component.children();
    expect(timer.name()).toEqual('Meter');
    values = timer.prop('values')[0];
    expect(values.value).toBeCloseTo(84.5, 0);
    expect(values.color).toBe('red');

    component.unmount();
    expect(clearInterval).toHaveBeenCalledTimes(4);
});

test('existing timer', () => {
    let [component] = mounted(<Timer />, {
        public: {
            timer: {
                start: new Date().getTime() - 5000,
                duration: 10000,
            }
        }
    });

    let timer = component.children();
    expect(clearInterval).toHaveBeenCalledTimes(0);
    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(timer.name()).toEqual('Meter');
    let values = timer.prop('values')[0];
    expect(values.value).toBeCloseTo(50, 0);
    expect(values.color).toBe('white');

    component.unmount();
    expect(clearInterval).toHaveBeenCalledTimes(1);
});
