import React, { Component } from "react";
import { connect } from "react-redux";
import { BreadCrumbs, Search, Pagination } from "interface/components";
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
import * as tbThuocTinhDanhMuc from 'controller/services/tbThuocTinhDanhMucServices'
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
      searchIsOpen: false,

      page: CONSTANTS.DEFAULT_PAGE,
      pagesize: CONSTANTS.DEFAULT_PAGESIZE,
      _size: 0,
      _total_pages: 0,
      filter: null,
      search: {},
      searchToggle: false

    }
  }

  componentDidMount = async () => {
    this._getDanhSachthuoctinhdanhmuc(this._createFilterSearch())
  }

  componentDidUpdate(prevProps) {
    let { location } = this.props
    if (location !== prevProps.location) {
      this._getDanhSachthuoctinhdanhmuc(this._createFilterSearch())
    }
  }

  _createFilter = () => {
    let parsed = queryString.parse(this.props.location.search);
    let { page, pagesize, filter } = parsed
    filter = filter ? cmFunction.decode(filter) : filter
    parsed.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
    parsed.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    parsed.count = true
    // parsed.sort_by = 'STT'
    !filter ? delete parsed.filter : parsed.filter = filter
    this.state.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
    this.state.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    this.state.filter = filter
    this.forceUpdate()
    return new URLSearchParams(parsed).toString()
  }

  _getDanhSachthuoctinhdanhmuc = async (query) => {
    let data = await tbThuocTinhDanhMuc.getAll(query)
    this.state.danhsach = data && data._embedded ? data._embedded : [];
    this.state._size = data._size || 0
    this.state._total_pages = data._total_pages || 0
    this.state.cbCheckAll = false
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
        axiosReq.push(tbThuocTinhDanhMuc.deleteById(item._id.$oid || item._id))
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
    this._getDanhSachthuoctinhdanhmuc(this._createFilter())
  }

  _handleLockMulti = async () => {
    let { danhsach } = this.state, axiosReq = [], count = 0
    danhsach.forEach((item, index) => {
      if (item.checked)
        axiosReq.push(tbThuocTinhDanhMuc.lockById(item._id.$oid || item._id))
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
    this._getDanhSachthuoctinhdanhmuc(this._createFilter())
  }

  _handleDeleteOne = async (id) => {
    let axiosRes = await tbThuocTinhDanhMuc.deleteById(id)
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: "Xóa thành công" }))
      this._getDanhSachthuoctinhdanhmuc(this._createFilter())
    }
  }

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

  _handleChangeSearchElement = (evt) => {
    this.state.search[evt.target.id] = evt.target.value
    this.forceUpdate()
  }

  _handleSearch = () => {
    // let { search } = this.state
    // if (search.Ten) {
      this._getDanhSachthuoctinhdanhmuc(this._createFilterSearch())
  //   } else {
  //     this._getDanhSachthuoctinhdanhmuc(this._createFilter())
  //   }
  }

  _createFilterSearch = () => {
    let { search } = this.state
    let parsed = queryString.parse(this.props.location.search);
    let { page, pagesize } = parsed
    let filter = {}
    // if (search.Ten) filter['NguoiDung.name'] = cmFunction.regexText(search.Ten.trim())
    if (search.Ten) {filter['$or'] = [
      { 'Ten': cmFunction.regexText(search.Ten.trim()) },
      { 'Ma': cmFunction.regexText(search.Ten.trim()) }
      
    ]
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
  // EXPORT EXCEL
  // _handleExportExcel = (ref) => {

  //   // ví dụ xuất excel tại bảng đang có
  //   let myRows = [['Danh sách thuộc tính']], maxCol = 0
  //   let table = ReactDOM.findDOMNode(this.refs[ref]);
  //   let filter = this.state.filter
  //   for (let tbindex = 0; tbindex < table.children.length; tbindex++) {
  //     let tb = table.children[tbindex]
  //     for (let trindex = 0; trindex < tb.children.length; trindex++) {
  //       let row = []
  //       let tr = tb.children[trindex]
  //       maxCol = tr.children.length > maxCol ? tr.children.length : maxCol
  //       for (let thindex = 0; thindex < tr.children.length; thindex++) {
  //         let th = tr.children[thindex]
  //         row.push(th.innerText)
  //       }
  //       myRows.push(row)
  //     }
  //   }
  //   // set colspan và rowspan
  //   let merge = [
  //     // { s: { r: 0, c: 0 }, e: { r: 0, c: maxCol } },
  //     // { s: { r: 1, c: 6 }, e: { r: 1, c: 7 } }
  //   ]
  //   // xuất file
  //   let ws = XLSX.utils.aoa_to_sheet(myRows);
  //   ws["!merges"] = merge;
  //   let wb = XLSX.utils.book_new();
  //   //add thêm nhiều Sheet vào đây cũng đc
  //   XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  //   let date = cmFunction.timestamp2DateString(moment().valueOf())
  //   let name = 'DSThuocTinhDM_' + this.state.page + '_' + date
  //   XLSX.writeFile(wb, name + ".xlsx")
  // }
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
        for (let thindex = 1; thindex < tr.children.length-1; thindex++) {
          let th = tr.children[thindex]
          row.push(th.innerText)
        }
        myRows.push(row)
      }
    }
    let date = cmFunction.timestamp2DateString(moment().valueOf())
    let name = 'DSThuocTinhDanhMuc_' + this.state.page + '_' + date
    const wb = new Excel.Workbook()
    const ws = wb.addWorksheet('DSThuocTinhDanhMuc')
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

  _searchToggle = () => {
    this.state.searchToggle = !this.state.searchToggle
    this.forceUpdate()
  }

  render() {
    let { danhsach, cbCheckAll, search, searchToggle } = this.state
    let { page, pagesize, _size, _total_pages } = this.state
    let { LoginRes } = this.props
    let checkSuperAdmin = LoginRes.roles === SUPER.roles
    try {
      return (
        <React.Fragment>
          <div className="main portlet fade-in">
            <BreadCrumbs title={"Danh sách thuộc tính danh mục"} route={[{ label: 'Quản lý thuộc tính danh mục', value: '/danh-muc-dtdc/thuoc-tinh-danh-muc' }]} />
            <div className="portlet-title">
              <div className="caption">
                <i className="fas fa-grip-vertical" />Danh sách thuộc tính danh mục
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

            {searchToggle && <div className="card-body pt-3 pb-3 card-search">
              <div className="form-body">
                <div className="form-row form-group form-custom">

                  <div className="col-md-4">
                    <input className="form-control" onChange={this._handleChangeSearchElement}
                      value={search.Ten || ''} type="text" id="Ten" placeholder='Tìm kiếm tên, mã thuộc tính danh mục' />
                  </div>
                  <div className="col-md-4">
                    <button onClick={this._handleSearch} className="btn btn-outline-primary border-radius ">
                      <i className="fas fa-search" />Tìm kiếm
                    </button>
                  </div>
                </div>
              </div>
            </div>}
            <div className="card">
              <div className="card-header">
                <Link to={'/danh-muc-dtdc/thuoc-tinh-danh-muc/0'} className="btn btn-sm btn-outline-primary border-radius">
                  <i className="fas fa-plus" />Thêm
                </Link>
                <button onClick={() => this._handleConfirmDelete(true, 0)} className="btn btn-sm btn-outline-danger border-radius">
                  <i className="fas fa-trash" />Xóa
                </button>
              </div>
              <div className="card-body fix-first">
                <div className="table-fix-head">
                  <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                    <thead>
                      <tr>
                        <th className='td-checkbox'><input type="checkbox" id='cbCheckAll' checked={cbCheckAll} onChange={this._handleCheckAll} /></th>
                        <th>STT</th>
                        <th>Tên</th>
                        <th>Mã</th>
                        <th>Trạng thái</th>
                        <th>Ghi chú</th>
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
                          <td>{item.KichHoat ? 'Kích hoạt' : ' '}</td>
                          <td>{item.GhiChu}</td>
                          {checkSuperAdmin && <td><span style={{ color: 'red' }}>{item.isActive ? '' : 'Đã xóa'}</span></td>}
                          <td>
                            <Link to={'/danh-muc-dtdc/thuoc-tinh-danh-muc/' + item._id.$oid || item._id} title="Chi tiết" className="btn btn-sm btn-outline-info border-radius"><i className="fas fa-pencil-alt" /></Link>
                            <button onClick={() => this._handleConfirmDelete(false, item._id.$oid || item._id)} title="Xóa" className="btn btn-sm btn-outline-danger border-radius">
                              <i className="fas fa-trash" />
                            </button>
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
export default connect(mapStateToProps)(DanhSach);
