import React, { Component } from "react";
import { connect } from "react-redux";
import { BreadCrumbs, Pagination } from "interface/components";
import Modal from 'react-modal';
import axios from 'axios'
import Select from 'react-select'
import queryString from 'query-string'
import { fetchToastNotify } from "../../../controller/redux/app-reducer";
import { Link } from "react-router-dom";
import { confirmAlert } from 'react-confirm-alert';
import { Other } from 'interface/screens/error'
import { __DEV__, SUPER } from "../../../common/ulti/constants";
import * as CONSTANTS from 'common/ulti/constants';
import * as tbNhomQuyenNguoiDung from 'controller/services/tbNhomQuyenNguoiDungServices'
import * as tbNhomQuyen from 'controller/services/tbNhomQuyenServices'
import * as tbUsers from 'controller/services/tbUsersServices'
import * as cmFunction from 'common/ulti/commonFunction'
import { isEmpty } from "../../../common/ulti/commonFunction";

class PhanQuyen extends Component {
  constructor(props) {
    super(props)
    this.state = {
      danhsach: [], // danh sách người dùng nhóm quyền hiện tại
      dsNguoiDung: [], // danh sách người dùng chưa phân quyền hiện tại
      cbCheckAll: false,
      modalIsOpen: false,

      page: CONSTANTS.DEFAULT_PAGE,
      pagesize: CONSTANTS.DEFAULT_PAGESIZE,
      _size: 0,
      _total_pages: 0,
      filter: null,
      search: {},
      danhsachNhomQuyen: [],
      nhomquyenSelected: null,

      error: false
    }
  }

  componentDidMount = async () => {
    try {
      let danhsachNhomQuyen, nhomquyenSelected, query = new URLSearchParams({ sort_by: 'STT' }).toString()
      danhsachNhomQuyen = await tbNhomQuyen.getAll(query)
      danhsachNhomQuyen = danhsachNhomQuyen && danhsachNhomQuyen._embedded ? danhsachNhomQuyen._embedded : [];
      danhsachNhomQuyen = this._convertDanhSachNhomQuyen(danhsachNhomQuyen)
      nhomquyenSelected = danhsachNhomQuyen[0]
      if (isEmpty(nhomquyenSelected)) return
      this.setState({ danhsachNhomQuyen, nhomquyenSelected }, () => {
        this._getNhomQuyenNguoiDung(this._createFilter())
      })
    } catch (e) {
      this.state.error = true
      this.forceUpdate()
    }
  }

  componentDidUpdate(prevProps) {
    let { location } = this.props
    if (location !== prevProps.location) {
      this._getNhomQuyenNguoiDung(this._createFilter())
    }
  }

  _convertDanhSachNhomQuyen = (arr) => {
    let dsNhomQuyen = []
    arr.forEach((item, index) => {
      item.value = item.Ma
      item.label = item.Ten
      dsNhomQuyen.push(item)
    })
    return dsNhomQuyen
  }

  _createFilter = () => {
    let { nhomquyenSelected, search } = this.state
    let parsed = queryString.parse(this.props.location.search);
    let { page, pagesize } = parsed
    let filter = { 'NhomQuyen.Ma': nhomquyenSelected.Ma }
    // if (search.Ten) filter['NguoiDung.name'] = cmFunction.regexText(search.Ten.trim())
    if (search.Ten) filter['$or'] = [
      { 'NguoiDung.name': cmFunction.regexText(search.Ten.trim()) },
      { 'NguoiDung.account': cmFunction.regexText(search.Ten.trim()) }
    ]
    parsed.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
    parsed.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    parsed.count = true
    parsed.filter = JSON.stringify(filter)

    this.state.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
    this.state.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    this.forceUpdate()
    return new URLSearchParams(parsed).toString()
  }

  _getNhomQuyenNguoiDung = async (query) => {
    let data = await tbNhomQuyenNguoiDung.getAll(query)
    this.state.danhsach = data && data._embedded ? data._embedded : [];
    this.state._size = data._size || 0
    this.state._total_pages = data._total_pages || 0
    this.state.cbCheckAll = false
    this.forceUpdate()
  }

  _handleNhomQuyenChange = (sel) => {
    // this.state.nhomquyenSelected = sel
    // this.forceUpdate()
    this.setState({ nhomquyenSelected: sel }, () => {
      this._getNhomQuyenNguoiDung(this._createFilter())
    })
  }

  _handleChangeSearchElement = (evt) => {
    this.state.search[evt.target.id] = evt.target.value
    this.forceUpdate()
  }

  _handleSearch = () => {
    this._getNhomQuyenNguoiDung(this._createFilter())
  }

