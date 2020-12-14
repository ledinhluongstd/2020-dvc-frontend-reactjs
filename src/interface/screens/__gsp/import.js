import React, { Component } from "react";
import { connect } from "react-redux";
import { BreadCrumbs, Search, Pagination } from "interface/components";
import axios from 'axios'
import Modal from 'react-modal';
import Select from 'react-select'
import queryString from 'query-string'
import XLSX from 'xlsx';
import ReactDOM from 'react-dom';
import moment from 'moment'
import { fetchToastNotify, fetchWait } from "../../../controller/redux/app-reducer";
import { Link } from "react-router-dom";
import { confirmAlert } from 'react-confirm-alert';
import { Other } from 'interface/screens/error'
import { __DEV__, SUPER } from "../../../common/ulti/constants";
import * as CONSTANTS from 'common/ulti/constants';
import * as tbDonVi from 'controller/services/tbDonViServices'
import * as tbDMDCQG from 'controller/services/tbDMDCQGServices'
import * as cmFunction from 'common/ulti/commonFunction'
import JSONTree from 'react-json-tree'

class ImportDMDCQG extends Component {
  constructor(props) {
    super(props)
    this.state = {
      jsonData: [],
      data: [],
      isLoad: false,
      isCheck: false,
      listInserted: [],
      listError: [],
      listNonDiffrent: []
    }
  }

  componentDidMount = async () => {
    let { LoginRes } = this.props
    if (LoginRes.roles !== SUPER.roles) {
      cmFunction.goBack()
    }
  }

  componentDidUpdate(prevProps) {

  }

  _handleSelectFile = (event) => {
    try {
      let fileObj = event.target.files[0];
      if (!fileObj) return
      this.state.isCheck = false
      this.state.isLoad = false
      this.forceUpdate()
      this.props.dispatch(fetchWait(true))
      let self = this
      const fileReader = new FileReader();
      fileReader.readAsText(fileObj, "UTF-8");
      fileReader.onload = e => {
        let result = e.target.result
        self.setState({ data: result, isLoad: true }, () => {
          self.props.dispatch(fetchWait(false))
        })
      };
    } catch (e) {
      console.log(e)
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Có lỗi' }))
    }
  }

  _checkDiffrent(dataOrg, data) {
    let a = cmFunction.clone(dataOrg)
    let b = cmFunction.clone(data)
    delete a._id
    delete a._etag
    delete a.code
    delete a.createdAt
    delete a.createdBy
    delete a.isActive
    delete a.checked
    delete a.modifiedAt
    delete a.modifiedBy

    delete b._id
    delete b._etag

    return cmFunction.compareObject(a, b)
  }

