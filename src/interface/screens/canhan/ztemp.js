import React, { Component } from "react";
import { connect } from "react-redux";
import { Page404 } from 'interface/screens/error'
import * as tbDanhSachDemo from 'controller/services/tbDanhSachDemoServices'
import * as tbUsers from 'controller/services/tbUsersServices'
import * as cmFunction from 'common/ulti/commonFunction'
import * as CONSTANTS from 'common/ulti/constants';
import { BreadCrumbs } from "../../components";
import { fetchToastNotify } from "../../../controller/redux/app-reducer";
import { fetchLoginSuccess } from "../../../controller/redux/login-fetch-reducers";

class Temp extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: {}
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

  _handleSave = async () => {
    let LoginRes = cmFunction.clone(this.props.LoginRes)
    let axiosReq = cmFunction.clone(this.state.user)
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
          <div className="portlet-body">
            <div className="form-body">
              <div className="form-group">
                <label>Họ tên</label>
                <input onChange={this._handleChangeElement} value={user.name || ''} type="text" className="form-control" id="name" placeholder="Nhập họ tên" />
              </div>
              <div className="form-group">
                <label>Tài khoản</label>
                <input disabled readOnly onChange={this._handleChangeElement} value={user.account || ''} type="text" className="form-control" id="account" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input onChange={this._handleChangeElement} value={user.email || ''} type="email" className="form-control" id="email" />
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
export default connect(mapStateToProps)(Temp);
