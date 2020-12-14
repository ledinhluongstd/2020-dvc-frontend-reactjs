import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Page404, Other } from 'interface/screens/error';
import { BreadCrumbs, FormInput, FormWrapper } from 'interface/components';
import { __DEV__ } from '../../../common/ulti/constants';
import * as CONSTANTS from 'common/ulti/constants';
import { confirmAlert } from 'react-confirm-alert';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import axios from 'axios';
import * as cmFunction from 'common/ulti/commonFunction';
import * as tbNhomQuyen from 'controller/services/tbNhomQuyenServices';
import * as tbData from 'controller/services/tbDataServices';
import { fetchToastNotify } from '../../../controller/redux/app-reducer';

class ChiTiet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isInsert: this.props.match.params.id == 0,
      error: false,
      form: {},
      danhsach: [],
      cbCheckAll: {},
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
      let data = await tbNhomQuyen.getById(id);
      let danhsach = await tbData.getAll();
      danhsach = danhsach && danhsach._embedded ? danhsach._embedded : [];
      if (data) {
        let { QuyenChucNang } = data;
        this.state.form = data;
        danhsach.forEach((item, index) => {
          QuyenChucNang.forEach((qcn) => {
            if (item.Ma === qcn.Ma) danhsach[`${index}`] = qcn;
          });
        });
        this.state.danhsach = danhsach;
      }
      if (!data) this.state.error = true;
      this.forceUpdate();
    } else {
      let danhsach = await tbData.getAll();
      danhsach = danhsach && danhsach._embedded ? danhsach._embedded : [];
      this.state.danhsach = danhsach;
      this.forceUpdate();
    }
  };

  _getAllTbData = async () => {
    let danhsach = await tbData.getAll();
    danhsach = danhsach && danhsach._embedded ? danhsach._embedded : [];
    this.state.danhsach = danhsach;
    this.forceUpdate();
  };

  _handleChangeElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.value;
    this.forceUpdate();
  };

  _handleChangeCheckElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.checked;
    this.forceUpdate();
  };

  _handleCheckAll = (evt, method) => {
    this.state.danhsach.forEach((item, index) => {
      item.HanhDong[`${method}`] = evt.target.checked;
    });
    this.state.cbCheckAll[`${method}`] = evt.target.checked;
    this.forceUpdate();
  };

  _handleCheckItem = (evt, data, method) => {
    this.state.danhsach.forEach((item, index) => {
      if (item.Ma === data.Ma) item.HanhDong[`${method}`] = evt.target.checked;
    });
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
    let axiosRes = await tbNhomQuyen.deleteById(id);
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
    let { form, isInsert } = this.state;
    let axiosReq = form;
    axiosReq.QuyenChucNang = this.state.danhsach;
    axiosReq.STT = Number(axiosReq.STT || 9999);
    let axiosRes;
    if (isInsert) {
      axiosRes = await tbNhomQuyen.create(axiosReq);
    } else {
      let id = this.props.match.params.id;
      axiosRes = await tbNhomQuyen.updateById(id, axiosReq);
    }

    if (axiosRes) {
      this.props.dispatch(
        fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' })
      );
      if (isInsert) {
        this.state.form = {};
        this.forceUpdate();
      }
      if (!stay) cmFunction.goBack();
    }
  };

  render() {
    let { isInsert, form, error } = this.state;
    let { danhsach, cbCheckAll } = this.state;
    if (error) return <Page404 />;
    try {
      return (
        <div className="main portlet fade-in">
          <BreadCrumbs
            title={'Chi tiết'}
            route={[
              { label: 'Quản lý nhóm quyền', value: '/phan-quyen/nhom-quyen' },
              {
                label: 'Thông tin nhóm quyền',
                value: '/phan-quyen/nhom-quyen/:id',
              },
            ]}
          />
          <div className="portlet-title">
            <div className="caption">
              <i className="fas fa-grip-vertical" />
              Thông tin nhóm quyền
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
                      label="Tên nhóm quyền"
                      placeholder="Nhập tên nhóm quyền"
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
                      label="Mã nhóm quyền"
                      placeholder="Nhập mã nhóm quyền"
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

          <div className="card">
            <div
              className="card-header d-flex justify-content-between"
              data-toggle="collapse"
              data-target="#collapseChucNang"
              aria-expanded="true"
              aria-controls="collapseChucNang"
            >
              <span className="caption-subject">Chức năng</span>
              <span>
                <i className="fas fa-chevron-up" />
                <i className="fas fa-chevron-down" />
              </span>
            </div>
            <div className="collapse show" id="collapseChucNang">
              <div className="card-body ">
                <div className="form-body">
                  <div className="col">
                    <table
                      className="table table-bordered"
                      id="dataTable"
                      width="100%"
                      cellSpacing="0"
                      ref="dataTable"
                    >
                      <thead>
                        <tr>
                          <th>STT</th>
                          <th>Tên</th>
                          <th>
                            <input
                              type="checkbox"
                              id="POST"
                              checked={!!cbCheckAll.POST}
                              onChange={(evt) =>
                                this._handleCheckAll(evt, 'POST')
                              }
                            />&nbsp;
                            Thêm
                          </th>
                          <th>
                            <input
                              type="checkbox"
                              id="GET"
                              checked={!!cbCheckAll.GET}
                              onChange={(evt) =>
                                this._handleCheckAll(evt, 'GET')
                              }
                            /> &nbsp;
                            Xem
                          </th>
                          <th>
                            <input
                              type="checkbox"
                              id="PATCH"
                              checked={!!cbCheckAll.PATCH}
                              onChange={(evt) =>
                                this._handleCheckAll(evt, 'PATCH')
                              }
                            />&nbsp;
                            Sửa
                          </th>
                          <th>
                            <input
                              type="checkbox"
                              id="DELETE"
                              checked={!!cbCheckAll.DELETE}
                              onChange={(evt) =>
                                this._handleCheckAll(evt, 'DELETE')
                              }
                            />&nbsp;
                            Xóa
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {danhsach.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td className="text-center">{index + 1}</td>
                              <td>{item.Ten}</td>
                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  checked={item.HanhDong.POST || false}
                                  onChange={(evt) =>
                                    this._handleCheckItem(evt, item, 'POST')
                                  }
                                />
                              </td>
                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  checked={item.HanhDong.GET || false}
                                  onChange={(evt) =>
                                    this._handleCheckItem(evt, item, 'GET')
                                  }
                                />
                              </td>
                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  checked={item.HanhDong.PATCH || false}
                                  onChange={(evt) =>
                                    this._handleCheckItem(evt, item, 'PATCH')
                                  }
                                />
                              </td>
                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  checked={item.HanhDong.DELETE || false}
                                  onChange={(evt) =>
                                    this._handleCheckItem(evt, item, 'DELETE')
                                  }
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              {/* <div className="card-footer">
              </div> */}
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
