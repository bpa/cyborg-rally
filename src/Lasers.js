import { ws } from './Util';
import React, { Component } from 'react';
import { Button } from './UI';

export default class Lasers extends Component {
    laser(count) {
        ws.send({ cmd: 'laser', n: count });
    }

    btn(dmg) {
        return (
            <Button py={4} style={{ flex: "1 1 100px" }} key={dmg}
                color="red" onClick={this.laser.bind(this, dmg)}>
                {dmg} laser
      </Button>);
    }

    render() {
        return (
            <div>
                <Button width={1} p={3} style={{ marginBottom: '12px' }}
                    color="green" onClick={this.laser.bind(this, 0)}>
                    No Damage
    </Button>
                <div style={{ display: 'flex', marginBottom: '12px' }}>
                    {this.btn(1)}
                    {this.btn(2)}
                    {this.btn(3)}
                    {this.btn(4)}
                </div>
            </div>
        )
    }
}
