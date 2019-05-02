import { Component } from 'react';
import { ws } from './Util';

export default class RegisteredComponent extends Component {
    componentDidMount() {
        let prototype = Object.getPrototypeOf(this);
        let names = Object.getOwnPropertyNames(prototype);
        for (var prop of names) {
            let property = this[prop];
            if (prop.startsWith("on_") && typeof property === "function") {
                ws.subscribe(this, prop, property.bind(this));
            }
        }
    };

    componentWillUnmount() {
        let prototype = Object.getPrototypeOf(this);
        let names = Object.getOwnPropertyNames(prototype);
        for (var prop of names) {
            let property = this[prop];
            if (prop.startsWith("on_") && typeof property === "function") {
                ws.unsubscribe(this, prop);
            }
        }
    }
}
