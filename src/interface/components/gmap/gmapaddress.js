import React, { Component } from "react";
import { gmapServices, getSuggestions, getPlaceId } from "../../../controller/services/gmapServices";


class GmapAddress extends Component {
  constructor(props) {
    super(props)
    this.state = {
      listSuggestions: [],
      diachi: '',
      selected: false
    }
  }

  componentDidMount() {
    let { value } = this.props
    if (value && value.DiaChi) {
      this.state.diachi = value.DiaChi
      this.state.selected = true
      this.forceUpdate()
    }
  }

  componentDidUpdate(prevProps) {
    let { value } = this.props
    if (value !== prevProps.value && value && value.DiaChi) {
      this.state.diachi = value.DiaChi
      this.state.selected = true
      this.forceUpdate()
    }
  }

  _handleChangeElement = (evt) => {
    let { onChange } = this.props
    let { value } = evt.target
    this.state.diachi = value
    this.state.selected = false
    this.forceUpdate()
    if (value && value.trim()) {
      clearTimeout(this.state.searchTimeout);
      this.state.searchTimeout = setTimeout(async () => {
        let suggestions = await getSuggestions(value)
        if (!suggestions) {
          this.state.listSuggestions = []
          this.forceUpdate()
          return
        }
        this.state.listSuggestions = suggestions.predictions
        this.forceUpdate()
      }, 500);
    } else {
      clearTimeout(this.state.searchTimeout);
      this.state.searchTimeout = setTimeout(async () => {
        let evt = { target: { id: this.props.id, value: null } }
        onChange(evt)
        this.state.listSuggestions = []
        this.state.selected = true
        this.forceUpdate()
      }, 500);
    }
  }

  suggestionsClick = async (item) => {
    let { onChange, id } = this.props
    this.state.listSuggestions = []
    this.forceUpdate()

    let place = await getPlaceId(item.place_id)

    if (!place) {
      this.state.listSuggestions = []
      this.forceUpdate()
      return
    }

    let { result } = place
    let { formatted_address, geometry } = result
    let { location } = geometry
    let evt = { target: { id: id, value: { location, DiaChi: formatted_address } } }

    onChange(evt)
    // this.state.diachi = formatted_address
    // this.state.selected = true
    // this.forceUpdate()
  }

  render() {
    let { listSuggestions, diachi, selected } = this.state
    let { className, value, placeholder, id } = this.props
    let text = selected ? (value && value.DiaChi ? value.DiaChi : '') : diachi
    return (
      <React.Fragment>
        <span className='col pl-0 pr-0'>
          <input className={className}
            type="text"
            onChange={this._handleChangeElement}
            value={text}
            id={id}
            placeholder={placeholder} />
          {!!listSuggestions.length ? <div className='list-gmap-address-suggestions'>
            {listSuggestions.map((item, index) => {
              return <span className="suggestions-item" key={index} onClick={() => this.suggestionsClick(item)}>
                *&nbsp;{item.description}
              </span>
            })}
          </div> : null}
        </span>
      </React.Fragment>
    );
  }
}



export default GmapAddress;
