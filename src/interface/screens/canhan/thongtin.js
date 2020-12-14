import React, { Component, useCallback } from "react";
import { connect } from "react-redux";
import { Page404 } from 'interface/screens/error'
import * as tbDanhSachDemo from 'controller/services/tbDanhSachDemoServices'
import * as tbUsers from 'controller/services/tbUsersServices'
import * as cmFunction from 'common/ulti/commonFunction'
import * as CONSTANTS from 'common/ulti/constants';
import { BreadCrumbs, FormInput, FileUpload, FormWrapper } from "../../components";
import { fetchToastNotify } from "../../../controller/redux/app-reducer";
import { fetchLoginSuccess } from "../../../controller/redux/login-fetch-reducers";
import { confirmAlert } from 'react-confirm-alert';
import axios from 'axios'

const MULTI_IMG = false;

class ThongTin extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: {},
      files: []
    }
  }

  componentDidMount = async () => {
    let { LoginRes } = this.props
    this.state.user = cmFunction.clone(LoginRes.user)
    this.forceUpdate()
  }

  _handleChangeElement = (evt) => {
    this.state.user[evt.target.id] = evt.target.value
    this.forceUpdate()
  }

  _handleData = (prop, val) => {
    this.state.user[prop] = val
    this.forceUpdate()
  }

  _handleSave = () => {
    if (!cmFunction.formValidate(this, 'form')) {
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
    confirmAlert({
      title: 'Sửa thông tin',
      message: 'Xác nhận sửa thông tin',
      buttons: [
        {
          label: 'Không',
          onClick: () => { return }
        },
        {
          label: 'Đồng ý',
          onClick: () => this._handleUpdateInfo()
        }
      ]
    });
  }

  _handleUpdateInfo = async () => {
    let LoginRes = cmFunction.clone(this.props.LoginRes)
    let axiosReq = cmFunction.clone(this.state.user)
    if (!axiosReq._id) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Không thể cập nhật tài khoản này' }))
      return
    }
    let id = axiosReq._id.$oid || axiosReq._id
    delete axiosReq._id
    delete axiosReq._etag

    let axiosRes = await tbUsers.changeProfile(id, axiosReq)
    if (axiosRes) {
      LoginRes.user = this.state.user
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Cập nhật thành công' }))
      this.props.dispatch(fetchLoginSuccess(LoginRes))
    }
  }

  onDropFiles = (files) => {
    let fileTemp = [];
    let icons = CONSTANTS.ICONSET_FOR_FILE;
    files.map(item => {
      let dupl = this.state.files.findIndex(file => file.name == item.name && file.size == item.size);
      if (dupl >= 0) return;
      let ic = icons.find(ele => ele.type.includes(item.type));
      if (ic) item["icon"] = ic;
      else item["icon"] = CONSTANTS.DEFAULT_IC_FOR_FILE;
      // if (item.size >= 10000000) {
      // this.props.dispatch(fetchToast({
      //   type: '',
      //   data: ('Tệp tin "' + item.name + '" quá dung lượng cho phép'),
      // }));
      // } else {
      //   fileTemp.push(item);
      // }
      fileTemp.push(item);
    });
    if (!fileTemp.length) return;
    if (fileTemp.length > 1) fileTemp = fileTemp.splice(0, 1);
    this.state.avatars = fileTemp;
    this.forceUpdate();
  }

  onRemoveFile = (data) => {
    if (!data) return;
    let { avatars } = this.state;
    let ind = avatars.findIndex(ele => ele.name == data.name && ele.type == data.type && ele.size == data.size);
    if (ind >= 0) {
      avatars.splice(ind, 1);
      this.forceUpdate();
    }
  }

  render() {
    let { user } = this.state
    return (
      <React.Fragment>
        <div className="main portlet fade-in">
          <BreadCrumbs title={"Chi tiết"}
            route={[{ label: 'Thông tin cá nhân', value: '/ca-nhan' }]}
          />
          <div className="portlet-title">
            <div className="caption">
              <i className="fas fa-grip-vertical" />&nbsp;&nbsp;Thông tin cá nhân
            </div>
            <div className="action">
              <button onClick={this._handleSave} className="btn btn-sm btn-outline-primary border-radius ">
                <i className="fas fa-save"></i>&nbsp;Lưu
              </button>&nbsp;
            <button onClick={cmFunction.goBack} className="btn btn-sm btn-outline-dark border-radius ">
                <i className="fas fa-reply"></i>&nbsp;Quay lại
              </button>
            </div>
          </div>
          <div className="card">
            <div className="card-header">
            </div>
            <div className="card-body">
              <div className="form-body" ref="form">
                <div className="form-row form-group form-wrap">
                  <FormInput required={false} disabled={true} readOnly={true} onChange={this._handleChangeElement}
                    id="account" defaultValue={user.account || ''} label="Tài khoản" />
                </div>
                <div className="form-row form-group form-wrap">
                  <FormInput required={false} disabled={false} readOnly={false} onChange={this._handleChangeElement}
                    id="name" defaultValue={user.name || ''} label="Họ tên" placeholder="Nhập họ tên" />
                </div>
                {/* <div className="form-row form-group form-custom">
                  <label className="col-md-3 mb-0">Email</label>
                  <input className="col-md-9 form-control" onChange={this._handleChangeElement} value={user.email || ''} type="email" id="email" />
                </div> */}

                {/* <Input parentClass="" labelClass="" required={false} inputClass="" disabled={false} readOnly={false}
                  type="text" id="email" label="Email" errorLabel="Email không hợp lệ" pattern={CONSTANTS.EMAIL_PATTERN}
                  onChange={this._handleChangeElement} /> */}

                <div className="form-row form-group form-wrap">
                  <FormInput required={false} disabled={false} readOnly={false} id="email"
                    label="Email" errorLabel="Email không hợp lệ" placeholder="Nhập Email liên hệ"
                    defaultValue={user.email || ''} pattern={CONSTANTS.EMAIL_PATTERN} onChange={this._handleChangeElement} />
                </div>

                {/* <div className="form-row form-group form-custom">
                  <label className="col-md-3 mb-0">Ảnh đại diện</label>
                  <input className="col-md-3 form-control btn btn-sm btn-outline-primary border-radius"
                    type="file"
                    id="avatar" name="avatar"
                    multiple
                    accept="image/*" />
                </div> */}

                {/* <FormWrapper>
                  <FileUpload
                    label="Chọn ảnh"
                    accept={CONSTANTS.IMAGE}
                    startWith={10}
                    endWith={4}
                    required={false}
                    readOnly={false}
                    disabled={false}
                    disableClick={false}
                    multiple={false}
                    files={this.state.avatars}
                    onDrop={this.onDropFiles}
                    onRemove={this.onRemoveFile}
                  />
                </FormWrapper> */}

                {/* <FormWrapper>
                  <FileUpload
                    label="Chọn file"
                    accept=".doc,.docx,.pdf,.xlsx,.xls,.ppt,.pptx"
                    startWith={15}
                    endWith={5}
                    required={true}
                    readOnly={false}
                    disabled={false}
                    disableClick={false}
                    multiple={true}
                    max={5}
                    files={this.state.files}
                    onDrop={this.onDropFiles}
                    onRemove={this.onRemoveFile}
                  />
                </FormWrapper> */}

              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  let { LoginRes } = state;
  return { LoginRes };
};
export default connect(mapStateToProps)(ThongTin);
