import React, { Component } from "react";
import { connect } from "react-redux";
import { BreadCrumbs, FormWrapper } from "interface/components";
import axios from 'axios'
import queryString from 'query-string'
import ReactDOM from 'react-dom';
import moment from 'moment'
import { fetchToastNotify } from "../../../controller/redux/app-reducer";
import { Link } from "react-router-dom";
import { confirmAlert } from 'react-confirm-alert';
import { Other } from 'interface/screens/error'
import { __DEV__, SUPER } from "../../../common/ulti/constants";
import * as CONSTANTS from 'common/ulti/constants';
import * as tbDonVi from 'controller/services/tbDonViServices'
import * as tbLogDVC from 'controller/services/tbLogDVCServices'
import * as cmFunction from 'common/ulti/commonFunction'
import * as Excel from "exceljs";
import { saveAs } from 'file-saver';
import { data } from './data'
import { HOST_API } from "../../../controller/api";
import JSONTree from 'react-json-tree'

const theme = {
  scheme: 'monokai',
  author: 'wimer hazenberg (http://www.monokai.nl)',
  base00: '#272822',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633',
};

class ChiTiet extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isInsert: this.props.match.params.id == 0,
      error: false,
      form: {},
      isLoad: false
    }
  }

  componentDidMount() {
    this._init()
  }

  componentDidUpdate(prevProps) {
    let { match } = this.props
    if (match.params.id !== prevProps.match.params.id) {
      this._init()
    }
  }

  _init = async () => {
    this.state.isInsert = this.props.match.params.id == 0
    let id = this.props.match.params.id
    if (!this.state.isInsert) {
      let data = await tbLogDVC.getById(id)
      if (data) {
        this.state.form = data
        this.state.isLoad = true
      }
      if (!data) this.state.error = true
      this.forceUpdate()
    }
  };

  render() {
    let { form, isLoad } = this.state
    try {
      if (!isLoad) return <div></div>
      return (
        <React.Fragment>
          <div className="main portlet">
            <BreadCrumbs
              title={"Danh sách đơn vị"}
              route={[
                { label: 'Giám sát giao dịch', value: '/giam-sat-giao-dich' },
                { label: 'Chi tiết giao dịch', value: '/giam-sat-giao-dich/:id' }
              ]} />
            <div className="portlet-title">
              <div className="caption">
                <i className="fas fa-layer-group" />Chi tiết giao dịch
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <span className='font-weight-bold'>Đơn vị:&nbsp;{form.unit.Ten}</span><br />
                <span className='text-muted'>Email:&nbsp;{form.unit.Email || "Đơn vị chưa cung cấp email liên lạc"}</span><br />
                <span>Dịch vụ:&nbsp;{form.service.dvkn.Ten}</span><br />
                <span className='font-italic text-muted'>{HOST_API}{form.service.Url}</span><br />
                <span className='font-italic text-muted'>Trạng thái:&nbsp;{form.response.status >= 200 && form.response.status < 300 ? <span className="text-success">Thành công</span> : <span className="text-danger">Thất bại</span>}</span><br />
              </div>
            </div>
            <hr />
            <div className="card">
              <div className="card-header portlet-title">
                <label className='caption'>1. Thông tin kết nối</label>
              </div>
              <div className="card-body">
                {/* <span>Hệ thống: xxx</span><hr className='doted' /> */}
                <span>Ứng dụng: {form.dvud.Ten}</span><hr className='doted' />
                {/* <span>Địa chỉ mở rộng (ResourcePath): xxx</span><hr className='doted' /> */}
                <span>Phương thức: {form.request.method}</span><hr className='doted' />
                <span>IP: {form.ip}</span><hr className='doted' />
                {/* <span>Môi trường (UserAgent): xxx</span><hr className='doted' /> */}
              </div>
            </div>
            <hr />
            <div className="card">
              <div className="card-header portlet-title">
                <label className='caption'>2. Chi tiết</label>
              </div>
              <div className="card-body">
                REQUEST:
                <FormWrapper>
                  <JSONTree
                    data={form.request}
                    theme={{
                      extend: theme,
                      valueLabel: {
                        textDecoration: 'underline',
                      },
                      nestedNodeLabel: ({ style }, keyPath, nodeType, expanded) => ({
                        style: {
                          ...style,
                          textTransform: expanded ? 'uppercase' : style.textTransform,
                        },
                      }),
                    }}
                  />
                </FormWrapper>
                <hr className='doted' />
                  RESPONSE:
                <FormWrapper>
                  <JSONTree
                    data={form.response}
                    theme={{
                      extend: theme,
                      valueLabel: {
                        textDecoration: 'underline',
                      },
                      nestedNodeLabel: ({ style }, keyPath, nodeType, expanded) => ({
                        style: {
                          ...style,
                          textTransform: expanded ? 'uppercase' : style.textTransform,
                        },
                      }),
                    }}
                  />
                </FormWrapper>
              </div>
            </div>
            <hr />
            <div className="card">
              <div className="card-header portlet-title">
                <label className='caption'>3. Thông tin bổ sung</label>
              </div>
              <div className="card-body">
                <span>Thời gian gọi: {cmFunction.timestamp2DateString(form.request.timestamp.$numberLong, 'DD/MM/YYYY HH:mm:ss')}</span><hr className='doted' />
                <span>Thời gian xử lý: {form.total_time}&nbsp;ms</span><hr className='doted' />
                <span>Trạng thái:&nbsp;{form.response.status >= 200 && form.response.status < 300 ? <span className="text-success">Thành công</span> : <span className="text-danger">Thất bại</span>}</span><br />
              </div>
            </div>
            {/* <div className="card-header portlet-title">
              <label className='caption'>2. Chi tiết</label>
            </div>
            <div className="card">
              <div className="card-body fix-first">
                <nav className="navbar navbar-light bg-light">
                  <span className="navbar-text">
                    Mediator: {chitiet.CHiTiet.Mediator1}
                  </span>
                </nav>
                <nav className="navbar navbar-light bg-light">
                  <span className="navbar-text">
                    Mediator: {chitiet.CHiTiet.Mediator2}
                  </span>
                </nav>
              </div>
            </div>
            <div className="card-header portlet-title">
              <label className='caption'>3. Thông tin đích</label>
            </div>
            <div className="card">
              <div className="card-body fix-first">
                <span> Địa chỉ đích:<span className='font-italic'>{chitiet.CHiTiet.DiaChiDich}</span></span><br />
                <span> Thời điểm gọi: {chitiet.NgayGiaoDich}</span><br />
                <span> Thời gian trả về: {chitiet.CHiTiet.ThoiGianTraVe}</span><br />
                <span>Trạng thái: <span className='text-info'>{chitiet.GiaoDich}</span></span>
              </div>
            </div> */}
          </div>
        </React.Fragment>
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
export default connect(mapStateToProps)(ChiTiet);
