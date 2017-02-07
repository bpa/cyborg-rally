import ButtonOutline from 'rebass/src/ButtonOutline';

export default class Touching extends React.Component {
    touch(tile) {
        this.props.ws.send({cmd:'touch', tile:tile});
    }

    render() { return (
<div>
    <ButtonOutline style={{width:'45%',paddingBottom:'30%'}}
        onClick={this.touch.bind(this, 'floor')}>
        Floor
    </ButtonOutline>
    <ButtonOutline style={{width:'45%',paddingBottom:'30%'}}
        onClick={this.touch.bind(this, 'repair')}>
        Repair
    </ButtonOutline>
    <ButtonOutline style={{width:'45%',paddingBottom:'30%'}}
        onClick={this.touch.bind(this, 'upgrade')}>
        Upgrade
    </ButtonOutline>
    <ButtonOutline style={{width:'45%',paddingBottom:'30%'}}
        onClick={this.touch.bind(this, 'flag')}>
        Flag
    </ButtonOutline>
    <ButtonOutline style={{width:'45%',paddingBottom:'30%'}}
        onClick={this.touch.bind(this, 'pit')}>
        Fell in pit
    </ButtonOutline>
    <ButtonOutline style={{width:'45%',paddingBottom:'30%'}}
        onClick={this.touch.bind(this, 'off')}>
        Off the board
    </ButtonOutline>
</div>
    )}
}
