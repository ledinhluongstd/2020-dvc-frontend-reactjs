import React, { Component } from "react";
import { connect } from "react-redux";
import { BreadCrumbs, Search, Pagination } from "../../components";
import axios from 'axios'
import Modal from 'react-modal';
import Select from 'react-select'
import queryString from 'query-string'
import XLSX from 'xlsx';
import ReactDOM from 'react-dom';
import { fetchToastNotify } from "../../../controller/redux/app-reducer";
import { Link } from "react-router-dom";
import { confirmAlert } from 'react-confirm-alert';
import { Other } from 'interface/screens/error'
import { __DEV__, SUPER } from "../../../common/ulti/constants";
import AsyncSelect from 'react-select/async';
import * as CONSTANTS from 'common/ulti/constants';
import * as tbDanhSachDemo from 'controller/services/tbDanhSachDemoServices'
import * as tbDonViHanhChinh from 'controller/services/tbDonViHanhChinhServices'
import * as cmFunction from 'common/ulti/commonFunction'
import { PORT, HTTP_API } from "../../../../config";

class DanhSach extends Component {
  constructor(props) {
    super(props)
    this.state = {
      danhsach: [],
      form: {},
      tinhthanh: [],
      tinhthanhSelected: null,
      quanhuyen: [],
      quanhuyenSelected: null,

      cbCheckAll: false,
      modalIsOpen: false,
      searchIsOpen: false,

      page: CONSTANTS.DEFAULT_PAGE,
      pagesize: CONSTANTS.DEFAULT_PAGESIZE,
      _size: 0,
      _total_pages: 0,
      filter: null,
    }
  }

  componentDidMount = async () => {
    this._getDanhSachDemo(this._createFilter())
  }

  componentDidUpdate(prevProps) {
    let { location } = this.props
    if (location !== prevProps.location) {
      this._getDanhSachDemo(this._createFilter())
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

  _getDanhSachDemo = async (query) => {
    let data = await tbDanhSachDemo.getAll(query)
    this.state.danhsach = data && data._embedded ? data._embedded : [];
    this.state._size = data._size || 0
    this.state._total_pages = data._total_pages || 0
    this.state.cbCheckAll = false
    this.forceUpdate()
  }

  _handleAddToggle = () => {
    this.state.modalIsOpen = !this.state.modalIsOpen
    this.forceUpdate()
  }

  _handleSearchToggle = () => {
    this.state.searchIsOpen = !this.state.searchIsOpen
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
        axiosReq.push(tbDanhSachDemo.deleteById(item._id.$oid || item._id))
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
    this._getDanhSachDemo(this._createFilter())
  }

  _handleLockMulti = async () => {
    let { danhsach } = this.state, axiosReq = [], count = 0
    danhsach.forEach((item, index) => {
      if (item.checked)
        axiosReq.push(tbDanhSachDemo.lockById(item._id.$oid || item._id))
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
    this._getDanhSachDemo(this._createFilter())
  }

  _handleDeleteOne = async (id) => {
    let axiosRes = await tbDanhSachDemo.deleteById(id)
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: "Xóa thành công" }))
      this._getDanhSachDemo(this._createFilter())
    }
  }