  _handleConvert = async () => {
    let { isLoad, isCheck, data } = this.state
    if (!isLoad) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.WARNING, data: 'Chọn file dữ liệu' }))
      return
    }
    if (isCheck) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.WARNING, data: 'Dữ liệu đã được chuyển đổi' }))
      return
    }
    this.props.dispatch(fetchWait(true))

    try {

      let dataTmp = JSON.parse(data)
      dataTmp.sort((a, b) => (a.TotalItem < b.TotalItem) ? 1 : ((b.TotalItem < a.TotalItem) ? -1 : 0));

      // kiểm tra dữ liệu khác nhau
      let query = { page: 1, pagesize: 1000, count: true, keys: JSON.stringify({ BanGhi: 0 }) }
      let dmdcqg = await tbDMDCQG.getAll(new URLSearchParams(query).toString())
      if (!dmdcqg) {
        this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Có lỗi, vui lòng thử lại' }))
        return
      }
      let listNonDiffrent = []
      dmdcqg = dmdcqg && dmdcqg._embedded ? dmdcqg._embedded : [];
      dmdcqg.map((item, i) => {
        let index = dataTmp.findIndex(x => x.CategoryCode === item.CategoryCode)
        if (index !== -1) {
          let check = this._checkDiffrent(item, dataTmp[`${index}`])
          if (check) listNonDiffrent.push(dataTmp[`${index}`]._id.$oid)
        }
      })


      this.setState({ jsonData: dataTmp, listNonDiffrent: listNonDiffrent, isCheck: true }, () => {
        this.props.dispatch(fetchWait(false))
      })
    } catch (e) {
      console.log(e)
      this.state.isCheck = false
      this.forceUpdate()
      this.props.dispatch(fetchWait(false))
    }
  }

  _handleUpload = async () => {
    let { isLoad, isCheck, jsonData, data } = this.state
    if (!isLoad || !isCheck) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.WARNING, data: 'Chọn file dữ liệu và thực hiện chuyển đổi' }))
      return
    }
    let listInserted = cmFunction.clone(this.state.listInserted), listError = [], jsonDataInsert = []
    jsonData.map(item => {
      // kiểm tra nếu dữ liệu được check và không nằm trong danh sách dữ liệu đã insert
      let index = listInserted.findIndex(x => x === (item._id.$oid || item._id))
      if (item.checked && index === -1) jsonDataInsert.push(item)
    })
    if (!jsonDataInsert.length || jsonDataInsert.length > 10) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.WARNING, data: 'Vui lòng chọn từ 1-10 danh mục cần upload' }))
      return
    }

    try {
      let sizeOfData = Buffer.from(JSON.stringify(jsonDataInsert)).length
      if (sizeOfData > 15000000) {
        this.props.dispatch(fetchToastNotify({ type: CONSTANTS.WARNING, data: 'Dữ liệu danh mục tải lên quá lớn, vui lòng chọn ít danh mục hơn hoặc liên hệ quản trị viên để được hướng dẫn' }))
        return
      }

      jsonDataInsert.map(async (item, index) => {
        let query = {
          page: 1,
          pagesize: 1000,
          count: true,
          filter: JSON.stringify({ CategoryCode: item.CategoryCode })
        }
        let id = item._id.$oid

        let dataExist = await tbDMDCQG.checkCategoryCode(new URLSearchParams(query).toString())
        let itemUpdate = JSON.parse(JSON.stringify(item))
        delete itemUpdate.checked

        if (dataExist.status === true) {
          delete itemUpdate._id
          let res = await tbDMDCQG.updatePutById(dataExist._id.$oid, itemUpdate)
          if (res) { listInserted.push(id) } else { listError.push(id) }
        } else if (dataExist.status === false) {
          delete itemUpdate.checked
          let res = await tbDMDCQG.create(itemUpdate)
          if (res) { listInserted.push(id) } else { listError.push(id) }
        }
        this.state.listInserted = listInserted
        this.state.listError = listError
        this.forceUpdate()
      })
    } catch (err) {
      console.log('err', err)
    }
  }

  _handleCheckItem = (evt) => {
    this.state.jsonData.forEach((item, index) => {
      if (item._id.$oid === evt.target.id || item._id === evt.target.id)
        item.checked = evt.target.checked
    });
    this.forceUpdate()
  }

  render() {
    let { jsonData, value, listInserted, listError, listNonDiffrent } = this.state
    let { isCheck, isLoad } = this.state
    let { } = this.state
    try {
      return (
        <React.Fragment>
          <div className="main portlet fade-in">
            <BreadCrumbs title={"Import"} route={[
              { label: 'Nhóm danh mục quốc gia', value: '/quoc-gia/nhom-danh-muc' },
              { label: "Import", value: '' },
            ]} />
            <div className="portlet-title">
              <div className="caption">
                <i className="fas fa-grip-vertical" />Import
              </div>
              <div className="action">
                <button onClick={this._handleUpload} className="btn btn-sm btn-outline-info border-radius pull-right" title="Tìm kiếm">
                  <i className="fas fa-upload"></i>Upload
                </button>
                <button onClick={this._handleConvert} className="btn btn-sm btn-outline-info border-radius pull-right" title="Tìm kiếm">
                  <i className="fas fa-exchange-alt"></i>Chuyển đổi
                </button>
                <label htmlFor="file-upload" className="btn btn-sm btn-outline-primary border-radius">
                  <i className="fas fa-upload"></i>Chọn file json
                </label>
                <input
                  id="file-upload"
                  className="btn btn-sm btn-outline-primary border-radius"
                  type="file" accept=".json"
                  value={value}
                  onChange={this._handleSelectFile}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <React.Fragment><strong>Chú ý: Dữ liệu JSON phải được export dưới dạng 'JSON - mongoexport' && 'Export as document array'</strong><br /></React.Fragment>
                {isLoad && <React.Fragment><i className="fas fa-hand-point-right"></i>&nbsp;<span>Load dữ liệu thành công, tiền hành chuyển đổi</span><br /></React.Fragment>}
                {isCheck && <React.Fragment><i className="fas fa-hand-point-right"></i>&nbsp;<span>Chuyển đổi dữ liệu thành công tiến hành upload (vui lòng chọn từ 1-10 danh mục cần upload, để đảm bảo an toàn dữ liệu)</span><br /></React.Fragment>}
              </div>

              {!!jsonData.length && <div className="card-body fix-first">
                <div className='mb-1'>
                  <strong>*** Danh sách danh mục ***</strong><br />
                  <span style={{ color: '#007bff' }}>Có sự khác biệt với danh mục đã đồng bộ trước đó&nbsp;{jsonData.length - listNonDiffrent.length}</span><br />
                  <span style={{ color: '#28a745' }}>Upload thành công&nbsp;{listInserted.length}</span><br />
                  <span style={{ color: '#dc3545' }}>Upload không thành công&nbsp;{listError.length}</span><br />
                </div>
                <div className="table-fix-head-custom">
                  <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Tên</th>
                        <th>Mã</th>
                        <th style={{ width: '80px' }}>Số bản ghi</th>
                        <th>Chọn</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jsonData.map((item, index) => {
                        let checkInserted = listInserted.findIndex(x => x === (item._id.$oid || item._id))
                        let checkError = listError.findIndex(x => x === (item._id.$oid || item._id))
                        let checkNonDiff = listNonDiffrent.findIndex(x => x === (item._id.$oid || item._id)) // true là không có sự khác biêt
                        let color = checkInserted !== -1 ? '#28a745' : (checkError !== -1 ? '#dc3545' : (checkNonDiff !== -1 ? '' : '#007bff'))
                        return <tr key={index} >
                          <td className='text-center'>{index + 1}</td>
                          <td><span style={{ color: color }}>{item.CategoryName}</span></td>
                          <td><span style={{ color: color }}>{item.CategoryCode}</span></td>
                          <td><span style={{ color: color }}>{item.TotalItem}</span></td>
                          <td className='td-checkbox'>
                            <input type="checkbox" disabled={checkInserted !== -1} checked={item.checked || false} id={item._id.$oid || item._id} onChange={this._handleCheckItem} />
                          </td>
                        </tr>
                      })}
                    </tbody>
                  </table>
                </div>
              </div>}
              <div className="card-footer">
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    } catch (e) {
      if (__DEV__) console.log(e)
      return <Other data={e} />
    }
  }
}

const mapStateToProps = state => {
  let { LoginRes, General } = state;
  return { LoginRes, General };
};
export default connect(mapStateToProps)(ImportDMDCQG);
