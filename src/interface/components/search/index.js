import React, { Component } from "react";
import { ToastContainer, toast } from 'react-toastify';
import AsyncSelect from 'react-select/async';

import * as cmFunction from "common/ulti/commonFunction";

class Search extends Component {
  constructor(props) {
    super(props)
    this.state = {
      filter: {},
      danhsach: {}
    }
  }

  componentDidMount() {

  }

  _handleChangeElement = (evt) => {
    this.state.filter[evt.target.id] = evt.target.value
    this.forceUpdate()
  }

  _handleReset = () => {

  }

  _handleSearch = () => {
    console.log(cmFunction.isEmpty(this.state.filter))
    if (!cmFunction.isEmpty(this.state.filter)) {
      this.props.history.push({
        search: `?filter=${cmFunction.encode(JSON.stringify(this.state.filter))}`
      })
    } else {
      this.props.history.push({
        search: ``
      })
    }

  }

  _handleLoadOptions = (inputValue, callback, element) => {
    clearTimeout(this[element.id]);
    this[element.id] = setTimeout(async () => {
      let filter = {}
      filter.page = 1
      filter.pagesize = 1000
      filter.count = true
      filter.filter = element.filter
      filter.filter[element.key] = cmFunction.regexText(inputValue)
      filter.filter = JSON.stringify(filter.filter)
      filter = new URLSearchParams(filter).toString()
      let response = await element.function(filter)
      response = (response && response._embedded ? response._embedded : [])
      let danhsach = cmFunction.convertSelectOptions(response, '_id.$oid', element.key || 'Ten')
      this.state.danhsach[element.id] = danhsach
      this.forceUpdate()
      callback(danhsach);
    }, 500);
  }

  _handleOnInputChange = (inputValue, element) => {
    if (inputValue) {
      this.state.filter[element.id] = inputValue
      this.state[element.id] = { value: 1, label: inputValue }
      // console.log(this.state.danhsach[element.id])
      // this.state.danhsach[element.id] =(this.state.danhsach[element.id]).push({ value: 1, label: inputValue })
    } else {
      delete this.state.filter[element.id]
      this.state[element.id] = null
    }
    this.forceUpdate()
  }

  _handleOnChange = (sel, element) => {
    if (sel) {
      this.state.filter[element.id] = sel.label
      this.state[element.id] = sel
    } else {
      delete this.state.filter[element.id]
      this.state[element.id] = null
    }
    this.forceUpdate()
  }

  _renderSearchElement = () => {
    let { options } = this.props
    return options.map((element, index) => {
      switch (element.type) {
        case 'text':
          return (
            <div key={index} className="col-md-6">
              <div className="form-group form-row form-custom">
                <label className="col-md-3 mb-0">{element.label}</label>
                <input className="col-md-9 form-control" onChange={this._handleChangeElement}
                  value={this.state[element.id] || ''} id={element.id} type="text"
                  placeholder={"Nhập " + element.label} />
              </div>
            </div>
          )
        case 'react-select-db':
          return (
            <div key={index} className="col-md-6">
              <div className="form-group form-row form-custom">
                <label className="col-md-3 mb-0">{element.label}</label>
                <div className="col-md-9 pl-0 pr-0">
                  <AsyncSelect
                    className=""
                    classNamePrefix="form-control"
                    placeholder={element.label + " ..."}
                    loadOptions={(inputValue, callback) => this._handleLoadOptions(inputValue, callback, element)}
                    onInputChange={(inputValue) => this._handleOnInputChange(inputValue, element)}
                    onChange={(sel) => this._handleOnChange(sel, element)}
                    isClearable
                    isSearchable
                    defaultOptions={!!element.defaultOptions}
                  />
                </div>
              </div>
            </div>
          )
        case 'select':

          break
        default:
          return (
            <div key={index} className="col-md-6">
              <div className="form-group form-row form-custom">
                <label className="col-md-3 mb-0">{element.label}</label>
                <input className="col-md-9 form-control" onChange={this._handleChangeElement}
                  value={this.state[element.id] || ''} id={element.id} type={element.type || 'text'}
                  placeholder={"Nhập " + element.label.toLowerCase()} />
              </div>
            </div>
          )
      }


    })
  }

  render() {
    let { isOpen, options } = this.props
    if (!isOpen || cmFunction.isEmpty(options))
      return (
        <div></div>
      )
    return (
      <div className="search card">
        <div className="card-header">
          <span className="caption-subject">Tìm kiếm nâng cao</span>
        </div>
        <div>
          <div className="card-body">
            <div className="form-row">
              {this._renderSearchElement()}
            </div>
          </div>
          <div className="card-footer">
            <div className="d-flex justify-content-end">
              <button onClick={this._handleSearch} className="btn btn-sm btn-outline-primary border-radius ">
                <i className="fas fa-search" />Tìm kiếm
            </button>
              <button onClick={this._handleReset} className="btn btn-sm btn-outline-danger border-radius ">
                <i className="fas fa-sync-alt"></i>Reset
            </button>
            </div>

          </div>
        </div>
      </div>
    );
  }
}

export default Search;
