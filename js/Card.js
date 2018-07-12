import Modal from './Modal';

export default class Card extends React.Component {
    constructor(props) {
        super(props);
        this.show = this.show.bind(this);
        this.hide = this.hide.bind(this);
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

        return (
<span>
    <img src={getFile(o)}
        style={style} onClick={this.onClick}/>;
    {this.cardModal()}
</span>);
    }
}
