    import { Chart } from "react-google-charts";
    import React, { Component } from "react";
    import { connect } from "react-redux";
    import * as dashboardServices from 'controller/services/dashboardServices'
    import {BreadCrumbs,} from "../../components";

    class ThongKeGiaoDich extends Component {
      constructor(props) {
        super(props)
        this.state = {
          countDay: 0,
          countWeek: 0,
          countMonth: 0,
          countYear: 0,
          countAll:0,
          dataChart:[]
        }
      }

      componentDidMount = () => {
        this._init()
      }

      _init = async () => {
        this._getDataDay()
        this._getDataWeek()
        this._getDataMonth()
        this._getDataYear()
        this._getAllData()
        this._getDataHours()
        this.forceUpdate()
      }
      _getDataDay = async () => {
        let date = new Date()
        let startDay = date.setHours(0, 0, 0);
        let endDay = date.setHours(23, 59, 59)
        let query = `TuNgay=${startDay}&ToiNgay=${endDay}`
        let countSuccessOrError = await dashboardServices.countSuccessOrError(query)
        let data = countSuccessOrError.data
        let count = 0;
        data.forEach((item) => {
          count = count + item.count
        })
        this.state.countDay = count
        this.forceUpdate()
      }
      _getDataWeek = async () => {
        let date = new Date()
        let mon = date.setHours(0, 0, 0)
        let sun = date.setHours(23, 59, 59)
        let monday = new Date(mon);
        monday.setDate(monday.getDate() - monday.getDay() + 1);
        let sunday = new Date(sun)
        sunday.setDate(sunday.getDate() - sunday.getDay() + 7);
        let firstofWeek = Date.parse(monday)
        let lastofWeek = Date.parse(sunday)
        let query = `TuNgay=${firstofWeek}&ToiNgay=${lastofWeek}`
        let countSuccessOrError = await dashboardServices.countSuccessOrError(query)
        let data = countSuccessOrError.data
        let count = 0;
        data.forEach((item) => {
          count = count + item.count
        })
        this.state.countWeek = count
        this.forceUpdate()
      }
      _getDataMonth = async () => {
        let date = new Date();
        let firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        let lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 24, 0, -1);
        let query = `TuNgay=${Date.parse(firstDayOfMonth)}&ToiNgay=${Date.parse(lastDayOfMonth)}`
        let countSuccessOrError = await dashboardServices.countSuccessOrError(query)
        let data = countSuccessOrError.data
        let count = 0;
        data.forEach((item) => {
          count = count + item.count
        })
        this.state.countMonth = count
        this.forceUpdate()
      }
      _getDataYear = async () => {
        let date = new Date();
        let firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        let lastDayOfYear = new Date(date.getFullYear(), 12, 0, 24, 0, -1);
        let query = `TuNgay=${Date.parse(firstDayOfYear)}&ToiNgay=${Date.parse(lastDayOfYear)}`
        let countSuccessOrError = await dashboardServices.countSuccessOrError(query)
        let data = countSuccessOrError.data
        let count = 0;
        data.forEach((item) => {
          count = count + item.count
        })
        this.state.countYear = count
        this.forceUpdate()
      }
      _getAllData = async () => {
        let date = new Date()
        let first = new Date(2020, 10, 1, 0, 0, 0)
        let query = `TuNgay=${Date.parse(first)}&ToiNgay=${Date.parse(date)}`
        let countSuccessOrError = await dashboardServices.countSuccessOrError(query)
        let data = countSuccessOrError.data
        let count = 0;
        data.forEach((item) => {
          count = count + item.count
        })
        this.state.countAll = count
        this.forceUpdate()
      }
      _getDataHours = async () => {
        let date = new Date();
        let hours = []
        let h = Date.parse(date)
        let count = [];
        for (let i = 0; i < 6; i++) {
          let bh = h - 3600000;
          let myObj = new Date(h).toString()
          let hoursssss= new Date(myObj)
          let query = `TuNgay=${bh}&ToiNgay=${h}`
          count[i] = 0
          let countSuccessOrError = await dashboardServices.countSuccessOrError(query)
          let data = countSuccessOrError.data
          data.forEach((item) => {
            count[i] = count[i] + item.count
          })
          let hhh = hoursssss.getHours()
          h=bh
          hours.push(hhh+':00')
        }
        let array = [
          ['x', 'Giao dịch mới'],
        ]
        for (let j = hours.length - 1; j >= 0; j--) {
          array.push([hours[j], count[j]])
        }
        this.state.dataChart = array;
        this.forceUpdate();
      }


      render() {
        let { countDay, countWeek, countMonth, countYear, countAll, dataChart } = this.state
        return (
          <div className="main portlet fade-in">
            <BreadCrumbs title={"Tổng quan Thông tin giao dịch"} route={[{ label: 'Tổng quan Thông tin giao dịch', value: '/' }]} />
            <br />
            <div className="row">
              <div className="col-md-4 col-xl-4 ">
                <div className="card card-home text-white mb-4 border border-primary card-bg-001 text-center ">
                  <div className="card-body"><strong><h3>GIAO DỊCH TRONG NGÀY</h3></strong></div>
                  <div className="card-dashboard "><h1>{countDay}</h1></div>
                </div>
                <div className="card card-home text-white mb-4 border border-primary card-bg-001 text-center">
                  <div className="card-body"><strong><h3>GIAO DỊCH TRONG TUẦN</h3></strong></div>
                  <div className="card-dashboard"><h1>{countWeek}</h1></div>
                </div>
              </div>

              <div className="col-md-8 col-xl-8">
                <div className="card">
                  <div className="card-body">
                    <Chart
                      chartType="LineChart"
                      height='400px'
                      loader={<div>Đang tải ...</div>}
                      data={dataChart}
                      options={{
                        hAxis: {
                          title: 'Thời điểm',
                        },
                        vAxis: {
                          title: 'Số lượng',
                          viewWindowMode: "explicit",   
                            viewWindow: {min: 0,max:100}, 
                          baseline:{
                            color: '#F6F6F6'
                           }
                        },
                        series: {
                          0: { color: '#1c91c0', curveType: 'function' },
                        }
                      }}
                      rootProps={{ 'data-testid': '2' }}
                    />
                  </div>
                  </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 col-xl-4">
                <div className="card card-home text-white mb-4 border border-primary card-bg-001 text-center">
                  <div className="card-body"><strong><h3>GIAO DỊCH TRONG THÁNG</h3></strong></div>
                  <div className="card-dashboard"><h1>{countMonth}</h1></div>
                </div>
              </div>

              <div className="col-md-4 col-xl-4">
                <div className="card card-home  text-white mb-4 border border-primary card-bg-001 text-center">
                  <div className="card-body"><strong><h3>GIAO DỊCH TRONG NĂM</h3></strong></div>
                  <div className="card-dashboard"><h1>{countYear}</h1></div>
                </div>
              </div>

              <div className="col-md-4 col-xl-4">
                <div className="card card-home  text-white mb-4 border border-primary card-bg-001 text-center">
                  <div className="card-body text-center"><strong><h3>TỔNG SỐ GIAO DỊCH</h3></strong></div>
                  <div className="card-dashboard"><h1>{countAll}</h1></div>
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
    export default connect(mapStateToProps)(ThongKeGiaoDich);

