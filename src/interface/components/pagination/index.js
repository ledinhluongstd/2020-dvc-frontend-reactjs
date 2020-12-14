import React, { Component } from "react";
import { ToastContainer, toast } from 'react-toastify';
import queryString from 'query-string'
import * as CONSTANTS from 'common/ulti/constants';
import * as cmFunction from "common/ulti/commonFunction";

class Pagination extends Component {
  constructor(props) {
    super(props)
    this.state = {
      page: 1,
      pagesize: 10
    }
  }

  componentDidMount() {
    let { page, pagesize } = this.props
    this.state.page = page || CONSTANTS.DEFAULT_PAGE
    this.state.pagesize = pagesize || CONSTANTS.DEFAULT_PAGESIZE
    this.forceUpdate()
  }

  componentDidUpdate(prevProps) {
    let { page, pagesize } = this.props
    if (page !== prevProps.page || pagesize !== prevProps.pagesize) {
      this.state.page = page || CONSTANTS.DEFAULT_PAGE
      this.state.pagesize = pagesize || CONSTANTS.DEFAULT_PAGESIZE
      this.forceUpdate()
    }
  }

  _handleChangeElement = (evt) => {
    let { _total_pages, _size } = this.props
    if (Number(evt.target.value) >= _total_pages) return
    this.state[evt.target.id] = evt.target.value
    this.forceUpdate()
  }

  _handleOnKeyDown = (evt) => {
    if (evt.keyCode === 13) {
      this._handleSearch()
    }
  }

  _handleSearch = () => {
    let { page, pagesize } = this.state
    let params = [['page', page], ['pagesize', pagesize]]
    cmFunction.insertMultiParams(params, this.props.history)
  }

  _handleItemPerPage = (value) => {
    this.state.pagesize = value
    this.forceUpdate()
    this._handleSearch()
  }

  _handlePrevious = () => {
    if (this.state.page === 1) return
    this.state.page--
    this.forceUpdate()
    this._handleSearch()
  }

  _handleNext = () => {
    let { _total_pages, _size } = this.props
    if (this.state.page >= _total_pages) return
    this.state.page++
    this.forceUpdate()
    this._handleSearch()
  }

  render() {
    let { page, pagesize } = this.state
    let { _size, _total_pages } = this.props
    let pageSizeIndex = CONSTANTS.PAGINATION_SIZE.findIndex(x => x.value === pagesize)
    return (
      <div className="pagination-custom">
        <div className="dropdown">
          <span>{`Hiển thị`}&nbsp;</span>
          <button className="btn btn-sm btn-outline-primary border-radius dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            {CONSTANTS.PAGINATION_SIZE[`${pageSizeIndex}`].label}
          </button>
          <span>&nbsp;{`dòng / trang`}</span>
          <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
            {CONSTANTS.PAGINATION_SIZE.map((item, index) => {
              return (
                <button key={index} onClick={() => this._handleItemPerPage(item.value)} className="dropdown-item">{item.label}</button>
              )
            })}
          </div>
        </div>
        <nav className="nav-ul" aria-label="navigation">
          <span>{`Trang`}&nbsp;</span>
          <ul className="pagination pagination-sm">
            <li className="page-item"><button onClick={this._handlePrevious} className="page-link">{"<<"}</button></li>
            <li className="page-item"><input type="text" value={page} onKeyDown={this._handleOnKeyDown} onChange={this._handleChangeElement} id="page" className="page-link" /></li>
            <li className="page-item"><button onClick={this._handleNext} className="page-link">{">>"}</button></li>
          </ul>
          <span>&nbsp;{`của ${_total_pages} | Tổng số ${_size} kết quả`}</span>
        </nav>
      </div>
    );
  }
}

export default Pagination;
