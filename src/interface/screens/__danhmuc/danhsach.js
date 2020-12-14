import React, { Component } from "react";
import { connect } from "react-redux";
import { BreadCrumbs, Search, FormWrapper, Pagination, FormInput } from "interface/components";
import axios from 'axios'
import Modal from 'react-modal';
import Select from 'react-select'
import queryString from 'query-string'
import XLSX from 'xlsx';
import ReactDOM from 'react-dom';
import moment from 'moment'
import { fetchToastNotify, fetchWait } from "../../../controller/redux/app-reducer";
import { Link } from "react-router-dom";
import { confirmAlert } from 'react-confirm-alert';
import { Other } from 'interface/screens/error'
import { __DEV__, SUPER } from "../../../common/ulti/constants";
import * as CONSTANTS from 'common/ulti/constants';
import * as tbDanhMuc from 'controller/services/tbDanhMucServices'
import * as tbLinhVuc from 'controller/services/tbLinhVucServices'
import * as tbDonVi from 'controller/services/tbDonViServices'

import * as cmFunction from 'common/ulti/commonFunction'
import * as Excel from "exceljs";
import { saveAs } from 'file-saver';

class DanhSach extends Component {
  constructor(props) {
    super(props)
    this.state = {
      danhsach: [],
      form: {},
      cbCheckAll: false,
      page: CONSTANTS.DEFAULT_PAGE,
      pagesize: CONSTANTS.DEFAULT_PAGESIZE,
      _size: 0,
      _total_pages: 0,
      filter: null,
      search: {},
      error: false,
      modalIsOpen: false,
      luachon: [false, false, false, false, false, false, false, false, false, false, false, false],
      nhomdanhmuc: [],
      danhmuc: [],
      value: '',
      dsdanhmuc: [],
      searchToggle: false,
      linhvucSelected: null,
      donviSelected: null,
      linhvuc: [],
      donvi: [],

    }
  }

  componentDidMount = async () => {
    this._getDanhSachDanhMuc(this._createFilterSearch())
    this._handleLoadOptionsLinhVuc()
    this._handleLoadOptionsDonVi()
  }
  componentDidUpdate(prevProps) {
    let { location } = this.props
    if (location !== prevProps.location) {
      this._getDanhSachDanhMuc(this._createFilterSearch())
    }
  }

  // Load

  _handleChangeSearchElement = (evt) => {
    this.state.search[evt.target.id] = evt.target.value
    this.forceUpdate()

  }

  _handleLoadOptionsLinhVuc = async () => {
    let filter = {}
    filter.page = 1
    filter.pagesize = 1000
    filter.count = true
    filter.filter = JSON.stringify({ KichHoat: true });
    filter = new URLSearchParams(filter).toString()
    let dsLinhVuc = await tbLinhVuc.getAll(filter)
    dsLinhVuc = (dsLinhVuc && dsLinhVuc._embedded ? dsLinhVuc._embedded : [])
    let linhvuc = cmFunction.convertSelectOptions(dsLinhVuc, '_id.$oid', 'Ten')
    this.state.linhvuc = linhvuc
    this.forceUpdate()

  };
  _handleLoadOptionsDonVi = async () => {
    let filter = {}
    filter.page = 1
    filter.pagesize = 1000
    filter.count = true
    filter.filter = JSON.stringify({ KichHoat: true });
    filter = new URLSearchParams(filter).toString()
    let dsDonVi = await tbDonVi.getAll(filter)
    dsDonVi = (dsDonVi && dsDonVi._embedded ? dsDonVi._embedded : [])
    let donvi = cmFunction.convertSelectOptions(dsDonVi, '_id.$oid', 'Ten')
    this.state.donvi = donvi
    this.forceUpdate()

  };


