import React, { Component } from "react";
import { connect } from "react-redux";
import { BreadCrumbs, Pagination, FormWrapper, FormInput } from "interface/components";
import axios from 'axios'
import queryString from 'query-string'
import ReactDOM from 'react-dom';
import moment from 'moment'
import { fetchToastNotify } from "../../../controller/redux/app-reducer";
import { Link } from "react-router-dom";
import { confirmAlert } from 'react-confirm-alert';
import { Other } from 'interface/screens/error'
import { __DEV__, SUPER } from "../../../common/ulti/constants";
import * as CONSTANTS from 'common/ulti/constants';
import * as cmFunction from 'common/ulti/commonFunction'
import * as Excel from "exceljs";
import { saveAs } from 'file-saver';
import * as tbDichVu from 'controller/services/tbDVCServices'
import { HOST_API } from "../../../controller/api";
import { Axios } from "../../../controller/services/axios";
import Modal from 'react-modal';
import JSONTree from 'react-json-tree'
const theme = {
  scheme: 'monokai',
  author: 'wimer hazenberg (http://www.monokai.nl)',
  base00: '#272822',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633',
};

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
      //
      formKiemThu: {},
      modalKiemThuToggle: false
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
    let data = await tbDichVu.getAll(query)
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
    let axiosRes = await tbDichVu.deleteById(id)
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: "Xóa thành công" }))
      this._getDanhSachDichVu(this._createFilter())
    }
  }

  _handleDeleteMulti = async () => {
    let { danhsach } = this.state, axiosReq = [], count = 0
    danhsach.forEach((item, index) => {
      if (item.checked)
        axiosReq.push(tbDichVu.deleteById(item._id.$oid || item._id))
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
    this._getDanhSachDichVu(this._createFilter())
  }

  _handleLockMulti = async () => {
    let { danhsach } = this.state, axiosReq = [], count = 0
    danhsach.forEach((item, index) => {
      if (item.checked)
        axiosReq.push(tbDichVu.lockById(item._id.$oid || item._id))
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
    this._getDanhSachDichVu(this._createFilter())
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
    let name = 'DSDichVu_' + this.state.page + '_' + date
    const wb = new Excel.Workbook()
    const ws = wb.addWorksheet('DSDichVu')
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
    ws.columns[1].width = 120
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

  _modalKiemThuToggle = (item) => {
    this.state.modalKiemThuToggle = !this.state.modalKiemThuToggle
    this.state.formKiemThu = {
      url: !!item ? HOST_API + item.Url.Ma : "",
      request: !!item && !!item.DuLieuKiemThu ? JSON.stringify(JSON.parse(item.DuLieuKiemThu.trim())) : "",
      response: {}
    }
    this.forceUpdate()
  }

  _dateModified = (item) => {
    if (item.modifiedAt) { return item.modifiedAt.$numberLong } else { return item.createdAt.$numberLong }
  }

  _handleChangeElement = (evt) => {
    this.state.formKiemThu[evt.target.id] = evt.target.value;
    this.forceUpdate();
  };

  _handleTested = async () => {
    let { formKiemThu } = this.state
    if (!formKiemThu.request || !formKiemThu.request.trim()) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.WARNING, data: "Vui lòng cài đặt dữ liệu kiểm thử" }))
      return
    }
    let config = {
      headers: {
        Authorization: 'KIEM_THU',
      }
    }
    let axiosRes = await Axios('POST', formKiemThu.url + '-kiem-thu', JSON.parse(formKiemThu.request.trim()), config)
    this.state.formKiemThu = {
      url: formKiemThu.url,
      request: JSON.stringify(JSON.parse(formKiemThu.request.trim())),
      response: axiosRes
    }
    this.state.modalKiemThuToggle = true
    this.forceUpdate()
  }

  render() {
    let { danhsach, cbCheckAll, searchToggle, formKiemThu, modalKiemThuToggle } = this.state
    let { page, pagesize, _size, _total_pages, search } = this.state
    let { LoginRes } = this.props
    let checkSuperAdmin = LoginRes.roles === SUPER.roles
    try {
      return (
        <React.Fragment>
          <div className="main portlet">
            <BreadCrumbs title={"Danh sách dịch vụ cung cấp"} route={[{ label: 'Dịch vụ cung cấp', value: 'dich-vu-cung-cap' }]} />
            <div className="portlet-title">
              <div className="caption">
                <i className="fas fa-grip-vertical" />Danh sách dịch vụ cung cấp
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
                      value={search.Ten || ''} type="text" id="Ten" placeholder='Tìm kiếm tên hoặc mã dịch vụ cung cấp' />
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
                <Link to={'/dich-vu-cung-cap/0'} className="btn btn-sm btn-outline-primary border-radius">
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
                        <th >STT</th>
                        <th>Dịch vụ</th>
                        <th>Trạng thái</th>
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
                          <td className='text-center align-middle' style={{ width: '5%' }}>{index + 1}</td>
                          <td>
                            <span>Tên dịch vụ:&nbsp;<span className="font-weight-bold">{item.Ten || ''}</span></span> <br />
                            <span>Nhóm:&nbsp;<span className="font-weight-bold">{item.NhomDichVu.Ten || ''}</span></span> <br />
                            <span className='text-muted'>Url:&nbsp;<span className='font-italic text-info'>{HOST_API}{item.Url.Ma || ''}</span></span><br />
                            <span className='text-muted'>Version:&nbsp;{item.Url.Version || ''}</span><br />
                            <span className='text-muted font-italic'>Ngày cập nhật:&nbsp;{cmFunction.timestamp2DateString(this._dateModified(item), 'HH:mm:ss DD/MM/YYYY')}</span>
                          </td>
                          <td className="text-center align-middle">{item.KichHoat ? 'Kích hoạt' : ''}</td>
                          {checkSuperAdmin && <td className="text-center align-middle"><span style={{ color: 'red' }}>{item.isActive ? '' : 'Đã xóa'}</span></td>}
                          <td className="text-center align-middle">
                            <Link to={'/info-dvcc/' + item._id.$oid || item._id} title="Chi tiết" className="btn btn-sm btn-outline-info border-radius"><i className="fas fa-eye" /></Link>
                            <React.Fragment>
                              <button
                                className="btn btn-sm btn-outline-info border-radius dropdown-toggle"
                                type="button"
                                id={"dropdownMenuButton" + index}
                                data-toggle="dropdown"
                                aria-haspopup="true"
                                aria-expanded="false"
                              >
                                <i className="fas fa-cog" />
                              </button>
                              <span
                                className="dropdown-menu"
                                aria-labelledby={"dropdownMenuButton" + index}
                              >
                                <Link to={'/dich-vu-cung-cap/' + item._id.$oid || item._id} title="Chỉnh sửa" className="btn btn-sm btn-outline-info border-radius"><i className="fas fa-pencil-alt" /></Link>
                                <button onClick={() => this._modalKiemThuToggle(item)} title="Kiểm thử" className="btn btn-sm btn-outline-info border-radius">
                                  <i className="fas fa-play" />
                                </button>
                                <button onClick={() => this._handleConfirmDelete(false, item._id.$oid || item._id)} title="Xóa" className="btn btn-sm btn-outline-danger border-radius">
                                  <i className="fas fa-trash" />
                                </button>
                              </span>
                            </React.Fragment>
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

          <Modal
            isOpen={modalKiemThuToggle}
            onRequestClose={() => this._modalKiemThuToggle()}
          >
            <div className="card">
              <div className="card-header">
                <label className='caption'>Kết quả kiểm thử dịch vụ</label>
                <button onClick={() => this._modalKiemThuToggle()} className="pull-right btn btn-sm btn-outline-danger border-radius">
                  <i className="far fa-times-circle"></i>
                </button>
              </div>

              <div className="card-body">
                <strong>Nội dung Url: <span className="font-italic text-info">{formKiemThu.url}</span></strong><br />
                <hr />
                <strong>Nội dung request:</strong>
                <div className="form-group form-custom">
                  <FormInput
                    parentClass="col-md-12"
                    // labelClass="col-md-6"
                    inputClass="col-md-12"
                    type="textarea"
                    onChange={this._handleChangeElement}
                    rows="3"
                    defaultValue={formKiemThu.request || ''}
                    id="request"
                    label=""
                  />
                  {/* <FormWrapper>
                    <JSONTree
                      data={formKiemThu.request}
                      theme={{
                        extend: theme,
                        valueLabel: {
                          textDecoration: 'underline',
                        },
                        nestedNodeLabel: ({ style }, keyPath, nodeType, expanded) => ({
                          style: {
                            ...style,
                            textTransform: expanded ? 'uppercase' : style.textTransform,
                          },
                        }),
                      }}
                    />
                  </FormWrapper> */}
                </div>
                <hr />
                <strong>Nội dung response:</strong>
                <div className="form-group form-custom">
                  <FormWrapper>
                    <JSONTree
                      data={formKiemThu.response || {}}
                      theme={{
                        extend: theme,
                        valueLabel: {
                          textDecoration: 'underline',
                        },
                        nestedNodeLabel: ({ style }, keyPath, nodeType, expanded) => ({
                          style: {
                            ...style,
                            textTransform: expanded ? 'uppercase' : style.textTransform,
                          },
                        }),
                      }}
                    />
                  </FormWrapper>
                </div>
              </div>
              <div className="card-footer">
                <button onClick={() => this._modalKiemThuToggle()} className="pull-right btn btn-sm btn-outline-danger border-radius">
                  <i className="far fa-times-circle"></i>Đóng
                </button>
                <button onClick={this._handleTested} className="pull-right btn btn-sm btn-outline-info border-radius">
                  <i className="fas fa-play"></i>Kiểm thử
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
export default connect(mapStateToProps)(DanhSach);
