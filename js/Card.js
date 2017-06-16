import Modal from './Modal';

export default class Card extends React.Component {
    constructor(props) {
        super(props);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
        this.re = new RegExp(' ', 'g');
    }

    show() {
        this.setState({showCard: true})
    };

    hide() {
        this.setState({showCard: true})
    };

    cardModal() {
        if (!this.state.showCard) {
            return null;
        }
        let o = this.props.card;
        return (
<Modal title={o.name}>
</Modal>);
    }

    render() {
        let o = this.props.card;
        if (!o) {
            return null;
        }
        let file = o.name.toLowerCase().replace(this.re, "-");
        if (o.uses > 0) {
            file += o.uses;
        }
        return (
<span>
    <img src={"images/"+file+".svg"}
        style={style} onClick={this.onClick}/>;
    {this.cardModal()}
</span>);
    }
}
