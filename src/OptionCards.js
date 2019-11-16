import React from 'react';
import Icon from './Icon';

class Option {
  constructor(name) {
    this.name = name;
  }

  active() {
    return true;
  }

  render(props, showHelp, openHelp, context) {
    if (context.me.options === undefined || context.me.options[this.name] === undefined) {
      return null;
    }

    if (showHelp) {
      return <Icon name={this.name} key={this.name} className="help"
        onClick={openHelp.bind(null, this.name)} />;
    }

    return this.render_option(props, showHelp, openHelp, context);
  }

  render_option(props, showHelp, openHelp, context) {
    if (props.active === this.name) {
      return <Icon name={this.name} key={this.name} className="selected"
        onClick={() => props.setActive(null)} />;
    }

    if (!this.active(props, showHelp, openHelp, context)) {
      return <Icon name={this.name} key={this.name} className="inactive" />;
    }

    return <Icon name={this.name} key={this.name}
      onClick={() => props.setActive(this.name)} />;
  }
}

class ComboOption extends Option {
  constructor(name, data) {
    super(name);
    this.data = data;
  }

  active(props, showHelp, openHelp, context) {
    var held = {};

    const cards = context.private.cards || []
    for (var c of cards) {
      held[c.name] = (held[c.name] || 0) + 1;
    }

    if (context.private) {
      var reg = context.private.registers;
      for (var r of reg) {
        if (r.locked || r.program.length === 2
          || (r.program.length === 1 && r.program[0].name > "3")) {
          for (var p of r.program) {
            held[p.name]--;
          }
        }
      }
    }

    for (var m of Object.keys(this.data)) {
      var required = this.data[m];
      if (held[m] > 0) {
        for (var turn of required) {
          if (held[turn]) {
            return true;
          }
        }
      }
    }

    return false;
  }
}

class OneTimeOption extends Option {
  constructor(name, flag) {
    super(name);
    this.flag = flag;
  }

  active(props, showHelp, openHelp, context) {
    return !context.me.options[this.name].tapped;
  }
}

class FiringOption extends Option {
  render_option(props, showHelp, openHelp, context) {
    if (context.me.options[this.name] === undefined) {
      return null;
    }

    if (props.active === this.name) {
      return <Icon name={this.name} key={this.name} className="selected"
        onClick={() => props.setActive(null)} />;
    }

    return <Icon name={this.name} key={this.name}
      onClick={() => props.setActive(this.name)} />;
  }
}

class LaserOption extends Option {
  render(props, showHelp, openHelp, context) {
    let options = context.me.options;
    let o = options['Double Barreled Laser'] || { name: 'laser' };

    if (showHelp) {
      return <Icon option={o} key={o.name} help
        onClick={openHelp.bind(null, o.name)} />;
    }

    if (props.active === 'laser') {
      return <Icon option={o} key={o.name} className="selected"
        onClick={() => props.setActive(null)} />;
    }

    return <Icon option={o} key={o.name}
      onClick={() => props.setActive('laser')} />;
  }
}

var OptionCards = {
  'Abort Switch': new OneTimeOption('Abort Switch', 'aborted'),
  'Crab Legs': new ComboOption('Crab Legs', { 1: ['r', 'l'] }),
  'Dual Processor': new ComboOption('Dual Processor', { 2: ['r', 'l'], 3: ['r', 'l', 'u'] }),
  'Recompile': new OneTimeOption('Recompile', 'recompiled'),
  'Rear-Firing Laser': new FiringOption('Rear-Firing Laser'),
  'High-Power Laser': new FiringOption('High-Power Laser'),
  'Fire Control': new FiringOption('Fire Control'),
  'Mini Howitzer': new FiringOption('Mini Howitzer'),
  'Pressor Beam': new FiringOption('Pressor Beam'),
  'Radio Control': new FiringOption('Radio Control'),
  'Ramming Gear': new Option('Ramming Gear'),
  'Scrambler': new FiringOption('Scrambler'),
  'Tractor Beam': new FiringOption('Tractor Beam'),
  'laser': new LaserOption(),
};

export default OptionCards;
