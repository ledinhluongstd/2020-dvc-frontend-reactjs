import React, { Component } from "react";
import { gmapServices, getPlaceId } from "../../../controller/services/gmapServices";


class InputSearch extends Component {
  constructor(props) {
    super(props)
    this.state = {
      listSuggestions: [],
      form: '',
      selected: false
    }
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    let { defaultValue } = this.props
    if (defaultValue) {
      this.state.form = defaultValue
      this.state.selected = true
      this.forceUpdate()
    }
    document.addEventListener('mousedown', this.handleClickOutside);

  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
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
    let { onChange, getSuggestions } = this.props
    let { value } = evt.target
    this.state.form = value
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
        this.state.listSuggestions = suggestions
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
    let { onChange, id, keyLabel } = this.props
    this.state.listSuggestions = []
    this.state.form = item[keyLabel]
    this.forceUpdate()
    let evt = { target: { id: id, value: item } }
    onChange(evt)
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      setTimeout(() => {
        this.state.listSuggestions = []
        this.state.selected = false
        this.forceUpdate()
      }, 500)
    }
  }

  render() {
    let { listSuggestions, form, selected } = this.state
    let { className, placeholder, id, defaultValue, keyLabel } = this.props
    let text = selected ? (defaultValue || '') : form
    return (
      <React.Fragment>
        <span className='col pl-0 pr-0'>
          <input ref={this.setWrapperRef}
            className={className}
            type="text"
            onChange={this._handleChangeElement}
            value={text}
            id={id}
            placeholder={placeholder} />
          {!!listSuggestions.length ? <div className='list-gmap-address-suggestions' style={{ width:'max-content'}}>
            {listSuggestions.map((item, index) => {
              return <span className="suggestions-item" key={index} onClick={() => this.suggestionsClick(item)}>
                *&nbsp;{item[keyLabel]}
              </span>
            })}
          </div> : null}
        </span>
      </React.Fragment>
    );
  }
}



export default InputSearch;
