import { Dot } from 'rebass';
import { Flex, Box } from 'grid-styled';

export function Shutdown() {
    return <div style={{textAlign:'center',fontSize:120}}>ZZZ</div>;
}

export function Registers(props) {
  return (
    <Flex>
      <Dot bg={props.active == 0 ? 'white' : 'grey' }/>
      <Dot bg={props.active == 1 ? 'white' : 'grey' }/>
      <Dot bg={props.active == 2 ? 'white' : 'grey' }/>
      <Dot bg={props.active == 3 ? 'white' : 'grey' }/>
      <Dot bg={props.active == 4 ? 'white' : 'grey' }/>
    </Flex>
  );
}