  //MODAL PHÂN QUYỀN 
  _createFilterNguoiDung = () => {
    let { search, danhsach } = this.state
    let codes = [], filter = {}, parsed = {}
    danhsach.forEach((item, index) => {
      if (item.isActive)
        codes.push(item.NguoiDung.code)
    })
    filter = { 'code': { $nin: codes }, KichHoat: true, isActive: true }
    if (search.TenModal) filter['$or'] = [
      { 'name': cmFunction.regexText(search.TenModal.trim()) },
      { 'account': cmFunction.regexText(search.TenModal.trim()) }
    ]

    parsed.page = 1//parseInt(page) || CONSTANTS.DEFAULT_PAGE
    parsed.pagesize = 1000//parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    parsed.count = true
    parsed.filter = JSON.stringify(filter)

    return new URLSearchParams(parsed).toString()
  }

  _handleAddToggle = () => {
    this.state.modalIsOpen = !this.state.modalIsOpen
    this.forceUpdate()
    if (this.state.modalIsOpen) {
      this._getDanhSachNguoiDung(this._createFilterNguoiDung())
    } else {
      this.state.search.TenModal = ''
      this.forceUpdate()
      this._getNhomQuyenNguoiDung(this._createFilter())
    }
  }

  _getDanhSachNguoiDung = async (query) => {
    let dsNguoiDung = await tbUsers.getAll(query)
    dsNguoiDung = dsNguoiDung && dsNguoiDung._embedded ? dsNguoiDung._embedded : [];
    this.state.dsNguoiDung = dsNguoiDung
    this.forceUpdate()
  }

  _handleSearchDanhSachNguoiDung = () => {
    this._getDanhSachNguoiDung(this._createFilterNguoiDung())
  }

  _handleConfirmAddUser = (usr) => {
    let { nhomquyenSelected } = this.state
    confirmAlert({
      title: 'Thêm người dùng',
      message: 'Xác nhận thêm người dùng ' + usr.name + ' vào nhóm ' + nhomquyenSelected.Ten,
      buttons: [
        {
          label: 'Không',
          onClick: () => { return }
        },
        {
          label: 'Có',
          onClick: () => this._handleAddUser(usr)
        }
      ]
    });
  }

  _handleConfirmRemoveUser = (item) => {
    let { nhomquyenSelected } = this.state
    confirmAlert({
      title: 'Xóa người dùng',
      message: 'Xác nhận xóa người dùng ' + item.NguoiDung.name + ' khỏi nhóm ' + nhomquyenSelected.Ten,
      buttons: [
        {
          label: 'Không',
          onClick: () => { return }
        },
        {
          label: 'Có',
          onClick: () => this._handleRemoveUser(item._id.$oid || item._id)
        }
      ]
    });
  }

  _checkUserIsExist = async (usr, per) => {
    let filter = {}, parsed = {}
    filter = {
      'NguoiDung.account': usr.account,
      'NhomQuyen.Ma': per.Ma,
      isActive: true
    }
    parsed.page = 1
    parsed.pagesize = 1000
    parsed.count = true
    parsed.filter = JSON.stringify(filter)
    parsed = new URLSearchParams(parsed).toString()
    let axiosRes = await tbNhomQuyenNguoiDung.getAll(parsed)
    return !!axiosRes._returned
  }

