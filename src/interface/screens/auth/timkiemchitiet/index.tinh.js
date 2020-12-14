import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { fetchLoginRequest } from "../../../../controller/redux/login-fetch-reducers";
import Footer from "../../../navigation/layouts/Admin/Footer/index.jsx";
import * as cmFunction from "../../../../common/ulti/commonFunction";
import { __DEV__ } from "../../../../common/ulti/constants";
import * as publicServices from "../../../../controller/services/publicServices";
import * as CONSTANTS from "../../../../common/ulti/constants";
import queryString from "query-string";
import { Pagination } from "../../../components/index";
import { query } from "chartist";
import Select from "react-select";
import { InputSearch } from "../../../../interface/components";
import { FormInput, FormWrapper } from "../../../../interface/components";
import ReactToPrint from "react-to-print";
import ReactDOM from "react-dom";
import XLSX from "xlsx";
import moment from "moment";
import Modal from "react-modal";
import { GSP_DMDC } from "../../../../../config";
import { Filter } from "@material-ui/icons";

class ComponentToPrint extends React.Component {
  render() {
    let { danhmuc, tenlinhvuc } = this.props;
    return (
      <div className="card-body fix-first">
        <h2 className="modal-title text-center">Lĩnh vực: {tenlinhvuc}</h2>
        <br />
        <table className="table table-bordered" width="100%">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên danh mục</th>
              <th>Mã</th>
              <th>Đơn vị quản lý</th>
              <th>Nhóm danh mục</th>
            </tr>
          </thead>
          <tbody>
            {danhmuc.map((item, index) => {
              return (
                <tr key={index}>
                  <td className="text-center">{index + 1}</td>
                  <td>{item.Ten}</td>
                  <td>{item.Ma}</td>
                  <td>{item.DonViCha.Ten || ''}</td>
                  <td>{item.NhomDanhMuc.Ten || ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}
class ComponentToPrintQG extends React.Component {
  render() {
    let { danhsach } = this.props;
    return (
      <div className="card-body fix-first">
        <h2 className="modal-title text-center">Danh mục Điện tử Quốc Gia</h2>
        <br />
        <table className="table table-bordered" width="100%">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên danh mục</th>
              <th>Mã</th>
            </tr>
          </thead>
          <tbody>
            {danhsach.map((item, index) => {
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.CategoryName}</td>
                  <td>{item.CategoryCode}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
}
class TimKiemChiTiet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      linhvucSelected: null,
      searchTimeout: null,
      clickDungChung: false,
      clickQuocGia: false,
      danhsach: [],
      search: {},
      danhsachclone: [],
      searchDM: '',
      checkDM: false,
      dsDanhMuc: [],
      searchDanhMuc: [],
      tenlinhvuc: '',
      selectLinhvuc: false,
      checkList: false,
    };
  }

  componentDidMount = async () => {
    this._loadData()
  };
  componentDidUpdate(prevProps) {
    // let { location } = this.props
    // if (location !== prevProps.location) {
    //     this._loadData()
    // }
  }
  _loadData = async () => {
    let parsed = queryString.parse(this.props.location.search);
    let { list, code, search } = parsed
    let filter = cmFunction.clone(parsed)
    if (list === 'dmdc') {
      this.state.checkList = true
    }
    this.forceUpdate()
    if (code !== undefined) {
      this._Danhmucdungchung()
      let codeLinhVuc = code
      filter.page = 1;
      filter.pagesize = 1000;
      filter.count = true;
      filter.filter = JSON.stringify({
        code: cmFunction.regexText(codeLinhVuc),
        KichHoat: true,
      });
      filter = new URLSearchParams(filter).toString();
      let LinhVuc = await publicServices.getLinhVuc(filter);
      LinhVuc = LinhVuc && LinhVuc._embedded ? LinhVuc._embedded : [];
      let selectLinhvuc = cmFunction.convertSelectOptions(
        LinhVuc,
        "_id.$oid",
        "Ten"
      );
      this._handleLinhVucChange(selectLinhvuc[0])
      this.forceUpdate()
      if (search !== undefined && search !== 'all') {
        this.state.searchDM = search
        this.forceUpdate()
      }
    }

  }
  _updateURL = (list, linhvuc, danhmuc) => {
    let params = [['list', list], ['code', linhvuc], ['search', danhmuc]]
    cmFunction.insertMultiParams(params, this.props.history)
  }
  _handleLoadLinhVuc = (inputValue, callback) => {
    clearTimeout(this.state.searchTimeout);
    this.state.searchTimeout = setTimeout(async () => {
      let filter = {};
      filter.page = 1;
      filter.pagesize = 1000;
      filter.count = true;
      filter.filter = JSON.stringify({
        Ten: cmFunction.regexText(inputValue),
        KichHoat: true,
      });
      filter = new URLSearchParams(filter).toString();
      let dsLinhVuc = await publicServices.getLinhVuc(filter);
      dsLinhVuc = dsLinhVuc && dsLinhVuc._embedded ? dsLinhVuc._embedded : [];
      let linhvuc = cmFunction.convertSelectOptions(
        dsLinhVuc,
        "_id.$oid",
        "Ten"
      );
      linhvuc.sort(function (a, b) {
        if (a.Cap !== b.Cap) {
          return a.Cap - b.Cap;
        }
        var nameA = cmFunction.changeAlias(a.Ten);
        var nameB = cmFunction.changeAlias(b.Ten);
        if (nameA === nameB) {
          return 0;
        }
        return nameA > nameB ? 1 : -1;
      });
      this.forceUpdate();
      callback(linhvuc);
    }, 500);
  };
  _handleLinhVucChange = (value) => {
    this.state.linhvucSelected = cmFunction.clone(value);
    if (value === null) {
      this.state.tenlinhvuc = ''
      this.state.searchDanhMuc = []
      this.state.selectLinhvuc = false
      this._updateURL('dmdc', 'all', 'all')

    } else {
      this._handleLoadDanhmuc(this.state.linhvucSelected)
      this._updateURL('dmdc', this.state.linhvucSelected.code, 'all')
      this.state.tenlinhvuc = this.state.linhvucSelected.Ten
      this.state.selectLinhvuc = true
    }
    this.state.searchDM = ''
    this.forceUpdate();
  };
  _handleLoadDanhmuc = async (linhvucSelected) => {
    let filter = {};
    filter.page = 1;
    filter.pagesize = 1000;
    filter.count = true;
    filter.filter = JSON.stringify({
      ["LinhVuc.code"]: cmFunction.regexText(linhvucSelected.code),
      PheDuyet: 3,
    });
    filter = new URLSearchParams(filter).toString();
    let dsDanhMuc = await publicServices.getDanhMuc(filter);
    dsDanhMuc = dsDanhMuc && dsDanhMuc._embedded ? dsDanhMuc._embedded : [];
    this.state.dsDanhMuc = dsDanhMuc;
    this.state.searchDanhMuc = dsDanhMuc
    if (dsDanhMuc.length > 0) {
      this.state.checkDM = true
    } else {
      this.state.checkDM = false
    }
    if (this.state.searchDM !== '') {
      this._handleSearch()
    }
    this.forceUpdate();
  };
  renderDanhMuc = () => {
    if (this.state.linhvucSelected) {
      return (<div>
        <FormWrapper>
          <FormInput
            required={false}
            disabled={false}
            readOnly={false}
            onChange={this._handleChangeSearchElement}
            defaultValue={this.state.searchDM || ""}
            type="text"
            id="Ten"
            label="Tìm kiếm danh mục"
            placeholder="Nhập tên danh mục cần tìm kiếm"
          />
        </FormWrapper>
        <div className="text-center">
          <button
            onClick={this._handleSearch} //disabled={!checkSearch}
            className="btn btn-outline-primary border-radius"
          >
            <i className="fas fa-search" />
                        Tìm kiếm
                        </button>
        </div>
        <br></br>
        <div className="card mb-4">
          <div className="card-header d-flex justify-content-between">
            <span className="caption-subject">
              Kết quả tìm kiếm: {this.state.searchDanhMuc.length} danh mục
                            </span>
            <div>
              <button
                onClick={() => this._handleExportExcel("dataTable")}
                className="btn btn-sm btn-outline-info border-radius"
                title="Xuất excel"
              >
                <i className="fas fa-download" /> Xuất excel
                                </button>
              <button
                className="btn btn-sm btn-outline-info border-radius"
                data-toggle="modal"
                data-target="#openModal"
                title="In danh sách"
              >
                <i className="fas fa-print" />
                                In danh sách
                                </button>
            </div>
          </div>
        </div>
        <div
          className="modal fade"
          id="openModal"
          tabIndex="-1"
          role="dialog"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <ComponentToPrint
                danhmuc={this.state.searchDanhMuc}
                tenlinhvuc={this.state.tenlinhvuc}
                ref={(el) => (this.componentRef = el)}
              />
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-info border-radius"
                  data-dismiss="modal"
                >
                  Close
                                    </button>
                <ReactToPrint
                  trigger={() => (
                    <button
                      className="btn btn-sm btn-outline-info border-radius"
                      data-dismiss="modal"
                    >
                      <i className="fas fa-print" />
                                            In danh sách
                    </button>
                  )}
                  content={() => this.componentRef}
                />
              </div>
            </div>
          </div>
        </div>
        {this.state.checkDM && <div className="row justify-content-center">
          <div className="col-md-12" style={{ marginTop: "10px" }}>
            <table
              className="table table-bordered"
              id="dataTable"
              width="100%"
              cellSpacing="0"
              ref="dataTable"
            >
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên danh mục</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {this.state.searchDanhMuc.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td className="text-center">{index + 1}</td>
                      <td>{item.Ten}</td>
                      <td className="text-center">
                        <Link
                          to={"/home/" + item._id.$oid || item._id}
                          title="Chi tiết"
                          className="btn btn-sm btn-outline-info border-radius"
                        >
                          <i className="fas fa-eye"></i>{" "}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>}
      </div>
      )
    }
  };
  _handleChangeSearchElement = (evt) => {
    this.state.searchDM = evt.target.value;
    if (evt.target.value.trim() === "") {
      this.state.searchDanhMuc = this.state.dsDanhMuc;
    }
    // else {
    //     let filter = this.state.searchDM
    //     let params = [['lv', this.state.linhvucSelected.code], ['dm', filter]]
    //     cmFunction.insertMultiParams(params, this.props.history)
    // }
    this.forceUpdate();
  };
  _handleSearch = () => {
    let list = this.state.dsDanhMuc;
    let text = this.state.searchDM.trim();
    let searchList = list.filter((item) => {
      const textSearch = text;
      const itemDanhsach = `
                ${cmFunction.changeAlias(item.Ten)}}
                `;
      return itemDanhsach.indexOf(textSearch) > -1;
    });
    this.state.searchDanhMuc = searchList;
    this.forceUpdate();
    this._updateURL('dmdc', this.state.linhvucSelected.code, text)
  };

  // EXPORT EXCEL
  _handleExportExcel = (ref) => {
    // ví dụ xuất excel tại bảng đang có
    let myRows = [[this.state.linhvucSelected.Ten || 'Danh mục Điện tử Quốc Gia']],
      maxCol = 0;
    let table = ReactDOM.findDOMNode(this.refs[ref]);
    for (let tbindex = 0; tbindex < table.children.length; tbindex++) {
      let tb = table.children[tbindex];
      for (let trindex = 0; trindex < tb.children.length; trindex++) {
        let row = [];
        let tr = tb.children[trindex];
        maxCol = tr.children.length > maxCol ? tr.children.length : maxCol;
        for (let thindex = 0; thindex < tr.children.length; thindex++) {
          let th = tr.children[thindex];
          row.push(th.innerText);
        }
        myRows.push(row);
      }
    }
    // set colspan và rowspan
    let merge = [
      // { s: { r: 0, c: 0 }, e: { r: 0, c: maxCol } },
      // { s: { r: 1, c: 6 }, e: { r: 1, c: 7 } }
    ];
    // xuất file
    let ws = XLSX.utils.aoa_to_sheet(myRows);
    ws["!merges"] = merge;
    let wb = XLSX.utils.book_new();
    //add thêm nhiều Sheet vào đây cũng đc
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    let date = cmFunction.timestamp2DateString(moment().valueOf());
    let name = [this.state.linhvucSelected.Ten || "Danh_muc_dien_tu_Quoc_Gia"] + "_" + date + ".xlsx";
    XLSX.writeFile(wb, name);
  };


  _Danhmucdungchung = () => {
    this.state.clickDungChung = true;
    this.state.clickQuocGia = false;
    this.state.checkList = true
    this.forceUpdate();
    if (this.state.linhvucSelected === null) {
      this._updateURL('dmdc', 'all', 'all')
    } else {
      if (this.state.searchDM === '') {
        this._updateURL('dmdc', this.state.linhvucSelected.code, 'all')
      } else {
        this._updateURL('dmdc', this.state.linhvucSelected.code, this.state.searchDM)
      }
    }
  };
  _Danhmucquocgia = () => {
    this.state.clickDungChung = false;
    // this._handleLinhVucChange(null);
    this.state.clickQuocGia = true;
    this.state.checkList = false
    this._getDanhMucQuocGia(this._createFilter());
    this.forceUpdate();
    this._updateURL('dmqg', 'all', 'all')
  };

  _getDanhMucQuocGia = async (query) => {
    let data = await publicServices.getDanhMucQuocGia("GET", GSP_DMDC);
    this.state.danhsach = data;
    this.state.danhsachclone = cmFunction.clone(data)
    this.forceUpdate();
  };
  _createFilter = () => {
    let parsed = {}
    parsed.count = true;
    this.forceUpdate();
    return new URLSearchParams(parsed).toString();
  };
  _convertName = (item) => {
    return item.CategoryName
  }
  _handleChangeSearchElementQG = (evt) => {
    this.state.search[evt.target.id] = evt.target.value
    this.forceUpdate()
  }
  _handleKeyDowQG = (evt) => {
    if (evt.key === 'Enter') {
      this._handleSearchQG();
      this.forceUpdate()
    }
  }
  _handleSearchQG = () => {
    let { danhsachclone, search } = this.state
    let danhsach = danhsachclone.filter(function (item) {
      const itemDanhsach = `
                ${cmFunction.changeAlias(item.CategoryName)}}
                ${cmFunction.changeAlias(item.CategoryCode)}}
                `;
      const textSearch = cmFunction.changeAlias(search.Ten);
      return itemDanhsach.indexOf(textSearch) > -1;
    });
    this.state.danhsach = danhsach
    this.forceUpdate()
  }
  render() {
    let {
      linhvucSelected, waiting, thuoctinh, modalIsOpen,
      formModal, clickDungChung, clickQuocGia, danhsach,
      search, checkList
    } = this.state;
    return (
      <React.Fragment>
        <div className="main portlet trich-xuat">
          <div className="p-4 mb-4 search-block-title">
            <div className="portlet-title">
              <div className="caption">
                {" "}
                <i className="fas fa-search" /> TÌM KIẾM CHI TIẾT{" "}
              </div>
            </div>
            <div className="form-body" ref="form">
              <br></br>
              <div className="form-row form-group form-custom form-wrap">
                <div className="col-md-12 form-row form-wrap">
                  <div className="col-md-12 form-row form-custom form-no-spacing">
                    <div className="col-md-3 text-right pr-3">Tìm theo</div>
                    <div className="col-md-9 pl-0 pr-0">
                      <div className="custom-control custom-radio custom-control-inline">
                        <input
                          type="radio"
                          id="Danhmucdungchung"
                          name="Danhmucdungchung"
                          className="custom-control-input"
                          onChange={this._Danhmucdungchung}
                          checked={checkList}
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="Danhmucdungchung"
                        >
                          Danh mục điện tử dùng chung
                                                </label>
                      </div>
                      <div className="custom-control custom-radio custom-control-inline">
                        <input
                          type="radio"
                          id="Danhmucquocgia"
                          name="Danhmucdungchung"
                          className="custom-control-input"
                          onChange={this._Danhmucquocgia}
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="Danhmucquocgia"
                        >
                          Danh mục điện tử quốc gia{" "}
                        </label>
                      </div>
                    </div>
                  </div>
                  <br></br>
                </div>
              </div>
              {clickDungChung && (
                <FormWrapper>
                  <FormInput
                    loadOptions={this._handleLoadLinhVuc}
                    onChange={this._handleLinhVucChange}
                    required={false}
                    defaultValue={linhvucSelected}
                    isClearable={true}
                    isSearchable={true}
                    isDisabled={false}
                    defaultOptions={true}
                    type="select"
                    label="Chọn lĩnh vực tìm kiếm"
                    placeholder="Chọn lĩnh vực ..."
                  />
                </FormWrapper>
              )}

              {clickDungChung && this.renderDanhMuc()}

              {clickQuocGia && (<div>
                <div className="card-body pt-3 pb-3 row justify-content-center">
                  <div className="form-body col-md-12">
                    <div className="form-row form-group form-custom">
                      <div className="col-md-1">

                      </div>
                      <div className="col-md-8">
                        <input className="form-control" onChange={this._handleChangeSearchElementQG} onKeyDown={this._handleKeyDowQG}
                          value={search.Ten || ''} type="text" id="Ten" placeholder='Tìm kiếm tên, mã danh mục quốc gia' />
                      </div>
                      <div className="col-md-2">
                        <button onClick={this._handleSearchQG} className="btn btn-outline-primary border-radius ">
                          <i className="fas fa-search" />Tìm kiếm
                                                </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-header d-flex justify-content-between">
                    <strong>{`Tổng số: ${danhsach.length} danh mục`}</strong>
                    <div>
                      <button
                        onClick={() => this._handleExportExcel("dataTable")}
                        className="btn btn-sm btn-outline-info border-radius"
                        title="Xuất excel"
                      >
                        <i className="fas fa-download" /> Xuất excel
                                            </button>
                      <button
                        className="btn btn-sm btn-outline-info border-radius"
                        data-toggle="modal"
                        data-target="#openModal"
                        title="In danh sách"
                      >
                        <i className="fas fa-print" />
                                            In danh sách
                                            </button>
                    </div>
                    <div
                      className="modal fade"
                      id="openModal"
                      tabIndex="-1"
                      role="dialog"
                      aria-hidden="true"
                    >
                      <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                          <ComponentToPrintQG
                            danhsach={this.state.danhsach}
                            ref={(el) => (this.componentRef = el)}
                          />
                          <div className="modal-footer">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-info border-radius"
                              data-dismiss="modal"
                            >
                              Close
                                                        </button>
                            <ReactToPrint
                              trigger={() => (
                                <button
                                  className="btn btn-sm btn-outline-info border-radius"
                                  data-dismiss="modal"
                                >
                                  <i className="fas fa-print" />
                                                                In danh sách
                                </button>
                              )}
                              content={() => this.componentRef}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-body fix-first">
                    <div className="table-fix-head-custom">
                      <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                        <thead>
                          <tr>
                            <th>STT</th>
                            <th>Tên</th>
                            <th>Mã</th>
                            <th>Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {danhsach.map((item, index) => {
                            return <tr key={index} >
                              <td className='text-center'>{index + 1}</td>
                              <td>{this._convertName(item)}</td>
                              <td>{item.CategoryCode}</td>
                              <td>
                                {item.TotalItem ?
                                  <Link target="_blank" to={'/search/danh-muc?danhmuc=' + (cmFunction.encode(item.UrlGetList)) + '&ten=' + (cmFunction.encode(item.CategoryName))} title="Chi tiết" className="btn btn-sm btn-outline-info border-radius"><i className="fas fa-eye"></i></Link>
                                  : null}
                              </td>
                            </tr>
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  let { General } = state;
  return { General };
};
export default connect(mapStateToProps)(TimKiemChiTiet);
