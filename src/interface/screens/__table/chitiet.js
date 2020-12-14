import React, { Component } from "react";
import { connect } from "react-redux";
import { Page404, Other } from 'interface/screens/error'
import { BreadCrumbs, FormWrapper, FormInput } from "interface/components";
import { __DEV__ } from "../../../common/ulti/constants";
import * as CONSTANTS from 'common/ulti/constants';
import { confirmAlert } from 'react-confirm-alert';
import AsyncSelect from 'react-select/async';
import Select from 'react-select'
import axios from 'axios'
import moment from 'moment'
import * as cmFunction from 'common/ulti/commonFunction'
import * as tbDonViHanhChinh from 'controller/services/tbDonViHanhChinhServices'
import * as tbDanhSachDemo from 'controller/services/tbDanhSachDemoServices'
import { fetchToastNotify } from "../../../controller/redux/app-reducer";

class ChiTiet extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isInsert: this.props.match.params.id == 0,
      error: false,
      form: {},

      tinhthanh: [],
      tinhthanhSelected: null,
      quanhuyen: [],
      quanhuyenSelected: null,
    }
  }

  componentDidMount() {
    this._init()
  }

  componentDidUpdate(prevProps) {
    let { match } = this.props
    if (match.params.id !== prevProps.match.params.id) {
      this._init()
    }
  }

  _init = async () => {
    let id = this.props.match.params.id
    this.state.isInsert = id == 0
    if (!this.state.isInsert) {
      let data = await tbDanhSachDemo.getById(id)
      if (data) {
        this.state.form = data
        this.state.tinhthanhSelected = cmFunction.convertSelectedOptions(data.TinhThanh, '_id.$oid', 'Ten')
        this.state.quanhuyenSelected = cmFunction.convertSelectedOptions(data.QuanHuyen, '_id.$oid', 'Ten')
      }
      if (!data) this.state.error = true
      this.forceUpdate()
    }
  }

  _handleChangeElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.value
    this.forceUpdate()
  }

  //SELECT
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

  //ACTION
  _handleConfirm = (_type = 0, _action, _stay = false) => {
    confirmAlert({
      title: `${!_type ? 'Sửa' : (_type < 0 ? 'Xóa' : 'Thêm')} dữ liệu`,
      message: `Xác nhận ${!_type ? 'sửa' : (_type < 0 ? 'xóa' : 'thêm')} dữ liệu`,
      buttons: [
        {
          label: 'Không',
          onClick: () => { return }
        },
        {
          label: 'Có',
          onClick: () => _action(_stay)
        }
      ]
    });
  }

  _handleDelete = async () => {
    if (this.state.isInsert) return
    let { id } = this.props.match.params
    let axiosRes = await tbDanhSachDemo.deleteById(id)
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: "Xóa thành công" }))
      cmFunction.goBack()
    }
  }
  _handleSave = (stay) => {
    if (cmFunction.formValidate(this, 'form')) {
      this._handleConfirm(this.state.isInsert, this._handleUpdateInfo, stay)
    } else {
      confirmAlert({
        title: 'Dữ liệu không hợp lệ',
        message: 'Vui lòng nhập đúng định dạng dữ liệu',
        buttons: [
          {
            label: 'Đồng ý',
            onClick: () => { return }
          }
        ]
      });
      return;
    }
  }
  _handleUpdateInfo = async (stay) => {
    let { form, tinhthanhSelected, quanhuyenSelected, isInsert } = this.state
    let axiosReq = form
    if (tinhthanhSelected) {
      axiosReq.TinhThanh = cmFunction.clone(tinhthanhSelected)
      delete axiosReq.TinhThanh.value
      delete axiosReq.TinhThanh.label
    }
    if (quanhuyenSelected) {
      axiosReq.QuanHuyen = cmFunction.clone(quanhuyenSelected)
      delete axiosReq.QuanHuyen.value
      delete axiosReq.QuanHuyen.label
    }
    let axiosRes
    if (isInsert) {
      axiosRes = await tbDanhSachDemo.create(axiosReq)
    } else {
      let id = this.props.match.params.id;
      axiosRes = await tbDanhSachDemo.updateById(id, axiosReq)
    }
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' }))
      if (isInsert) {
        this.state.form = {}
        this.state.tinhthanhSelected = null
        this.state.quanhuyenSelected = null
        this.forceUpdate()
      }
      if (!stay) cmFunction.goBack()
    }
  }

  render() {
    let { isInsert, form, error, tinhthanhSelected, quanhuyen, quanhuyenSelected } = this.state
    if (error)
      return <Page404 />
    try {
      return (
        <div className="main portlet fade-in">
          <BreadCrumbs title={"Chi tiết"}
            route={[{ label: 'Danh sách demo', value: '/danh-sach-demo' }, { label: 'Chi tiết demo', value: '/danh-sach-demo/:id' }]}
          />
          <div className="portlet-title">
            <div className="caption">
              <i className="fas fa-grip-vertical" />Thông tin đơn vị
              </div>
            <div className="action">
              <button onClick={() => this._handleSave(false)} className="btn btn-sm btn-outline-primary border-radius">
                <i className="fas fa-save" />Lưu
                </button>
              <button onClick={() => this._handleSave(true)} className="btn btn-sm btn-outline-primary border-radius">
                <i className="far fa-save" />Lưu và tiếp tục
                </button>
              <div className="btn btn-sm dropdown">
                <button className="btn btn-sm btn-outline-primary border-radius dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i className="fas fa-share" />Khác
                </button>
                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <button onClick={cmFunction.goBack} className="btn btn-sm">
                    <i className="fas fa-reply" />Quay lại
                  </button>
                  <button onClick={this._init} className="btn btn-sm">
                    <i className="fas fa-sync" />Làm mới
                  </button>
                  {!isInsert && <button onClick={() => this._handleConfirm(-1, this._handleDelete)} className="btn btn-sm">
                    <i className="fas fa-trash" />
                    Xóa
                  </button>}
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header d-flex justify-content-between" data-toggle="collapse" data-target="#collapseExample" aria-expanded="true" aria-controls="collapseExample">
              <span className="caption-subject">Thông tin cơ bản</span>
              <span>
                <i className="fas fa-chevron-up" />
                <i className="fas fa-chevron-down" />
              </span>

            </div>
            <div className="collapse show" id="collapseExample">
              <div className="card-body ">
                  <div className="form-body" ref="form">
                  <FormWrapper>
                    <FormInput
                      required={true} disabled={false} readOnly={false} onChange={this._handleChangeElement}
                      defaultValue={form.HoTen || ''} type="text" id="HoTen" label="Họ tên" placeholder="Nhập họ tên" />
                  </FormWrapper>
                  <FormWrapper>
                    {/* <label className="col-md-3 mb-0">Tỉnh thành</label>
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
                    <input type="hidden" className="form-control" id="tinhthanh" /> */}
                    <FormInput
                      loadOptions={this._handleLoadTinhThanhOptions} onChange={this._handleTinhThanhChange} required={false}
                      defaultValue={tinhthanhSelected} isClearable={true} isSearchable={true} defaultOptions={true}
                      type="select" label="Tỉnh thành" placeholder="Chọn tỉnh thành..." />
                  </FormWrapper>
                  <FormWrapper>
                    {/* <label className="col-md-3 mb-0">Quận huyện</label>
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
                    <input type="hidden" className="form-control" id="quanhuyen" /> */}
                    <FormInput
                      loadOptions={this._handleLoadQuanHuyenOptions} onChange={this._handleQuanHuyenChange} required={false}
                      defaultValue={quanhuyenSelected} isClearable={true} isSearchable={true} defaultOptions={true}
                      type="select" label="Quận huyện" placeholder="Chọn quận huyện..." />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput type="textarea" onChange={this._handleChangeElement} rows="3" defaultValue={form.GhiChu || ''} id="GhiChu" label="Ghi chú" />
                  </FormWrapper>
                </div>

              </div>
              <div className="card-footer">
              </div>
            </div>
          </div>
        </div>
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
