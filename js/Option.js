import Modal from './Modal';

export default class Option extends React.Component {
    constructor(props) {
        super(props);
        this.re = new RegExp(' ', 'g');
    }

    render() {
        let o = this.props.card;
        let file = o.name.toLowerCase().replace(this.re, "-");
        if (o.uses > 0) {
            file += o.uses;
        }
        return (
            <img src={"images/"+file+".svg"}
                style={this.props.style}
                onClick={this.props.onClick}
            />);
    }
}
