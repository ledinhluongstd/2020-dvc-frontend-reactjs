import React, { Component } from "react";
import ReactDOM from 'react-dom'
import Iframe from 'react-iframe'
import { connect } from "react-redux";
import { Page404, Other } from 'interface/screens/error'
import { BreadCrumbs, FormInput, FormWrapper } from "interface/components";
import { __DEV__ } from "../../../common/ulti/constants";
import * as CONSTANTS from 'common/ulti/constants';
import { confirmAlert } from 'react-confirm-alert';
import * as cmFunction from 'common/ulti/commonFunction'
import * as tbEform from 'controller/services/tbEformServices'
import * as tbLinhVuc from 'controller/services/tbLinhVucServices'
import * as tbDonVi from 'controller/services/tbDonViServices'
import * as tbThongTinEform from 'controller/services/tbThongTinEformServices'
import * as nextcloudServices from 'controller/services/nextcloudServices'

import { fetchToastNotify } from "../../../controller/redux/app-reducer";
import { Link } from "react-router-dom";
import { HOST_NEXT_CLOUD } from '../../../controller/api'
import { LoadingComponent } from "../../components";

class ChinhSua extends Component {
  constructor(props) {
    super(props)
    this.state = {
      error: false,
      requesttoken: null
    }
  }

  componentDidMount() {
    this._init()
  }

  componentDidUpdate(prevProps) {

  }

  _init = async () => {
    window.scrollTo(0, 0)
    let requesttoken = await nextcloudServices.getToken()
    if (requesttoken) {
      let head = document.getElementsByTagName('head')[0]
      let user = document.createAttribute("data-user");
      user.value = "root";
      head.setAttributeNode(user);

      let displayname = document.createAttribute("data-user-displayname");
      displayname.value = "root";
      head.setAttributeNode(displayname);

      let dataRequesttoken = document.createAttribute("data-requesttoken");
      dataRequesttoken.value = requesttoken.requesttoken;
      head.setAttributeNode(dataRequesttoken);

      this.state.requesttoken = new URLSearchParams(requesttoken.requesttoken).toString()
      setTimeout(() => {
        this.forceUpdate()
      }, 500)
    }
  }

  render() {
    let { error, requesttoken } = this.state
    let { id, fileid } = this.props.match.params
    console.log(fileid)
    if (error)
      return <Page404 />
    try {
      return (
        <div className="main portlet fade-in">
          <BreadCrumbs title={"Chi tiết"}
            route={[
              { label: 'Quản lý biểu mẫu', value: '/quan-ly/eform' },
              { label: 'Thông tin biểu mẫu', value: '/quan-ly/eform/' + id },
              { label: 'Chỉnh sửa biểu mẫu', value: '/quan-ly/eform/:id/chinh-sua' }]}
          />
          <div className="portlet-title">
            <div className="caption">
              <i className="fas fa-grip-vertical" />Chỉnh sửa biểu mẫu
              </div>
            <div className="action">
              <button onClick={cmFunction.goBack} className="btn btn-sm btn-outline-dark border-radius">
                <i className="fas fa-reply" />Quay lại
              </button>
            </div>
          </div>

          {requesttoken ? <div className="card">
            <Iframe url="https://gamek.vn/"
              // width="450px"
              // height="450px"
              id="richdocumentsframe"
              className="iframe"
              display="initial"
              position="relative" />
            {/* <iframe src='https://github.com/nextcloud/server/issues/1472' className='iframe' /> */}
            {/* <iframe className='iframe' src={`${HOST_NEXT_CLOUD}?fileid=${fileid}&requesttoken=${requesttoken}`} /> */}
          </div> : <LoadingComponent />}
        </div>
      );
    } catch (e) {
      if (__DEV__) console.log(e)
      return <Other data={e} />
    }
  }
}

const mapStateToProps = state => {
  let { LoginRes, General } = state;
  return { LoginRes, General };
};
export default connect(mapStateToProps)(ChinhSua);
