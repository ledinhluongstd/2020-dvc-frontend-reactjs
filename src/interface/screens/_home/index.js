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
import axios from 'axios'
import {
  BreadCrumbs, HomeCategory, HomeCategoryGroup, HomeOrganizational, HomeUsers, HomeSector,
  HomeCounterStatistics,
  HomeCategorySearchStatistics,
  HomePublicCategorySearchStatistics
} from "../../components";

class Home extends Component {
  constructor(props) {
    super(props)
    this.state = {
      // danhmuc: { count: 0, data: [] },
      // nhomdanhmuc: { count: 0, data: [] },
      // donvi: { count: 0, data: [] },
      // user: { count: 0, data: [] }
    }
  }

  componentDidMount = () => {
    this._init()
  }

  _init = async () => {
    // let axiosReq = [
    //   dashboardServices.countDanhMuc(),
    //   dashboardServices.countNhomDanhMuc(),
    //   dashboardServices.countDonVi(),
    //   dashboardServices.countUser(),
    // ]
    // let axiosRes = await axios.all(axiosReq).then(axios.spread((...responses) => {
    //   return responses
    // })).catch(errors => {
    //   if (__DEV__) console.log(errors)
    //   this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Có lỗi _init' }))
    // })
    // console.log(axiosRes)
    // let danhmuc = this._convert(axiosRes[0])
    // let nhomdanhmuc = this._convert(axiosRes[1])
    // let donvi = this._convert(axiosRes[2])
    // let user = this._convert(axiosRes[3])

    // this.state.danhmuc = danhmuc
    // this.state.nhomdanhmuc = nhomdanhmuc
    // this.state.donvi = donvi
    // this.state.user = user

    // this.forceUpdate()
  }



  render() {
    let { } = this.state
    return (
      <div className="main portlet fade-in">
        <BreadCrumbs title={"Thống kê"} route={[{ label: 'Thống kê', value: '/' }]} />
        <br />
        <div className="row ">
          <HomeCategory />
          {/* <HomeCategoryGroup /> */}
          <HomeSector />
          <HomeOrganizational />
          <HomeUsers />
        </div>
        <div className="row ">
          {/* <div className="col-xl-6">
            <div className="card mb-4">
              <div className="card-header"><i className="fas fa-chart-area mr-1"></i>BarChart Example</div>
              <div className="card-body">
                <Chart
                  chartType="BarChart"
                  loader={<div>Đang tải ...</div>}
                  data={[
                    ['City', '2010 Population', '2000 Population'],
                    ['New York City, NY', 8175000, 8008000],
                    ['Los Angeles, CA', 3792000, 3694000],
                    ['Chicago, IL', 2695000, 2896000],
                    ['Houston, TX', 2099000, 1953000],
                    ['Philadelphia, PA', 1526000, 1517000],
                  ]}
                  options={{
                    title: 'Population of Largest U.S. Cities',
                    chartArea: { width: '50%' },
                    hAxis: {
                      title: 'Total Population',
                      minValue: 0,
                    },
                    vAxis: {
                      title: 'City',
                    },
                  }}
                  // For tests
                  rootProps={{ 'data-testid': '1' }}
                />
              </div>
            </div>
          </div> */}
          <HomeCounterStatistics />
          <HomeCategorySearchStatistics />
          <HomePublicCategorySearchStatistics />
          {/* <div className="col-xl-6">
            <div className="card mb-4">
              <div className="card-header"><i className="fas fa-chart-area mr-1"></i>BarChart Example</div>
              <div className="card-body">
                <Chart
                  chartType="BarChart"
                  loader={<div>Đang tải ...</div>}
                  data={[
                    ['City', '2010 Population', '2000 Population'],
                    ['New York City, NY', 8175000, 8008000],
                    ['Los Angeles, CA', 3792000, 3694000],
                    ['Chicago, IL', 2695000, 2896000],
                    ['Houston, TX', 2099000, 1953000],
                    ['Philadelphia, PA', 1526000, 1517000],
                  ]}
                  options={{
                    title: 'Population of Largest U.S. Cities',
                    chartArea: { width: '50%' },
                    hAxis: {
                      title: 'Total Population',
                      minValue: 0,
                    },
                    vAxis: {
                      title: 'City',
                    },
                  }}
                  // For tests
                  rootProps={{ 'data-testid': '1' }}
                />
              </div>
            </div>
          </div>
          <div className="col-xl-6">
            <div className="card mb-4">
              <div className="card-header"><i className="fas fa-chart-bar mr-1"></i>LineChart Example</div>
              <div className="card-body">
                <Chart
                  chartType="LineChart"
                  loader={<div>Đang tải ...</div>}
                  data={[
                    ['x', 'dogs'],
                    [0, 0],
                    [1, 10],
                    [2, 23],
                    [3, 17],
                    [4, 18],
                    [5, 9],
                    [6, 11],
                    [7, 27],
                    [8, 33],
                    [9, 40],
                    [10, 32],
                    [11, 35],
                  ]}
                  options={{
                    hAxis: {
                      title: 'Time',
                    },
                    vAxis: {
                      title: 'Popularity',
                    },
                  }}
                  rootProps={{ 'data-testid': '1' }}
                />
              </div>
            </div>
          </div> */}
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

// function Home({ ...props }) {
//   return (

//   );
// }

// export default Home;
