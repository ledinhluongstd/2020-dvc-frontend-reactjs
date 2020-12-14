import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { compose } from 'redux'
import { Router, Route, Switch } from "react-router-dom";
import { LoadingComponent } from 'interface/components'
import { withRouter } from 'react-router';
import axios from 'axios'
import indexRoutes from "interface/navigation/router";
import { TEMPLATE } from '../../../config'
import * as cmFunction from 'common/ulti/commonFunction'
import * as ccFunction from 'common/ulti/cookieFunction'
import { AUTHORIZATION_COOKIE } from "../../common/ulti/constants";
import { fetchLoginSuccess, fetchLoginFailure } from "../../controller/redux/login-fetch-reducers";
import * as generalServices from "../../controller/services/generalServices";
import * as tbMenu from "../../controller/services/tbMenuServices";
import * as tbNhomQuyen from "../../controller/services/tbNhomQuyenServices";
import * as tbDanhMucUngDung from "../../controller/services/tbDanhMucUngDungServices";
import { fetchGeneral } from "../../controller/redux/app-reducer";
import { toast } from 'react-toastify';

class NavigationRouter extends Component {
  constructor(props) {
    super(props)
    this.state = {
      verified: false,
      allDone: false
    }
  }

  componentDidMount() {
    let { LoginRes } = this.props
    if (cmFunction.isEmpty(LoginRes) && ccFunction.getCookie(AUTHORIZATION_COOKIE)) {
      this.props.dispatch(fetchLoginSuccess(JSON.parse(cmFunction.decode(ccFunction.getCookie(AUTHORIZATION_COOKIE)))))
    } else {
      this._initGeneralAuth()
      this.state.allDone = true
      this.forceUpdate()
    }
  }

  componentDidUpdate(prevProps) {
    let { LoginRes, ToastNotify, General } = this.props
    if (LoginRes !== prevProps.LoginRes) {
      if (!cmFunction.isEmpty(LoginRes) && ccFunction.checkCookie(LoginRes)) {
        this.state.verified = true
        this._initGeneral()
      } else {
        this.state.verified = false
        this._initGeneralAuth()
      }
      this.state.allDone = true
      this.forceUpdate()
    }
    if (ToastNotify !== prevProps.ToastNotify && !cmFunction.isEmpty(ToastNotify)) {
      toast[ToastNotify.type](ToastNotify.data);
    }
    if (General !== prevProps.General) {
      console.log(General)
    }
  }

  _convertDanhMuc = (danhmuc) => {
    let dmObj = {}
    danhmuc.forEach(item => {
      if (dmObj[item.MaDanhMuc]) {
        dmObj[item.MaDanhMuc].push(item)
      } else {
        dmObj[item.MaDanhMuc] = []
        dmObj[item.MaDanhMuc].push(item)
      }
    })
    return dmObj
  }

  _initGeneral = async () => {
    let axiosReq = [tbMenu.getAll(), tbNhomQuyen.getAll(), tbDanhMucUngDung.getAll()]
    let axiosRes = await axios.all(axiosReq).then(axios.spread((...responses) => {
      return responses
    })).catch(errors => {
      if (__DEV__) console.log(errors)
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Có lỗi _initGeneral' }))
    })
    let menu = (axiosRes[0] && axiosRes[0]._embedded ? axiosRes[0]._embedded : [])
    let nhomquyen = (axiosRes[1] && axiosRes[1]._embedded ? axiosRes[1]._embedded : [])
    let danhmuc = (axiosRes[2] && axiosRes[2]._embedded ? axiosRes[2]._embedded : [])
    danhmuc = this._convertDanhMuc(danhmuc)
    this.props.dispatch(fetchGeneral({ Menu: menu, NhomQuyen: nhomquyen, DanhMuc: danhmuc }))
  }

  _initGeneralAuth = async () => {
    let axiosReq = [generalServices.getMenu()//, generalServices.getNhomQuyen(), generalServices.getDanhMucUngDung()
    ]
    let axiosRes = await axios.all(axiosReq).then(axios.spread((...responses) => {
      return responses
    })).catch(errors => {
      if (__DEV__) console.log(errors)
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Có lỗi _initGeneral' }))
    })
    let menu = (axiosRes[0] && axiosRes[0]._embedded ? axiosRes[0]._embedded : [])
    // let nhomquyen = (axiosRes[1] && axiosRes[1]._embedded ? axiosRes[1]._embedded : [])
    // let danhmuc = (axiosRes[2] && axiosRes[2]._embedded ? axiosRes[2]._embedded : [])
    // danhmuc = this._convertDanhMuc(danhmuc)
    this.props.dispatch(fetchGeneral({ Menu: menu//, NhomQuyen: nhomquyen, DanhMuc: danhmuc
     }))
  }
  render() {
    let { verified, allDone } = this.state
    if (!allDone) {
      return (
        <LoadingComponent />
      )
    }
    return (
      <Switch>
        {verified ? <Route path={indexRoutes[TEMPLATE].path} component={indexRoutes[TEMPLATE].component} />
          : <Route path={indexRoutes['auth'].path} component={indexRoutes['auth'].component} />}
      </Switch>
    );
  }
}

const mapStateToProps = state => {
  let { LoginRes, ToastNotify, General } = state;
  return { LoginRes, ToastNotify, General };
};

export default compose(
  withRouter,
  connect(mapStateToProps)
)(NavigationRouter);
