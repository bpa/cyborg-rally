import { Input, Panel, PanelHeader, WideButton } from './Widgets';

export default class ChooseName extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.name = window.localStorage.name || undefined;
    }

    onClick(e) {
        window.localStorage.name = this.name;
        ws.send({cmd:'set_name', name:this.name});
        this.props.back();
    }

    render() { return (
<Panel>
	<PanelHeader color="black" bg="blue">Name Preferences</PanelHeader>
	<Input label="" placeholder="Name" defaultValue={this.name}
        onChange={(e) => this.name = e.target.value}/>
	<WideButton color="black" bg="green" onClick={this.onClick}>
		Save Preferences
	</WideButton>
	<WideButton color="black" bg="red" onClick={this.props.back}>
		Cancel
	</WideButton>
</Panel>
    )}
}

