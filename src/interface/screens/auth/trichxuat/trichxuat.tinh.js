import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { fetchLoginRequest } from '../../../../controller/redux/login-fetch-reducers'
import Footer from "../../../navigation/layouts/Admin/Footer/index.jsx";
import * as cmFunction from '../../../../common/ulti/commonFunction'
import { __DEV__ } from "../../../../common/ulti/constants";
import * as publicServices from '../../../../controller/services/publicServices'
import * as CONSTANTS from '../../../../common/ulti/constants';
import queryString from 'query-string'
import { Pagination } from "../../../components/index";
import { query } from "chartist";
import Select from 'react-select'
import { InputSearch, BreadCrumbs, FormInput, FormWrapper } from 'interface/components';
import { fetchWait } from "../../../../controller/redux/app-reducer";
import ReactDOM from 'react-dom';
import XLSX from 'xlsx';
import moment from 'moment'
import ReactToPrint from "react-to-print";
import * as gspServices from 'controller/services/gspServices'
import { GSP_DMDC } from "../../../../../config";
import * as Excel from "exceljs";
import { saveAs } from 'file-saver';

class ComponentToPrint extends React.Component {
  render() {
    let { data, danhmuc, thuoctinh } = this.props
    if (cmFunction.isEmpty(data) || !data.length)
      return null
    return (
      <div className="card-body fix-first">
        <h2 className="modal-title text-center">{danhmuc.Ten}</h2>
        <br />
        <table className="table table-bordered" width="100%">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên</th>
              <th>Mã</th>
              {data[0].ThuocTinh.map((item, index) => {
                let checkShow = thuoctinh.findIndex(x => x.Ma === item.Ma && x.checked)
                if (checkShow !== -1)
                  return <th key={index}>{item.Ten}</th>
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              return <tr key={index} >
                <td className='text-center'>{index + 1}</td>
                <td>{item.TEN}</td>
                <td>{item.MA}</td>
                {item.ThuocTinh.map((i, d) => {
                  let checkShow = thuoctinh.findIndex(x => x.Ma === i.Ma && x.checked)
                  if (checkShow !== -1)
                    switch (i.KieuDuLieu.Ma) {
                      case CONSTANTS.KIEU_DU_LIEU.select.value:
                        return i.LuaChon.map((ii, dd) => {
                          if (ii.Checked) return <td key={dd}>{ii.GiaTri}</td>
                        })
                      case CONSTANTS.KIEU_DU_LIEU.radio.value:
                        return i.LuaChon.map((ii, dd) => {
                          if (ii.Checked) return <td key={dd}>{ii.GiaTri}</td>
                        })
                      default:
                        return <td key={d}>{i.LuaChon}</td>
                    }
                })}
              </tr>
            })}
          </tbody>
        </table>
      </div>
    );
  }
}

class TrichXuat extends Component {
  constructor(props) {
    super(props)
    this.state = {
      thuoctinh: [],
      banghi: [],
      search: { Ten: '', Ma: '' },
      searchDMTimeout: null,
      searchPVTimeOut: null,
      isCheckThuocTinh: false,
      isChecked: false,
      isTrichXuat: false,
      cbCheckAll: false,
      phamvi: null,
      // DMQG
      dulieudanhmucquocgia: []
    }
  }

  componentDidMount = async () => {
  }

  componentDidUpdate(prevProps) {
  }

  _handleChangeElement = (evt) => {
    this.state.search[evt.target.id] = evt.target.value
    this.state.isChecked = false
    this.state.isTrichXuat = false
    this.forceUpdate()
  }

  _handleLoadDanhMuc = (inputValue, callback) => {
    clearTimeout(this.state.searchDMTimeOut);
    this.state.searchDMTimeOut = setTimeout(async () => {
      let filter = {};
      filter.page = 1;
      filter.pagesize = 1000;
      filter.count = true
      filter.filter = JSON.stringify({ Ten: cmFunction.regexText(inputValue), KichHoat: true, PheDuyet: 3 });
      filter = new URLSearchParams(filter).toString();
      let dsDanhMuc = await publicServices.getDanhMuc(filter);
      dsDanhMuc = dsDanhMuc && dsDanhMuc._embedded ? dsDanhMuc._embedded : [];
      let danhmuc = cmFunction.convertSelectOptions(dsDanhMuc, '_id.$oid', 'Ten');
      callback(danhmuc);
    }, 500);
  };

