import React from 'react';
import { act } from 'react-dom/test-utils';
import { mounted, message } from '../setupTests';
import Timer from '../Timer';

beforeEach(() => jest.useFakeTimers());

test('timer', () => {
    let [context, component] = mounted(<Timer />);
    let timer = component.children();
    expect(component.children().name()).toEqual('div');

    let now = new Date().getTime();
    message({ cmd: 'timer', start: now, duration: 10000 });
    expect(setInterval).toHaveBeenCalledTimes(1);

    component.update();
    timer = component.children();
    expect(timer.name()).toEqual('Meter');
    let values = timer.prop('values')[0];
    expect(values.value).toBeCloseTo(0, 0);
    expect(values.color).toBe('white');

    now = new Date().getTime() - 6100;
    message({ cmd: 'timer', start: now, duration: 9000 });
    expect(setInterval).toHaveBeenCalledTimes(1);
    act(() => jest.runOnlyPendingTimers());
    component.update();

    timer = component.children();
    expect(timer.name()).toEqual('Meter');
    values = timer.prop('values')[0];
    expect(values.value).toBeCloseTo(68, 0);
    expect(values.color).toBe('orange');

    now = new Date().getTime() - 7600;
    message({ cmd: 'timer', start: now, duration: 9000 });
    expect(setInterval).toHaveBeenCalledTimes(1);
    act(() => jest.runOnlyPendingTimers());
    component.update();

    timer = component.children();
    expect(timer.name()).toEqual('Meter');
    values = timer.prop('values')[0];
    expect(values.value).toBeCloseTo(84.5, 0);
    expect(values.color).toBe('red');

    component.unmount();
});

test('existing timer', () => {
    let [context, component] = mounted(<Timer />, {
        public: {
            timer: {
                start: new Date().getTime() - 5000,
                duration: 10000,
            }
        }
    });

    let timer = component.children();
    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(timer.name()).toEqual('Meter');
    let values = timer.prop('values')[0];
    expect(values.value).toBeCloseTo(50, 0);
    expect(values.color).toBe('white');
});