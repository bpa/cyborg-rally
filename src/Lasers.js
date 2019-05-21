import { useMessages, ws } from './Util';
import React from 'react';
import { Box, Button, Content } from './UI';

function laser(n) {
    ws.send({ cmd: 'laser', n: n });
}

function btn(dmg) {
    return (
        <Button style={{ flex: "1 1 auto" }}
            background="red" onClick={laser.bind(null, dmg)}>
            {dmg} laser
        </Button>
    );
}

export default function Lasers(props) {
    useMessages({
        error: (msg) => alert(JSON.stringify(msg))
    });
    return (
        <Content>
            <Button background="green" onClick={laser.bind(null, 0)}>
                No Damage
            </Button>
            <Box direction="row">
                {btn(1)}
                {btn(2)}
                {btn(3)}
                {btn(4)}
            </Box>
        </Content>
    )
}
