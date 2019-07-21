export var subscriptions = new Map();

export default class Socket {
    send(msg) {
    }

    subscribe(instance, name, callback) {
        let methods = subscriptions.get(name);
        if (!methods) {
            methods = new Map();
            subscriptions.set(name, methods);
        }

        methods.set(instance, callback);
    }

    unsubscribe(instance, name) {
        subscriptions.get(name).delete(instance);
    }
}
