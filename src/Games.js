import React, { Component } from 'react';
import { Box } from 'grommet';

export default class Games extends Component {
    render() {
        if (this.props.games.length) {
            return <Box p={0}>{this.props.games}</Box>;
        }
        return <div style={{ width: "100%", textAlign: 'center' }}>
            <Box color="status-error">No games available</Box>
        </div>
    }
}

