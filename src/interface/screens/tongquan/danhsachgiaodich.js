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
import * as tbLogDVC from 'controller/services/tbLogDVCServices'
import * as cmFunction from 'common/ulti/commonFunction'
import axios from 'axios'
import {
  BreadCrumbs,
  HomeTransactionStatistics,
  Pagination
} from "../../components";
import { data } from './data'
import { HOST_API } from "../../../controller/api";

class DanhSachGiaoDich extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dichvu: [],
      donvi: [],
      //LOG GIAO DỊCH
      danhsachlog: [],
      danhsachtopten: [],
      batdau: null,
      ketthuc: null,
      cbCheckAll: false,
      searchIsOpen: false,
      page: CONSTANTS.DEFAULT_PAGE,
      pagesize: CONSTANTS.DEFAULT_PAGESIZE,
      _size: 0,
      _total_pages: 0,
      filter: null,
      search: {},
      searchToggle: false
    }
  }

  componentDidMount = () => {
    this._init()
    // this._getDanhSachLogDVC(this._createFilterSearch())

  }

  componentDidUpdate(prevProps) {
    let { location } = this.props
    if (location !== prevProps.location) {
      this._getDanhSachLogDVC(this._createFilterSearch())
    }
  }

  _init = async () => {
    this._getDanhSachLogDVC(this._createFilterSearch())
    // setInterval(() => { this._getTopTenLogDVC(this._createFilter()); }, 3000);
  }

  _getTopTenLogDVC = async (query) => {
    let data = await tbLogDVC.getAll(query)
    this.state.danhsachtopten = data && data._embedded ? data._embedded : [];
    this.forceUpdate()
  }

  _getDanhSachLogDVC = async (query) => {
    let data = await tbLogDVC.getAll(query)
    this.state.danhsachlog = data && data._embedded ? data._embedded : [];
    this.state._size = data._size || 0
    this.state._total_pages = data._total_pages || 0
    this.state.cbCheckAll = false
    this.forceUpdate()
  }

  _createFilter = () => {
    let parsed = {}
    parsed.page = CONSTANTS.DEFAULT_PAGE
    parsed.pagesize = CONSTANTS.DEFAULT_PAGESIZE
    parsed.count = true
    return new URLSearchParams(parsed).toString()
  }

  _createFilterSearch = () => {
    let { search, batdau, ketthuc } = this.state
    let parsed = queryString.parse(this.props.location.search);
    let { page, pagesize } = parsed
    let batdauTimeStamp = this._handleConverDateToTimeStamp(batdau)
    let ketthucTimeStamp = this._handleConverDateToTimeStamp(ketthuc)
    let filter = {}
    // parsed.sort_by = "STT"
    if (search.Ten || batdauTimeStamp || ketthucTimeStamp) {
      if (search.Ten) {
        filter['$or'] = [
          { 'unit.Ma': cmFunction.regexText(search.Ten.trim()) },
          { 'unit.Ten': cmFunction.regexText(search.Ten.trim()) },
        ]
      }
      if (batdauTimeStamp && ketthucTimeStamp) {
        filter['$and'] = [
          { "request.timestamp": { $gte: batdauTimeStamp } },
          { "request.timestamp": { $lte: ketthucTimeStamp } }]
      }
      else if (batdauTimeStamp && !ketthucTimeStamp) {
        filter["request.timestamp"] = { $gte: batdauTimeStamp }
      }
      else if (!batdauTimeStamp && ketthucTimeStamp) {
        filter["request.timestamp"] = { $lte: ketthucTimeStamp }
      }
      parsed.filter = JSON.stringify(filter)
    }
    parsed.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
    parsed.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    parsed.count = true
    this.state.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
    this.state.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    this.forceUpdate()
    return new URLSearchParams(parsed).toString()
  }

  _handleConverDateToTimeStamp = (dateToConvert) => {
    let date = new Date(dateToConvert)
    return date.getTime()
  }

  _convertUrl = (string) => {
    if (string.length > 49)
      return string.slice(0, 50) + '...';
    return string
  }

  checkStatusResponse = (item) => {
    if (item.response.status >= 200 && item.response.status <= 300) {
      return <span className='text-success'>Thành công</span>
    } else {
      return <span className="text-danger">Thất bại</span>
    }
  }

  render() {
    let { danhsachtopten, danhsachlog } = this.state
    let { page, pagesize, _size, _total_pages } = this.state
    console.log('danhsachtopten', danhsachtopten)
    return (
      <div className="main portlet fade-in">
        <BreadCrumbs title={"Tổng quan Danh sách giao dịch"} route={[{ label: 'Tổng quan Danh sách giao dịch', value: '/' }]} />
        <br />
        <div className="row">
          {/* <div className="col-md-5 col-xl-5">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className='text-info'><i className="fas fa-chart-bar mr-1"></i>{"Danh sách giao dịch".toUpperCase()}</h5>
              </div>
              <div className="card-body fix-first">
                <div className="table-fix-head-custom">
                  <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                    <thead>
                      <tr>
                        <th className='th-stt'>Trạng thái</th>
                        <th>Danh sách</th>
                      </tr>
                    </thead>
                    <tbody>
                      {danhsachtopten.map((item, index) => {
                        return <tr key={index} >
                          <td className='text-center'><i className="fas fa-check-circle fa-2x text-success"></i></td>
                          <td className="text-left">
                            <span className='td-nhom'>Nhóm: {item.Nhom}</span><br />
                            <span className='td-url'>Dịch vụ: {item.DichVu}</span><br />
                            <span className='td-dichvu'>{item.Url}</span><br />
                            <span className='td-last-call'>Lần gọi cuối: {item.Version}</span><br />
                          </td>
                        </tr>
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div> */}
          <div className="col-md-12 col-xl-12">
            <HomeTransactionStatistics label="Thống kê giao dịch" />
          </div>
        </div>
        <hr />
        <div className="row ">
          <div className="col-xl-12">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className='text-info'><i className="fas fa-chart-bar mr-1"></i>{"LOG DANH SÁCH GIAO DỊCH".toUpperCase()}</h5>
              </div>
              <div className="card-body fix-first">
                <div className="table-fix-head">
                  <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Thời gian</th>
                        <th>Đơn vị</th>
                        <th>IP</th>
                        <th>Dịch vụ</th>
                        <th>Kết quả</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {danhsachlog.map((item, index) => {
                        return <tr key={index} >
                          <td className='text-center'>{index + 1}</td>
                          <td>{cmFunction.timestamp2DateString(item.request.timestamp.$numberLong, 'DD/MM/YYYY HH:mm:ss')}</td>
                          <td>{item.unit.Ten || item.unit.Ma}</td>
                          <td>{item.ip}</td>
                          <td title={item.request.originalUrl}>
                            {HOST_API}{this._convertUrl(item.request.originalUrl)}
                          </td>
                          <td>
                            {this.checkStatusResponse(item)}
                          </td>
                          <td>
                            <Link to={'/giam-sat-giao-dich/' + item._id.$oid || item._id} title="Chi tiết" className="btn btn-sm btn-outline-info border-radius"><i className="fas fa-eye"></i></Link>
                          </td>
                        </tr>
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer">
                <Pagination history={this.props.history}
                  page={page} pagesize={pagesize}
                  _size={_size} _total_pages={_total_pages}
                />
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
export default connect(mapStateToProps)(DanhSachGiaoDich);

