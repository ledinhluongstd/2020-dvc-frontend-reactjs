import { Chart } from "react-google-charts";
import React, { Component } from "react";
import { connect } from "react-redux";
import Modal from 'react-modal';
import Select from 'react-select'
import queryString from 'query-string'
import XLSX from 'xlsx';
import ReactDOM from 'react-dom';
import moment from 'moment'
import { fetchToastNotify } from "../../../../controller/redux/app-reducer";
import { Link } from "react-router-dom";
import { confirmAlert } from 'react-confirm-alert';
import { Other } from 'interface/screens/error'
import { __DEV__, SUPER } from "../../../../common/ulti/constants";
import * as CONSTANTS from 'common/ulti/constants';
import * as dashboardServices from 'controller/services/dashboardServices'
import axios from 'axios'

class HomeCounterStatistics extends Component {
  constructor(props) {
    super(props)
    this.state = {
      data: {},
      date: new Date().getTime(),
      day_of_week: []
    }
  }

  componentDidMount = () => {
    this.state.day_of_week = this._handleSevenDay(this.state.date)
    this.forceUpdate()
    this._init()
  }

  _init = async () => {
    let { day_of_week } = this.state
    let TuNgay = moment(day_of_week[0], 'DD/MM/YYYY').valueOf()
    let ToiNgay = moment(day_of_week[day_of_week.length - 1], 'DD/MM/YYYY').valueOf() + 86400000
    let query = `TuNgay=${TuNgay}&ToiNgay=${ToiNgay}`
    let axiosReq = [
      dashboardServices.counterStatistics(query),
    ]
    let axiosRes = await axios.all(axiosReq).then(axios.spread((...responses) => {
      return responses
    })).catch(errors => {
      if (__DEV__) console.log(errors)
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Có lỗi _init' }))
    })
    let data = this._convert(axiosRes[0], this.state.day_of_week)

    this.state.data = data
    this.forceUpdate()
  }

  _convert = (data, day_of_week) => {
    if (!data.size) return [['x', 'Lượt truy cập']]
    let res = Array.apply(null, Array(day_of_week.length)).map(function () { return [] });
    res.unshift(['x', 'Lượt truy cập'])
    let arr = data.data
    day_of_week.map((element, index) => {
      res[index + 1][0] = element
      res[index + 1][1] = 0
      arr.map(item => {
        if (item.createdAt >= moment(element, 'DD/MM/YYYY').valueOf() && item.createdAt <= (moment(element, 'DD/MM/YYYY').valueOf() + 86400000)) {
          res[index + 1][1]++
        }
      })
    });
    return res
  }

  _handleSevenDay = now => {
    let now_9, now_8, now_7, now_6, now_5, now_4, now_3, now_2, now_1;
    let j = moment(now);
    now_1 = j.subtract("1", "days").format("DD/MM/YYYY");
    now_2 = j.subtract("1", "days").format("DD/MM/YYYY");
    now_3 = j.subtract("1", "days").format("DD/MM/YYYY");
    now_4 = j.subtract("1", "days").format("DD/MM/YYYY");
    now_5 = j.subtract("1", "days").format("DD/MM/YYYY");
    now_6 = j.subtract("1", "days").format("DD/MM/YYYY");
    now_7 = j.subtract("1", "days").format("DD/MM/YYYY");
    now_8 = j.subtract("1", "days").format("DD/MM/YYYY");
    now_9 = j.subtract("1", "days").format("DD/MM/YYYY");

    now = moment.unix(now / 1000).format("DD/MM/YYYY");
    let days = [now_9, now_8, now_7, now_6, now_5, now_4, now_3, now_2, now_1, now];
    return days;
  };

  render() {
    let { data } = this.state
    return (
      <div className="col-xl-12">
        <div className="card mb-4">
          <div className="card-header"><i className="fas fa-chart-bar mr-1"></i>Thống kê lượt truy cập ứng dụng (trong 10 ngày)</div>
          <div className="card-body">
            <Chart
              chartType="LineChart"
              loader={<div>Đang tải ...</div>}
              data={data}
              options={{
                hAxis: {
                  title: 'Thời gian',
                },
                vAxis: {
                  title: 'Số lượng',
                },
                series: {
                  // 0: { color: '#e2431e' },
                  // 1: { color: '#e7711b' },
                  0: { color: '#f1ca3a' },
                  // 3: { color: '#6f9654' },
                  // 4: { color: '#1c91c0' },
                  // 5: { color: '#43459d' },
                }
              }}
              rootProps={{ 'data-testid': '1' }}
            />
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
export default connect(mapStateToProps)(HomeCounterStatistics);

// function Home({ ...props }) {
//   return (

//   );
// }

// export default Home;
