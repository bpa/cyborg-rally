import Card from 'rebass/src/Card';
import Register from './Register';
import Vitality from "./Vitality";

export default class Player extends React.Component {
    render() {
        const p = this.props.player;
        return (
            <Card rounded backgroundColor={p.ready?'green':'red'} color="white"
                style={{
                    textAlign:'center',
                    display:'flex',
                    justifyContent:'space-between',
                    alignItems:'center'
                }}
            >
                <Register register={this.props.register}/>
                {p.name}{p.shutdown ? '.zZ' : ''}
                <Vitality player={p}/>
            </Card>
    )}
}
