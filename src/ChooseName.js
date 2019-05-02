import { ws } from './Util';
import React, { Component } from 'react';
import { Button, Panel, TextInput } from './UI';

export default class ChooseName extends Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.name = window.localStorage.name || undefined;
    }

    onClick(e) {
        window.localStorage.name = this.name;
        ws.send({ cmd: 'set_name', name: this.name });
        this.props.back();
    }

    render() {
        return (
            <Panel color="accent-1" title="Name Preferences">
                <TextInput label="" placeholder="Name" defaultValue={this.name}
                    onChange={(e) => this.name = e.target.value} />
                <Button color="black" bg="green" onClick={this.onClick}>
                    Save Preferences
                </Button>
                <Button color="black" bg="red" onClick={this.props.back}>
                    Cancel
                </Button>
            </Panel>
        )
    }
}

