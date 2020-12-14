import React, { Component } from "react";
import { connect } from "react-redux";
import { Page404 } from 'interface/screens/error'
import * as tbDanhSachDemo from 'controller/services/tbDanhSachDemoServices'
import * as tbUsers from 'controller/services/tbUsersServices'
import * as cmFunction from 'common/ulti/commonFunction'
import * as CONSTANTS from 'common/ulti/constants';
import { BreadCrumbs } from "../../components";
import { fetchToastNotify } from "../../../controller/redux/app-reducer";
import { fetchLoginSuccess, fetchLoginFailure } from "../../../controller/redux/login-fetch-reducers";

class MatKhau extends Component {
  constructor(props) {
    super(props)
    this.state = {
      pwd: {
        cur_pwd: '',
        new_pwd: '',
        re_new_pwd: ''
      }
    }
  }

  componentDidMount = async () => {

  }

  _handleChangeElement = (evt) => {
    this.state.pwd[evt.target.id] = evt.target.value
    this.forceUpdate()
  }

  _handleSave = async () => {
    let { LoginRes } = this.props
    if (!LoginRes._id) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Không thể cập nhật tài khoản này' }))
      return
    }
    let id = LoginRes._id
    let axiosReq = cmFunction.clone(this.state.pwd)
    let axiosRes = await tbUsers.changeProfile(id, axiosReq)
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Cập nhật thành công' }))
      this.props.dispatch(fetchLoginFailure({}))
    }
  }

  render() {
    let { pwd } = this.state
    return (
      <React.Fragment>
        <div className="main portlet fade-in">
          <BreadCrumbs title={"Chi tiết"}
            route={[{ label: 'Thay đổi mật khẩu', value: '/mat-khau' }]}
          />
          <div className="portlet-title">
            <div className="caption">
              <i className="fas fa-grip-vertical" />&nbsp;&nbsp;Thay đổi mật khẩu
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
              <div className="form-body">
                <div className="form-row form-group form-custom">
                  <label className="col-md-3 mb-0">Mật khẩu hiện tại</label>
                  <input className="col-md-9 form-control" onChange={this._handleChangeElement} value={pwd.cur_pwd || ''} type="password" id="cur_pwd"
                    placeholder="Nhập mật khẩu hiện tại" />
                </div>
                <div className="form-row form-group form-custom">
                  <label className="col-md-3 mb-0">Mật khẩu mới</label>
                  <input className="col-md-9 form-control" onChange={this._handleChangeElement} value={pwd.new_pwd || ''} type="password" id="new_pwd"
                    placeholder="Nhập mật khẩu mới" />
                </div>
                <div className="form-row form-group form-custom">
                  <label className="col-md-3 mb-0">Nhập lại mật khẩu mới</label>
                  <input className="col-md-9 form-control" onChange={this._handleChangeElement} value={pwd.re_new_pwd || ''} type="password" id="re_new_pwd"
                    placeholder="Nhập lại mật khẩu mới" />
                </div>
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
export default connect(mapStateToProps)(MatKhau);
