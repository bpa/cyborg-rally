import { Button } from './Widgets';
import Card from './Card.js';
import Modal from './Modal.js';
import Option from './Option.js';

export default class FireType extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        if (!this.props.target) {
            return null;
        }
        var held = this.props.player.options;
        var opts = [];
        let btnStyle = {
            textAlign:'center',
            display:'flex',
            justifyContent:'space-between',
            alignItems:'center'
        };
        let optStyle = {height: "30px"};

        for (var w of this.props.weapons) {
            if (held[w]) {
                opts.push(
<Button onClick={this.props.onChoose.bind(null, w)} key={w} style={btnStyle}>
    <Option card={held[w]} style={optStyle}/>
    {w}
</Button>
                );
            }
        }
        
        return (
<Modal title={this.props.target.name} close={this.props.close}>
    <Button onClick={this.props.onChoose.bind(null, 'laser')} key={'laser'} style={btnStyle}>
        <Option card={{name:'Laser', text:'Main laser'}} style={optStyle}/>
        Main Laser
    </Button>
    {opts}
    <Card card={this.state.card} onClose={this.closeCard}/>
</Modal>);
    }
}

