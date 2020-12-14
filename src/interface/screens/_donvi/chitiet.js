import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Page404, Other } from 'interface/screens/error';
import { BreadCrumbs, FormInput, FormWrapper } from 'interface/components';
import { __DEV__ } from '../../../common/ulti/constants';
import * as CONSTANTS from 'common/ulti/constants';
import { confirmAlert } from 'react-confirm-alert';
import axios from 'axios';
import moment from 'moment';
import * as cmFunction from 'common/ulti/commonFunction';
import * as tbDonVi from 'controller/services/tbDonViServices';
import { fetchToastNotify } from '../../../controller/redux/app-reducer';

class ChiTiet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isInsert: this.props.match.params.id == 0,
      error: false,
      form: {},

      donvi: [],
      donviSelected: null,

      searchTimeout: null,
    };
  }

  componentDidMount() {
    this._init();
  }

  componentDidUpdate(prevProps) {
    let { match } = this.props;
    if (match.params.id !== prevProps.match.params.id) {
      this._init();
    }
  }

  _init = async () => {
    let id = this.props.match.params.id;
    this.state.isInsert = id == 0;
    if (!this.state.isInsert) {
      let data = await tbDonVi.getById(id);
      if (data) {
        this.state.form = data;
        this.state.donviSelected = cmFunction.convertSelectedOptions(
          data.DonViCha,
          '_id.$oid',
          'Ten'
        );
      }
      if (!data) this.state.error = true;
      this.forceUpdate();
    }
  };

  _handleChangeElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.value;
    this.forceUpdate();
  };
  
  _handleChangeCheckElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.checked;
    this.forceUpdate();
  };

  //SELECT LOAD DATA
  _handleLoadOptions = (inputValue, callback) => {
    clearTimeout(this.state.searchTimeout);
    this.state.searchTimeout = setTimeout(async () => {
      let filter = {};
      filter.page = 1;
      filter.pagesize = 1000;
      filter.count = true
      filter.filter = JSON.stringify({ Ten: cmFunction.regexText(inputValue) });
      filter = new URLSearchParams(filter).toString();
      let dsDonVi = await tbDonVi.getAll(filter);
      dsDonVi = dsDonVi && dsDonVi._embedded ? dsDonVi._embedded : [];
      let id = this.props.match.params.id;
      let find = dsDonVi.find(ele => ele._id.$oid == id);
      find = find ? [find] : [];
      let donvi = cmFunction.convertSelectOptions(dsDonVi, '_id.$oid', 'Ten', find);
      this.state.donvi = donvi;
      this.forceUpdate();
      callback(donvi);
    }, 500);
  };

  _handleCheckMaDV = async () => {
    if (!this.state.form.Ma) return false;
    let filter = { filter: {} };
    filter.count = true;
    filter.page = 1;
    filter.pagesize = 1;
    filter.filter['Ma'] = this.state.form.Ma;
    // if (!this.state.isInsert) {
    //   console.log('this.state.form: ', this.state.form);
    //   filter.filter['_id.$oid'] = {$nin: [this.state.form._id.$oid]};
    // }
    filter.filter = JSON.stringify(filter.filter)
    filter = new URLSearchParams(filter).toString()
    let data = await tbDonVi.getAll(filter)
    return data._returned;
  }

  _handleDonViChange = (sel) => {
    this.state.donviSelected = sel;
    this.forceUpdate();
  };
  //ACTION
  _handleConfirm = (_type = 0, _action, _stay = false) => {
    confirmAlert({
      title: `${!_type ? 'Sửa' : _type < 0 ? 'Xóa' : 'Thêm'} dữ liệu`,
      message: `Xác nhận ${
        !_type ? 'sửa' : _type < 0 ? 'xóa' : 'thêm'
        } dữ liệu`,
      buttons: [
        {
          label: 'Không',
          onClick: () => {
            return;
          },
        },
        {
          label: 'Có',
          onClick: () => _action(_stay),
        },
      ],
    });
  };

  _handleDelete = async () => {
    if (this.state.isInsert) return;
    let { id } = this.props.match.params;
    let axiosRes = await tbDonVi.deleteById(id);
    if (axiosRes) {
      this.props.dispatch(
        fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Xóa thành công' })
      );
      cmFunction.goBack();
    }
  };

  _handleSave = (stay) => {
    if (cmFunction.formValidate(this, 'form')) {
      this._handleConfirm(this.state.isInsert, this._handleUpdateInfo, stay);
    } else {
      confirmAlert({
        title: 'Dữ liệu không hợp lệ',
        message: 'Vui lòng nhập đúng định dạng dữ liệu',
        buttons: [
          {
            label: 'Đồng ý',
            onClick: () => {
              return;
            },
          },
        ],
      });
      return;
    }
  };

  _handleUpdateInfo = async (stay) => {
    let { form, donviSelected, isInsert } = this.state;
    let axiosReq = form;
    axiosReq.STT = Number(axiosReq.STT || 9999);
    axiosReq.DonViCha = null;
    axiosReq.Cap = 0;
    if (donviSelected) {
      axiosReq.DonViCha = cmFunction.clone(donviSelected);
      // axiosReq.Ma = isInsert
      //   ? `${axiosReq.DonViCha.Ma}.${moment().valueOf()}`
      //   : axiosReq.Ma;
      axiosReq.Cap = donviSelected.Cap++;
      delete axiosReq.DonViCha.value;
      delete axiosReq.DonViCha.label;
    }
    let axiosRes;
    if (isInsert) {
      axiosRes = await tbDonVi.create(axiosReq);
    } else {
      let id = this.props.match.params.id;
      axiosRes = await tbDonVi.updateById(id, axiosReq);
    }
    if (axiosRes) {
      this.props.dispatch(
        fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' })
      );
      if (isInsert) {
        this.state.form = {};
        this.state.donviSelected = null;
        this.forceUpdate();
      }
      if (!stay) cmFunction.goBack();
    }
  };

  render() {
    let { isInsert, form, error, donviSelected } = this.state;
    if (error) return <Page404 />;
    try {
      return (
        <div className="main portlet fade-in">
          <BreadCrumbs
            title={'Chi tiết'}
            route={[
              { label: 'Quản lý đơn vị', value: '/quan-ly/don-vi' },
              { label: 'Thông tin đơn vị', value: '/quan-ly/don-vi/:id' },
            ]}
          />
          <div className="portlet-title">
            <div className="caption">
              <i className="fas fa-grip-vertical" />
              Thông tin đơn vị
            </div>
            <div className="action">
              <button
                onClick={() => this._handleSave(false)}
                className="btn btn-sm btn-outline-primary border-radius"
              >
                <i className="fas fa-save" />
                Lưu
              </button>
              <button
                onClick={() => this._handleSave(true)}
                className="btn btn-sm btn-outline-primary border-radius"
              >
                <i className="far fa-save" />
                Lưu và tiếp tục
              </button>
              <div className="btn btn-sm dropdown">
                <button
                  className="btn btn-sm btn-outline-primary border-radius dropdown-toggle"
                  type="button"
                  id="dropdownMenuButton"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <i className="fas fa-share" />
                  Khác
                </button>
                <div
                  className="dropdown-menu"
                  aria-labelledby="dropdownMenuButton"
                >
                  <button onClick={cmFunction.goBack} className="btn btn-sm">
                    <i className="fas fa-reply" />
                    Quay lại
                  </button>
                  <button onClick={this._init} className="btn btn-sm">
                    <i className="fas fa-sync" />
                    Làm mới
                  </button>
                  {!isInsert && (
                    <button
                      onClick={() =>
                        this._handleConfirm(-1, this._handleDelete)
                      }
                      className="btn btn-sm"
                    >
                      <i className="fas fa-trash" />
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div
              className="card-header d-flex justify-content-between"
              data-toggle="collapse"
              data-target="#collapseExample"
              aria-expanded="true"
              aria-controls="collapseExample"
            >
              <span className="caption-subject">Thông tin cơ bản</span>
              <span>
                <i className="fas fa-chevron-up" />
                <i className="fas fa-chevron-down" />
              </span>
            </div>
            <div className="collapse show" id="collapseExample">
              <div className="card-body">
                <div className="form-body" ref="form">
                  <FormWrapper>
                    <FormInput
                      parentClass="col-md-6"
                      labelClass="col-md-6"
                      inputClass="col-md-6"
                      required={true}
                      disabled={false}
                      readOnly={false}
                      onChange={this._handleChangeElement}
                      defaultValue={form.Ten || ''}
                      type="text"
                      id="Ten"
                      label="Tên đơn vị"
                      placeholder="Nhập tên đơn vị"
                    />
                    <FormInput
                      parentClass="col-md-6"
                      labelClass="col-md-6"
                      inputClass="col-md-6"
                      required={true}
                      disabled={!isInsert}
                      readOnly={!isInsert}
                      onChange={this._handleChangeElement}
                      defaultValue={form.Ma || ''}
                      type="text"
                      id="Ma"
                      label="Mã đơn vị"
                      // _handleCheck={this._handleCheckMaDV} 
                      />
                  </FormWrapper>
                  {/* <div className="form-row form-group form-custom form-no-spacing">
                    <label className="col-md-3 mb-0">Trực thuộc<span className="required">*</span></label>
                    <div className="col-md-9 pl-0 pr-0">
                      <AsyncSelect
                        className=""
                        classNamePrefix="form-control"
                        placeholder="Trực thuộc ..."
                        loadOptions={this._handleLoadOptions}
                        // onInputChange={this._handleInputChange}
                        onChange={this._handleDonViChange}
                        value={donviSelected}
                        isClearable
                        isSearchable
                        defaultOptions
                      />
                    </div>
                    <input type="hidden" className="form-control" id="donvi" />
                  </div> */}
                  <FormWrapper>
                    <FormInput
                      loadOptions={this._handleLoadOptions}
                      onChange={this._handleDonViChange}
                      required={false}
                      defaultValue={donviSelected}
                      isClearable={true}
                      isSearchable={true}
                      defaultOptions={true}
                      type="select"
                      label="Trực thuộc"
                      placeholder="Chọn đơn vị trực thuộc ..."
                    />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      required={false}
                      disabled={false}
                      readOnly={false}
                      onChange={this._handleChangeElement}
                      defaultValue={form.DiaChi || ''}
                      type="text"
                      id="DiaChi"
                      label="Địa chỉ"
                      placeholder="Nhập địa chỉ"
                    />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      onChange={this._handleChangeElement}
                      defaultValue={form.DiaChiBanDo}
                      type="gmapaddress"
                      id="DiaChiBanDo"
                      label="Địa chỉ bản đồ"
                      placeholder="Nhập địa chỉ bản đồ"
                    />
                  </FormWrapper>
                  {/* <div className="form-group form-row form-custom form-no-spacing">
                    <label className="col-md-3 mb-0">Địa chỉ bản đồ</label>
                    <GmapAddress className='form-control' onChange={this._handleChangeElement} value={form.DiaChiBanDo} id="DiaChiBanDo" placeholder="Địa chỉ bản đồ" />
                  </div> */}
                  <FormWrapper>
                    <FormInput
                      parentClass="col-md-6"
                      labelClass="col-md-6"
                      inputClass="col-md-6"
                      required={false}
                      disabled={false}
                      readOnly={false}
                      pattern={CONSTANTS.VN_PHONE_NUMBER}
                      onChange={this._handleChangeElement}
                      defaultValue={form.SoDienThoai || ''}
                      type="text"
                      id="SoDienThoai"
                      label="SĐT liên hệ"
                      errorLabel="SĐT không hợp lệ"
                      placeholder="Nhập SĐT liên hệ"
                    />
                    <FormInput
                      parentClass="col-md-6"
                      labelClass="col-md-6"
                      inputClass="col-md-6"
                      required={false}
                      disabled={false}
                      readOnly={false}
                      pattern=""
                      onChange={this._handleChangeElement}
                      defaultValue={form.STT || ''}
                      type="number"
                      id="STT"
                      label="STT"
                      placeholder="Nhập số thứ tự"
                    />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      type="textarea"
                      onChange={this._handleChangeElement}
                      rows="3"
                      defaultValue={form.GhiChu || ''}
                      id="GhiChu"
                      label="Ghi chú"
                    />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      type="checkbox"
                      onChange={this._handleChangeCheckElement}
                      defaultValue={form.KichHoat}
                      id="KichHoat"
                      label="Kích hoạt"
                    />
                  </FormWrapper>
                </div>
              </div>
              <div className="card-footer"></div>
            </div>
          </div>
        </div>
      );
    } catch (e) {
      if (__DEV__) console.log(e);
      return <Other data={e} />;
    }
  }
}

const mapStateToProps = (state) => {
  let { LoginRes, General } = state;
  return { LoginRes, General };
};
export default connect(mapStateToProps)(ChiTiet);
