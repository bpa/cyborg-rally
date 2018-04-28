import { Input, Panel } from 'rebass';
import { Button, Content } from './Widgets';

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
	<Panel.Header color="black" bg="blue">Name Preferences</Panel.Header>
    <Content>
        <Input label="" placeholder="Name" defaultValue={this.name}
            onChange={(e) => this.name = e.target.value}/>
        <Button color="black" bg="green" onClick={this.onClick}>
            Save Preferences
        </Button>
        <Button color="black" bg="red" onClick={this.props.back}>
            Cancel
        </Button>
    </Content>
</Panel>
    )}
}

