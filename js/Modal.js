import Button from 'rebass/dist/Button';
import Footer from 'rebass/dist/Footer';
import Panel from 'rebass/dist/Panel';
import PanelHeader from 'rebass/dist/PanelHeader';

export default class Modal extends React.Component {
    render() {

    const bg = {
      position: 'fixed',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      padding: 50
    };

    return (
<div style={bg}>
<Panel theme="primary">
	<PanelHeader>{this.props.title}</PanelHeader>
	{this.props.children}
	<Button theme="error" onClick={this.props.close}>
		Close
	</Button>
</Panel>
</div>
    )}
}

