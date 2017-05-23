import ButtonOutline from 'rebass/dist/ButtonOutline';

export default class Lasers extends React.Component {
    laser(count) {
        ws.send({cmd:'laser', n:count});
    }

    render() { return (
<div>
    <ButtonOutline style={{width:'98%',paddingBottom:'22%'}}
        theme="success" onClick={this.laser.bind(this, 0)}>
        No Damage
    </ButtonOutline>
    <ButtonOutline style={{width:'21%',paddingBottom:'21%'}}
        theme="error" onClick={this.laser.bind(this, 1)}>
        1 laser
    </ButtonOutline>
    <ButtonOutline style={{width:'21%',paddingBottom:'21%'}}
        theme="error" onClick={this.laser.bind(this, 2)}>
        2 laser
    </ButtonOutline>
    <ButtonOutline style={{width:'21%',paddingBottom:'21%'}}
        theme="error" onClick={this.laser.bind(this, 3)}>
        3 laser
    </ButtonOutline>
    <ButtonOutline style={{width:'21%',paddingBottom:'21%'}}
        theme="error" onClick={this.laser.bind(this, 4)}>
        4 laser
    </ButtonOutline>
</div>
    )}
}
