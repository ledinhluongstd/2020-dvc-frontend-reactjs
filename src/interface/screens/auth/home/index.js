import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import * as cmFunction from "../../../../common/ulti/commonFunction";
import { __DEV__ } from "../../../../common/ulti/constants";
import * as publicServices from "../../../../controller/services/publicServices";
import queryString from "query-string";
import { InputSearch } from "../../../../interface/components";
import imgBackground from '../../../../common/assets/imgs/photo.jpg'

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      danhmuc: [],
      search: {
        TenDanhMuc: "",
      },
      searchTimeout: null,
      check: false,
      waiting: false,
      show: true,
      checkSearch: false
    };
  }

  componentDidMount = async () => {
    this._loadData()
  };
  componentDidUpdate(prevProps) {
    let { location } = this.props
    if (location !== prevProps.location) {
      this._loadData()
    }
  }

  _loadData = async () => {
    let parsed = queryString.parse(this.props.location.search);
    let filter = cmFunction.clone(parsed)
    let search = filter.search
    let danhmuc = []
    if (search === undefined) {
      this.state.search.TenDanhMuc = ''
      this.state.check = false
      this.state.show = true
      this.forceUpdate()
    } else {
      this.state.check = true
      this.state.show = false
      if (search === 'all') {
        danhmuc = await this._getDanhSachDanhMuc()
      } else {
        this.state.search.TenDanhMuc = JSON.stringify(search)
        danhmuc = await this._getDanhSachDanhMuc(search)
      }
      this.state.danhmuc = danhmuc
      this.forceUpdate()
    }
    this.forceUpdate();
  }

  _handleChangeElement = async (evt) => {
    let code = "";
    this.state.checkSearch = false;
    this.forceUpdate()
    if (evt.target.value === null) {
      code = "";
      this.state.search.TenDanhMuc = "";
      this.state.show = false;
    } else {
      code = evt.target.value.code;
      this.state.search.TenDanhMuc = evt.target.value.Ten;
      let filter = {};
      filter.page = 1;
      filter.pagesize = 1000;
      filter.count = true;
      filter.filter = JSON.stringify({
        code: cmFunction.regexText(code),
        PheDuyet: 3,
      });
      filter = new URLSearchParams(filter).toString();
      let dsDanhMuc = await publicServices.getDanhMuc(filter);
      dsDanhMuc = dsDanhMuc && dsDanhMuc._embedded ? dsDanhMuc._embedded : [];
      let danhmuc = cmFunction.convertSelectOptions(dsDanhMuc, "_id.$oid", "Ten");
      this.state.danhmuc = danhmuc;
      if (this.state.danhmuc.length > 0) {
        this.state.check = true;
      } else {
        this.state.check = false;
      }
      let params = [['search', evt.target.value.Ten]]
      cmFunction.insertMultiParams(params, this.props.history)
      this.state.show = false
    }
    this.forceUpdate();
  };

  _getDanhSachDanhMuc = async (value) => {
    this.state.search.TenDanhMuc = value;
    let parsed = {};
    parsed.page = 1;
    parsed.pagesize = 1000;
    parsed.count = true;
    let filter = {}
    filter = { 'PheDuyet': 3 }
    if (value) filter['$or'] = [
      { 'Ten': cmFunction.regexText(value) },
      { 'Ma': cmFunction.regexText(value) }
    ]
    parsed.filter = JSON.stringify(filter);
    parsed = new URLSearchParams(parsed).toString();
    let dsDanhMuc = await publicServices.getDanhMuc(parsed);
    dsDanhMuc = dsDanhMuc && dsDanhMuc._embedded ? dsDanhMuc._embedded : [];
    let danhmuc = cmFunction.convertSelectOptions(dsDanhMuc, "_id.$oid", "Ten");
    //this.state.danhmuc = danhmuc;
    this.forceUpdate();
    return danhmuc
  };

  _handleSearch = async () => {
    let danhmuc = await this._getDanhSachDanhMuc(this.state.search.TenDanhMuc);
    this.state.danhmuc = danhmuc
    let filter = ''
    if (this.state.search.TenDanhMuc === '') {
      filter = 'all'
    } else {
      filter = this.state.search.TenDanhMuc
    }
    let params = [['search', filter]]
    cmFunction.insertMultiParams(params, this.props.history)
    this.state.show = false
    this.state.check = true
    this.forceUpdate();
  };
  
  render() {
    let { search, danhmuc, check, show } = this.state;
    return (
      <React.Fragment>
        <div className="main portlet"
          style={!check ? { backgroundImage: 'url(' + imgBackground + ')', height: '100vh', minHeight: '500px', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : null}

        >
          <div
            className="row justify-content-center"
            style={{ marginTop: !check ? "100px" : "20px" }}
          >
            <div className="col-md-7">
              <InputSearch
                onChange={this._handleChangeElement}
                className="form-control"
                defaultValue={search.TenDanhMuc}
                getSuggestions={this._getDanhSachDanhMuc}
                keyLabel={"Ten"}
                id="TenDanhMuc"
                placeholder={search.TenDanhMuc || "Nhập tên danh mục cần tìm kiếm..."}
              />
            </div>
            <div className="col-md-2">
              <button
                onClick={this._handleSearch}
                className="btn btn-outline-primary border-radius"
              >
                <i className="fas fa-search" />
                    Tìm kiếm
                  </button>
            </div>
          </div>
          <br></br>
          <br></br>
          {show && (<div className="row justify-content-center">
              <div className='col-md-7'>
                <br />
                <div style={{ marginTop: '40px' }}>
                  <a className="panel-group" data-toggle="collapse" href="#collapseForm" role="button" aria-expanded="false" aria-controls="collapseForm" style={{ fontStyle: 'italic', paddingRight: '10px', marginTop: '10px' }}>
                    Hướng dẫn sử dụng</a>
                  <div className="collapse show mt-3" id="collapseForm">

                    <div className="panel-group" role="tablist" aria-multiselectable="true">

                      <div className="panel ">
                        <div className=" p-2 mb-1" role="tab" id="heading0" style={{ fontStyle: 'italic' }}>
                          <a className="collapsed" role="button" title="" data-toggle="collapse" data-parent="#collapseForm" href="#collapse0" aria-expanded="true" aria-controls="collapse0">
                            Tìm kiếm danh mục
			                </a>
                        </div>
                        <div id="collapse0" className="panel-collapse collapse" role="tabpanel" aria-labelledby="heading0">
                          <div className=" px-3 mb-4">
                            <p>Nhập tên danh mục cần tìm vào ô tìm kiếm:</p>
                            <ul >
                              <li>- Phần mềm tự động hiển thị danh sách các danh mục phù hợp với từ khóa tìm kiếm</li>
                              <li>- Chọn danh mục có trong danh sách danh mục hiển thị khi nhập từ khóa</li>
                              <li>- Hoặc nhấn Tìm kiếm để hiển thị danh sách các danh mục phù hợp với từ khóa tìm kiếm</li>
                              <li style={{ fontStyle: 'italic' }}>  (Lưu ý: Phần mềm tìm kiếm theo tên hoặc mã danh mục)</li>
                              <li>- Trong danh sách danh mục kết quả tìm kiếm, chọn hành động để xem chi tiết danh mục </li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="panel " id="collapseChiTiet">
                        <div className=" p-2 mb-1" role="tab" id="heading1" style={{ fontStyle: 'italic' }}>
                          <a className="collapsed" role="button" title="" data-toggle="collapse" data-parent="#collapseForm" href="#collapse1" aria-expanded="true" aria-controls="collapse1">
                            Tìm kiếm chi tiết
			                    </a>
                        </div>
                        <div id="collapse1" className="panel-collapse collapse" role="tabpanel" aria-labelledby="heading1">

                          <div className="panel px-3 mb-2">
                            <div className=" p-2 mb-1" role="tab" id="heading11" style={{ fontStyle: 'italic' }}>
                              <a className="collapsed" role="button" title="" data-toggle="collapse" data-parent="#collapseChiTiet" href="#collapse11" aria-expanded="true" aria-controls="collapse11">
                                Tìm theo danh mục điện tử dùng chung
			                        </a>
                            </div>
                            <div id="collapse11" className="panel-collapse collapse" role="tabpanel" aria-labelledby="heading11">
                              <div className=" px-3 mb-2">
                                <p>Chọn lĩnh vực tìm kiếm:</p>
                                <ul>
                                  <li>- Phần mềm sẽ hiển thị danh sách các danh mục thuộc lĩnh vực được chọn </li>
                                  <li>- Nhập tên danh mục vào ô tìm kiềm danh mục, nhấn tìm kiếm để tìm danh mục phù hợp.</li>
                                  <li>- Nhấn hành động để xem chi tiết danh mục.</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <div className="panel px-3 mb-4">
                            <div className=" p-2 mb-1" role="tab" id="heading11" style={{ fontStyle: 'italic' }}>
                              <a className="collapsed" role="button" title="" data-toggle="collapse" data-parent="#collapseChiTiet" href="#collapse12" aria-expanded="true" aria-controls="collapse11">
                                Tìm theo danh mục điện tử quốc gia
			                        </a>
                            </div>
                            <div id="collapse12" className="panel-collapse collapse" role="tabpanel" aria-labelledby="heading11">
                              <div className=" px-3 mb-4">
                                <p>Nhập tên, mã danh mục quốc gia. Nhấn Tìm kiếm:</p>
                                <ul>
                                  <li>- Phần mềm sẽ hiển thị danh sách các danh mục phù hợp với từ khóa được nhập </li>
                                  <li>- Nhấn hành động để xem chi tiết danh mục.</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="panel ">
                        <div className=" p-2 mb-1" role="tab" id="heading2" style={{ fontStyle: 'italic' }}>
                          <a className="collapsed" role="button" title="" data-toggle="collapse" data-parent="#collapseForm" href="#collapse2" aria-expanded="true" aria-controls="collapse2">
                            Trích xuất dữ liệu
			                </a>
                        </div>
                        <div id="collapse2" className="panel-collapse collapse" role="tabpanel" aria-labelledby="heading2">
                          <div className=" px-3 mb-4">
                            <p>Chọn phạm vi trích xuất (trích xuất trong danh mục điện tử dùng chung hoặc danh mục quốc gia):</p>
                            <ul>
                              <li>- Chọn danh mục trích xuất (Có thể nhập tên danh mục để phần mềm hiển thị danh sách danh mục phù hợp)</li>
                              <li>- Chọn các thuộc tính của danh mục cần trích xuất. Nhấn Kiểm tra.</li>
                              <li>- Nhấn Trích xuất dữ liệu để xem Kết quả trích xuất.</li>
                              <li>- Chọn Xuất excel hoặc In danh sách</li>
                            </ul>
                          </div>
                        </div>
                      </div>


                    </div>

                  </div>
                </div>
              </div>
            <div className="col-md-2"></div>
            <br></br>
          </div>
          )}
          {
            check && (<div>
              <div className="card mb-4">
                <div className="card-header d-flex justify-content-between">
                  <span className="caption-subject">
                    Kết quả tìm kiếm: {this.state.danhmuc.length} danh mục
                            </span>
                  {/* <div>
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
                  </div> */}
                </div>
              </div>
              <div className="row justify-content-center">
                <div className="col-md-11" style={{ marginTop: "10px" }}>
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
                        <th>Mã danh mục</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {danhmuc.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td className="text-center">{index + 1}</td>
                            <td>{item.Ten}</td>
                            <td>{item.Ma}</td>
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
              </div>
            </div>
            )
          }

        </div >
      </React.Fragment >
    );
  }
}

const mapStateToProps = (state) => {
  let { General } = state;
  return { General };
};
export default connect(mapStateToProps)(Home);
