import React, { Component } from "react";
import { connect } from "react-redux";
import { BreadCrumbs, Search, Pagination, FormInput, FormWrapper } from "interface/components";
import axios from 'axios'
import Modal from 'react-modal';
import Select from 'react-select'
import queryString from 'query-string'
import XLSX from 'xlsx';
import ReactDOM from 'react-dom';
import moment from 'moment'
import { fetchToastNotify } from "../../../controller/redux/app-reducer";
import { Link } from "react-router-dom";
import { confirmAlert } from 'react-confirm-alert';
import { Other } from 'interface/screens/error'
import { __DEV__, SUPER } from "../../../common/ulti/constants";
import * as CONSTANTS from 'common/ulti/constants';
import * as gspServices from 'controller/services/gspServices'
import * as cmFunction from 'common/ulti/commonFunction'

class ChiTiet extends Component {
  constructor(props) {
    super(props)
    this.state = {
      danhsach: [],
      form: {},

      cbCheckAll: false,
      searchIsOpen: false,
      search: {},
      page: CONSTANTS.DEFAULT_PAGE,
      pagesize: CONSTANTS.DEFAULT_PAGESIZE,
      _size: 0,
      _total_pages: 0,
      filter: null,
      detail: null,
      modalIsOpen: false
    }
  }

  componentDidMount = async () => {
    this._getDanhSachDanhMuc(this._createNhomDanhMuc())
  }

  componentDidUpdate(prevProps) {
    let { location } = this.props
    if (location !== prevProps.location) {
      this._getDanhSachDanhMuc(this._createNhomDanhMuc())
    }
  }

  _createNhomDanhMuc = () => {
    let parsed = queryString.parse(this.props.location.search);
    let { danhmuc } = parsed
    return cmFunction.decode(danhmuc)
  }

  _createFilter = () => {
    let parsed = queryString.parse(this.props.location.search);
    let { page, pagesize, filter } = parsed
    filter = filter ? cmFunction.decode(filter) : filter
    parsed.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
    parsed.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    parsed.count = true
    // parsed.sort_by = "STT"
    !filter ? delete parsed.filter : parsed.filter = filter
    this.state.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
    this.state.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    this.state.filter = filter
    this.forceUpdate()
    return new URLSearchParams(parsed).toString()
  }

  _getDanhSachDanhMuc = async (url) => {
    let data = await gspServices.getDanhMucQuocGia('GET', url)
    this.state.danhsach = data //&& data._embedded ? data._embedded : [];
    this.state._size = data._size || 0
    this.state._total_pages = data._total_pages || 0
    this.state.cbCheckAll = false
    this.forceUpdate()
  }

  // EXPORT EXCEL
  _handleExportExcel = (ref) => {
    // ví dụ xuất excel tại bảng đang có
    let myRows = [['Thông tin danh mục quốc gia']], maxCol = 0
    let table = ReactDOM.findDOMNode(this.refs[ref]);
    for (let tbindex = 0; tbindex < table.children.length; tbindex++) {
      let tb = table.children[tbindex]
      for (let trindex = 0; trindex < tb.children.length; trindex++) {
        let row = []
        let tr = tb.children[trindex]
        maxCol = tr.children.length > maxCol ? tr.children.length : maxCol
        for (let thindex = 0; thindex < tr.children.length; thindex++) {
          let th = tr.children[thindex]
          row.push(th.innerText)
        }
        myRows.push(row)
      }
    }
    // set colspan và rowspan
    let merge = [
      // { s: { r: 0, c: 0 }, e: { r: 0, c: maxCol } },
      // { s: { r: 1, c: 6 }, e: { r: 1, c: 7 } }
    ]
    // xuất file
    let ws = XLSX.utils.aoa_to_sheet(myRows);
    ws["!merges"] = merge;
    let wb = XLSX.utils.book_new();
    //add thêm nhiều Sheet vào đây cũng đc
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    let date = cmFunction.timestamp2DateString(moment().valueOf())
    let name = 'TTdanhmuc_' + this.state.page + '_' + date + '.xlsx'
    XLSX.writeFile(wb, name)
  }

  _handleChangeSearchElement = (evt) => {
    this.state.search[evt.target.id] = evt.target.value
    this.forceUpdate()
  }

  _createFilterSearch = () => {
    let { search } = this.state
    let parsed = queryString.parse(this.props.location.search);
    let { page, pagesize } = parsed
    let filter = {}
    parsed.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
    parsed.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    parsed.count = true
    // parsed.sort_by = "STT"
    if (search.Ten) {
      // filter['Ten'] = cmFunction.regexText(search.Ten.trim())
      filter['$or'] = [
        { 'Ten': cmFunction.regexText(search.Ten.trim()) },
        { 'Ma': cmFunction.regexText(search.Ten.trim()) }
      ]
      parsed.filter = JSON.stringify(filter)
    }
    this.state.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
    this.state.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    this.forceUpdate()
    return new URLSearchParams(parsed).toString()
  }

