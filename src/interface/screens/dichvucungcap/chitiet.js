import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Page404, Other } from 'interface/screens/error';
import { BreadCrumbs, FormInput, FormWrapper } from 'interface/components';
import { __DEV__ } from '../../../common/ulti/constants';
import * as CONSTANTS from 'common/ulti/constants';
import { confirmAlert } from 'react-confirm-alert';
import * as cmFunction from 'common/ulti/commonFunction';
import * as tbDanhMucUngDung from 'controller/services/tbDanhMucUngDungServices'
import * as tbDichVu from 'controller/services/tbDVCServices'
import { fetchToastNotify } from '../../../controller/redux/app-reducer';

class ChiTiet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isInsert: this.props.match.params.id == 0,
      error: false,
      form: {},
      nhomdichvu: [],
      nhomdichvuSelected: null,
      urlDichVu: [],
      urlDichVuSelected: null,
      searchNDvTimeout: null,
      searchUrlTimeout: null,
      check: false
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
      let data = await tbDichVu.getById(id);
      if (data) {
        this.state.form = data
        this.state.nhomdichvuSelected = cmFunction.convertSelectedOptions(
          data.NhomDichVu,
          '_id.$oid',
          'Ten'
        )
        this.state.urlDichVuSelected = cmFunction.convertSelectedOptions(
          data.Url,
          'Id',
          'Ten'
        )
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
  _handleLoadNhomDichvu = (inputValue, callback) => {
    clearTimeout(this.state.searchNDvTimeout);
    this.state.searchNDvTimeout = setTimeout(async () => {
      let filter = {};
      filter.page = 1;
      filter.pagesize = 1000;
      filter.count = true
      filter.filter = JSON.stringify({ Ten: cmFunction.regexText(inputValue), MaDanhMuc: "NhomDichVuCungCap" });
      filter = new URLSearchParams(filter).toString();
      let dsNhomDichVu = await tbDanhMucUngDung.getAll(filter);
      dsNhomDichVu = dsNhomDichVu && dsNhomDichVu._embedded ? dsNhomDichVu._embedded : [];
      let id = this.props.match.params.id;
      let find = dsNhomDichVu.find(ele => ele._id.$oid == id);
      find = find ? [find] : [];
      let nhomdichvu = cmFunction.convertSelectOptions(dsNhomDichVu, '_id.$oid', 'Ten', find);
      nhomdichvu.sort(function (a, b) {
        if (a.STT !== b.STT) {
          return a.STT - b.STT
        }
        var nameA = cmFunction.changeAlias(a.Ten);
        var nameB = cmFunction.changeAlias(b.Ten);
        if (nameA === nameB) {
          return 0;
        }
        return nameA > nameB ? 1 : -1
      });
      this.state.nhomdichvu = nhomdichvu;
      this.forceUpdate();
      callback(nhomdichvu);
    }, 500);
  };

  _handleNhomDichVuChange = (value) => {
    this.state.nhomdichvuSelected = value;
    this.forceUpdate();
  }

  _handleLoadUrl = (inputValue, callback) => {
    clearTimeout(this.state.searchUrlTimeout);
    this.state.searchUrlTimeout = setTimeout(async () => {
      let filter = {};
      filter.page = 1;
      filter.pagesize = 1000;
      filter.count = true
      filter.filter = JSON.stringify({ Ten: cmFunction.regexText(inputValue) });
      filter = new URLSearchParams(filter).toString();
      let dsUrlDichVu = await tbDichVu.getAllServices(filter);
      dsUrlDichVu = dsUrlDichVu && dsUrlDichVu._embedded ? dsUrlDichVu._embedded : [];
      let id = this.props.match.params.id;
      let find = dsUrlDichVu.find(ele => ele.Id == id);
      find = find ? [find] : [];
      let urlDichVu = cmFunction.convertSelectOptions(dsUrlDichVu, 'Id', 'Ten', find);
      this.state.urlDichVu = urlDichVu;
      this.forceUpdate();
      callback(urlDichVu);
    }, 500);
  }

  _handleUrlChange = (value) => {
    this.state.urlDichVuSelected = value;
    this.forceUpdate();
  }

  //ACTION
  _handleConfirm = (_type = 0, _action, _stay = false) => {
    confirmAlert({
      title: `${!_type ? 'Sửa' : _type < 0 ? 'Xóa' : 'Thêm'} dữ liệu`,
      message: `Xác nhận ${!_type ? 'sửa' : _type < 0 ? 'xóa' : 'thêm'
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
    let axiosRes = await tbDichVu.deleteById(id);
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
    let { form, isInsert, nhomdichvuSelected, urlDichVuSelected } = this.state;
    let axiosReq = form;
    axiosReq.STT = Number(axiosReq.STT || 9999);
    axiosReq.NhomDichVu = null;
    axiosReq.Url = null;
    axiosReq.Cap = 0;
    if (nhomdichvuSelected) {
      axiosReq.NhomDichVu = cmFunction.clone(nhomdichvuSelected);
      delete axiosReq.NhomDichVu.value;
      delete axiosReq.NhomDichVu.label
    }
    if (urlDichVuSelected) {
      axiosReq.Url = cmFunction.clone(urlDichVuSelected);
      delete axiosReq.Url.value;
      delete axiosReq.Url.label
    }
    let axiosRes;
    if (isInsert) {
      axiosRes = await tbDichVu.create(axiosReq);
    } else {
      let id = this.props.match.params.id;
      axiosRes = await tbDichVu.updateById(id, axiosReq);
    }
    if (axiosRes) {
      this.props.dispatch(
        fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' })
      );
      if (isInsert) {
        this.state.form = {};
        this.state.nhomdichvuSelected = null;
        this.state.urlDichVuSelected = null;
        this.forceUpdate();
      }
      if (!stay) cmFunction.goBack();
    }
  };

  render() {
    let { isInsert, form, error, nhomdichvuSelected, urlDichVuSelected } = this.state;
    if (error) return <Page404 />;
    try {
      return (
        <div className="main portlet">
          <BreadCrumbs
            title={'Chi tiết dịch vụ'}
            route={[
              { label: 'Dịch vụ cung cấp', value: '/dich-vu-cung-cap' },
              { label: 'Thông tin dịch vụ', value: '/dich-vu-cung-cap/:id' },
            ]}
          />
          <div className="portlet-title">
            <div className="caption">
              <i className="fas fa-grip-vertical" />
              Thông tin dịch vụ
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
                      label="Tên dịch vụ"
                      placeholder="Nhập tên dịch vụ"
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
                      label="Mã dịch vụ"
                    />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      loadOptions={this._handleLoadUrl}
                      onChange={this._handleUrlChange}
                      required={true}
                      defaultValue={urlDichVuSelected}
                      isClearable={true}
                      isSearchable={true}
                      isDisabled={false}
                      defaultOptions={true}
                      type="select"
                      label="Dịch vụ chức năng"
                      placeholder="Chọn dịch vụ chức năng ..."
                    />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      loadOptions={this._handleLoadNhomDichvu}
                      onChange={this._handleNhomDichVuChange}
                      required={true}
                      defaultValue={nhomdichvuSelected}
                      isClearable={true}
                      isSearchable={true}
                      isDisabled={false}
                      defaultOptions={true}
                      type="select"
                      label="Nhóm dịch vụ cung cấp"
                      placeholder="Chọn nhóm dịch vụ cung cấp ..."
                    />
                  </FormWrapper>
                  <FormWrapper>
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
                      defaultValue={form.DuLieuKiemThu || ''}
                      id="DuLieuKiemThu"
                      label="Dữ liệu kiểm thử"
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
