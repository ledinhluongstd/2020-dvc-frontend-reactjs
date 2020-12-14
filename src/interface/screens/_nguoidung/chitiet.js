import React, { Component } from "react";
import { connect } from "react-redux";
import { Page404, Other } from 'interface/screens/error'
import { BreadCrumbs, FormInput, FormWrapper } from "interface/components";
import { __DEV__ } from "../../../common/ulti/constants";
import * as CONSTANTS from 'common/ulti/constants';
import { confirmAlert } from 'react-confirm-alert';
import AsyncSelect from 'react-select/async';
import * as cmFunction from 'common/ulti/commonFunction'
import * as tbUsers from 'controller/services/tbUsersServices'
import * as tbDonVi from 'controller/services/tbDonViServices'
import { fetchToastNotify } from "../../../controller/redux/app-reducer";

class ChiTiet extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isInsert: this.props.match.params.id == 0,
      error: false,
      form: {},
      donvi: [],
      donviSelected: null
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
    this.state.isInsert = this.props.match.params.id == 0
    let id = this.props.match.params.id
    if (!this.state.isInsert) {
      let data = await tbUsers.getById(id)
      if (data) {
        delete data.pwd
        this.state.form = data
        this.state.donviSelected = cmFunction.convertSelectedOptions(data.DonVi, '_id.$oid', 'Ten')
      }
      if (!data) this.state.error = true
      this.forceUpdate()
    }
  }

  _handleChangeElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.value
    this.forceUpdate()
  }

  _handleCheckAccount = async () => {
    if (!this.state.form.account) return false;
    let filter = { filter: {} };
    filter.count = true;
    filter.page = 1;
    filter.pagesize = 1;
    filter.filter['account'] = this.state.form.account;
    filter.filter = JSON.stringify(filter.filter)
    filter = new URLSearchParams(filter).toString()
    let data = await tbUsers.getAll(filter)
    return data._returned;
  }

  _handleChangeCheckElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.checked
    this.forceUpdate()
  }

  //SELECT
  _handleLoadOptions = (inputValue, callback) => {
    clearTimeout(this.state.searchTimeout);
    this.state.searchTimeout = setTimeout(async () => {
      let filter = {}
      filter.page = 1
      filter.pagesize = 1000
      filter.count = true
      filter.filter = JSON.stringify({ Ten: cmFunction.regexText(inputValue) });
      filter = new URLSearchParams(filter).toString()
      let dsDonVi = await tbDonVi.getAll(filter)
      dsDonVi = (dsDonVi && dsDonVi._embedded ? dsDonVi._embedded : [])
      let donvi = cmFunction.convertSelectOptions(dsDonVi, '_id.$oid', 'Ten')
      this.state.donvi = donvi
      this.forceUpdate()
      callback(donvi);
    }, 500);
  };

  _handleDonViChange = (sel) => {
    this.state.donviSelected = sel
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

    let { LoginRes } = this.props
    if (LoginRes._id === id) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.WARNING, data: "Không thể xóa tài khoản của bạn" }))
      return
    }

    let axiosRes = await tbUsers.deleteById(id)
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
    let { form, isInsert, donviSelected } = this.state
    let axiosRes, axiosReq = cmFunction.clone(form)
    axiosReq.DonVi = null
    if (donviSelected) {
      axiosReq.DonVi = cmFunction.clone(donviSelected)
      delete axiosReq.DonVi.value
      delete axiosReq.DonVi.label
    }

    if (isInsert) {
      axiosRes = await tbUsers.create(axiosReq)
    } else {
      let id = this.props.match.params.id;
      axiosRes = await tbUsers.updateById(id, axiosReq)
    }
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' }))
      if (isInsert) {
        this.state.form = {}
        this.state.donviSelected = null
        this.forceUpdate()
      }
      if (!stay) cmFunction.goBack()
    }
  }

  render() {
    let { isInsert, form, error } = this.state
    let { donvi, donviSelected } = this.state
    if (error)
      return <Page404 />
    try {
      return (
        <div className="main portlet fade-in">
          <BreadCrumbs title={"Chi tiết"}
            route={[{ label: 'Quản lý người dùng', value: '/quan-ly/nguoi-dung' }, { label: 'Thông tin người dùng', value: '/phan-quyen/nhom-quyen/:id' }]}
          />
          <div className="portlet-title">
            <div className="caption">
              <i className="fas fa-grip-vertical" />Thông tin người dùng
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
                      id="name"
                      type="text"
                      required={true}
                      disabled={false}
                      readOnly={false}
                      label="Tên người dùng"
                      placeholder="Nhập tên người dùng"
                      defaultValue={form.name || ''}
                      onChange={this._handleChangeElement} />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      id="account"
                      type="text"
                      required={true}
                      disabled={!isInsert}
                      readOnly={!isInsert}
                      label="Tài khoản người dùng"
                      placeholder="Nhập tài khoản người dùng"
                      defaultValue={form.account || ''}
                      onChange={this._handleChangeElement}
                      _handleCheck={this._handleCheckAccount} />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      required={isInsert} disabled={false} readOnly={false} onChange={this._handleChangeElement}
                      defaultValue={form.pwd || ''} type="password" id="pwd" label="Mật khẩu" placeholder="Nhập mật khẩu" />
                  </FormWrapper>
                  <FormWrapper>
                    {/* <label className="col-md-3 mb-0">Đơn vị<span className="required">*</span></label>
                    <div className="col-md-9 pl-0 pr-0">
                      <AsyncSelect
                        className=""
                        classNamePrefix="form-control"
                        placeholder="Đơn vị ..."
                        loadOptions={this._handleLoadOptions}
                        // onInputChange={this._handleInputChange}
                        onChange={this._handleDonViChange}
                        value={donviSelected}
                        isClearable
                        isSearchable
                        defaultOptions
                      /> */}
                    <FormInput
                      loadOptions={this._handleLoadOptions} onChange={this._handleDonViChange} required={true}
                      defaultValue={donviSelected} isClearable={true} isSearchable={true} defaultOptions={true}
                      type="select" label="Đơn vị" placeholder="Chọn đơn vị ..." />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput parentClass="col-md-6" labelClass="col-md-6" inputClass="col-md-6"
                      required={false} disabled={false} readOnly={false} onChange={this._handleChangeElement}
                      defaultValue={form.email || ''} type="text" id="email" label="Email" placeholder="Nhập email" />
                    <FormInput parentClass="col-md-6" labelClass="col-md-6" inputClass="col-md-6"
                      required={false} disabled={false} readOnly={false} pattern={CONSTANTS.VN_PHONE_NUMBER} onChange={this._handleChangeElement}
                      defaultValue={form.SoDienThoai || ''} type="text" id="SoDienThoai" label="SĐT liên hệ" errorLabel="SĐT không hợp lệ" placeholder="Nhập SĐT người dùng" />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput type="textarea" onChange={this._handleChangeElement} rows="3" defaultValue={form.GhiChu || ''} id="GhiChu" label="Ghi chú" />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      type="checkbox" onChange={this._handleChangeCheckElement}
                      defaultValue={form.KichHoat} id="KichHoat" label="Kích hoạt" />
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
