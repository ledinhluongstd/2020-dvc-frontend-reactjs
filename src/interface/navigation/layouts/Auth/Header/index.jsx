import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchLoginFailure } from "../../../../../controller/redux/login-fetch-reducers";
import { Link } from "react-router-dom";
import * as cmFunction from 'common/ulti/commonFunction'
import { APP_NAME } from "../../../../../../config";

class Header extends Component {
  constructor(props) {
    super(props)

  }

  _handleLogout = () => {
    this.props.dispatch(fetchLoginFailure({}))
  }

  render() {
    let { LoginRes } = this.props
    let name = ''
    if (!cmFunction.isEmpty(LoginRes))
      name = this.props.LoginRes.user.name
    return (
      <nav ref='PageHeaderTop' className="sb-topnav navbar navbar-expand navbar-dark bg-dark page-header-top">
        <div className="container">
          <img src="common/assets/imgs/logo.png" alt="logo" className="logo-default" />
          <span className="navbar-brand">{APP_NAME.toUpperCase()}</span>
          <div className="d-none d-md-inline-block form-inline ml-auto mr-0 mr-md-3 my-2 my-md-0">
            {/* <div className="input-group">
            <input className="form-control" type="text" placeholder="Tìm kiếm..." aria-label="Search" aria-describedby="basic-addon2" />
            <div className="input-group-append">
              <button className="btn btn-primary" type="button"><i className="fas fa-search"></i></button>
            </div>
          </div> */}
          </div>
          <ul className="navbar-nav ml-auto ml-md-0">
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                {name} <i className="fas fa-user fa-fw"></i>
              </a>
              <div className="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">
                <Link to='/login' className="dropdown-item">Đăng nhập</Link>
                {/* <Link to='/mat-khau' className="dropdown-item">Đổi mật khẩu</Link>
                <div className="dropdown-divider"></div>
                <button onClick={this._handleLogout} className="dropdown-item">Đăng nhập</button> */}
              </div>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}

const mapStateToProps = state => {
  let { LoginRes, General } = state;
  return { LoginRes, General };
};
export default connect(mapStateToProps)(Header);