  _handleChiTiet = (id) => {
    let url = '/danh-sach-demo/' + id
    this.props.history.push(url)
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
    let myRows = [['Tiêu đề của bảng']], maxCol = 0
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
      { s: { r: 0, c: 0 }, e: { r: 0, c: maxCol } },
      { s: { r: 1, c: 6 }, e: { r: 1, c: 7 } }
    ]
    // xuất file
    let ws = XLSX.utils.aoa_to_sheet(myRows);
    ws["!merges"] = merge;
    let wb = XLSX.utils.book_new();
    //add thêm nhiều Sheet vào đây cũng đc
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "DataTable (" + new Date() + ").xlsx")
  }

  //THÊM MỚI Ở MODAL
  _handleLoadTinhThanhOptions = (inputValue, callback) => {
    clearTimeout(this.state.searchTinhThanhTimeout);
    this.state.searchTinhThanhTimeout = setTimeout(async () => {
      let filter = {}
      filter.page = 1
      filter.pagesize = 1000
      filter.count = true
      filter.filter = JSON.stringify({ Ten: cmFunction.regexText(inputValue), Loai: 'Tinh' });
      filter = new URLSearchParams(filter).toString()
      let donvihanhchinh = await tbDonViHanhChinh.getAll(filter)
      donvihanhchinh = donvihanhchinh && donvihanhchinh._embedded ? donvihanhchinh._embedded : []
      let tinhthanh = cmFunction.convertSelectOptions(donvihanhchinh, '_id.$oid', 'Ten')
      this.state.tinhthanh = tinhthanh
      this.forceUpdate()
      callback(tinhthanh);
    }, 500);
  };

  _handleTinhThanhChange = async (sel) => {
    this.state.tinhthanhSelected = sel
    let filter = { filter: { Loai: 'QuanHuyen' } }
    if (sel) {
      filter.filter['MaCapTren'] = sel.Ma
    }
    filter.filter = JSON.stringify(filter.filter)
    filter = new URLSearchParams(filter).toString()
    let quanhuyen = await tbDonViHanhChinh.getAll(filter)
    quanhuyen = quanhuyen && quanhuyen._embedded ? quanhuyen._embedded : []
    this.state.quanhuyen = cmFunction.convertSelectOptions(quanhuyen, '_id.$oid', 'Ten')
    this.state.quanhuyenSelected = null
    this.forceUpdate()
  }

  _handleLoadQuanHuyenOptions = (inputValue, callback) => {
    clearTimeout(this.state.searchQuanHuyenTimeout);
    this.state.searchQuanHuyenTimeout = setTimeout(async () => {
      let filter = { filter: { Ten: cmFunction.regexText(inputValue), Loai: 'QuanHuyen' } }
      filter.page = 1
      filter.pagesize = 1000
      filter.count = true
      if (this.state.tinhthanhSelected) {
        filter.filter['MaCapTren'] = this.state.tinhthanhSelected.Ma
      }
      filter.filter = JSON.stringify(filter.filter);
      filter = new URLSearchParams(filter).toString()
      let donvihanhchinh = await tbDonViHanhChinh.getAll(filter)
      donvihanhchinh = donvihanhchinh && donvihanhchinh._embedded ? donvihanhchinh._embedded : []
      let quanhuyen = cmFunction.convertSelectOptions(donvihanhchinh, '_id.$oid', 'Ten')
      this.state.quanhuyen = quanhuyen
      this.forceUpdate()
      callback(quanhuyen);
    }, 500);
  };

  _handleQuanHuyenChange = (sel) => {
    this.state.quanhuyenSelected = sel
    this.forceUpdate()
  }

  _handleChangeElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.value
    this.forceUpdate()
  }

  _handleSave = async (stay) => {
    let { form, tinhthanhSelected, quanhuyenSelected } = this.state
    let axiosReq = form
    if (tinhthanhSelected) axiosReq.TinhThanh = tinhthanhSelected
    if (quanhuyenSelected) axiosReq.QuanHuyen = quanhuyenSelected
    let axiosRes = await tbDanhSachDemo.create(axiosReq)
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Tạo công dân thành công' }))
      this.state.form = {}
      this.state.tinhthanhSelected = null
      this.state.quanhuyenSelected = null
      this.forceUpdate()
      this._getDanhSachDemo(this._createFilter())
      if (!stay) this._handleAddToggle()
    }
  }

  render() {
    let { LoginRes } = this.props
    let { danhsach, form, cbCheckAll, modalIsOpen, searchIsOpen } = this.state
    let { tinhthanhSelected, quanhuyen, quanhuyenSelected } = this.state
    let { page, pagesize, _size, _total_pages } = this.state
    let checkSuperAdmin = LoginRes.roles === SUPER.roles

    try {
      return (
        <React.Fragment>
          <div className="main portlet fade-in">
            <BreadCrumbs title={"Danh sách demo"} route={[{ label: 'Danh sách demo', value: '/danh-sach-demo' }]} />
            <div className="portlet-title">
              <div className="caption">
                <i className="fas fa-grip-vertical" />Danh sách demo
              </div>
              <div className="action">
                <button onClick={this._handleSearchToggle} className="btn btn-sm btn-outline-info border-radius" title="Tìm kiếm">
                  <i className="fas fa-search" />
                </button>
                <button onClick={() => this._handleExportExcel('dataTable')} className="btn btn-sm btn-outline-info border-radius" title="Xuất excel">
                  <i className="fas fa-download" />
                </button>
                <a target="_blank" href={"http://localhost:" + PORT + "/report/index.html?file=BaoCaoMau" + "&services=" + HTTP_API + "/api/statistic/bao-cao-mau&token=" + LoginRes.access_token} className="btn btn-sm btn-outline-info border-radius" title="Xuất báo cáo">
                  <i className="fas fa-print"></i>
                </a>
              </div>
            </div>
            <Search isOpen={searchIsOpen} history={this.props.history} options={CONSTANTS.SEARCH_DEMO} />
            <div className="card">
              <div className="card-header">
                {/* <button onClick={this._handleAddToggle} className="btn btn-sm btn-outline-primary border-radius">
                  <i className="fas fa-plus" />Thêm (action)
                </button> */}
                <Link to={'/danh-sach-demo/0'} className="btn btn-sm btn-outline-primary border-radius">
                  <i className="fas fa-plus" />Thêm
                </Link>
                <button onClick={() => this._handleConfirmDelete(true, 0)} className="btn btn-sm btn-outline-danger border-radius">
                  <i className="fas fa-trash" />Xóa
                </button>
                <button onClick={this._handleLockMulti} className="btn btn-sm btn-outline-dark border-radius">
                  <i className="fas fa-lock" />Khóa
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
                        <th>Trạng thái</th>
                        <th>Tỉnh thành</th>
                        <th>Quận huyện</th>
                        {/* <th colSpan="2">Ghi chú</th> */}
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
                          <td>{item.HoTen}</td>
                          <td>{item.isActive !== false ? 'Kích hoạt' : 'Khóa'}</td>
                          <td>{item.TinhThanh.Ten}</td>
                          <td>{item.QuanHuyen.Ten}</td>
                          <td>{item.GhiChu}</td>
                          {checkSuperAdmin && <td><span style={{ color: 'red' }}>{item.isActive ? '' : 'Đã xóa'}</span></td>}
                          {/* <td>Test colSpan</td> */}
                          <td>
                            <Link to={'/danh-sach-demo/' + item._id.$oid || item._id} title="Chi tiết" className="btn btn-sm btn-outline-info border-radius"><i className="fas fa-pencil-alt" /></Link>
                            {/* <button onClick={() => this._handleChiTiet(item._id.$oid || item._id)} title="Chi tiết" className="btn btn-sm btn-outline-info border-radius">
                              <i className="fas fa-eye" />
                            </button> */}
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
          {/* THÊM MỚI Ở MODAL */}
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={this._handleAddToggle}
          >
            <div className="card">
              <div className="card-header">
                <label className='caption'>Thêm mới</label>
                <button onClick={this._handleAddToggle} className="pull-right btn btn-sm btn-outline-danger border-radius">
                  <i className="far fa-times-circle"></i>
                </button>
              </div>

              <div className="card-body">
                <div className="form-body">
                  <div className="form-row form-group form-custom">
                    <label className="col-md-3 mb-0">Họ tên</label>
                    <input className="col-md-9 form-control" onChange={this._handleChangeElement} value={form.HoTen || ''} type="text" id="HoTen" placeholder="Nhập họ tên" />
                  </div>
                  <div className="form-row form-group form-custom">
                    <label className="col-md-3 mb-0">Tỉnh thành</label>
                    <div className="col-md-9 pl-0 pr-0">
                      <AsyncSelect
                        className=""
                        classNamePrefix="form-control"
                        placeholder="Tỉnh thành ..."
                        loadOptions={this._handleLoadTinhThanhOptions}
                        onChange={this._handleTinhThanhChange}
                        value={tinhthanhSelected}
                        isClearable
                        isSearchable
                        defaultOptions
                      />
                    </div>
                    <input type="hidden" className="form-control" id="tinhthanh" />
                  </div>
                  <div className="form-row form-group form-custom">
                    <label className="col-md-3 mb-0">Quận huyện</label>
                    <div className="col-md-9 pl-0 pr-0">
                      <AsyncSelect
                        className=""
                        classNamePrefix="form-control"
                        placeholder="Quận huyện ..."
                        loadOptions={this._handleLoadQuanHuyenOptions}
                        onChange={this._handleQuanHuyenChange}
                        value={quanhuyenSelected}
                        isClearable
                        isSearchable
                        defaultOptions={quanhuyen}
                      />
                    </div>
                    <input type="hidden" className="form-control" id="quanhuyen" />
                  </div>
                  <div className="form-row form-group form-custom">
                    <label className="col-md-3 mb-0">Ghi chú</label>
                    <textarea className="col-md-9 form-control" onChange={this._handleChangeElement} value={form.GhiChu || ''} id="GhiChu" rows="3" />
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <button onClick={() => this._handleSave(false)} className="pull-right btn btn-sm btn-outline-primary border-radius">
                  <i className="fas fa-save"></i>Lưu
            </button>
                <button onClick={() => this._handleSave(true)} className="pull-right btn btn-sm btn-outline-primary border-radius">
                  <i className="far fa-save"></i>Lưu và tiếp tục
            </button>
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
export default connect(mapStateToProps)(DanhSach);
