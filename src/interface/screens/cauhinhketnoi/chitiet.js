import React, { Component } from "react";
import { connect } from "react-redux";
import { BreadCrumbs, FormInput, FormWrapper } from 'interface/components';
import { fetchToastNotify } from "../../../controller/redux/app-reducer";
import { confirmAlert } from 'react-confirm-alert';
import { Other } from 'interface/screens/error'
import { __DEV__ } from "../../../common/ulti/constants";
import * as CONSTANTS from 'common/ulti/constants';
import * as cmFunction from 'common/ulti/commonFunction';
import * as tbUngDung from 'controller/services/tbUngDungServices';
import * as tbDonVi from 'controller/services/tbDonViServices'
import * as tbCauHinhKetNoi from 'controller/services/tbCauHinhKetNoiServices'
import * as tbDVC from 'controller/services/tbDVCServices'
import { HOST_API } from "../../../controller/api";

class DanhSach extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isInsert: this.props.match.params.id == 0,
      form: {},
      error: false,
      page: CONSTANTS.DEFAULT_PAGE,
      pagesize: CONSTANTS.DEFAULT_PAGESIZE,
      _size: 0,
      _total_pages: 0,
      index: 0,
      donvi: [],
      donviTimeout: null,
      donviSelected: [],
      dichvu: [],
      dichvuTimeout: null,
      dichvuSelected: [],
      dichvucungcap: [],
      showDV: false,
      showToken: false,
    }
  }

  componentDidMount = async () => {
    this._init();
  }

  componentDidUpdate(prevProps) {
    let { match } = this.props;
    if (match.params.id !== prevProps.match.params.id) {
      this._init();
    }
  }

  _init = async () => {
    let id = this.props.match.params.id;
    this.state.isInsert = id == 0;
    if (!this.state.isInsert) {
      let data = await tbCauHinhKetNoi.getById(id)
      if (data) {
        this.state.form = data
        this.state.donviSelected = cmFunction.convertSelectedOptions(
          data.DonVi,
          '_id.$oid',
          'Ten'
        )
        this.state.dichvuSelected = cmFunction.convertSelectedOptions(
          data.DichVuUngDung,
          '_id.$oid',
          'Ten'
        )
        if (data.DichVuUngDung) {
          this.state.dichvucungcap = data.DichVuUngDung.DichVuCungCap
        }
        this.state.showToken = true
      }
      if (!data) this.state.error = true;
      this.forceUpdate();
    }
    this._showDichVuCungCap();
    this.forceUpdate();
  };

  _showDichVuCungCap = () => {
    this.state.showDV = this.state.dichvucungcap.length !== 0;
    this.forceUpdate()
  }

  _handleChangeElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.value;
    this.forceUpdate();
  };

  _handleChangeCheckElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.checked;
    this.forceUpdate();
  };

  //SELECT LOAD DATA
  _handleLoadDonVi = (inputValue, callback) => {
    clearTimeout(this.state.donviTimeout);
    this.state.donviTimeout = setTimeout(async () => {
      let filter = {}
      filter.page = 1
      filter.pagesize = 1000
      filter.count = true
      filter.filter = JSON.stringify({ Ten: cmFunction.regexText(inputValue), KichHoat: true });
      filter = new URLSearchParams(filter).toString()
      let dsDonVi = await tbDonVi.getAll(filter)
      dsDonVi = (dsDonVi && dsDonVi._embedded ? dsDonVi._embedded : [])
      let donvi = cmFunction.convertSelectOptions(dsDonVi, '_id.$oid', 'Ten')
      this.state.donvi = donvi
      this.forceUpdate()
      callback(donvi);
    }, 500);
  };

  _handleDonViChange = (sel) => {
    this.state.donviSelected = sel
    this.forceUpdate()
  }

  _handleLoadDichvu = (inputValue, callback) => {
    clearTimeout(this.state.dichvuTimeout);
    this.state.dichvuTimeout = setTimeout(async () => {
      let filter = {};
      filter.page = 1;
      filter.pagesize = 1000;
      filter.count = true
      filter.filter = JSON.stringify({ Ten: cmFunction.regexText(inputValue), KichHoat: true });
      filter = new URLSearchParams(filter).toString();
      let dsDichVu = await tbUngDung.getAll(filter);
      dsDichVu = dsDichVu && dsDichVu._embedded ? dsDichVu._embedded : [];
      let id = this.props.match.params.id;
      let find = dsDichVu.find(ele => ele._id.$oid == id);
      find = find ? [find] : [];
      let dichvu = cmFunction.convertSelectOptions(dsDichVu, '_id.$oid', 'Ten', find);
      dichvu.sort(function (a, b) {
        if (a.STT !== b.STT) {
          return a.STT - b.STT
        }
        var nameA = cmFunction.changeAlias(a.Ten);
        var nameB = cmFunction.changeAlias(b.Ten);
        if (nameA === nameB) {
          return 0;
        }
        return nameA > nameB ? 1 : -1
      });
      this.state.dichvu = dichvu;
      this.forceUpdate();
      callback(dichvu);
    }, 500);
  };

  _handleDichVuChange = (value) => {
    this.state.dichvuSelected = value;
    this.state.dichvucungcap = value.DichVuCungCap
    this.state.showToken = true
    this.forceUpdate();
    this._showDichVuCungCap()
    this._changeAPIToken()
  }

  //ACTION
  _handleConfirm = (_type = 0, _action, _stay = false) => {
    confirmAlert({
      title: `${!_type ? 'Sửa' : _type < 0 ? 'Xóa' : 'Thêm'} dữ liệu`,
      message: `Xác nhận ${!_type ? 'sửa' : _type < 0 ? 'xóa' : 'thêm'
        } dữ liệu`,
      buttons: [
        {
          label: 'Không',
          onClick: () => {
            return;
          },
        },
        {
          label: 'Có',
          onClick: () => _action(_stay),
        },
      ],
    });
  };

  _handleDelete = async () => {
    if (this.state.isInsert) return;
    let { id } = this.props.match.params;
    let axiosRes = await tbCauHinhKetNoi.deleteById(id);
    if (axiosRes) {
      this.props.dispatch(
        fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Xóa thành công' })
      );
      cmFunction.goBack();
    }
  };

  _handleSave = (stay) => {
    if (cmFunction.formValidate(this, 'form')) {
      this._handleConfirm(this.state.isInsert, this._handleUpdateInfo, stay);
    } else {
      confirmAlert({
        title: 'Dữ liệu không hợp lệ',
        message: 'Vui lòng nhập đúng định dạng dữ liệu',
        buttons: [
          {
            label: 'Đồng ý',
            onClick: () => {
              return;
            },
          },
        ],
      });
      return;
    }
  };

  _handleUpdateInfo = async (stay) => {
    let { form, isInsert, donviSelected, dichvuSelected, } = this.state;
    let axiosReq = form;
    axiosReq.STT = Number(axiosReq.STT || 9999);
    axiosReq.DichVuUngDung = null;
    axiosReq.DonVi = null;
    axiosReq.Cap = 0;
    if (donviSelected) {
      axiosReq.DonVi = cmFunction.clone(donviSelected);
      delete axiosReq.DonVi.value;
      delete axiosReq.DonVi.label
    }
    if (dichvuSelected) {
      axiosReq.DichVuUngDung = cmFunction.clone(dichvuSelected);
      delete axiosReq.DichVuUngDung.value;
      delete axiosReq.DichVuUngDung.label
    }
    let axiosRes;
    if (isInsert) {
      axiosRes = await tbCauHinhKetNoi.create(axiosReq);
    } else {
      let id = this.props.match.params.id;
      axiosRes = await tbCauHinhKetNoi.updateById(id, axiosReq);
    }
    if (axiosRes) {
      this.props.dispatch(
        fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' })
      );
      if (isInsert) {
        this.state.form = {};
        this.state.DonVi = null;
        this.state.DichVuUngDung = null
        this.forceUpdate();
      }
      if (!stay) cmFunction.goBack();
    }
  };

  _changeAPIToken = async () => {
    let apiToken = await tbDVC.generateApiToken()
    this.state.form.Ma = apiToken.key
    this.forceUpdate()
  }

  render() {
    let { isInsert, form, dichvuSelected, donviSelected, dichvucungcap, showDV, showToken } = this.state
    try {
      return (
        <React.Fragment>
          <div className="main portlet">
            <BreadCrumbs
              title={'Chi tiết dịch vụ'}
              route={[
                { label: 'Cấu hình kết nối', value: '/quan-tri-ket-noi/cau-hinh-ket-noi' },
                { label: 'Thông tin cấu hình', value: '/quan-tri-ket-noi/cau-hinh-ket-noi/:id' },
              ]}
            />
            <div className="portlet-title">
              <div className="caption">
                <i className="fas fa-grip-vertical" />Thông tin cấu hình kết nối
                            </div>
              <div className="action">
                <button
                  onClick={() => this._handleSave(false)}
                  className="btn btn-sm btn-outline-primary border-radius"
                >
                  <i className="fas fa-save" />
                                    Lưu
                            </button>
                <button
                  onClick={() => this._handleSave(true)}
                  className="btn btn-sm btn-outline-primary border-radius"
                >
                  <i className="far fa-save" />
                                    Lưu và tiếp tục
                            </button>
                <div className="btn btn-sm dropdown">
                  <button
                    className="btn btn-sm btn-outline-primary border-radius dropdown-toggle"
                    type="button"
                    id="dropdownMenuButton"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <i className="fas fa-share" />
                                        Khác
                                </button>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="dropdownMenuButton"
                  >
                    <button onClick={cmFunction.goBack} className="btn btn-sm">
                      <i className="fas fa-reply" />
                                        Quay lại
                                    </button>
                    <button onClick={this._init} className="btn btn-sm">
                      <i className="fas fa-sync" />
                                        Làm mới
                                    </button>
                    {!isInsert && (
                      <button
                        onClick={() =>
                          this._handleConfirm(-1, this._handleDelete)
                        }
                        className="btn btn-sm"
                      >
                        <i className="fas fa-trash" />
                                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div
                className="card-header d-flex justify-content-between"
                data-toggle="collapse"
                data-target="#collapseThongTin"
                aria-expanded="true"
                aria-controls="collapseThongTin"
              >
                <span className="caption-subject">Thông tin cơ bản</span>
                <span>
                  <i className="fas fa-chevron-up" />
                  <i className="fas fa-chevron-down" />
                </span>
              </div>
              <div className="collapse show" id="collapseThongTin">
                <div className="card-body">
                  <div className="form-body" ref="form">
                    <FormWrapper>
                      <FormInput
                        loadOptions={this._handleLoadDonVi}
                        onChange={this._handleDonViChange}
                        required={true}
                        defaultValue={donviSelected}
                        isClearable={true}
                        isSearchable={true}
                        isDisabled={false}
                        defaultOptions={true}
                        type="select"
                        label="Đơn vị khai thác dịch vụ"
                        placeholder="Chọn đơn vị khai thác dịch vụ..."
                      />
                    </FormWrapper>
                    <FormWrapper>
                      <FormInput
                        loadOptions={this._handleLoadDichvu}
                        onChange={this._handleDichVuChange}
                        required={true}
                        defaultValue={dichvuSelected}
                        isClearable={true}
                        isSearchable={true}
                        isDisabled={false}
                        defaultOptions={true}
                        type="select"
                        label="Nhóm dịch vụ"
                        placeholder="Chọn nhóm dịch vụ ứng dụng..."
                      />
                    </FormWrapper>
                    {showToken && <FormWrapper>
                      <FormInput
                        parentClass="col-md-6"
                        labelClass="col-md-6"
                        inputClass="col-md-6"
                        required={true}
                        disabled={true}
                        readOnly={true}
                        onChange={this._handleChangeElement}
                        defaultValue={form.Ma || ''}
                        type="text"
                        id="Ma"
                        label="Consumer key"
                      />
                      <div className="action">
                        <button onClick={this._changeAPIToken} className="btn btn-sm btn-outline-info border-radius pull-right" title="Tìm kiếm">
                          <i className="fas fa-sync"/>
                        </button>
                      </div>
                    </FormWrapper>}
                    <FormWrapper>
                      <FormInput
                        type="textarea"
                        onChange={this._handleChangeElement}
                        rows="3"
                        defaultValue={form.MoTa || ''}
                        id="MoTa"
                        label="Mô Tả"
                      />
                    </FormWrapper>
                    <FormWrapper>
                      <FormInput
                        type="checkbox"
                        onChange={this._handleChangeCheckElement}
                        defaultValue={form.KichHoat}
                        id="KichHoat"
                        label="Kích hoạt"
                      />
                    </FormWrapper>
                  </div>
                </div>
              </div>
            </div>

            {showDV && <div className="card">
              <div
                className="card-header d-flex justify-content-between"
                data-toggle="collapse"
                data-target="#collapseDichVu"
                aria-expanded="true"
                aria-controls="collapseDichVu"
              >
                <span className="caption-subject">Dịch vụ cung cấp</span>
                <span>
                  <i className="fas fa-chevron-up" />
                  <i className="fas fa-chevron-down" />
                </span>
              </div>
              <div className="card-body fix-first collapse show" id="collapseDichVu">
                {/* <div className="card-body fix-first"> */}
                <div className="table-fix-head">
                  <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Tên dịch vụ cung cấp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dichvucungcap.map((item, index) => {
                        return <tr key={index} >
                          <td>{index + 1}</td>
                          <td className="text-left">
                            <span>{item.Ten}</span><br />
                            <span className="text-info">{HOST_API + item.Url.Ma}</span></td>
                        </tr>
                      })}
                    </tbody>
                  </table>
                </div>
                {/* </div> */}
              </div>
            </div>}
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
export default connect(mapStateToProps)(DanhSach);
