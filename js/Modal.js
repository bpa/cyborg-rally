import { ButtonCircle, Footer, Panel } from 'rebass';
import { Flex, Box } from 'grid-styled';

export default class Modal extends React.Component {
    render() {

    const bg = {
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      padding: 50,
      zIndex: this.props.z || 'auto',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    };

    return (
<div style={bg}>
<Panel bg="white">
  <Panel.Header bg="black" color="white">{this.props.title}</Panel.Header>
  <Box p={2}>
    {this.props.children}
    <ButtonCircle bg="red" w={1} onClick={this.props.close}>
      {this.props.closeText || "Close"}
    </ButtonCircle>
  </Box>
</Panel>
</div>
    )}
}

