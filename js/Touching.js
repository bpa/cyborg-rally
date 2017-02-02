import ButtonOutline from 'rebass/src/ButtonOutline';

export default class Touching extends React.Component {
    touch(tile) {
        this.props.ws.send({cmd:'touch', tile:tile});
    }

    render() { return (
<div>
    <ButtonOutline style={{width:'45%',paddingBottom:'50%',float:'left'}}
        onClick={this.touch.bind(this, 'floor')}>
        Floor
    </ButtonOutline>
    <ButtonOutline style={{width:'45%',paddingBottom:'50%',float:'left'}}
        onClick={this.touch.bind(this, 'repair')}>
        Repair
    </ButtonOutline>
    <ButtonOutline style={{width:'45%',paddingBottom:'50%',float:'left'}}
        onClick={this.touch.bind(this, 'upgrade')}>
        Upgrade
    </ButtonOutline>
    <ButtonOutline style={{width:'45%',paddingBottom:'50%',float:'left'}}
        onClick={this.touch.bind(this, 'flag')}>
        Flag
    </ButtonOutline>
</div>
    )}
}
