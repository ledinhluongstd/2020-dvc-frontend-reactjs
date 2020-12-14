// import { Chart } from "react-google-charts";
// import React, { Component } from "react";
// import { connect } from "react-redux";
// import Modal from 'react-modal';
// import Select from 'react-select'
// import queryString from 'query-string'
// import XLSX from 'xlsx';
// import ReactDOM from 'react-dom';
// import moment from 'moment'
// import { fetchToastNotify } from "../../../controller/redux/app-reducer";
// import { Link } from "react-router-dom";
// import { confirmAlert } from 'react-confirm-alert';
// import { Other } from 'interface/screens/error'
// import { __DEV__, SUPER } from "../../../common/ulti/constants";
// import * as CONSTANTS from 'common/ulti/constants';
// import * as dashboardServices from 'controller/services/dashboardServices'
// import axios from 'axios'
// import {
//   BreadCrumbs, HomeCategory, HomeCategoryGroup, HomeOrganizational, HomeUsers, HomeSector,
//   HomeCounterStatistics,
//   HomeCategorySearchStatistics,
//   HomePublicCategorySearchStatistics,
//   Pagination
// } from "../../components";
// import { data } from './data'

// class ThongTinDangNhap extends Component {
//   constructor(props) {
//     super(props)
//     this.state = {
//       dichvu: [],
//       donvi: [],
//       phiengiaodich: [],
//       dangnhap: []
//     }
//   }

//   componentDidMount = () => {
//     this._init()
//   }

//   _init = async () => {
//     this.state.dichvu = data.dichvu
//     this.state.donvi = data.donvi
//     this.state.phiengiaodich = data.phiengiaodich
//     this.state.dangnhap = data.dangnhap
//     this.forceUpdate()
//   }



//   render() {
//     let { dichvu, donvi, phiengiaodich, dangnhap } = this.state
//     return (
//       <div className="main portlet fade-in">
//         <BreadCrumbs title={"Tổng quan Danh sách phiên"} route={[{ label: 'Tổng quan Danh sách phiên', value: '/' }]} />
//         <br />
//         <div className="row">
//           <div className="col-md-6 col-xl-6">
//             <div className="card mb-4">
//               <div className="card-header">
//                 <h5 className='text-info'><i className="fas fa-chart-bar mr-1"></i>{"Danh sách phiên".toUpperCase()}</h5>
//               </div>
//               <div className="card-body fix-first">
//                 <div className="table-fix-head-custom">
//                   <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
//                     <thead>
//                       <tr>
//                         <th className='th-stt'>Trạng thái</th>
//                         <th>Danh sách</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {phiengiaodich.map((item, index) => {
//                         return <tr key={index} >
//                           <td className='text-center'><i className="fas fa-check-circle fa-2x text-success"></i></td>
//                           <td className="text-left">
//                             <span className='td-nhom'>{item.IP}</span><br />
//                             <span className='td-url'>Dịch vụ: {item.Ten}</span><br />
//                             <span className='td-dichvu'>{item.UngDung}</span><br />
//                           </td>
//                         </tr>
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className="col-md-6 col-xl-6">
//             <div className="card mb-4">
//               <div className="card-header">
//                 <h5 className='text-info'><i className="fas fa-chart-bar mr-1"></i>{"Thống kê phiên hiện tại".toUpperCase()}</h5>
//               </div>
//               <div className="card-body">
//                 <Chart
//                   chartType="LineChart"
//                   height={'calc(100vh - 200px)'}
//                   loader={<div>Đang tải ...</div>}
//                   data={[
//                     ['x', 'Số phiên'],
//                     ['10:00', 4521],
//                     ['10:30', 2453],
//                     ['11:00', 5234],
//                     ['11:30', 2351],
//                     ['12:00', 2563],
//                     ['12:30', 4521],
//                   ]}
//                   options={{
//                     hAxis: {
//                       title: 'Thời điểm',
//                     },
//                     vAxis: {
//                       title: 'Số phiên',
//                     },
//                     series: {
//                       0: { color: '#1c91c0', curveType: 'function' },
//                     }
//                   }}
//                   rootProps={{ 'data-testid': '2' }}
//                 />
//               </div>
//             </div>
//           </div>

//         </div>
//         <hr />
//         <div className="row ">
//           <div className="col-xl-12">
//             <div className="card mb-4">
//               <div className="card-header">
//                 <h5 className='text-info'><i className="fas fa-chart-bar mr-1"></i>{"LOG ĐĂNG NHẬP".toUpperCase()}</h5>
//               </div>
//               <div className="card-body fix-first">
//                 <div className="table-fix-head">
//                   <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
//                     <thead>
//                       <tr>
//                         <th className='th-stt'>STT</th>
//                         <th>Thời điểm</th>
//                         <th>Tài khoản</th>
//                         <th>Ứng dụng</th>
//                         <th>Trạng thái</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {dangnhap.map((item, index) => {
//                         return <tr key={index} >
//                           <td className='text-center' style={{ width: '40px' }}>{index + 1}</td>
//                           <td>{item.ThoiGian}  </td>
//                           <td>{item.TaiKhoan}  </td>
//                           <td>{item.UngDung}  </td>
//                           <td><span className='text-success'>Thành công</span>  </td>
//                         </tr>
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//               <div className="card-footer">
//                 <Pagination history={this.props.history}
//                   page={1} pagesize={10}
//                   _size={20} _total_pages={100}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }
// }

// const mapStateToProps = state => {
//   let { LoginRes, General } = state;
//   return { LoginRes, General };
// };
// export default connect(mapStateToProps)(ThongTinDangNhap);

