import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { fetchLoginRequest } from '../../../../controller/redux/login-fetch-reducers'
import Footer from "../../../navigation/layouts/Admin/Footer/index.jsx";
import * as cmFunction from 'common/ulti/commonFunction'
import { __DEV__ } from "../../../../common/ulti/constants";

class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      usr: {
        account: __DEV__ ? 'admin' : '',
        pwd: __DEV__ ? 'admin' : '',
      }
    }
  }

  componentDidMount() {

  }

  _handleOnKeyDown = (evt) => {
    if (evt.keyCode === 13) {
      this._handleLogin()
    }
  }

  _handleLogin = () => {
    // if (!this.state.usr.account) {
    //   return;
    // }
    // if (!this.state.usr.pwd || this.state.usr.pwd.length < 6) {
    //   return;
    // }
    // this.forceUpdate();
    this.props.dispatch(
      fetchLoginRequest(this.state.usr)
    );
  }

  _handleChangeElement = (evt) => {
    this.state.usr[evt.target.id] = evt.target.value
    this.forceUpdate()
  }

  render() {
    let { usr } = this.state
    return (
      <div id="layoutAuthentication">
        <div id="layoutAuthentication_content">
          <main>
            <div className="container auth">
              <div className="row justify-content-center">
                <div className="col-lg-5">
                  <div className="card shadow-lg border-0 rounded-lg mt-5">
                    <div className="card-header"><h3 className="text-center font-weight-light my-4">Đăng nhập</h3></div>
                    <div className="card-body">
                      <div className="form-group">
                        <label className="mb-1" htmlFor="inputEmailAddress">Tài khoản</label>
                        <input onChange={this._handleChangeElement}
                          value={usr.account} className="form-control py-4" id="account" type="text" placeholder="Nhập tài khoản" />
                      </div>
                      <div className="form-group">
                        <label className="mb-1" htmlFor="inputPassword">Mật khẩu</label>
                        <input onChange={this._handleChangeElement} onKeyDown={this._handleOnKeyDown}
                          value={usr.pwd} className="form-control py-4" id="pwd" type="password" placeholder="Nhập mật khẩu" />
                      </div>
                      {/* <div className="form-group">
                          <div className="custom-control custom-checkbox">
                            <input className="custom-control-input" id="rememberPasswordCheck" type="checkbox" />
                            <label className="custom-control-label" htmlFor="rememberPasswordCheck">Ghi nhớ mật khẩu</label>
                          </div>
                        </div> */}
                      <div className="form-group d-flex align-items-center justify-content-between mt-4 mb-0">
                        <Link className="" to={'/forgot-password'}>
                          Quên mật khẩu
                          </Link>
                        <button className="btn btn-primary" onClick={this._handleLogin}>Đăng nhập</button>
                      </div>
                    </div>
                    <div className="card-footer text-center">
                      <div className="">
                        <Link to={'/register'}>
                          Chưa có tài khoản? Đăng ký ngay!
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
        {/* <div id="layoutAuthentication_footer">
          <Footer />
        </div> */}
      </div>
    );
  }
}

const mapStateToProps = state => {
  let { LoginRes } = state;
  return { LoginRes };
};
export default connect(mapStateToProps)(Login);
