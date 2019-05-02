import React, { Component } from 'react';
import Icon from './Icon';

export default class Register extends Component {
  render() {
    const register = this.props.register;
    if (!register) {
      return <div style={{ width: "16px" }} />;
    }
    const program = this.props.register.program;
    var name = program.reduce((a, b) => a + b.name, '');
    return (
      <Icon
        onClick={this.props.onClick}
        locked={register.locked}
        inactive={this.props.inactive}
        card={{ name: name || 'null' }} />
    )
  }
}
