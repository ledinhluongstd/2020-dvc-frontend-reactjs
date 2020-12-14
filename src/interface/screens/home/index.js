import { Chart } from "react-google-charts";
import React, { Component } from "react";
import { connect } from "react-redux";
import ReactDOM from 'react-dom';
import moment from 'moment'
import { __DEV__, SUPER } from "../../../common/ulti/constants";
import * as dashboardServices from 'controller/services/dashboardServices'
import { BreadCrumbs, HomeTransactionStatistics } from "../../components";
import * as tbDichVu from 'controller/services/tbDVCServices'
import * as tbLogDVC from 'controller/services/tbLogDVCServices'
import { HOST_API } from "../../../controller/api";
import * as tbDonVi from 'controller/services/tbDonViServices'

class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      countDichVu: 0,
      countGiaoDich: 0,
      dichvu: [],
      donvi: [],
      topSuccess: [],
      topUnit: [],
    }
  }

  componentDidMount = () => {
    this._init()
  }

  _init = async () => {
    let filter = new URLSearchParams({ count: true, page: 1, pagesize: 1000 }).toString()
    let countDichVu = await tbDichVu.getAll(filter)
    let countGiaoDich = await tbLogDVC.getAll(filter)
    let listDonVi = await tbDonVi.getAll(filter)
    let dichvu = countDichVu && countDichVu._embedded ? countDichVu._embedded : [];
    let donvi = listDonVi && listDonVi._embedded ? listDonVi._embedded : [];
    let countTopSuccessSerrvice = await dashboardServices.countTopSuccessSerrvice()
    let countTopSuccessUnit = await dashboardServices.countTopSuccessUnit()
    let sortTopSuccess = countTopSuccessSerrvice.data
    sortTopSuccess.sort(function (a, b) {
      if (a.count !== b.count) {
        return b.count - a.count
      }
    });
    sortTopSuccess.map((item, index) => {
      let found = dichvu.find(element => element.Url.Ma === item.Url);
      sortTopSuccess[index].DichVu = found
    })
    this.state.topSuccess = sortTopSuccess
    let sortTopSuccessUnit = countTopSuccessUnit.data
    sortTopSuccessUnit.sort(function (a, b) {
      if (a.count !== b.count) {
        return b.count - a.count
      }
    });
    sortTopSuccessUnit.map((item, index) => {
      let found = donvi.find(element => element.Ma === item.Unit);
      sortTopSuccessUnit[index].DonVi = found
    })
    this.state.topUnit = sortTopSuccessUnit
    countDichVu = countDichVu && countDichVu._size ? countDichVu._size : 0;
    countGiaoDich = countGiaoDich && countGiaoDich._size ? countGiaoDich._size : 0;
    this.state.countDichVu = countDichVu
    this.state.countGiaoDich = countGiaoDich
    this.forceUpdate()
  }

  render() {
    let { countDichVu, countGiaoDich, topSuccess, topUnit } = this.state
    return (
      <div className="main portlet fade-in">
        <BreadCrumbs title={"Hệ thống quản lý giám sát dịch vụ công"} route={[{ label: 'Hệ thống quản lý giám sát dịch vụ công', value: '/' }]} />
        <br />
        <div className="row">
          <div className="col">
            <div className="text-right bg-info p-2">
              <h3 className='text-uppercase text-white'>{countDichVu}&nbsp;Dịch vụ</h3>
            </div>
          </div>
          <div className="col">
            <div className="text-right bg-success p-2">
              <h3 className='text-uppercase text-white'>{countGiaoDich}&nbsp;Giao dịch</h3>
            </div>
          </div>
        </div>
        <br />

        <div className="row">
          <div className="col-xl-12">
            <HomeTransactionStatistics label="TỔNG GIAO DỊCH TỚI THỜI ĐIỂM HIỆN TẠI" />
          </div>
        </div>
        <hr />

        <div className="row ">
          <div className="col-xl-12">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className='text-info'><i className="fas fa-chart-bar mr-1"></i>{"Top 10: Dịch vụ kết nối thành công nhiều nhất".toUpperCase()}</h5>
              </div>
              <div className="card-body fix-first">
                <div className="table-fix-head">
                  <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                    <thead>
                      <tr>
                        <th className='th-stt'>STT</th>
                        <th>Danh sách</th>
                        <th className='th-action'>Số lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topSuccess.map((item, index) => {
                        return <tr key={index} >
                          <td className='text-center'>{index + 1}</td>
                          <td>
                            <span >Nhóm:&nbsp; <span className='td-nhom'>{item.DichVu.NhomDichVu.Ten}</span></span><br />
                            <span className='td-dichvu'>Dịch vụ:&nbsp; {item.DichVu.Ten}</span><br />
                            <span className='text-muted'>Url:&nbsp;<span className='td-url'>{HOST_API}{item.Url}</span></span><br />
                            {/* <span className='td-last-call'>Lần gọi cuối: {item.Version}</span><br /> */}
                          </td>
                          <td>
                            <span className="text-info">{item.count}</span>
                            {/* /<span className="text-danger">{item.TongGiaoDich.Loi}</span> */}
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
        <hr />

        <div className="row ">
          <div className="col-xl-12">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className='text-info'><i className="fas fa-chart-bar mr-1"></i>{"Top 10: Đơn vị kết nối thành công nhiều nhất".toUpperCase()}</h5>
              </div>
              <div className="card-body fix-first">
                <div className="table-fix-head">
                  <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                    <thead>
                      <tr>
                        <th className='th-stt'>STT</th>
                        <th>Danh sách</th>
                        <th className='th-action'>Số lượng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topUnit.map((item, index) => {
                        return <tr key={index} >
                          <td className='text-center'>{index + 1}</td>
                          <td>
                            <span className='td-nhom'>Nhóm: {item.DonVi.NhomDonVi.Ten}</span><br />
                            <span className='td-url'>Đơn vị: {item.DonVi.Ten}</span><br />
                            {/* <span className='td-dichvu'>{item.Url}</span><br />
                            <span className='td-last-call'>Lần gọi cuối: {item.Version}</span><br /> */}
                          </td>
                          <td>
                            <span className="text-info">{item.count}</span>
                            {/* /<span className="text-danger">{item.TongGiaoDich.Loi}</span> */}
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
export default connect(mapStateToProps)(Home);

