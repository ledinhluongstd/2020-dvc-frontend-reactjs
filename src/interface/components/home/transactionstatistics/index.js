import { Chart } from "react-google-charts";
import React, { Component } from "react";
import { connect } from "react-redux";
import ReactDOM from 'react-dom';
import moment from 'moment'
import { __DEV__, SUPER } from "../../../../common/ulti/constants";
import * as dashboardServices from 'controller/services/dashboardServices'
import { BreadCrumbs } from "../../../components";
import * as tbDichVu from 'controller/services/tbDVCServices'
import * as tbLogDVC from 'controller/services/tbLogDVCServices'
import { HOST_API } from "../../../../controller/api";
import * as tbDonVi from 'controller/services/tbDonViServices'

class HomeTransactionStatistics extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dataYear: [],
      dataMonth: [],
      dataWeek: [],
      dataDay: [],
      checkNam: true,
      checkThang: false,
      checkTuan: false,
      checkNgay: false,
    }
  }

  componentDidMount = () => {
    this._init()
  }

  _init = async () => {
    this._getdataYear()
  }

  _getdataYear = async () => {
    let currentYear = new Date().getFullYear();
    let year = [];
    let SUCCESS = []
    let ERROR = []
    for (let y = currentYear; y > (currentYear - 5); y--) {
      let nam = y.toString()
      year.push(nam)
    }
    for (let y = 0; y < 5; y++) {
      let firstofYear = this._getfirstday(year[`${y}`], 0)
      let lastofYear = this._getlastday(year[`${y}`], 12)
      let query = `TuNgay=${firstofYear}&ToiNgay=${lastofYear}`
      let countSuccessOrError = await dashboardServices.countSuccessOrError(query)
      ERROR[`${y}`] = 0;
      SUCCESS[`${y}`] = 0
      let data = countSuccessOrError.data
      data.forEach(item => {
        if (item.KQ === "ERROR") { ERROR[`${y}`] = item.count }
        if (item.KQ === "SUCCESS") { SUCCESS[`${y}`] = item.count }
      })
    }
    this.state.dataYear = this._pushData(year, SUCCESS, ERROR)
    this.forceUpdate()
  }

  _getfirstday = (year, month) => {
    let firstofYear = new Date(year, month, 1)
    return Date.parse(firstofYear);
  }

  _getlastday = (year, month) => {
    let lastofYear = new Date(year, month, 0, 24, 0, -1);
    return Date.parse(lastofYear);
  }

  _pushData = (data, SUCCESS, ERROR) => {
    let array = [
      ['x', 'Thành công', 'Không thành công'],
    ]
    for (let i = data.length - 1; i >= 0; i--) {
      array.push([data[i], SUCCESS[i], ERROR[i]])
    }
    return array
  }

  _getdataMonth = async () => {
    let now = new Date()
    let month = []
    let SUCCESS = []
    let ERROR = []
    for (let m = 0; m < 12; m++) {
      let before = new Date(now.getFullYear(), now.getMonth() - m, 1);
      let currentMonth = before.getMonth();
      let currentYear = before.getFullYear();
      let firstofMonth = this._getfirstday(currentYear, currentMonth)
      let lastofMonth = this._getlastday(currentYear, currentMonth + 1)
      let monthyear = currentMonth + 1 + '/' + currentYear
      month.push(monthyear)
      let query = `TuNgay=${firstofMonth}&ToiNgay=${lastofMonth}`
      let countSuccessOrError = await dashboardServices.countSuccessOrError(query)
      ERROR[m] = 0;
      SUCCESS[m] = 0
      let data = countSuccessOrError.data
      data.forEach(item => {
        if (item.KQ === "ERROR") { ERROR[m] = item.count }
        if (item.KQ === "SUCCESS") { SUCCESS[m] = item.count }
      })
    }
    this.state.dataMonth = this._pushData(month, SUCCESS, ERROR)
    this.forceUpdate()
  }

  _getdataWeek = async () => {
    let date = new Date()
    let year = date.getFullYear()
    let week = []
    let weekNo = this._weekNumber(date)
    let day = 31
    let weeklastYear = '';
    let SUCCESS = []
    let ERROR = []
    do {
      let d = new Date(year - 1, 11, day--);
      weeklastYear = this._weekNumber(d);
    } while (weeklastYear == 1);
    if (weekNo >= 12) {
      for (let w = weekNo, m = 0; w > (weekNo - 12); w--, m++) {
        week.push(w + '.' + year)
        let query = this._querybyWeek(year, w)
        let countSuccessOrError = await dashboardServices.countSuccessOrError(query)
        ERROR[m] = 0;
        SUCCESS[m] = 0
        let data = countSuccessOrError.data
        data.forEach(item => {
          if (item.KQ === "ERROR") { ERROR[m] = item.count }
          if (item.KQ === "SUCCESS") { SUCCESS[m] = item.count }
        })
      }
    } else {
      let weekBefore = 12 - weekNo;
      let m = 0
      for (let w = weekNo; w > 0; w--, m++) {
        week.push(w + '.' + year)
        let query = this._querybyWeek(year, w)
        let countSuccessOrError = await dashboardServices.countSuccessOrError(
          query
        );
        ERROR[m] = 0;
        SUCCESS[m] = 0
        let data = countSuccessOrError.data
        data.forEach(item => {
          if (item.KQ === "ERROR") { ERROR[m] = item.count }
          if (item.KQ === "SUCCESS") { SUCCESS[m] = item.count }
        })
      }
      let yearBefore = year - 1
      for (let wb = weeklastYear; weekBefore > 0; weekBefore--, wb--, m++) {
        week.push(wb + '.' + yearBefore)
        let query = this._querybyWeek(yearBefore, wb);
        let countSuccessOrError = await dashboardServices.countSuccessOrError(query);
        ERROR[m] = 0;
        SUCCESS[m] = 0
        let data = countSuccessOrError.data
        data.forEach(item => {
          if (item.KQ === "ERROR") { ERROR[m] = item.count }
          if (item.KQ === "SUCCESS") { SUCCESS[m] = item.count }
        })
      }
    }
    this.state.dataWeek = this._pushData(week, SUCCESS, ERROR)
    this.forceUpdate()
  }

  _querybyWeek = (year, week) => {
    let monday = moment().day("Monday").year(year).week(week).toDate();
    monday.setHours(0, 0, 0)
    let sunday = moment().day("Sunday").year(year).week(week + 1).toDate();
    sunday.setHours(23, 59, 59)
    let firstofWeek = Date.parse(monday)
    let lastofWeek = Date.parse(sunday)
    let query = `TuNgay=${firstofWeek}&ToiNgay=${lastofWeek}`
    return query
  }

  _weekNumber = (date) => {
    date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    date.setHours(0, 0, 0)
    date.setDate(date.getDate() + 4 - (date.getDay() || 7));
    let yearStart = new Date(date.getFullYear(), 0, 1);
    let weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
    return weekNo
  }

  _getdataDay = async () => {
    let date = new Date()
    let today = Date.parse(date)
    let day = []
    let SUCCESS = []
    let ERROR = []
    for (let d = 0; d < 7; d++) {
      let bfday = today - 86400000;
      let myObj = new Date(today).toString()
      let dayyyy = new Date(myObj)
      let startDay = dayyyy.setHours(0, 0, 0);
      let endDay = dayyyy.setHours(23, 59, 59)
      let query = `TuNgay=${startDay}&ToiNgay=${endDay}`
      let countSuccessOrError = await dashboardServices.countSuccessOrError(query)
      ERROR[d] = 0;
      SUCCESS[d] = 0
      let data = countSuccessOrError.data
      data.forEach(item => {
        if (item.KQ === "ERROR") { ERROR[d] = item.count }
        if (item.KQ === "SUCCESS") { SUCCESS[d] = item.count }
      })
      let date = dayyyy.getDate()
      let month = dayyyy.getMonth() + 1
      let year = dayyyy.getFullYear()
      today = bfday
      day.push(date + '/' + month + '/' + year)
    }
    this.state.dataDay = this._pushData(day, SUCCESS, ERROR)
    this.forceUpdate()
  }

  _clickNam = (evt) => {
    this.state.checkNam = true;
    this.state.checkThang = false;
    this.state.checkTuan = false;
    this.state.checkNgay = false;
    this.forceUpdate();
  };

  _clickThang = (evt) => {
    this._getdataMonth()
    this.state.checkNam = false;
    this.state.checkThang = true;
    this.state.checkTuan = false;
    this.state.checkNgay = false;
    this.forceUpdate();
  };

  _clickTuan = (evt) => {
    this._getdataWeek()
    this.state.checkNam = false;
    this.state.checkThang = false;
    this.state.checkTuan = true;
    this.state.checkNgay = false;
    this.forceUpdate();
  };

  _clickNgay = (evt) => {
    this._getdataDay()
    this.state.checkNam = false;
    this.state.checkThang = false;
    this.state.checkTuan = false;
    this.state.checkNgay = true;
    this.forceUpdate();
  };

  render() {
    let { dataYear, dataMonth, dataWeek, dataDay, checkNam, checkThang, checkTuan, checkNgay } = this.state
    let { label } = this.props
    return (
      <div className="card mb-4">
        <div className="card-header">
          <h5 className='text-info'><i className="fas fa-chart-bar mr-1"></i>{label.toUpperCase()}</h5>
        </div>
        <div className="card-body">
          <nav>
            <div className="nav nav-tabs" id="nav-tab" role="tablist">
              <a
                className="nav-item nav-link active"
                id="nam-tab"
                data-toggle="tab"
                href="#nam"
                role="tab"
                aria-controls="nam"
                aria-selected="true"
                onClick={this._clickNam}
              >
                Năm
                    </a>
              <a
                className="nav-item nav-link"
                id="thang-tab"
                data-toggle="tab"
                href="#thang"
                role="tab"
                aria-controls="thang"
                aria-selected="false"
                onClick={this._clickThang}
              >
                Tháng
                    </a>
              <a
                className="nav-item nav-link"
                id="tuan-tab"
                data-toggle="tab"
                href="#tuan"
                role="tab"
                aria-controls="tuan"
                aria-selected="false"
                onClick={this._clickTuan}
              >
                Tuần
                    </a>
              <a
                className="nav-item nav-link"
                id="ngay-tab"
                data-toggle="tab"
                href="#ngay"
                role="tab"
                aria-controls="ngay"
                aria-selected="false"
                onClick={this._clickNgay}
              >
                Ngày
                    </a>
            </div>
          </nav>

          <div
            className="tab-pane fade show active"
            id="nam"
            role="tabpanel"
            aria-labelledby="nam-tab"
          >
            {checkNam && (
              <Chart
                height={'500px'}
                chartType="AreaChart"
                loader={<div>Loading...</div>}
                data={dataYear}
                options={{
                  hAxis: { title: 'Năm', titleTextStyle: { color: '#333' } },
                  vAxis: { minValue: 0 },
                  chartArea: { width: '75%', height: '70%' },
                  animation: {
                    duration: 1000,
                    easing: 'out',
                    startup: true
                  }
                }}
                graph_id="ChartNam"
                // chartEvents={[
                //   {
                //     eventName: "ready",
                    // callback: ({ chartWrapper, google }) => {
                      // let chart = new google.visualization.ColumnChart(document.getElementById("ChartNam"));
                      // let chart = chartWrapper.getChart()
                      // google.visualization.events.addListener(
                      //   chart,
                      //   'error',
                      //   function (err) {
                      //     google.visualization.errors.removeError(err.id);
                      //     alert("error catch")
                      //   })
                      // google.visualization.events.addListener(
                      //   chart,
                      //   'ready',
                      //   function () {
                      //     let urlChart =chart.getImageURI();
                      //     console.log(urlChart);
                      //     }
                      // )
                  //   }
                  // }
                // ]}
                rootProps={{ 'data-testid': '1' }}
              />
            )}
          </div>
                
          <div
            className="tab-pane fade"
            id="thang"
            role="tabpanel"
            aria-labelledby="thang-tab"
          >
            {checkThang && (
              <Chart
                height={'500px'}
                chartType="AreaChart"
                loader={<div>Loading...</div>}
                data={dataMonth}
                options={{
                  hAxis: { title: 'Tháng', titleTextStyle: { color: '#333' } },
                  vAxis: { minValue: 0 },
                  chartArea: { width: '75%', height: '70%' },
                  animation: {
                    duration: 1000,
                    easing: 'out',
                    startup: true
                  },
                }}
                rootProps={{ 'data-testid': '1' }}
              />
            )}
          </div>

          <div
            className="tab-pane fade"
            id="tuan"
            role="tabpanel"
            aria-labelledby="tuan-tab"
          >
            {checkTuan && (
              <Chart
                height={'500px'}
                chartType="AreaChart"
                loader={<div>Loading...</div>}
                data={dataWeek}
                options={{
                  hAxis: { title: 'Tuần', titleTextStyle: { color: '#333' } },
                  vAxis: { minValue: 0 },
                  chartArea: { width: '75%', height: '70%' },
                  animation: {
                    duration: 1000,
                    easing: 'out',
                    startup: true
                  }
                }}
                rootProps={{ 'data-testid': '1' }}

              />
            )}
          </div>

          <div
            className="tab-pane fade"
            id="ngay"
            role="tabpanel"
            aria-labelledby="ngay-tab"
          >
            {checkNgay && (
              <Chart
                height={'500px'}
                chartType="AreaChart"
                loader={<div>Loading...</div>}
                data={dataDay}
                options={{
                  hAxis: { title: 'Ngày', titleTextStyle: { color: '#333' } },
                  vAxis: { minValue: 0 },
                  chartArea: { width: '75%', height: '70%' },
                  animation: {
                    duration: 1000,
                    easing: 'out',
                    startup: true
                  }
                }}
                rootProps={{ 'data-testid': '1' }}
              />
            )}
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
export default connect(mapStateToProps)(HomeTransactionStatistics);