  _handleLoadPhamVi = (inputValue, callback) => {
    clearTimeout(this.state.searchPVTimeOut);
    this.state.searchPVTimeOut = setTimeout(async () => {
      let danhmuc = [{ value: 'DMDTDC', label: 'Danh mục điện tử dùng chung' }, { value: 'DMQG', label: 'Danh mục quốc gia' }]
      callback(danhmuc);
    }, 500);
  };

  _handleLoadDanhMucQuocGia = (inputValue, callback) => {
    clearTimeout(this.state.searchDMTimeOut);
    this.state.searchDMTimeOut = setTimeout(async () => {
      let danhmuc = [], dsDanhMuc = await publicServices.getDanhMucQuocGia('GET', GSP_DMDC)
      dsDanhMuc = dsDanhMuc ? dsDanhMuc : [];
      dsDanhMuc.map(item => {
        if (!item.TotalItem) danhmuc.push(item)
      })
      dsDanhMuc = cmFunction.convertSelectOptions(dsDanhMuc, 'CategoryCode', 'CategoryName', danhmuc);
      callback(dsDanhMuc);
    }, 500);
  };

  _handleDanhMucQuocGiaChange = async (value) => {
    let dulieudanhmucquocgia = await publicServices.getDanhMucQuocGia('GET', value.UrlGetList)
    this.state.danhmucquocgiaSelected = value;
    this.state.dulieudanhmucquocgia = dulieudanhmucquocgia
    this.state.isTrichXuat = false
    this.state.isChecked = false
    this.state.isCheckThuocTinh = true
    this.forceUpdate();
  }

  _handleDanhMucChange = (value) => {
    this.state.danhmucSelected = value;
    if (!cmFunction.isEmpty(value)) {
      this.state.thuoctinh = value.NhomDanhMuc.ThuocTinh
      this.state.isCheckThuocTinh = true
    } else {
      this.state.isCheckThuocTinh = false
      this.state.thuoctinh = []
    }
    this.state.cbCheckAll = false
    this.state.isChecked = false
    this.state.isTrichXuat = false
    this.state.search = { Ma: "", Ten: "" }
    this.forceUpdate();
  }

  _handlePhamViChange = (value) => {
    this.state.phamviSelected = value;
    this.state.phamvi = value.value
    this.state.isChecked = false
    this.state.isTrichXuat = false
    this.state.isCheckThuocTinh = false
    this.forceUpdate();
  }

  _handleCheckAll = (evt) => {
    this.state.thuoctinh.forEach((item, index) => {
      item.checked = evt.target.checked
    });
    this.state.cbCheckAll = evt.target.checked
    this.state.isChecked = false
    this.state.isTrichXuat = false
    this.forceUpdate()
  }

  _handleCheckItem = (evt) => {
    this.state.thuoctinh.forEach((item, index) => {
      if (item._id.$oid === evt.target.id || item._id === evt.target.id)
        item.checked = evt.target.checked
    });
    this.state.isChecked = false
    this.state.isTrichXuat = false
    this.forceUpdate()
  }

  _handleCheck = () => {
    this.props.dispatch(fetchWait(true))
    setTimeout(() => {
      this.state.isChecked = true
      this.props.dispatch(fetchWait(false))
      this.forceUpdate()
    }, 1000)
  }

  _handleExport = () => {
    this.state.isTrichXuat = true
    this.state.banghi = this._convertBanGhi(this.state.danhmucSelected.tbBanGhi)
    this.forceUpdate()
  }

  _handleExportDMQG = async () => {
    let { danhmucquocgiaSelected } = this.state
    let dulieudanhmucquocgia = await publicServices.getDanhMucQuocGia('GET', danhmucquocgiaSelected.UrlGetList)
    this.state.dulieudanhmucquocgia = dulieudanhmucquocgia
    this.state.isTrichXuat = true
    this.forceUpdate();
  }

