import { Button } from './Widgets';
import Icon from './Icon';
import Modal from './Modal';

const imgStyle = {
  width: '60px',
  height: '60px',
  margin: '5px',
  padding: '4px',
  backgroundColor: 'green',
  borderRadius: 6,
  float: 'left',
};

export default class ConfirmOption extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let option = this.props.option;
    if (option === undefined) {
      return null;
    }
    let src = getFile(gs.public.player[gs.id].options[option.name])

    return (
<Modal
    title={this.props.title || 'Confirm'}
    closeText={this.props.closeText || 'Cancel'}
    close={this.props.onCancel}
  >
  <span style={{color: 'black'}}>
    <img style={imgStyle} src={src} onClick={this.props.onClick}/>
    <div style={{marginTop: '8px'}}>{option.message}</div>
    <p>Are you sure?</p>
  </span>
  <Button onClick={this.props.onConfirm} bg="green">
      Yes
  </Button>
</Modal>
    );
  }
}
