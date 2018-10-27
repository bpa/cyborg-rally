
export default class Icon extends React.Component {
    normal() {
        return {
            color: 'black',
            border: 'thin solid black',
        };
    }
    locked() {
        return {
            color: 'white',
            background: 'radial-gradient(red, black)',
            border: 'thin solid black',
        };
    }
    selected() {
        return {
            color: 'white',
            background: 'radial-gradient(yellow, orange)',
            border: 'thin solid black',
        };
    }
    help() {
        return {
            color: 'white',
            background: 'radial-gradient(white, blue)',
            border: 'thin solid black',
        };
    }
    inactive() {
        return {
            color: 'darkGrey',
            background: 'lightGrey',
            border: 'thin solid grey',
        };
    }
    addOn() {
        return {
            color: 'green',
            background: 'white',
            border: 'thin solid green',
        };
    }
    render() {
        var style
            = this.props.help ? this.help()
                : this.props.locked ? this.locked()
                    : this.props.inactive ? this.inactive()
                        : this.props.addOn ? this.addOn()
                            : this.props.selected ? this.selected()
                                : this.normal();
        style.borderRadius = 6;
        style.marginTop = '8px';
        style.marginLeft = '8px';
        if (this.props.card !== undefined) {
            style.height = '40px';
            style.width = '40px';
            return (
                <svg viewBox="0 0 100 100" style={style} onClick={this.props.onClick}>
                    <g fill="currentColor" stroke="currentColor">
                        <use href={"#" + this.props.card.name} />
                    </g>
                </svg>
            );
        }
        let src
            = this.props.src !== undefined ? this.props.src
                : this.props.name !== undefined ? getFile(gs.public.player[gs.id].options[this.props.name])
                    : this.props.option !== undefined ? getFile(this.props.option)
                        : null;

        if (src === null) {
            return null;
        }

        return (
            <span style={style} onClick={this.props.onClick}>
                <img style={{ height: '40px', width: '40px', padding: '4px' }}
                    src={src} />
            </span>
        );
    }
}
