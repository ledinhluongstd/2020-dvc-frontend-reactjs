import { Chart } from "react-google-charts";
import React, { Component } from "react";
import { connect } from "react-redux";
import Modal from 'react-modal';
import Select from 'react-select'
import queryString from 'query-string'
import XLSX from 'xlsx';
import ReactDOM from 'react-dom';
import moment from 'moment'
import { fetchToastNotify } from "../../../controller/redux/app-reducer";
import { Link } from "react-router-dom";
import { confirmAlert } from 'react-confirm-alert';
import { Other } from 'interface/screens/error'
import { __DEV__, SUPER } from "../../../common/ulti/constants";
import * as CONSTANTS from 'common/ulti/constants';
import * as dashboardServices from 'controller/services/dashboardServices'
import * as tbDichVu from 'controller/services/tbDVCServices'
import * as tbDonVi from 'controller/services/tbDonViServices'
import * as tbUngDung from 'controller/services/tbUngDungServices';

import axios from 'axios'
import {
  BreadCrumbs
} from "../../components";
import { data } from './data'

class ThongTinKetNoi extends Component {
  constructor(props) {
    super(props)
    this.state = {
      donvi: { count: 0, data: [] },
      ungdung: { count: 0, data: [] },
      dichvu: { count: 0, data: [] },
    }
  }

  componentDidMount = () => {
    this._init()
  }

  _init = async () => {
    let axiosReq = [
      tbDonVi.getAll(this._createFilter()),
      tbUngDung.getAll(this._createFilter()),
      tbDichVu.getAll(this._createFilter())
    ]
    let axiosRes = await axios.all(axiosReq).then(axios.spread((...responses) => {
      return responses
    })).catch(errors => {
      if (__DEV__) console.log(errors)
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Có lỗi lấy thông tin dữ liệu' }))
    })

    let donvi = this._convert(axiosRes[0])
    let ungdung = this._convert(axiosRes[1])
    let dichvu = this._convert(axiosRes[2])

    this.state.donvi = donvi
    this.state.ungdung = ungdung
    this.state.dichvu = dichvu
    this.forceUpdate()
  }

  _createFilter = () => {
    let parsed = {}
    parsed.page = 1
    parsed.pagesize = 1000
    parsed.count = true
    return new URLSearchParams(parsed).toString()
  }

  _convert = (data) => {
    console.log(data)
    if (!data) return { count: 0, data: [] }
    let res = { count: data._size, data: data._embedded }
    return res
  }

  render() {
    let { dichvu, donvi, ungdung } = this.state
    return (
      <div className="main portlet fade-in">
        <BreadCrumbs title={"Tổng quan Thống kê kết nối"} route={[{ label: 'Tổng quan Thống kê kết nối', value: '/' }]} />
        <br />
        <div className="row ">
          <div className="col-xl-12">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className='text-info'><i className="fas fa-chart-bar mr-1"></i>{"Thông tin kết nối".toUpperCase()}</h5>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4 col-xl-4">
            <div className="card card-home mb-4 border border-primary">
              <div className="card-body text-center"><strong><h3>SỐ ĐƠN VỊ KẾT NỐI</h3></strong></div>
              <div className="card-dashboard text-center">
                <h1>{donvi.count}</h1>
              </div>
              <hr />
              <div className="card-body fix-first">
                <div className="table-fix-head-custom-overvivew">
                  <table className="table table-borderless" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                    <tbody>
                      {donvi.data.map((item, index) => {
                        return <tr key={index} >
                          <td key={index} className='text-left'>
                            <Link to={'/info-donvi/' + item._id.$oid || item._id} title="Chi tiết" className="">
                              {index + 1}.&nbsp;&nbsp;   {item.Ten}
                            </Link>
                          </td>
                        </tr>
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4 col-xl-4">
            <div className="card card-home mb-4 border border-primary">
              <div className="card-body text-center"><strong><h3>SỐ ỨNG DỤNG KẾT NỐI</h3></strong></div>
              <div className="card-dashboard text-center">
                <h1>{ungdung.count}</h1>
              </div>
              <hr />
              <div className="card-body fix-first">
                <div className="table-fix-head-custom-overvivew">
                  <table className="table table-borderless" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                    <tbody>
                      {ungdung.data.map((item, index) => {
                        return <tr key={index} >
                          <td key={index} className='text-left'>
                            <Link to={'/quan-tri-ket-noi/ung-dung-ket-noi/' + item._id.$oid || item._id} title="Chi tiết" className="">
                              {index + 1}.&nbsp;&nbsp;   {item.Ten}
                            </Link>
                          </td>
                        </tr>
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className='col-md-4 col-xl-4'>
            <div className="card card-home mb-4 border border-primary">
              <div className="card-body text-center"><strong><h3>SỐ DỊCH VỤ KẾT NỐI</h3></strong></div>
              <div className="card-dashboard text-center">
                <h1>{dichvu.count}</h1>
              </div>
              <hr />
              <div className="card-body fix-first">
                <div className="table-fix-head-custom-overvivew">
                  <table className="table table-borderless" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                    <tbody>
                      {dichvu.data.map((item, index) => {
                        return <tr key={index} >
                          <td key={index} className='text-left'>
                            <Link to={'/info-dvcc/' + item._id.$oid || item._id} title="Chi tiết" className="">
                              {index + 1}.&nbsp;&nbsp;   {item.Ten}
                            </Link>
                          </td>
                        </tr>
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => {
  let { LoginRes, General } = state;
  return { LoginRes, General };
};

export default connect(mapStateToProps)(ThongTinKetNoi);

