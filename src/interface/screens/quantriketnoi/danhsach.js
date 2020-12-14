import React, {Component} from "react";
import {connect} from "react-redux";
import {BreadCrumbs, Pagination} from "interface/components";
import axios from 'axios'
import queryString from 'query-string'
import ReactDOM from 'react-dom';
import moment from 'moment'
import {fetchToastNotify} from "../../../controller/redux/app-reducer";
import {Link} from "react-router-dom";
import {confirmAlert} from 'react-confirm-alert';
import {Other} from 'interface/screens/error'
import {__DEV__, SUPER} from "../../../common/ulti/constants";
import * as CONSTANTS from 'common/ulti/constants';
import * as cmFunction from 'common/ulti/commonFunction'
import * as Excel from "exceljs";
import {saveAs} from 'file-saver';
import * as tbUngDung from 'controller/services/tbUngDungServices';

class DanhSach extends Component {
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
    }
  }

  componentDidMount = async () => {
    this._getDanhSachDichVu(this._createFilterSearch())
  }

  componentDidUpdate(prevProps) {
    let { location } = this.props
    if (location !== prevProps.location) {
      this._getDanhSachDichVu(this._createFilterSearch())
    }
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

  _getDanhSachDichVu = async (query) => {
    let data = await tbUngDung.getAll(query)
    this.state.danhsach = data && data._embedded ? data._embedded : []
    this.state._size = data._size || 0
    this.state._total_pages = data._total_pages || 0
    this.state.cbCheckAll = false;
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

  _handleDeleteOne = async (id) => {
    let axiosRes = await tbUngDung.deleteById(id)
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: "Xóa thành công" }))
      this._getDanhSachDichVu(this._createFilter())
    }
  }

  _handleDeleteMulti = async () => {
    let { danhsach } = this.state, axiosReq = [], count = 0
    danhsach.forEach((item) => {
      if (item.checked)
        axiosReq.push(tbUngDung.deleteById(item._id.$oid || item._id))
    });

    if (!axiosReq.length) return

    let axiosRes = await axios.all(axiosReq).then(axios.spread((...responses) => {
      return responses
    })).catch(errors => {
      if (__DEV__) console.log(errors)
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Có lỗi' }))
    })

    axiosRes.forEach((item) => { if (item) count++ });

    this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: "Xóa thành công " + count + " dữ liệu" }))
    this._getDanhSachDichVu(this._createFilter())
  }

  _handleLockMulti = async () => {
    let { danhsach } = this.state, axiosReq = [], count = 0
    danhsach.forEach((item) => {
      if (item.checked)
        axiosReq.push(tbUngDung.lockById(item._id.$oid || item._id))
    });

    if (!axiosReq.length) return

    let axiosRes = await axios.all(axiosReq).then(axios.spread((...responses) => {
      return responses
    })).catch(errors => {
      if (__DEV__) console.log(errors)
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Có lỗi' }))
    })

    axiosRes.forEach((item) => { if (item) count++ });

    this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: "Khóa thành công " + count + " dữ liệu" }))
    this._getDanhSachDichVu(this._createFilter())
  }

  _handleCheckAll = (evt) => {
    this.state.danhsach.forEach((item ) => {
      item.checked = evt.target.checked
    });
    this.state.cbCheckAll = evt.target.checked
    this.forceUpdate()
  }

  _handleCheckItem = (evt) => {
    this.state.danhsach.forEach((item) => {
      if (item._id.$oid === evt.target.id || item._id === evt.target.id)
        item.checked = evt.target.checked
    });
    this.forceUpdate()
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
        for (let thindex = 1; thindex < tr.children.length - 1; thindex++) {
          let th = tr.children[thindex]
          row.push(th.innerText)
        }
        myRows.push(row)
      }
    }
    let date = cmFunction.timestamp2DateString(moment().valueOf())
    let name = 'DSCSDL_HTTT_' + this.state.page + '_' + date
    const wb = new Excel.Workbook()
    const ws = wb.addWorksheet('DSCSDL_HTTT')
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
        ws.getCell(String.fromCharCode(65 + j) + (i + 1)).alignment = {
          wrapText: true
        }
      }
    }
    ws.columns[1].width = 80
    ws.columns[2].width = 60
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
    this._getDanhSachDichVu(this._createFilterSearch())
  }

  _searchToggle = () => {
    this.state.searchToggle = !this.state.searchToggle
    this.forceUpdate()
  }

  _dateModified = (item) => {
    if (item.modifiedAt) { return item.modifiedAt.$numberLong } else { return item.createdAt.$numberLong }
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
            <BreadCrumbs title={"Danh sách dịch vụ cung cấp"} route={[{ label: 'Ứng dụng kết nối', value: '/quan-tri-ket-noi/ung-dung-ket-noi' }]} />
            <div className="portlet-title">
              <div className="caption">
                <i className="fas fa-grip-vertical" />Danh sách CSDL/HTTT khai thác dịch vụ
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
            {searchToggle && <div className="card-body pt-3 pb-3 card-search">
              <div className="form-body">
                <div className="form-row form-group form-custom">
                  <div className="col-md-6">
                    <input className="form-control" onChange={this._handleChangeSearchElement} onKeyDown={this._handleKeyDow}
                      value={search.Ten || ''} type="text" id="Ten" placeholder='Tìm kiếm CSDL/HTTT hoặc mã CSDL/HTTT' />
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
                <Link to={'/quan-tri-ket-noi/chinh-sua-qtkn/0'} className="btn btn-sm btn-outline-primary border-radius">
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
                        <th className='th-stt'>STT</th>
                        <th>Nội dung</th>
                        <th>Đơn vị chủ quản</th>
                        <th>Trạng thái</th>
                        {checkSuperAdmin && <th>***</th>}
                        <th className='th-action'>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {danhsach.map((item, index) => {
                        return <tr key={index} >
                          <td className='td-checkbox'>
                            <input type="checkbox" checked={item.checked || false} id={item._id.$oid || item._id} onChange={this._handleCheckItem} />
                          </td>
                          <td className='text-center align-middle' style={{ width: '5%' }}>{index + 1}</td>
                          <td>
                            <span>CSDL/HTTT:&nbsp;<span className="font-weight-bold">{item.Ten}</span></span><br />
                            <span>Nhóm:&nbsp;<span className='font-weight-bold'>{item.NhomDichVu.Ten}</span> </span><br />
                            <span>Mã:&nbsp;<span className="font-italic text-info">{item.Ma}</span></span><br />
                            <span className='text-muted font-italic'>Ngày cập nhật:&nbsp;<span >{cmFunction.timestamp2DateString(this._dateModified(item), 'HH:mm:ss DD/MM/YYYY')}</span></span>
                          </td>
                          <td>
                            <span>Đơn vị: &nbsp;<span className="font-weight-bold">{item.DonVi.Ten || ''}</span></span><br />
                            <span>Người liên hệ: &nbsp;<span className="font-weight-bold">{item.NguoiLienHe}</span></span><br />
                            <span>SĐT liên hệ: &nbsp;<span className="font-weight-bold">{item.SDT}</span></span><br />
                            <span>Email: &nbsp;<span className="font-weight-bold">{item.Email}</span></span>
                          </td>
                          <td className="text-center align-middle">{item.KichHoat ? 'Kích hoạt' : ''}</td>
                          {checkSuperAdmin && <td className="text-center align-middle" ><span style={{ color: 'red' }}>{item.isActive ? '' : 'Đã xóa'}</span></td>}
                          <td className="text-center align-middle">
                            <Link to={'/quan-tri-ket-noi/ung-dung-ket-noi/' + item._id.$oid || item._id} title="Chi tiết" className="btn btn-sm btn-outline-info border-radius"><i className="fas fa-eye" /></Link>
                            <Link to={'/quan-tri-ket-noi/chinh-sua-qtkn/' + item._id.$oid || item._id} title="Chỉnh sửa" className="btn btn-sm btn-outline-info border-radius"><i className="fas fa-pencil-alt" /></Link>
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
