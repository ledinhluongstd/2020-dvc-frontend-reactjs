import React, { Component } from "react";
import { connect } from "react-redux";
import { BreadCrumbs, Search, Pagination, InputSearch } from "interface/components";
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
import { GSP_DMDC } from "../../../../config";
import * as Excel from "exceljs";
import { saveAs } from 'file-saver';

class DanhSach extends Component {
  constructor(props) {
    super(props)
    this.state = {
      danhsachclone: [],
      danhsach: [],
      form: {},

      cbCheckAll: false,
      searchIsOpen: false,
      search: { Ten: '' },
      page: CONSTANTS.DEFAULT_PAGE,
      pagesize: CONSTANTS.DEFAULT_PAGESIZE,
      _size: 0,
      _total_pages: 0,
      filter: null,
      searchToggle: false
    }
  }

  componentDidMount = async () => {
    this._getDanhSachDanhMuc(this._createFilter())
  }

  componentDidUpdate(prevProps) {
    let { location } = this.props
    if (location !== prevProps.location) {
      this._getDanhSachDanhMuc(this._createFilter())
    }
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

  _getDanhSachDanhMuc = async (query) => {
    let data = await gspServices.getDanhMucQuocGia('GET', GSP_DMDC)
    this.state.danhsach = data
    this.state.danhsachclone = cmFunction.clone(data)
    // this.state._size = data._size || 0
    // this.state._total_pages = data._total_pages || 0
    this.state.cbCheckAll = false
    this.forceUpdate()
  }

  // EXPORT EXCEL
  _handleExportExcel = (ref) => {
    // ví dụ xuất excel tại bảng đang có
    let { phamvi, danhmucSelected, danhmucquocgiaSelected } = this.state
    let myRows = [], maxCol = 0
    let table = ReactDOM.findDOMNode(this.refs[`${ref}`]);
    for (let tbindex = 0; tbindex < table.children.length; tbindex++) {
      let tb = table.children[`${tbindex}`]
      for (let trindex = 0; trindex < tb.children.length; trindex++) {
        let row = []
        let tr = tb.children[`${trindex}`]
        maxCol = tr.children.length > maxCol ? tr.children.length : maxCol
        for (let thindex = 0; thindex < tr.children.length - 1; thindex++) {
          let th = tr.children[`${thindex}`]
          row.push(th.innerText)
        }
        myRows.push(row)
      }
    }
    let date = cmFunction.timestamp2DateString(moment().valueOf())
    let name = 'DS_DMDCQG_' + this.state.page + '_' + date
    const wb = new Excel.Workbook()
    const ws = wb.addWorksheet(name)
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

  _createFilterSearch = () => {
    let { search } = this.state
    let parsed = queryString.parse(this.props.location.search);
    let { page, pagesize } = parsed
    let filter = {}
    parsed.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
    parsed.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    parsed.count = true
    if (search.Ten) {
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
    let { danhsachclone, search } = this.state
    let danhsach = []
    danhsachclone.map(item => {
      let checkMa = search.Ten.trim() ? item.CategoryCode === search.Ten.trim() : true
      let checkTen = search.Ten.trim() ? cmFunction.changeAlias(item.CategoryName).toUpperCase() == cmFunction.changeAlias(search.Ten.trim()).toUpperCase() : true
      if (checkMa || checkTen) danhsach.push(item)
    })
    this.state.danhsach = danhsach
    this.forceUpdate()
  }

  _convertName = (item) => {
    return item.CategoryName
  }

  _searchToggle = () => {
    this.state.searchToggle = !this.state.searchToggle
    this.forceUpdate()
  }

  render() {
    let { danhsach, cbCheckAll, searchToggle } = this.state
    let { page, pagesize, _size, _total_pages, search } = this.state
    let { LoginRes } = this.props
    let checkSuperAdmin = LoginRes.roles === SUPER.roles

    try {
      return (
        <React.Fragment>
          <div className="main portlet">
            <BreadCrumbs title={"Danh sách danh mục quốc gia"}
              route={[{ label: 'Nhóm danh mục quốc gia', value: '/quoc-gia/nhom-danh-muc' }]}

            />
            <div className="portlet-title">
              <div className="caption">
                <i className="fas fa-grip-vertical" />Danh sách danh mục quốc gia
              </div>
              <div className="action">
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
            </div>}
            <div className="card">
              <div className="card-header">
                <strong>{`Tổng số: ${danhsach.length} danh mục`}</strong>
              </div>
              <div className="card-body fix-first">
                <div className="table-fix-head">
                  <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Tên</th>
                        <th>Mã</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {danhsach.map((item, index) => {
                        return <tr key={index} >
                          <td className='text-center'>{index + 1}</td>
                          <td>{this._convertName(item)}</td>
                          <td>{item.CategoryCode}</td>
                          <td>
                            {item.TotalItem ?
                              <Link to={'/quoc-gia/danh-muc?danhmuc=' + (cmFunction.encode(item.UrlGetList)) + '&ten=' + (cmFunction.encode(item.CategoryName))} title="Chi tiết" className="btn btn-sm btn-outline-info border-radius"><i className="fas fa-eye"></i></Link>
                              : null}
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