  _handleCheckAll = (evt) => {
    this.state.danhsach.forEach((item, index) => {
      item.checked = evt.target.checked
    });
    this.state.cbCheckAll = evt.target.checked
    this.forceUpdate()
  }
  _handleCheckItem = (evt) => {
    this.state.danhsach.forEach((item, index) => {
      if (item._id.$oid === evt.target.id || item._id === evt.target.id)
        item.checked = evt.target.checked
    });
    this.forceUpdate()
  }
  _checkRole = (LoginRes) => {
    let check = LoginRes.roles.Ma
    let flag = false
    check = check.map((item, index) => {
      if (item === "QUAN_LY_DANH_MUC" || item === 'QUAN_TRI_HE_THONG') {
        flag = true
      }
    })
    return flag
  }
  _checkRoleThuTruong = (LoginRes) => {
    let check = LoginRes.roles.Ma
    let flag = false
    check = check.map((item, index) => {
      if (item === "THU_TRUONG_DON_VI") {
        flag = true
      }
    })
    return flag
  }
  _handleChangeCheckBox = (index) => {
    let check = this.state.luachon[index]
    check = !check
    this.state.luachon[index] = check
    if (index == 11) {
      for (let i = 0; i < 11; i++) {
        this.state.luachon[i] = check
      }
    }

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
  _handleConfirmApproveDanhMuc = (id) => {
    confirmAlert({
      title: 'Yêu cầu phê duyệt danh mục',
      message: 'Bạn muốn yêu cầu phê duyệt danh mục này',
      buttons: [
        {
          label: 'Không',
          onClick: () => { return }
        },
        {
          label: 'Có',
          onClick: () => this._handleApproveDanhMuc(id)
        }
      ]
    });
  }
  _handleConfirmApprove = (id) => {
    confirmAlert({
      title: 'Phê duyệt danh mục',
      message: 'Bạn muốn phê duyệt danh mục này',
      buttons: [
        {
          label: 'Không',
          onClick: () => { return }
        },
        {
          label: 'Có',
          onClick: () => this._handleApprove(id)
        }
      ]
    });
  }
  _handleConfirmUnapprove = (id) => {
    confirmAlert({
      title: 'Bỏ phê duyệt danh mục',
      message: 'Bạn muốn hủy phê duyệt danh mục này',
      buttons: [
        {
          label: 'Không',
          onClick: () => { return }
        },
        {
          label: 'Có',
          onClick: () => this._handleUnapprove(id)
        }
      ]
    });
  }
  _handleLinhVucChange = (sel) => {
    let linhvuc = cmFunction.clone(sel)
    this.state.linhvucSelected = linhvuc
    this.forceUpdate()
  }
  _handleDonViChange = (sel) => {
    let donvi = cmFunction.clone(sel)
    this.state.donviSelected = donvi
    this.forceUpdate()
  }
  // Get
  _getDanhSachDanhMuc = async (query) => {
    let data = await tbDanhMuc.getAll(query)
    this.state.danhsach = data && data._embedded ? data._embedded : [];
    this.state._size = data._size || 0
    this.state._total_pages = data._total_pages || 0
    this.state.cbCheckAll = false
    this.forceUpdate()
  }

  // Action
  _searchToggle = () => {
    this.state.searchToggle = !this.state.searchToggle
    this.forceUpdate()
  }
  _createFilter = () => {
    let parsed = queryString.parse(this.props.location.search);
    let { page, pagesize, filter } = parsed
    filter = filter ? cmFunction.decode(filter) : filter
    parsed.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
    parsed.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    parsed.count = true
    !filter ? delete parsed.filter : parsed.filter = filter
    this.state.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
    this.state.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    this.state.filter = filter
    this.forceUpdate()
    return new URLSearchParams(parsed).toString()
  }
  _createFilterSearch = () => {
    let { search,donviSelected,linhvucSelected } = this.state
    let parsed = queryString.parse(this.props.location.search);
    let { page, pagesize } = parsed
    let filter = {}
    // if (search.Ten) filter['NguoiDung.name'] = cmFunction.regexText(search.Ten.trim())
    if (search.Ten||donviSelected||linhvucSelected) {
      if (search.Ten) filter['$or'] = [
        { 'Ten': cmFunction.regexText(search.Ten.trim()) },
        { 'Ma': cmFunction.regexText(search.Ten.trim()) },
        // { 'DonViCha.Ten': cmFunction.regexText(search.Ten.trim()) },
        // { 'NhomDanhMuc.Ten': cmFunction.regexText(search.Ten.trim()) },
        // { 'LinhVuc.Ten': cmFunction.regexText(search.Ten.trim()) },
      ]
      if(linhvucSelected) filter['LinhVuc.Ten'] = linhvucSelected.Ten
      if(donviSelected) filter['DonViCha.Ten'] = donviSelected.Ten
      parsed.filter = JSON.stringify(filter)
    }
    parsed.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
    parsed.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    parsed.count = true
    this.state.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
    this.state.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    this.forceUpdate()
    return new URLSearchParams(parsed).toString()
  }
  _handleDeleteMulti = async () => {
    let { LoginRes } = this.props
    let { danhsach } = this.state, axiosReq = [], count = 0

    danhsach.forEach((item, index) => {
      if (item.checked && LoginRes._id !== (item._id.$oid || item._id)) {
        axiosReq.push(tbDanhMuc.deleteById(item._id.$oid || item._id))
      }
      if (item.checked && LoginRes._id === (item._id.$oid || item._id)) {
        this.props.dispatch(fetchToastNotify({ type: CONSTANTS.WARNING, data: "Không thể xóa tài khoản của bạn" }))
      }
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
    this._getDanhSachDanhMuc(this._createFilter())
  }
  _handleLockMulti = async () => {
    let { danhsach } = this.state, axiosReq = [], count = 0
    danhsach.forEach((item, index) => {
      if (item.checked)
        axiosReq.push(tbDanhMuc.lockById(item._id.$oid || item._id))
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
    this._getDanhSachDanhMuc(this._createFilter())
  }
  _handleDeleteOne = async (id) => {
    let { LoginRes } = this.props
    if (LoginRes._id === id) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.WARNING, data: "Không thể xóa tài khoản của bạn" }))
      return
    }
    let axiosRes = await tbDanhMuc.deleteById(id)
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: "Xóa thành công" }))
      this._getDanhSachDanhMuc(this._createFilter())
    }
  }
  _handleSearch = () => {
    // let { search } = this.state
    // if (search.Ten) {
    this._getDanhSachDanhMuc(this._createFilterSearch())
    // } else {
    //   this._getDanhSachDanhMuc(this._createFilter())
    // }
  }
  _handleApprove = async (id) => {
    let axiosReq = { PheDuyet: 3 }//await tbUsers.getById(id);
    let axiosRes = await tbDanhMuc.updateById(id, axiosReq);
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' }))
      this._getDanhSachDanhMuc(this._createFilter())
    }
    else {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Không thành công' }))
    }
  }
  _handleUnapprove = async (id) => {
    let axiosReq = { PheDuyet: 2 }//await tbUsers.getById(id);
    let axiosRes = await tbDanhMuc.updateById(id, axiosReq);
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' }))
      // window.location.reload();
      this._getDanhSachDanhMuc(this._createFilter())
    }
    else {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Không thành công' }))
    }
  }
  _handleApproveDanhMuc = async (id) => {
    let axiosReq = { PheDuyet: 1 }//await tbUsers.getById(id);
    let axiosRes = await tbDanhMuc.updateById(id, axiosReq);
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' }))
      this._getDanhSachDanhMuc(this._createFilter())
    }
    else {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Không thành công' }))
    }
  }
  _handleAddToggle = () => {
    this.state.modalIsOpen = !this.state.modalIsOpen
    this.state.modalEditIndex = -1
    this.forceUpdate()
  }
  dataTable = () => {
    let luachon = this.state.luachon
    return <table width="100%" cellSpacing="0" ref="dataTable" style={{ display: 'none' }}>
      <thead>
        <tr>
          <th>STT</th>
          <th>Tên Danh Mục</th>
          <th>Mã Danh Mục</th>
          {luachon[0] && <th>Tên Đơn vị quản lý</th>}
          {luachon[1] && <th>Mã Đơn vị quản lý</th>}
          {luachon[2] && <th>Tên Nhóm danh mục</th>}
          {luachon[3] && <th>Mã Nhóm danh mục</th>}
          {luachon[4] && <th>Phê duyệt</th>}
          {luachon[5] && <th>Cấp</th>}
          {luachon[6] && <th>Cơ quan ban hành văn bản</th>}
          {luachon[7] && <th>Ngày ban hành</th>}
          {luachon[8] && <th>Văn bản ban hành sửa đổi</th>}
          {luachon[9] && <th>Link văn bản</th>}
          {luachon[10] && <th>Tên lĩnh vực</th>}
        </tr>
      </thead>
      <tbody>
        {this.state.danhsach.map((item, index) => {
          return <tr key={index} >
            <td className='text-center'>{index + 1}</td>
            <td>{item.Ten}</td>
            <td>{item.Ma}</td>
            {luachon[0] && <td>{item.DonViCha.Ten ? item.DonViCha.Ten : ""}</td>}
            {luachon[1] && <td>{item.DonViCha.Ma ? item.DonViCha.Ma : ""}</td>}
            {luachon[2] && <td>{item.NhomDanhMuc.Ten ? item.NhomDanhMuc.Ten : ""}</td>}
            {luachon[3] && <td>{item.NhomDanhMuc.Ma ? item.NhomDanhMuc.Ma : ""}</td>}
            {luachon[4] && <td>{(item.PheDuyet == 1) ? "Chờ phê duyệt" : ((item.PheDuyet == 2) ? "Hủy phê duyệt" : "Đã phê duyệt")}</td>}
            {luachon[5] && <td>{item.Cap}</td>}
            {luachon[6] && <td>{item.CoQuanBanHanhVB ? item.CoQuanBanHanhVB : ""}</td>}
            {luachon[7] && <td>{item.NgayBanHanh ? item.NgayBanHanh : ""}</td>}
            {luachon[8] && <td>{item.VBBanHanhSuaDoi.Ten ? item.VBBanHanhSuaDoi.Ten : ""}</td>}
            {luachon[9] && <td>{item.VBBanHanhSuaDoi.Link ? item.VBBanHanhSuaDoi.Link : ""}</td>}
            {luachon[10] && <td>{item.LinhVuc.Ten}</td>}
          </tr>
        })}
      </tbody>
    </table>
  }
  // EXPORT EXCEL
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
        for (let thindex = 0; thindex < tr.children.length; thindex++) {
          let th = tr.children[thindex]
          row.push(th.innerText)
        }
        myRows.push(row)
      }
    }
    let date = cmFunction.timestamp2DateString(moment().valueOf())
    let name = 'DSDanhMuc_' + this.state.page + '_' + date
    const wb = new Excel.Workbook()
    const ws = wb.addWorksheet('DSDanhMuc')
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


  //  WORKING CODE ---------------------
  render() {
    let { danhsach, cbCheckAll, search, modalIsOpen, luachon, nhomdanhmuc, nhomdanhmucSelected, linhvuc, linhvucSelected, donvi, donviSelected } = this.state
    let { page, pagesize, _size, _total_pages } = this.state
    let { LoginRes } = this.props
    let checkSuperAdmin = LoginRes.roles === SUPER.roles
    let { searchToggle } = this.state
    try {
      return (
        <React.Fragment>
          <div className="main portlet fade-in">
            <BreadCrumbs title={"Danh sách danh mục"} route={[{ label: 'Quản lý danh mục', value: '/danh-muc-dtdc/danh-muc' }]} />
            <div className="portlet-title">
              <div className="caption">
                <i className="fas fa-grip-vertical" />Danh sách danh mục
              </div>
              <div className="action">
                <button onClick={this._handleAddToggle} className="btn btn-sm btn-outline-info border-radius" title="Xuất excel">
                  <i className="fas fa-download" />
                </button>
                <button onClick={this._searchToggle} className="btn btn-sm btn-outline-info border-radius" title="Tìm kiếm">
                  <i className="fas fa-search" />
                </button>
              </div>
            </div>
            {searchToggle && <div className="card-body pt-3 pb-3 card-search">
              <div className="form-body">
                <div className="form-row form-group form-custom">
                  <div className="col-md-5">
                    <Select
                      className=""
                      classNamePrefix="form-control"
                      placeholder="Lĩnh vực..."
                      options={linhvuc}
                      value={linhvucSelected}
                      isSearchable={true}
                      isClearable={true}
                      onChange={this._handleLinhVucChange}
                    />
                  </div>
                  <div className="col-md-5">
                    <Select
                      className=""
                      classNamePrefix="form-control"
                      placeholder="Đơn vị ..."
                      options={donvi}
                      value={donviSelected}
                      isSearchable={true}
                      isClearable={true}
                      onChange={this._handleDonViChange}
                    />
                  </div>
                </div>
                <div className="form-row form-group form-custom">
                    <div className="col-md-10">
                      <input className="form-control" onChange={this._handleChangeSearchElement}
                        value={search.Ten || ''} type="text" id="Ten" placeholder='Tìm kiếm tên, mã danh mục' />
                    </div>
                    <div className="col-md-2">
                      <button onClick={this._handleSearch} className="btn btn-outline-primary border-radius ">
                        <i className="fas fa-search" />Tìm kiếm
                    </button>
                    </div>
                  </div>
              </div>
            </div>}
            {this.dataTable()}

            <div className="card">
              <div className="card-header">
                {(checkSuperAdmin || !this._checkRoleThuTruong(LoginRes)) && <Link to={'/danh-muc-dtdc/danh-muc/0'} className="btn btn-sm btn-outline-primary border-radius">
                  <i className="fas fa-plus" />Thêm
                </Link>}
                {(checkSuperAdmin || !this._checkRoleThuTruong(LoginRes)) && <button onClick={() => this._handleConfirmDelete(true, 0)} className="btn btn-sm btn-outline-danger border-radius">
                  <i className="fas fa-trash" />Xóa
                </button>}
              </div>
              <div className="card-body fix-first">
                <div className="table-fix-head">
                  <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="">
                    <thead>
                      <tr>
                        <th className='td-checkbox'><input type="checkbox" id='cbCheckAll' checked={cbCheckAll} onChange={this._handleCheckAll} /></th>
                        <th>STT</th>
                        <th>Tên</th>
                        <th>Mã</th>
                        {/* <th>ĐV quản lý</th> */}
                        <th>Lĩnh vực</th>
                        {/* <th>Nhóm danh mục</th>
                      <th>Phê duyệt</th> */}
                        {checkSuperAdmin && <th>***</th>}
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {danhsach.map((item, index) => {
                        return <tr key={index} >
                          <td className='td-checkbox'>
                            <input type="checkbox" checked={item.checked || false} id={item._id.$oid || item._id} onChange={this._handleCheckItem} />
                          </td>
                          <td className='text-center'>{index + 1}</td>
                          <td>{item.Ten}</td>
                          <td>{item.Ma}</td>
                          {/* <td>{item.DonViCha.Ten}</td> */}
                          <td>{item.LinhVuc.Ten}</td>
                          {/* <td>{item.NhomDanhMuc.Ten}</td>
                        <td>{(item.PheDuyet == 1) ? "Chờ phê duyệt" : ((item.PheDuyet == 2) ? "Hủy phê duyệt" : "Đã phê duyệt")}</td> */}
                          {checkSuperAdmin && <td><span style={{ color: 'red' }}>{item.isActive ? '' : 'Đã xóa'}</span></td>}
                          <td className='text-left'>
                            <Link to={'/danh-muc-dtdc/danh-muc/' + item._id.$oid || item._id} title="Chi tiết" className="btn btn-sm btn-outline-info border-radius"><i className="fas fa-pencil-alt" /></Link>
                            {(checkSuperAdmin || this._checkRole(LoginRes)) && ((item.PheDuyet == 1)) && <button onClick={() => this._handleConfirmApprove(item._id.$oid || item._id)} title="Phê duyệt danh mục" className="btn btn-sm btn-outline-success border-radius" style={{ display: (item.PheDuyet == 3) ? 'none' : 'inline' }}>
                              <i className="fas fa-user-check"></i>
                            </button>}
                            {(checkSuperAdmin || this._checkRole(LoginRes)) && <button onClick={() => this._handleConfirmUnapprove(item._id.$oid || item._id)} title="Hủy phê duyệt danh mục" className="btn btn-sm btn-outline-primary border-radius" style={{ display: (item.PheDuyet == 3) ? 'inline' : 'none' }}>
                              <i className="fas fa-ban"></i>
                            </button>}
                            {(checkSuperAdmin || !this._checkRoleThuTruong(LoginRes)) && <button onClick={() => this._handleConfirmDelete(false, item._id.$oid || item._id)} title="Xóa" className="btn btn-sm btn-outline-danger border-radius">
                              <i className="fas fa-trash" />
                            </button>}
                            {!checkSuperAdmin && !this._checkRole(LoginRes) && !this._checkRoleThuTruong(LoginRes) && <button onClick={() => this._handleConfirmApproveDanhMuc(item._id.$oid || item._id)} title="Yêu cầu phê duyệt" className="btn btn-sm btn-outline-success border-radius" style={{ display: (item.PheDuyet == 2) ? 'inline' : 'none' }}>
                              <i className="fas fa-user-check"></i>
                            </button>}
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
            <Modal
              style={{ width: '50%' }}
              isOpen={modalIsOpen}
              onRequestClose={this._handleAddToggle}
            >
              <div className="card">
                <div className="card-header">
                  <label className='caption'>Chọn thông tin xuất file excel</label>
                </div>
                <div className="card-body">
                  <div className="form-body" ref='formModal'>
                    <FormWrapper>
                      <input type="checkbox"
                        name="Chọn tất cả"
                        id="all"
                        checked={luachon[11]}
                        onChange={(evt) => this._handleChangeCheckBox(11)}
                      />
                      <label style={{ paddingLeft: '10px' }} onClick={(evt) => this._handleChangeCheckBox(11)}>Chọn tất cả</label>
                    </FormWrapper>
                    <hr></hr>
                    <div className="row">
                      <div className="col-md-3">
                        <FormWrapper>
                          <input type="checkbox"
                            name="Tên Đơn vị quản lý"
                            id="0"
                            checked={luachon[0]}
                            onChange={(evt) => this._handleChangeCheckBox(0)}
                          />
                          <label style={{ paddingLeft: '10px' }} onClick={(evt) => this._handleChangeCheckBox(0)}>Tên Đơn vị quản lý</label>
                        </FormWrapper>
                        <FormWrapper>
                          <input type="checkbox"
                            name="Mã Đơn vị quản lý"
                            id="1"
                            checked={luachon[1]}
                            onChange={(evt) => this._handleChangeCheckBox(1)}
                          />
                          <label style={{ paddingLeft: '10px' }} onClick={(evt) => this._handleChangeCheckBox(1)}>Mã Đơn vị quản lý</label>
                        </FormWrapper>
                        <FormWrapper>
                          <input type="checkbox"
                            name="Tên Nhóm danh mục"
                            id="2"
                            checked={luachon[2]}
                            onChange={(evt) => this._handleChangeCheckBox(2)}
                          />
                          <label style={{ paddingLeft: '10px' }} onClick={(evt) => this._handleChangeCheckBox(2)}>Tên Nhóm danh mục</label>
                        </FormWrapper>
                      </div>
                      <div className="col-md-3" >
                        <FormWrapper>
                          <input type="checkbox"
                            name="Mã Nhóm danh mục"
                            id="3"
                            checked={luachon[3]}
                            onChange={(evt) => this._handleChangeCheckBox(3)}
                          />
                          <label style={{ paddingLeft: '10px' }} onClick={(evt) => this._handleChangeCheckBox(3)}>Mã Nhóm danh mục</label>
                        </FormWrapper>
                        <FormWrapper>
                          <input type="checkbox"
                            name="Phê duyệt"
                            id="4"
                            checked={luachon[4]}
                            onChange={(evt) => this._handleChangeCheckBox(4)}
                          />
                          <label style={{ paddingLeft: '10px' }} onClick={(evt) => this._handleChangeCheckBox(4)}>Phê duyệt</label>
                        </FormWrapper>
                        <FormWrapper>
                          <input type="checkbox"
                            name="Cấp"
                            id="5"
                            checked={luachon[5]}
                            onChange={(evt) => this._handleChangeCheckBox(5)}
                          />
                          <label style={{ paddingLeft: '10px' }} onClick={(evt) => this._handleChangeCheckBox(5)}>Cấp</label>
                        </FormWrapper>
                      </div>
                      <div className="col-md-3" >
                        <FormWrapper>
                          <input type="checkbox"
                            name="Cơ quan ban hành văn bản"
                            id="6"
                            checked={luachon[6]}
                            onChange={(evt) => this._handleChangeCheckBox(6)}
                          />
                          <label style={{ paddingLeft: '10px' }} onClick={(evt) => this._handleChangeCheckBox(6)}>Cơ quan ban hành văn bản</label>
                        </FormWrapper>
                        <FormWrapper>
                          <input type="checkbox"
                            name="Ngày ban hành"
                            id="7"
                            checked={luachon[7]}
                            onChange={(evt) => this._handleChangeCheckBox(7)}
                          />
                          <label style={{ paddingLeft: '10px' }} onClick={(evt) => this._handleChangeCheckBox(7)}>Ngày ban hành</label>
                        </FormWrapper>
                        <FormWrapper>
                          <input type="checkbox"
                            name="Văn bản ban hành sửa đổi"
                            id="8"
                            checked={luachon[8]}
                            onChange={(evt) => this._handleChangeCheckBox(8)}
                          />
                          <label style={{ paddingLeft: '10px' }} onClick={(evt) => this._handleChangeCheckBox(8)}>Văn bản ban hành sửa đổi</label>
                        </FormWrapper>
                      </div>
                      <div className="col-md-3" >
                        <FormWrapper>
                          <input type="checkbox"
                            name="Link văn bản"
                            id="9"
                            checked={luachon[9]}
                            onChange={(evt) => this._handleChangeCheckBox(9)}
                          />
                          <label style={{ paddingLeft: '10px' }} onClick={(evt) => this._handleChangeCheckBox(9)}>Link văn bản</label>
                        </FormWrapper>
                        <FormWrapper>
                          <input type="checkbox"
                            name="Tên lĩnh vực"
                            id="10"
                            checked={luachon[10]}
                            onChange={(evt) => this._handleChangeCheckBox(10)}
                          />
                          <label style={{ paddingLeft: '10px' }} onClick={(evt) => this._handleChangeCheckBox(10)}>Tên lĩnh vực</label>
                        </FormWrapper>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-footer" style={{ marginTop: "10px" }}>
                  <button onClick={this._handleAddToggle} className="btn btn-sm btn-outline-info border-radius">
                    <i className="far fa-times-circle"></i>Đóng
                  </button>
                  <button onClick={() => this._handleExportExcel('dataTable')} className="btn btn-sm btn-outline-info border-radius" title="Xuất excel">
                    <i className="fas fa-download" />
                  </button>
                </div>
              </div>
            </Modal>
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
export default connect(mapStateToProps)(DanhSach);
