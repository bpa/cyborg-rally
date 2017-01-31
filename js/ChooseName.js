import Button from 'rebass/src/Button';
import Input from 'rebass/src/Input';
import Panel from 'rebass/src/Panel';
import PanelHeader from 'rebass/src/PanelHeader';

export default class ChooseName extends React.Component {
    onClick(e) {
        window.localStorage.name = this.name.value;
        this.props.ws.send({cmd:'set_name', name:this.name.value});
        this.props.back();
    }

    input(r) {
        if(r) {
            this.name = r;
            r.value=window.localStorage.name;
        }
    }

    render() { return (
<Panel theme="primary">
	<PanelHeader>Name Preferences</PanelHeader>
	<Input label="" name="name" placeholder="Name"
        baseRef={this.input.bind(this)}/>
	<Button theme="primary" onClick={this.onClick.bind(this)}>
		Save Preferences
	</Button>
	<Button theme="error" onClick={this.props.back}>
		Cancel
	</Button>
</Panel>
    )}
}

