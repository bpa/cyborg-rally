function combo_active() {
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

var OptionCards = {
  'Crab Legs': {
    active: combo_active.bind({1: ['r','l']}),
  },
  'Dual Processor': {
    active: combo_active.bind({2: ['r','l'], 3: ['r','l','u']}),
  },
  'Recompile': {
    active: () => true,
  },
};

export default OptionCards;