  _handleAddUser = async (usr) => {
    // xử lý lưu user vào nhóm quyền
    let { nhomquyenSelected, dsNguoiDung } = this.state
    // kiểm tra user đã có trong nhóm quyền chưa nếu chưa thì thêm
    if (await this._checkUserIsExist(usr, nhomquyenSelected)) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.WARNING, data: 'Người dùng đã được phân quyền này' }))
      await this._getNhomQuyenNguoiDung(this._createFilter())
      await this._getDanhSachNguoiDung(this._createFilterNguoiDung())
      return
    }
    let NhomQuyen = cmFunction.clone(nhomquyenSelected)
    delete NhomQuyen.value
    delete NhomQuyen.label
    delete usr.pwd
    let axiosReq = {
      NhomQuyen: NhomQuyen,
      NguoiDung: usr
    }

    let axiosRes = await tbNhomQuyenNguoiDung.create(axiosReq)
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' }))
      let index = dsNguoiDung.findIndex(x => x._id.$oid === usr._id.$oid)
      if (index !== -1) this.state.dsNguoiDung.splice(index, 1)
      this.forceUpdate()
    }
  }

  _handleRemoveUser = async (id) => {
    let axiosRes = await tbNhomQuyenNguoiDung.deleteById(id)
    if (axiosRes) {
      this._getNhomQuyenNguoiDung(this._createFilter())
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' }))
    }
  }

  render() {
    let { danhsach, cbCheckAll, danhsachNhomQuyen, nhomquyenSelected } = this.state
    let { page, pagesize, _size, _total_pages, search, error } = this.state
    let { modalIsOpen, dsNguoiDung } = this.state
    let { LoginRes } = this.props
    let checkSuperAdmin = LoginRes.roles === SUPER.roles

    if (error) return <Page404 />;

    try {
      return (
        <React.Fragment>
          <div className="main portlet fade-in">
            <BreadCrumbs title={"Danh sách phân quyền"} route={[{ label: 'Quản lý phân quyền', value: '/phan-quyen/phan-quyen' }]} />
            <div className="portlet-title">
              <div className="caption">
                <i className="fas fa-grip-vertical" />Danh sách phân quyền
              </div>
            </div>

            <div className="card-body pt-3 pb-3 card-search">
              <div className="form-body">
                <div className="form-row form-group form-custom">
                  <div className="col-md-4">
                    <Select
                      className=""
                      classNamePrefix="form-control"
                      placeholder="Nhóm quyền..."
                      options={danhsachNhomQuyen}
                      value={nhomquyenSelected}
                      isSearchable={false}
                      onChange={this._handleNhomQuyenChange}
                    />
                  </div>
                  <div className="col-md-4">
                    <input className="form-control" onChange={this._handleChangeSearchElement}
                      value={search.Ten || ''} type="text" id="Ten" placeholder='Tìm kiếm người dùng' />
                  </div>
                  <div className="col-md-4">
                    <button onClick={this._handleSearch} className="btn btn-outline-primary border-radius ">
                      <i className="fas fa-search" />Tìm kiếm
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              {/* <div className="card-header">
                <button onClick={this._handleAddToggle} className="btn btn-sm btn-outline-primary border-radius">
                  <i className="fas fa-plus" />Thêm
                </button>
              </div> */}
              <div className="card-body fix-first p-0">

                <div className="table-fix-head">
                  <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                    <thead>
                      <tr>
                        <th style={{ width: '20px' }}>STT</th>
                        <th>Người dùng</th>
                        {checkSuperAdmin && <th>***</th>}
                        <th className='text-center' style={{ width: '50px' }}>
                          <button onClick={this._handleAddToggle} className="btn btn-sm btn-primary border-radius">
                            <i className="fas fa-plus" />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {danhsach.map((item, index) => {
                        return <tr key={index} >
                          <td className='text-center'>{index + 1}</td>
                          <td><strong>{item.NguoiDung.name}</strong> ({item.NguoiDung.account})</td>
                          {checkSuperAdmin && <td><span style={{ color: 'red' }}>{item.isActive ? '' : 'Đã xóa'}</span></td>}
                          <td>
                            <button onClick={() => this._handleConfirmRemoveUser(item)} className="btn btn-sm btn-outline-danger border-radius">
                              <i className="fas fa-times-circle" />
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

          <Modal
            isOpen={modalIsOpen}
            onRequestClose={this._handleAddToggle}
          >
            <div className="card">
              <div className="card-header">
                <label className='caption'>Thêm người dùng vào nhóm quyền: {nhomquyenSelected ? nhomquyenSelected.Ten : ''}</label>
                <button onClick={this._handleAddToggle} className="pull-right btn btn-sm btn-outline-danger border-radius">
                  <i className="far fa-times-circle"></i>
                </button>
              </div>

              <div className="card-body fix-first">
                <div className="form-row form-group form-custom">
                  <div className="col-md-4">
                    <input className="form-control" onChange={this._handleChangeSearchElement}
                      value={search.TenModal || ''} type="text" id="TenModal" placeholder='Tìm kiếm người dùng' />
                  </div>
                  <div className="col-md-4">
                    <button onClick={this._handleSearchDanhSachNguoiDung} className="btn btn-outline-primary border-radius ">
                      <i className="fas fa-search" />Tìm kiếm
                    </button>
                  </div>
                </div>
                <div className="table-fix-head">
                  <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Người dùng</th>
                        <th>Thêm</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dsNguoiDung.map((item, index) => {
                        return <tr key={index} >
                          <td className='text-center'>{index + 1}</td>
                          <td><strong>{item.name}</strong> ({item.account})</td>
                          <td>
                            <button onClick={() => this._handleConfirmAddUser(item)} className="btn btn-sm btn-outline-primary border-radius">
                              <i className="fas fa-plus" />
                            </button>
                          </td>
                        </tr>
                      })}
                    </tbody>
                  </table>
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
export default connect(mapStateToProps)(PhanQuyen);