  _convertBanGhi = (banghi) => {
    let { search } = this.state
    let data = []
    banghi.map((item, index) => {
      let checkMa = search.Ma.trim() ? item.MA === search.Ma.trim() : true
      let checkTen = search.Ten.trim() ? cmFunction.changeAlias(item.TEN).toUpperCase() == cmFunction.changeAlias(search.Ten.trim()).toUpperCase() : true
      if (checkMa && checkTen) {
        data.push(item)
      }
    })
    return data
  }

  _handleExportExcel = (ref) => {
    // ví dụ xuất excel tại bảng đang có
    let { phamvi, danhmucSelected, danhmucquocgiaSelected } = this.state
    let myRows = [], maxCol = 0
    let table = ReactDOM.findDOMNode(this.refs[ref]);
    for (let tbindex = 0; tbindex < table.children.length; tbindex++) {
      let tb = table.children[tbindex]
      for (let trindex = 0; trindex < tb.children.length; trindex++) {
        let row = []
        let tr = tb.children[trindex]
        maxCol = tr.children.length > maxCol ? tr.children.length : maxCol
        for (let thindex = 0; thindex < tr.children.length - 1; thindex++) {
          let th = tr.children[thindex]
          row.push(th.innerText)
        }
        myRows.push(row)
      }
    }
    let date = cmFunction.timestamp2DateString(moment().valueOf())
    let nameRows = phamvi === 'DMQG' ? 'DMQG_' + danhmucquocgiaSelected.CategoryName : 'DMDTDC_' + danhmucSelected.Ten
    const wb = new Excel.Workbook()
    const ws = wb.addWorksheet(nameRows)
    ws.addRows(myRows)
    ws.getRow(1).font = { nameRows: 'Times New Roman', family: 2, size: 10, bold: true };
    for (let i = 0; i < myRows[1].length; i++) {
      ws.getCell(String.fromCharCode(65 + i) + 1).alignment = { vertical: 'top', horizontal: 'center' };
    }
    for (let i = 0; i < myRows.length; i++) {
      for (let j = 0; j < myRows[1].length; j++) {
        ws.getCell(String.fromCharCode(65 + j) + (i + 1)).border = {
          top: { style: 'thin', color: { argb: '00000000' } },
          left: { style: 'thin', color: { argb: '00000000' } },
          bottom: { style: 'thin', color: { argb: '00000000' } },
          right: { style: 'thin', color: { argb: '00000000' } }
        }
      }
    }
    wb.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' })
      saveAs(blob, nameRows + ".xlsx")
    })
  }

  render() {
    let { danhmucSelected, phamviSelected, danhmucquocgiaSelected, thuoctinh, banghi, search, phamvi } = this.state
    let { cbCheckAll, isCheckThuocTinh, isChecked, isTrichXuat, dulieudanhmucquocgia } = this.state
    return (
      <React.Fragment>
        <div className="main portlet trich-xuat">
          <div className="p-4 mb-4 search-block-title">
            <div className="portlet-title">
              <div className="caption">  <i className="fas fa-search" /> TIÊU CHÍ TRÍCH XUẤT   </div>
            </div>
            <br></br>
            <div className="form-body" ref="form">
              <FormWrapper>
                <FormInput
                  loadOptions={this._handleLoadPhamVi}
                  onChange={this._handlePhamViChange}
                  required={false}
                  defaultValue={phamviSelected}
                  isClearable={false}
                  isSearchable={true}
                  isDisabled={false}
                  defaultOptions={true}
                  type="select"
                  label="Chọn phạm vi trích xuất"
                  placeholder="Chọn phạm vi trích xuất ..."
                />
              </FormWrapper>
              {phamvi === 'DMDTDC' ? <FormWrapper>
                <FormInput
                  loadOptions={this._handleLoadDanhMuc}
                  onChange={this._handleDanhMucChange}
                  required={false}
                  defaultValue={danhmucSelected}
                  isClearable={true}
                  isSearchable={true}
                  isDisabled={false}
                  defaultOptions={true}
                  type="select"
                  label="Chọn danh mục trích xuất"
                  placeholder="Chọn danh mục trích xuất ..."
                />
              </FormWrapper> : null}
              {phamvi === 'DMQG' ? <FormWrapper>
                <FormInput
                  loadOptions={this._handleLoadDanhMucQuocGia}
                  onChange={this._handleDanhMucQuocGiaChange}
                  required={false}
                  defaultValue={danhmucquocgiaSelected}
                  isClearable={true}
                  isSearchable={true}
                  isDisabled={false}
                  defaultOptions={true}
                  type="select"
                  label="Chọn danh mục trích xuất"
                  placeholder="Chọn danh mục trích xuất ..."
                />
              </FormWrapper> : null}
              {phamvi === 'DMDTDC' && isCheckThuocTinh &&
                <React.Fragment>
                  <FormWrapper>
                    <FormInput
                      required={false}
                      disabled={false}
                      readOnly={false}
                      onChange={this._handleChangeElement}
                      defaultValue={search.Ten || ''}
                      type="text"
                      id="Ten"
                      label="Tên danh mục"
                      placeholder="Nhập tên danh mục"
                    />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      required={false}
                      disabled={false}
                      readOnly={false}
                      onChange={this._handleChangeElement}
                      defaultValue={search.Ma || ''}
                      type="text"
                      id="Ma"
                      label="Mã danh mục"
                      placeholder="Nhập mã danh mục"
                    />
                  </FormWrapper>
                </React.Fragment>}
            </div>
            {phamvi === 'DMDTDC' &&
              <React.Fragment>
                {isCheckThuocTinh &&
                  <div className="fix-first">
                    <div className="table-fix-head">
                      <table className="table table-bordered" id="#" width="100%" cellSpacing="0" ref="#">
                        <thead>
                          <tr>
                            <th>STT <br /></th>
                            <th>Tên thuộc tính <br /></th>
                            <th>Cho phép trích xuất <br />
                              <input type="checkbox" id='cbCheckAll' checked={cbCheckAll} onChange={this._handleCheckAll} />
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {thuoctinh.map((item, index) => {
                            return <tr key={index} >
                              <td className='text-center'>{index + 1}</td>
                              <td>{item.Ten}</td>
                              <td className="text-center">
                                <input type="checkbox" checked={item.checked || false} id={item._id.$oid || item._id} onChange={this._handleCheckItem} />
                              </td>
                            </tr>
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>}

                {isCheckThuocTinh &&
                  <div className='text-center'>
                    <button onClick={this._handleCheck} disabled={isChecked}
                      className="btn btn-outline-primary border-radius">
                      <i className="fas fa-check" />Kiểm tra
              </button>
                    {isChecked && <button onClick={this._handleExport}
                      className="btn btn-outline-primary border-radius">
                      <i className="fas fa-search" />Trích xuất dữ liệu
              </button>}
                  </div>}
              </React.Fragment>}

            {phamvi === 'DMQG' &&
              <React.Fragment>
                {isCheckThuocTinh && <div className='text-center'>
                  <button onClick={this._handleCheck} disabled={isChecked}
                    className="btn btn-outline-primary border-radius">
                    <i className="fas fa-check" />Kiểm tra
              </button>
                  {isChecked && <button onClick={this._handleExportDMQG}
                    className="btn btn-outline-primary border-radius">
                    <i className="fas fa-search" />Trích xuất dữ liệu
              </button>}
                </div>}
              </React.Fragment>}
          </div>
          {phamvi === 'DMDTDC' &&
            <React.Fragment>
              {isTrichXuat &&
                <div className="p-4 search-block-title">
                  <div className="portlet-title">
                    <div className="caption">  <i className="fas fa-grip-vertical" /> KẾT QUẢ TRÍCH XUẤT </div>
              Tổng số&nbsp;{banghi.length}&nbsp;bản ghi
            </div>
                  {banghi.length &&
                    <div className="card">
                      <div className="card-header">
                        <div className="action pull-right">
                          <button onClick={() => this._handleExportExcel('dataTable')} className="btn btn-sm btn-outline-info border-radius" title="Xuất excel">
                            <i className="fas fa-download" />Xuất excel
                  </button>
                          <button className="btn btn-sm btn-outline-info border-radius" data-toggle="modal" data-target="#openModal" title="In danh sách">
                            <i className="fas fa-print" />In danh sách
                  </button>
                        </div>
                      </div>
                      <div className="fix-first">
                        <div className="table-fix-head">
                          <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                            <thead>
                              <tr>
                                <th>STT</th>
                                <th>Tên</th>
                                <th>Mã</th>
                                {banghi[0].ThuocTinh.map((item, index) => {
                                  let checkShow = thuoctinh.findIndex(x => x.Ma === item.Ma && x.checked)
                                  if (checkShow !== -1)
                                    return <th key={index}>{item.Ten}</th>
                                })}
                              </tr>
                            </thead>
                            <tbody>
                              {banghi.map((item, index) => {
                                return <tr key={index} >
                                  <td className='text-center'>{index + 1}</td>
                                  <td>{item.TEN}</td>
                                  <td>{item.MA}</td>
                                  {item.ThuocTinh.map((i, d) => {
                                    let checkShow = thuoctinh.findIndex(x => x.Ma === i.Ma && x.checked)
                                    if (checkShow !== -1)
                                      switch (i.KieuDuLieu.Ma) {
                                        case CONSTANTS.KIEU_DU_LIEU.select.value:
                                          return i.LuaChon.map((ii, dd) => {
                                            if (ii.Checked) return <td key={dd}>{ii.GiaTri}</td>
                                          })
                                        case CONSTANTS.KIEU_DU_LIEU.radio.value:
                                          return i.LuaChon.map((ii, dd) => {
                                            if (ii.Checked) return <td key={dd}>{ii.GiaTri}</td>
                                          })
                                        default:
                                          return <td key={d}>{i.LuaChon}</td>
                                      }
                                  })}
                                </tr>
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>}
                </div>
              }
            </React.Fragment>
          }

          {phamvi === 'DMQG' &&
            <React.Fragment>
              {isTrichXuat &&
                <div className="p-4 search-block-title">
                  <div className="portlet-title">
                    <div className="caption">  <i className="fas fa-grip-vertical" /> KẾT QUẢ TRÍCH XUẤT </div>
              Tổng số&nbsp;{dulieudanhmucquocgia.length}&nbsp;bản ghi
            </div>
                  {dulieudanhmucquocgia.length &&
                    <div className="card">
                      <div className="card-header">
                        <div className="action pull-right">
                          <button onClick={() => this._handleExportExcel('dataTable')} className="btn btn-sm btn-outline-info border-radius" title="Xuất excel">
                            <i className="fas fa-download" />Xuất excel
                  </button>
                          {/* <button className="btn btn-sm btn-outline-info border-radius" data-toggle="modal" data-target="#openModal" title="In danh sách">
                            <i className="fas fa-print" />In danh sách
                  </button> */}
                        </div>
                      </div>
                      <div className="fix-first">
                        <div className="table-fix-head">
                          <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                            <thead>
                              <tr>
                                <th>STT</th>
                                {
                                  dulieudanhmucquocgia[0] && Object.keys(dulieudanhmucquocgia[0]).map(function (key, index) {
                                    return (<th key={index}>{key}</th>)
                                  })
                                }
                              </tr>
                            </thead>
                            <tbody>
                              {dulieudanhmucquocgia.map((item, index) => {
                                return <tr key={index} >
                                  <td className='text-center'>{index + 1}</td>
                                  {
                                    item && Object.keys(item).map(function (key, ind) {
                                      return (<td key={ind}>{item[key]}</td>)
                                    })
                                  }
                                </tr>
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>}
                </div>
              }</React.Fragment>
          }
        </div>
        <div className="modal fade" id="openModal" tabIndex="-1" role="dialog" aria-hidden="true">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <ComponentToPrint data={banghi} thuoctinh={thuoctinh} danhmuc={danhmucSelected} ref={el => (this.componentRef = el)} />
              <div className="modal-footer">
                <button type="button" className="btn btn-sm btn-outline-danger border-radius" data-dismiss="modal"><i className="far fa-times-circle"></i>Đóng</button>
                <ReactToPrint
                  trigger={() => <button className="btn btn-sm btn-outline-info border-radius" data-dismiss="modal"><i className="fas fa-print" />In danh sách</button>}
                  content={() => this.componentRef}
                />
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  let { General } = state;
  return { General };
};
export default connect(mapStateToProps)(TrichXuat);