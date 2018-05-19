import Icon from './Icon';

class Option {
  constructor(name) {
    this.name = name;
  }
  render(props, state) {
    if (gs.public.player[gs.id].options[this.name] === undefined) {
      return null;
    }

    if (props.active === this.name) {
      return <Icon name={this.name} key={this.name}
        onClick={props.notify.deactivate.bind(props.notify, this.name)}/>;
    }

    if (!(props.active === undefined && this.active())) {
      return <Icon name={this.name} key={this.name} inactive/>;
    }

    return <Icon name={this.name} key={this.name}
        onClick={props.notify.activate.bind(props.notify, this.name)}/>;
  }
}

class ComboOption extends Option {
  constructor(name, data) {
    super(name);
    this.data = data;
  }

  active() {
    var held = {};

    const cards = gs.private.cards || []
    for (var c of cards) {
      held[c.name] = (held[c.name] || 0) + 1;
    }

    var reg = gs.private.registers;
    for (var r of reg) {
      if (r.damaged || r.program.length == 2
          || (r.program.length == 1 && r.program[0].name > "3")) {
        for (var p of r.program) {
          held[p.name]--;
        }
      }
    }

    for (var m of Object.keys(this)) {
      var required = this[m];
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

class RecompileOption extends Option {
  active() {
    return (gs.state || {}).recompiled !== gs.id;
  }
}

class FiringOption extends Option {
  render(props) {
    if (gs.public.player[gs.id].options[this.name] === undefined) {
      return null;
    }

    if (props.active === this.name) {
      return <Icon name={this.name} key={this.name} selected
        onClick={props.notify.deactivate.bind(props.notify, this.name)}/>;
    }

    return <Icon name={this.name} key={this.name}
        onClick={props.notify.activate.bind(props.notify, this.name)}/>;
  }
}

class LaserOption extends Option {
  render(props) {
    let options = gs.public.player[gs.id].options;
    let o = options['Double Barreled Laser'] || {name: 'laser'};

    if (props.active === 'laser') {
      return <Icon option={o} key={o.name} selected
        onClick={props.notify.deactivate.bind(props.notify, 'laser')}/>;
    }

    return <Icon option={o} key={o.name}
        onClick={props.notify.activate.bind(props.notify, 'laser')}/>;
  }
}

var OptionCards = {
  'Crab Legs':      new ComboOption('Crab Legs', {1: ['r','l']}),
  'Dual Processor': new ComboOption('Dual Processor', {2: ['r','l'], 3: ['r','l','u']}),
  'Recompile':      new RecompileOption('Recompile'),
  'Fire Control':   new FiringOption('Fire Control'),
  'Mini Howitzer':  new FiringOption('Mini Howitzer'),
  'Pressor Beam':   new FiringOption('Pressor Beam'),
  'Radio Control':  new FiringOption('Radio Control'),
  'Scrambler':      new FiringOption('Scrambler'),
  'Tractor Beam':   new FiringOption('Tractor Beam'),
  'laser':          new LaserOption(),
};

export default OptionCards;
