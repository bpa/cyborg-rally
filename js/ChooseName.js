import { Box, Input, Panel, PanelHeader, ButtonCircle } from './Widgets';

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
    <Box p={3}>
        <Input label="" placeholder="Name" defaultValue={this.name}
            onChange={(e) => this.name = e.target.value}/>
        <ButtonCircle color="black" bg="green" onClick={this.onClick}>
            Save Preferences
        </ButtonCircle>
        <ButtonCircle color="black" bg="red" onClick={this.props.back}>
            Cancel
        </ButtonCircle>
    </Box>
</Panel>
    )}
}