  _handleKeyDow = (evt) => {
    if (evt.key === 'Enter') {
      this._handleSearch();
      this.forceUpdate()
    }
  }

  _handleSearch = () => {
    this._getDanhSachDanhMuc(this._createNhomDanhMuc())
  }

  _checkItem = (item) => {
    if (item.DonViCha) { return item.DonViCha.Ten }
    if (item.KhoiDonVi) { return item.KhoiDonVi.Ten } else { return " " }
  }

  _setDetail = (data) => {
    this.state.detail = data
    this.forceUpdate()
    this._handleAddToggle()
  }

  _handleAddToggle = () => {
    this.state.modalIsOpen = !this.state.modalIsOpen
    this.forceUpdate()
  }

  render() {
    let { danhsach, cbCheckAll, modalIsOpen, detail } = this.state
    let { page, pagesize, _size, _total_pages, search } = this.state
    let parsed = queryString.parse(this.props.location.search);
    let { danhmuc, ten } = parsed
    let tenDanhMuc = cmFunction.decode(ten)
    try {
      return (
        <React.Fragment>
          <div className="main portlet">
            <BreadCrumbs title={"Danh sách danh mục quốc gia"}
              route={[
                { label: 'Nhóm danh mục quốc gia', value: '/quoc-gia/nhom-danh-muc' },
                { label: tenDanhMuc, value: '' },
              ]} />
            <div className="portlet-title">
              <div className="caption">
                <i className="fas fa-grip-vertical" />{tenDanhMuc}
              </div>
              <div className="action">
                <button onClick={() => this._handleExportExcel('dataTable')} className="btn btn-sm btn-outline-info border-radius" title="Xuất excel">
                  <i className="fas fa-download" />
                </button>
              </div>
            </div>
            {/* <Search isOpen={searchIsOpen} history={this.props.history} /> */}
            {/* <div className="card-body pt-3 pb-3 card-search">
              <div className="form-body">
                <div className="form-row form-group form-custom">
                  <div className="col-md-6">
                    <input className="form-control" onChange={this._handleChangeSearchElement} onKeyDown={this._handleKeyDow}
                      value={search.Ten || ''} type="text" id="Ten" placeholder='Tìm kiếm tên, mã danh mục quốc gia' />
                  </div>
                  <div className="col-md-6">
                    <button onClick={this._handleSearch} className="btn btn-outline-primary border-radius ">
                      <i className="fas fa-search" />Tìm kiếm
                    </button>
                  </div>
                </div>
              </div>
            </div> */}
            <div className="card">
              <div className="card-header">
                <strong>{`Tổng số: ${danhsach.length} bản ghi`}</strong>
              </div>
              <div className="card-body fix-first">
                <div className="table-fix-head">
                  <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                    <thead>
                      <tr>
                        <th>STT</th>
                        {
                          danhsach[0] && Object.keys(danhsach[0]).map(function (key, index) {
                            return (<th key={index}>{key}</th>)
                          })
                        }
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {danhsach && danhsach.map((item, index) => {
                        return <tr key={index} >
                          <td className='text-center'>{index + 1}</td>
                          {
                            item && Object.keys(item).map(function (key, ind) {
                              return (<td key={ind}>{item[key]}</td>)
                            })
                          }
                          <td>
                            <button onClick={() => this._setDetail(item)} className="btn btn-outline-primary border-radius ">
                              <i className="fas fa-eye" />
                            </button>
                          </td>
                        </tr>
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer">
                {/* <Pagination history={this.props.history}
                  page={page} pagesize={pagesize}
                  _size={_size} _total_pages={_total_pages}
                /> */}
              </div>
            </div>
          </div>


          <Modal
            isOpen={modalIsOpen}
            onRequestClose={this._handleAddToggle}
          >
            <div className="card">
              <div className="card-header">
                <label className='caption'>Chi tiết</label>
                <button onClick={this._handleAddToggle} className="pull-right btn btn-sm btn-outline-danger border-radius">
                  <i className="far fa-times-circle"></i>
                </button>
              </div>

              <div className="card-body">
                <div className="form-body">
                  {
                    detail && Object.keys(detail).map(function (key, index) {
                      return (
                        <FormWrapper>
                          <FormInput
                            required={false}
                            disabled={true}
                            readOnly={true}
                            onChange={null}
                            defaultValue={detail[key] || ''}
                            type="text"
                            label={key}
                          />
                        </FormWrapper>
                      )
                    })
                  }
                </div>
              </div>
              <div className="card-footer">
                <button onClick={this._handleAddToggle} className="pull-right btn btn-sm btn-outline-danger border-radius">
                  <i className="far fa-times-circle"></i>Đóng
            </button>
              </div>
            </div>

          </Modal>

        </React.Fragment>
      );
    } catch (e) {
      if (__DEV__) console.log(e)
      return <Other data={e} />
    }
  }
}

const mapStateToProps = state => {
  let { LoginRes, General } = state;
  return { LoginRes, General };
};
export default connect(mapStateToProps)(ChiTiet);
