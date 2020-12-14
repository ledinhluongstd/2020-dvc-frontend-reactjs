import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import * as tbUsers from "../../../../controller/services/tbUsersServices";
import * as CONSTANTS from 'common/ulti/constants';
import Footer from "../../../navigation/layouts/Admin/Footer/index.jsx";
import { fetchToastNotify } from "../../../../controller/redux/app-reducer";

class Register extends Component {

  constructor(props) {
    super(props)
    this.state = {
      usr: {}
    }
  }

  componentDidMount() {

  }

  _handleChangeElement = (evt) => {
    this.state.usr[evt.target.id] = evt.target.value
    this.forceUpdate()
  }

  _handleRegister = async () => {
    let dataReq = this.state.usr
    delete dataReq.re_pwd
    let dataRes = await tbUsers.register(dataReq)
    if (dataRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Đăng ký tài khoản thành công' }))
      this.state.usr = {}
      this.forceUpdate()
    }
  }

  render() {
    let { usr } = this.state
    return (
      <div id="layoutAuthentication">
        <div id="layoutAuthentication_content">
          <main>
            <div className="container auth">
              <div className="row justify-content-center">
                <div className="col-lg-7">
                  <div className="card shadow-lg border-0 rounded-lg mt-5">
                    <div className="card-header"><h3 className="text-center font-weight-light my-4">Đăng ký tài khoản</h3></div>
                    <div className="card-body">
                      <div className="form-row">
                        <div className="col-md-12">
                          <div className="form-group">
                            <label className="mb-1" htmlFor="inputFirstName">Họ tên</label>
                            <input onChange={this._handleChangeElement}
                              value={usr.name || ''} className="form-control py-4" id="name" type="text" placeholder="Nhập họ tên" />
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="mb-1" htmlFor="inputEmailAddress">Tài khoản</label>
                        <input onChange={this._handleChangeElement}
                          value={usr.account || ''} className="form-control py-4" id="account" type="text" placeholder="Nhập tài khoản" />
                      </div>
                      <div className="form-row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="mb-1" htmlFor="pwd">Mật khẩu</label>
                            <input onChange={this._handleChangeElement}
                              value={usr.pwd || ''} className="form-control py-4" id="pwd" type="password" placeholder="Nhập mật khẩu" />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="mb-1" htmlFor="re_pwd">Nhập lại mật khẩu</label>
                            <input onChange={this._handleChangeElement}
                              value={usr.re_pwd || ''} className="form-control py-4" id="re_pwd" type="password" placeholder="Nhập lại mật khẩu" />
                          </div>
                        </div>
                      </div>
                      <div className="form-group mt-4 mb-0">
                        <button onClick={this._handleRegister} className="btn btn-primary btn-block">Đăng ký</button>
                      </div>
                    </div>
                    <div className="card-footer text-center">
                      <div className="">
                        <Link to={'/login'}>
                          Đã có tài khoản? Đăng nhập
                        </Link></div>
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
    )
  }
}

const mapStateToProps = state => {
  let { LoginRes } = state;
  return { LoginRes };
};
export default connect(mapStateToProps)(Register);