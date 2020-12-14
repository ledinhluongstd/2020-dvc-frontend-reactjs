import React, { Component } from "react";
import { connect } from "react-redux";
import { fetchToastNotify } from "../../../../controller/redux/app-reducer";
import { Link } from "react-router-dom";
import { __DEV__ } from "../../../../common/ulti/constants";
import * as CONSTANTS from 'common/ulti/constants';
import * as dashboardServices from 'controller/services/dashboardServices'
import axios from 'axios'

class HomeUsers extends Component {
  constructor(props) {
    super(props)
    this.state = {
      user: { count: 0, data: [] }
    }
  }

  componentDidMount = () => {
    this._init()
  }

  _init = async () => {
    let axiosReq = [
      dashboardServices.countUser(),
    ]
    let axiosRes = await axios.all(axiosReq).then(axios.spread((...responses) => {
      return responses
    })).catch(errors => {
      if (__DEV__) console.log(errors)
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Có lỗi _init' }))
    })
    let user = this._convert(axiosRes[0])

    this.state.user = user

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
    let { user } = this.state
    return (
      <div className="col-xl-3 col-md-6">
        <div className="card card-home bg-danger text-white mb-4">
          <div className="card-body"><strong>Tổng số người dùng: {user.count}</strong></div>
          <div className="card-dashboard">
            {user.data.map((item, index) => {
              if (index <= 2)
                return (
                  <div key={index} className="card-db-item">
                    <span key={index}>{`${item.TrangThai ? 'Kích hoạt' : 'Chưa kích hoạt'}${': '}`}</span><span >{item.count}</span>
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
            <Link className="small text-white stretched-link" to="/quan-ly/nguoi-dung">Chi tiết</Link>
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
export default connect(mapStateToProps)(HomeUsers);
