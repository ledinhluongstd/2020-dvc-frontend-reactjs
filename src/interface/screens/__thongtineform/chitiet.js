import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Page404, Other } from 'interface/screens/error';
import { BreadCrumbs, FormInput, FormWrapper } from 'interface/components';
import { __DEV__ } from '../../../common/ulti/constants';
import * as CONSTANTS from 'common/ulti/constants';
import { confirmAlert } from 'react-confirm-alert';
import * as cmFunction from 'common/ulti/commonFunction';
import * as tbThongTinEform from 'controller/services/tbThongTinEformServices';
import { fetchToastNotify } from '../../../controller/redux/app-reducer';
import Modal from 'react-modal';

class ChiTiet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isInsert: this.props.match.params.id == 0,
      error: false,
      form: {},
      cbCheckAll: {},

      kieudulieu: [],
      kieudulieuSelected: null,
      kieudulieuTimeout: null,

      modalIsOpen: false,
      tbKieudulieu: [],
      formModal: {},
      modalEditIndex: -1,
      checkShowTableOptions: false
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
    this.state.isInsert = this.props.match.params.id == 0;
    let id = this.props.match.params.id;
    if (!this.state.isInsert) {
      let data = await tbThongTinEform.getById(id);
      if (data) {
        this.state.form = data
        this.state.tbKieudulieu = data.LuaChon
        this.state.kieudulieuSelected = cmFunction.convertSelectedOptions(data.KieuDuLieu, 'Ma', 'Ten')
        this.state.checkShowTableOptions = data.KieuDuLieu && (data.KieuDuLieu.Ma === 'select' || data.KieuDuLieu.Ma === 'radio' || data.KieuDuLieu.Ma === 'checkbox')
      }
      if (!data) this.state.error = true;
      this.forceUpdate();
    }
  };

  _handleChangeElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.value;
    this.forceUpdate();
  };

  _handleModalChangeElement = (evt) => {
    this.state.formModal[evt.target.id] = evt.target.value;
    this.forceUpdate();
  };

  _handleChangeCheckElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.checked;
    this.forceUpdate();
  };

  _handleKieuDuLieuLoadOptions = (unputValue, callback) => {
    clearTimeout(this.state.kieudulieuTimeout);
    this.state.kieudulieuTimeout = setTimeout(async () => {
      let kieudulieu = []
      Object.keys(CONSTANTS.KIEU_DU_LIEU).map(function (key, index) {
        kieudulieu.push(CONSTANTS.KIEU_DU_LIEU[`${key}`])
      });
      this.state.kieudulieu = kieudulieu;
      this.forceUpdate();
      callback(kieudulieu);
    }, 500);

  }

  _handleKieuDuLieuChange = (sel) => {
    this.state.kieudulieuSelected = sel
    this.state.checkShowTableOptions = sel && (sel.value === 'select' || sel.value === 'radio' || sel.value === 'checkbox')
    this.forceUpdate()
    // if()
  }

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
    let axiosRes = await tbThongTinEform.deleteById(id);
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
    let { form, isInsert, checkShowTableOptions, kieudulieuSelected, tbKieudulieu } = this.state;
    let axiosReq = form;
    axiosReq.STT = Number(axiosReq.STT || 9999);
    let axiosRes;
    if (kieudulieuSelected) {
      axiosReq.KieuDuLieu = {
        Ten: kieudulieuSelected.label,
        Ma: kieudulieuSelected.value
      }
    }
    if (checkShowTableOptions) {
      axiosReq.LuaChon = cmFunction.clone(tbKieudulieu)
    }
    if (isInsert) {
      axiosRes = await tbThongTinEform.create(axiosReq);
    } else {
      let id = this.props.match.params.id;
      axiosRes = await tbThongTinEform.updateById(id, axiosReq);
    }

    if (axiosRes) {
      this.props.dispatch(
        fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' })
      );
      if (isInsert) {
        this.state.form = {};
        this.state.kieudulieuSelected = null
        this.state.formModal = {}
        this.state.tbKieudulieu = []
        this.forceUpdate();
      }
      if (!stay) cmFunction.goBack();
    }
  };

  _handleAddToggle = () => {
    this.state.modalIsOpen = !this.state.modalIsOpen
    this.state.modalEditIndex = -1
    this.forceUpdate()
  }

  _handleEditOptions = (index) => {
    this.state.formModal = cmFunction.clone(this.state.tbKieudulieu[`${index}`])
    this.state.modalEditIndex = index
    this.state.modalIsOpen = true
    this.forceUpdate()
  }

  _handleDeleteOptions = (index) => {
    this.state.tbKieudulieu.splice(index, 1)
    this.forceUpdate()
  }

  _handleSaveOptions = (stay) => {
    let { formModal, modalEditIndex } = this.state
    if (cmFunction.formValidate(this, 'formModal')) {
      if (modalEditIndex !== -1) {
        this.state.tbKieudulieu[modalEditIndex] = cmFunction.clone(formModal)
      } else {
        this.state.tbKieudulieu.push(formModal)
        this.state.formModal = {}
      }
      this.forceUpdate()
      if (!stay) this._handleAddToggle()
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
  }

  render() {
    let { isInsert, form, formModal, error } = this.state;
    let { kieudulieuSelected, modalIsOpen, tbKieudulieu, modalEditIndex, checkShowTableOptions } = this.state
    if (error) return <Page404 />;
    try {
      return (
        <div className="main portlet fade-in">
          <BreadCrumbs
            title={'Chi tiết'}
            route={[
              { label: 'Quản lý thông tin biểu mẫu', value: '/quan-ly/thong-tin-eform' },
              {
                label: 'Thông tin biểu mẫu',
                value: '/quan-ly/thong-tin-eform/:id',
              },
            ]}
          />
          <div className="portlet-title">
            <div className="caption">
              <i className="fas fa-grip-vertical" />
              Thông tin biểu mẫu
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
          <div className="card mb-4">
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
              <div className="card-body ">
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
                      label="Tên"
                      placeholder="Nhập tên thông tin biểu mẫu"
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
                      label="Mã"
                      placeholder="Nhập mã thông tin biểu mẫu"
                    />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      loadOptions={this._handleKieuDuLieuLoadOptions}
                      onChange={this._handleKieuDuLieuChange}
                      required={true}
                      defaultValue={kieudulieuSelected}
                      isClearable={true}
                      isSearchable={true}
                      defaultOptions={true}
                      type="select"
                      label="Kiểu dữ liệu"
                      placeholder="Chọn kiểu dữ liệu..."
                    />
                  </FormWrapper>
                  {checkShowTableOptions && <div className="col-md-12 form-row form-custom form-no-spacing mb-1">
                    <label className="col-md-3 mb-0">Các lựa chọn</label>
                    <div className='col-md-9  pl-0 pr-0 fix-first'>
                      <button onClick={this._handleAddToggle} className="pull-left btn btn-sm btn-outline-primary border-radius">
                        <i className="fas fa-plus"></i>Thêm
                      </button>
                    </div>
                  </div>}
                  {checkShowTableOptions && <div className="col-md-12 form-row form-custom form-no-spacing">
                    <div className='col-md-9 offset-md-3  pl-0 pr-0 fix-first'>
                      <table className="table table-sm table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                        <thead>
                          <tr>
                            <th>STT</th>
                            <th>Tiêu đề</th>
                            <th>Giá trị</th>
                            <th>#</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tbKieudulieu.map((item, index) => {
                            return <tr key={index} >
                              <td>{index + 1}</td>
                              <td>{item.TieuDe}</td>
                              <td>{item.GiaTri}</td>
                              <td>
                                <button onClick={() => this._handleEditOptions(index)} title="Sửa" className="btn btn-sm btn-outline-info border-radius">
                                  <i className="fas fa-pencil-alt" />
                                </button>
                                <button onClick={() => this._handleDeleteOptions(index)} title="Xóa" className="btn btn-sm btn-outline-danger border-radius">
                                  <i className="fas fa-trash" />
                                </button>
                              </td>
                            </tr>
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>}

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
                      parentClass="col-md-6"
                      labelClass="col-md-6"
                      inputClass=""
                      type="checkbox"
                      onChange={this._handleChangeCheckElement}
                      defaultValue={form.KichHoat}
                      id="KichHoat"
                      label="Kích hoạt"
                    />
                  </FormWrapper>
                </div>
              </div>
              <div className="card-footer" />
            </div>
          </div>

          <Modal
            isOpen={modalIsOpen}
            onRequestClose={this._handleAddToggle}
          >
            <div className="card">
              <div className="card-header">
                <label className='caption'>{modalEditIndex === -1 ? 'Thêm mới' : 'Cập nhật'}</label>
                <button onClick={this._handleAddToggle} className="pull-right btn btn-sm btn-outline-danger border-radius">
                  <i className="far fa-times-circle"></i>
                </button>
              </div>

              <div className="card-body">
                <div className="form-body" ref='formModal'>
                  <FormWrapper>
                    <FormInput
                      // parentClass="col-md-6"
                      // labelClass="col-md-6"
                      // inputClass="col-md-6"
                      required={true}
                      disabled={false}
                      readOnly={false}
                      onChange={this._handleModalChangeElement}
                      defaultValue={formModal.TieuDe || ''}
                      type="text"
                      id="TieuDe"
                      label="Tiêu đề"
                      placeholder="Nhập tiêu đề"
                    />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      // parentClass="col-md-6"
                      // labelClass="col-md-6"
                      // inputClass="col-md-6"
                      required={true}
                      disabled={false}
                      readOnly={false}
                      onChange={this._handleModalChangeElement}
                      defaultValue={formModal.GiaTri || ''}
                      type="text"
                      id="GiaTri"
                      label="Giá trị"
                      placeholder="Nhập giá trị"
                    />
                  </FormWrapper>
                </div>
              </div>
              <div className="card-footer">
                <button onClick={() => this._handleSaveOptions(false)} className="pull-right btn btn-sm btn-outline-primary border-radius">
                  <i className="fas fa-save"></i>Lưu
            </button>
                <button onClick={() => this._handleSaveOptions(true)} className="pull-right btn btn-sm btn-outline-primary border-radius">
                  <i className="far fa-save"></i>Lưu và tiếp tục
            </button>
                <button onClick={this._handleAddToggle} className="pull-right btn btn-sm btn-outline-danger border-radius">
                  <i className="far fa-times-circle"></i>Đóng
            </button>
              </div>
            </div>
          </Modal>
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
