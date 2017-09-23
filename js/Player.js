import { Box, Card, Flex } from './Widgets';
import Register from './Register';
import Vitality from "./Vitality";
import Options from "./Options";

export default class Player extends React.Component {
    render() {
        const p = this.props.player;
        return (
            <Card bg={p.ready?'green':'red'} color="white" p={1}
                style={{
                  display:'flex',
                  justifyContent:'space-between',
                  alignItems:'center',
                }}>
              <Register register={this.props.register}/>
              <Options player={p}/>
              <div style={{padding:'4px 0px'}}>{p.name}{p.shutdown ? '.zZ' : ''}</div>
              <Vitality player={p}/>
            </Card>
    )}
}
