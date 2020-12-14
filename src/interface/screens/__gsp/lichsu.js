import React, { Component } from "react";
import { connect } from "react-redux";
import { BreadCrumbs, FormInput, FormWrapper, Search, Pagination } from "interface/components";
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
import * as tbLogApi from 'controller/services/tbLogApiServices'

import * as tbDMDCQG from 'controller/services/tbDMDCQGServices'

import * as cmFunction from 'common/ulti/commonFunction'
import * as Excel from "exceljs";
import { saveAs } from 'file-saver';
import { filter } from "rxjs/operator/filter";

class LichSuDMDCQG extends Component {
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
      searchToggle: false,
      danhsachDanhMuc: [],
      danhmucSelected: null,
      batdau: null,
      ketthuc: null
    }
  }

  componentDidMount = async () => {
    this._getDanhSachLogApi(this._createFilterSearch())
    this._getDanhSachDMDCQG()
  }

  componentDidUpdate(prevProps) {
    let { location } = this.props
    if (location !== prevProps.location) {
      this._getDanhSachLogApi(this._createFilterSearch())
    }
  }

  _createFilter = () => {
    let parsed = queryString.parse(this.props.location.search);
    let { page, pagesize, filter } = parsed
    filter = filter ? cmFunction.decode(filter) : {}
    parsed.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
    parsed.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    parsed.count = true
    filter['request.type'] = "LOG_DMDCQG"
    !filter ? delete parsed.filter : parsed.filter = JSON.stringify(filter)
    this.state.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
    this.state.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    this.state.filter = filter
    this.forceUpdate()
    return new URLSearchParams(parsed).toString()
  }
  _createFilterSearch = () => {
    let { search, danhmucSelected, batdau, ketthuc } = this.state
    let parsed = queryString.parse(this.props.location.search);
    let { page, pagesize } = parsed
    let filter = {}
    let batdauTimeStamp = this._handleConverDateToTimeStamp(batdau)
    let ketthucTimeStamp = this._handleConverDateToTimeStamp(ketthuc)
    // parsed.sort_by = "STT"
    if (search.Ten) {
      if (!danhmucSelected) {
        filter['request.type'] = "LOG_DMDCQG"
        filter['$or'] = [
          { 'request.body.CategoryName': cmFunction.regexText(search.Ten.trim()) },
          { 'user.account': cmFunction.regexText(search.Ten.trim()) },
          { 'user.ip': cmFunction.regexText(search.Ten.trim()) }
        ]

      }
      else {
        filter = { 'request.type': "LOG_DMDCQG", "request.body.CategoryCode": danhmucSelected.CategoryCode }
        filter['$or'] = [
          { 'request.body.CategoryName': cmFunction.regexText(search.Ten.trim()) },
          { 'user.account': cmFunction.regexText(search.Ten.trim()) },
          { 'user.ip': cmFunction.regexText(search.Ten.trim()) },
        ]
      }
      // filter['Ten'] = cmFunction.regexText(search.Ten.trim())
    }
    else {
      if (danhmucSelected) { filter = { 'request.type': "LOG_DMDCQG", "request.body.CategoryCode": danhmucSelected.CategoryCode } }
      else {
        filter['request.type'] = "LOG_DMDCQG"
      }
    }
    if (batdauTimeStamp && ketthucTimeStamp) {
      filter['$and'] = [
        { "request.timestamp": { $gte: batdauTimeStamp } },
        { "request.timestamp": { $lte: ketthucTimeStamp } }]
    }
    else if (batdauTimeStamp && !ketthucTimeStamp) {
      filter["request.timestamp"] = { $gte: batdauTimeStamp }
    }
    else if (!batdauTimeStamp && ketthucTimeStamp) {
      filter["request.timestamp"] = { $lte: ketthucTimeStamp }
    }
    parsed.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
    parsed.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    parsed.count = true
    parsed.filter = JSON.stringify(filter)
    this.state.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
    this.state.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    this.forceUpdate()
    return new URLSearchParams(parsed).toString()
  }
  _getDanhSachLogApi = async (query) => {
    let data = await tbLogApi.getAll(query)
    this.state.danhsach = data && data._embedded ? data._embedded : [];
    this.state._size = data._size || 0
    this.state._total_pages = data._total_pages || 0
    this.state.cbCheckAll = false
    this.forceUpdate()
  }
  _getDanhSachDMDCQG = async () => {
    let parsed = queryString.parse(this.props.location.search);
    parsed.page = 1
    parsed.pagesize = 1000
    parsed.count = true
    parsed.keys = JSON.stringify({ BanGhi: 0 })
    let query = new URLSearchParams(parsed).toString()
    let data = await tbDMDCQG.getAll(query)
    data = data && data._embedded ? data._embedded : [];
    this.state.danhsachDanhMuc = cmFunction.convertSelectOptions(data, '_id.$oid', 'CategoryName')
    this.forceUpdate()
  }
  _handleConfirmDelete = (multi, id) => {
    confirmAlert({
      title: 'Xóa dữ liệu',
      message: 'Bạn muốn xóa dữ liệu',
      buttons: [
        {
          label: 'Không',
          onClick: () => { return }
        },
        {
          label: 'Có',
          onClick: () => multi ? this._handleDeleteMulti() : this._handleDeleteOne(id)
        }
      ]
    });
  }

  _handleDeleteMulti = async () => {

    let { danhsach } = this.state, axiosReq = [], count = 0
    danhsach.forEach((item, index) => {
      if (item.checked)
        axiosReq.push(tbLogApi.deleteById(item._id.$oid || item._id))
    });

    if (!axiosReq.length) return

    let axiosRes = await axios.all(axiosReq).then(axios.spread((...responses) => {
      return responses
    })).catch(errors => {
      if (__DEV__) console.log(errors)
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Có lỗi' }))
    })

    axiosRes.forEach((item, index) => { if (item) count++ });

    this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: "Xóa thành công " + count + " dữ liệu" }))
    this._getDanhSachLogApi(this._createFilter())
  }

  _handleLockMulti = async () => {
    let { danhsach } = this.state, axiosReq = [], count = 0
    danhsach.forEach((item, index) => {
      if (item.checked)
        axiosReq.push(tbLogApi.lockById(item._id.$oid || item._id))
    });

    if (!axiosReq.length) return

    let axiosRes = await axios.all(axiosReq).then(axios.spread((...responses) => {
      return responses
    })).catch(errors => {
      if (__DEV__) console.log(errors)
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Có lỗi' }))
    })

    axiosRes.forEach((item, index) => { if (item) count++ });

    this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: "Khóa thành công " + count + " dữ liệu" }))
    this._getDanhSachLogApi(this._createFilter())
  }

  _handleDeleteOne = async (id) => {
    let axiosRes = await tbLogApi.deleteById(id)
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: "Xóa thành công" }))
      this._getDanhSachLogApi(this._createFilter())
    }
  }

  _handleCheckAll = (evt) => {
    this.state.danhsach.forEach((item, index) => {
      item.checked = evt.target.checked
    });
    this.state.cbCheckAll = evt.target.checked
    this.forceUpdate()
  }

  _handleConverDateToTimeStamp = (dateToConvert) => {
    let date = new Date(dateToConvert)
    return date.getTime()
  }
  _handleCheckItem = (evt) => {
    this.state.danhsach.forEach((item, index) => {
      if (item._id.$oid === evt.target.id || item._id === evt.target.id)
        item.checked = evt.target.checked
    });
    this.forceUpdate()
  }
  _handleExportExcel = (ref) => {
    // ví dụ xuất excel tại bảng đang có
    let myRows = [], maxCol = 0
    let table = ReactDOM.findDOMNode(this.refs[ref]);
    for (let tbindex = 0; tbindex < table.children.length; tbindex++) {
      let tb = table.children[tbindex]
      for (let trindex = 0; trindex < tb.children.length; trindex++) {
        let row = []
        let tr = tb.children[trindex]
        maxCol = tr.children.length > maxCol ? tr.children.length : maxCol
        for (let thindex = 0; thindex < tr.children.length - 1; thindex++) {
          let th = tr.children[thindex]
          row.push(th.innerText)
        }
        myRows.push(row)
      }
    }
    let date = cmFunction.timestamp2DateString(moment().valueOf())
    let name = 'LSImportDLQG_' + this.state.page + '_' + date
    const wb = new Excel.Workbook()
    const ws = wb.addWorksheet('LSImportDLQG')
    ws.addRows(myRows)
    ws.getRow(1).font = { name: 'Times New Roman', family: 2, size: 10, bold: true };
    for (let i = 0; i < myRows[1].length; i++) {
      ws.getCell(String.fromCharCode(65 + i) + 1).alignment = { vertical: 'top', horizontal: 'center' };
    }
    for (let i = 0; i < myRows.length; i++) {
      for (let j = 0; j < myRows[1].length; j++) {
        ws.getCell(String.fromCharCode(65 + j) + (i + 1)).border = {
          top: { style: 'thin', color: { argb: '00000000' } },
          left: { style: 'thin', color: { argb: '00000000' } },
          bottom: { style: 'thin', color: { argb: '00000000' } },
          right: { style: 'thin', color: { argb: '00000000' } }
        }
      }
    }
    wb.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' })
      saveAs(blob, name + ".xlsx")
    })
  }
  _handleChangeSearchElement = (evt) => {
    this.state.search[evt.target.id] = evt.target.value
    this.forceUpdate()
  }
  _handleDanhMucChange = (sel) => {
    this.state.danhmucSelected = sel
    this.forceUpdate()
  }

  _handleChangeElement = (evt) => {
    if (evt.target.id == "batdau") {
      this.state.batdau = evt.target.value
    }
    if (evt.target.id == "ketthuc") {
      this.state.ketthuc = evt.target.value
    }
    this.forceUpdate()
  }
  _handleKeyDow = (evt) => {
    if (evt.key === 'Enter') {
      this._handleSearch();
      this.forceUpdate()
    }
  }

  _handleSearch = () => {
    this._getDanhSachLogApi(this._createFilterSearch())
  }

  _checkItem = (item) => {
    if (item.DonViCha) { return item.DonViCha.Ten }
    if (item.KhoiDonVi) { return item.KhoiDonVi.Ten } else { return " " }
  }

  _searchToggle = () => {
    this.state.searchToggle = !this.state.searchToggle
    this.forceUpdate()
  }
  render() {
    let { danhsach, cbCheckAll, searchToggle, danhsachDanhMuc, danhmucSelected } = this.state
    let { page, pagesize, _size, _total_pages, search } = this.state
    let { LoginRes } = this.props
    let checkSuperAdmin = LoginRes.roles === SUPER.roles
    try {
      return (
        <React.Fragment>
          <div className="main portlet">
            <BreadCrumbs title={"Danh sách đơn vị"} route={[{ label: 'Quản lý lịch sử import dữ liệu quốc gia', value: '/quoc-gia/lich-su' }]} />
            <div className="portlet-title">
              <div className="caption">
                <i className="fas fa-grip-vertical" />Lịch sử import dữ liệu quốc gia
              </div>
              <div className="action">
                {/* <button onClick={this._handleSearchToggle} className="btn btn-sm btn-outline-info border-radius" title="Tìm kiếm">
                  <i className="fas fa-search" />
                </button> */}
                <button onClick={() => this._handleExportExcel('dataTable')} className="btn btn-sm btn-outline-info border-radius" title="Xuất excel">
                  <i className="fas fa-download" />
                </button>
                <button onClick={this._searchToggle} className="btn btn-sm btn-outline-info border-radius pull-right" title="Tìm kiếm">
                  <i className="fas fa-search" />
                </button>
              </div>
            </div>
            {/* <Search isOpen={searchIsOpen} history={this.props.history} /> */}
            {searchToggle && <div className="card-body pt-3 pb-3 card-search">
              <div className="form-body">
                <div className="form-row form-group form-custom">
                  <div className="col-md-5" style={{ paddingTop: "10px" }}>
                    <Select
                      className=""
                      classNamePrefix="form-control"
                      placeholder="Danh mục..."
                      options={danhsachDanhMuc}
                      value={danhmucSelected}
                      isSearchable={true}
                      isClearable={true}
                      onChange={this._handleDanhMucChange}
                    />
                  </div>
                  <div className="col-md-5" style={{ paddingTop: "10px" }}>
                    <input className="form-control" onChange={this._handleChangeSearchElement} onKeyDown={this._handleKeyDow}
                      value={search.Ten || ''} type="text" id="Ten" placeholder='Tìm kiếm theo tên danh mục,  tài khoản, ip' />
                  </div>
                  <div className="col-md-2" style={{ paddingTop: "10px" }}>
                    <button onClick={this._handleSearch} className="btn btn-outline-primary border-radius ">
                      <i className="fas fa-search" />Tìm kiếm
                    </button>
                  </div>
                </div>
                <div className="form-row form-group form-custom">
                  <div className="col-md-2" style={{ textAlign: "left" }}>
                    <label htmlFor="ketthuc" style={{ paddingLeft: "10px", paddingTop: "8px" }}>
                      Thời gian bắt đầu
                    </label>
                  </div>
                  <div className="col-md-3">
                    <input className="form-control"
                      onChange={this._handleChangeElement}
                      type="date"
                      id="batdau"
                    />
                  </div>
                  <div className="col-md-2" style={{ textAlign: "left" }}>
                    <label htmlFor="ketthuc" style={{ paddingLeft: "10px", paddingTop: "8px" }}>
                      Thời gian kết thúc
                    </label>
                  </div>
                  <div className="col-md-3">
                    <input className="form-control"
                      onChange={this._handleChangeElement}
                      type="date"
                      id="ketthuc"
                    />
                  </div>
                  <div className="col-md-2">

                  </div>
                </div>

              </div>
            </div>}
            <div className="card">
              <div className="card-header">
                {/* <Link to={'/quoc-gia/lich-su/0'} className="btn btn-sm btn-outline-primary border-radius">
                  <i className="fas fa-plus" />Thêm
                      </Link>
                <button onClick={() => this._handleConfirmDelete(true, 0)} className="btn btn-sm btn-outline-danger border-radius">
                  <i className="fas fa-trash" />Xóa
                </button> */}
              </div>
              <div className="card-body fix-first">
                <div className="table-fix-head">
                  <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Tên danh mục</th>
                        <th>Thời gian</th>
                        <th>Tài khoản</th>
                        <th>Hành động</th>
                        <th>IP</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {danhsach.map((item, index) => {
                        return <tr key={index} >
                          <td className='text-center'>{index + 1}</td>
                          <td>{item.request.body.CategoryName}</td>
                          <td>{cmFunction.timestamp2DateString(item.request.timestamp.$numberLong, 'DD/MM/YYYY HH:mm:ss')}</td>
                          <td>{item.user.account}</td>
                          <td>{item.request.method}</td>
                          <td>{item.user.ip}</td>
                          <td>
                            <Link to={'/quoc-gia/lich-su/' + item._id.$oid || item._id} title="Chi tiết" className="btn btn-sm btn-outline-info border-radius"><i className="fas fa-eye"></i></Link>
                          </td>
                        </tr>
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer">
                <Pagination history={this.props.history}
                  page={page} pagesize={pagesize}
                  _size={_size} _total_pages={_total_pages}
                />
              </div>
            </div>
          </div>
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
export default connect(mapStateToProps)(LichSuDMDCQG);
