import Button from 'rebass/dist/Button';
import Input from 'rebass/dist/Input';
import Panel from 'rebass/dist/Panel';
import PanelHeader from 'rebass/dist/PanelHeader';

export default class ChooseName extends React.Component {
    onClick(e) {
        window.localStorage.name = this.name.value;
        ws.send({cmd:'set_name', name:this.name.value});
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

