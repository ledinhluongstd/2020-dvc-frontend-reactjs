import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchToastNotify } from "../../../../controller/redux/app-reducer";
import { Link } from "react-router-dom";
import { __DEV__ } from "../../../../common/ulti/constants";
import * as CONSTANTS from 'common/ulti/constants';
import * as dashboardServices from 'controller/services/dashboardServices'
import axios from 'axios'

class HomeOrganizational extends Component {
  constructor(props) {
    super(props)
    this.state = {
      donvi: { count: 0, data: [] },
    }
  }

  componentDidMount = () => {
    this._init()
  }

  _init = async () => {
    let axiosReq = [
      dashboardServices.countDonVi(),
    ]
    let axiosRes = await axios.all(axiosReq).then(axios.spread((...responses) => {
      return responses
    })).catch(errors => {
      if (__DEV__) console.log(errors)
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Có lỗi _init' }))
    })
    let donvi = this._convert(axiosRes[0])

    this.state.donvi = donvi

    this.forceUpdate()
  }

  _convert = (data) => {
    if (!data) return { count: 0, data: [] }
    let res = { count: 0, data: [] }
    data.data.map(item => {
      res.count += item.count
      res.data.push(item)
    })
    return res
  }

  render() {
    let { donvi } = this.state
    return (
      <div className="col-xl-3 col-md-6">
        <div className="card card-home bg-success text-white mb-4">
          <div className="card-body"><strong>Tổng số đơn vị: {donvi.count}</strong></div>
          <div className="card-dashboard">
            {donvi.data.map((item, index) => {
              if (index <= 2)
                return (
                  <div key={index} className="card-db-item">
                    <span key={index}>{`${item.Khoi || 'Khối chính'}${': '}`}</span><span >{item.count}</span>
                  </div>
                )
              if (index === 3)
                return (
                  <div key={index} className="card-db-item">
                    <span >...</span>
                  </div>
                )
            })}
          </div>
          <div className="card-footer d-flex align-items-center justify-content-between">
            <Link className="small text-white stretched-link" to="/quan-ly/don-vi">Chi tiết</Link>
            <div className="small text-white"><i className="fas fa-angle-right"></i></div>
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
export default connect(mapStateToProps)(HomeOrganizational);

// function Home({ ...props }) {
//   return (

//   );
// }

// export default Home;
