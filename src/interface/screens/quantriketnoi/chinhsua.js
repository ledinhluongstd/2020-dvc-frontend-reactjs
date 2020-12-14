import React, { Component } from "react";
import { connect } from "react-redux";
import { BreadCrumbs, FormInput, FormWrapper, Pagination } from 'interface/components';
import { fetchToastNotify } from "../../../controller/redux/app-reducer";
import { confirmAlert } from 'react-confirm-alert';
import { Other } from 'interface/screens/error'
import { __DEV__ } from "../../../common/ulti/constants";
import * as CONSTANTS from 'common/ulti/constants';
import * as cmFunction from 'common/ulti/commonFunction';
import * as tbUngDung from 'controller/services/tbUngDungServices';
import * as tbDanhMucUngDung from 'controller/services/tbDanhMucUngDungServices';
import * as tbDichVu from 'controller/services/tbDVCServices';
import * as tbDonVi from 'controller/services/tbDonViServices'
import Modal from 'react-modal';
import queryString from 'query-string'

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
      check: false,
      nhomdichvu: [],
      nhomdichvuSelected: null,
      nhomdichvuTimeout: null,
      danhsachDVCC: [],
      cbCheckAll: false,
      dichvucungcap: [],
      donvi: [],
      donviSelected: [],
      donviTimeout: null,
      checkDvcc: true,
      modalIsOpen: false,
      search: {},
    }
  }

  componentDidMount = async () => {
    this._init();
  }

  componentDidUpdate(prevProps) {
    let { match, location } = this.props;
    if (match.params.id !== prevProps.match.params.id) {
      this._init();
    }

    if (location !== prevProps.location) {
      this._getDanhSachDichVu(this._createFilterSearch())
      // this._getDanhSachDichVu(this._createFilterSearch())
    }
  }

  _init = async () => {
    let id = this.props.match.params.id;
    this.state.isInsert = id == 0;
    if (!this.state.isInsert) {
      let data = await tbUngDung.getById(id)
      if (data) {
        this.state.form = data
        this.state.nhomdichvuSelected = cmFunction.convertSelectedOptions(
          data.NhomDichVu,
          '_id.$oid',
          'Ten'
        )
        this.state.donviSelected = cmFunction.convertSelectedOptions(
          data.DonVi,
          '_id.$oid',
          'Ten'
        )
        if (data.DichVuCungCap) {
          this.state.dichvucungcap = data.DichVuCungCap
        }
      }
      if (!data) this.state.error = true;
      this.forceUpdate();
    }
    if (this.state.dichvucungcap.length === 0) {
      this.state.checkDvcc = false
    }
    this._getDanhSachDichVu(this._createFilterSearch())
    this.forceUpdate();
  };

  _getDanhSachDichVu = async (query) => {
    let data = await tbDichVu.getAll(query)
    this.state.danhsachDVCC = data && data._embedded ? data._embedded : []
    this.state._size = data._size || 0
    this.state._total_pages = data._total_pages || 0
    this.forceUpdate()
  }

  _createFilterSearch = () => {
    let { search } = this.state
    let parsed = queryString.parse(this.props.location.search);
    let { page, pagesize } = parsed
    let filter = {}
    parsed.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
    parsed.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    parsed.count = true
    if (search.TenModal) {
      filter['Ten'] = cmFunction.regexText(search.TenModal.trim())
      parsed.filter = JSON.stringify(filter)
    }
    this.state.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
    this.state.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
    this.forceUpdate()
    return new URLSearchParams(parsed).toString()
  }

  //SELECT LOAD DATA
  _handleLoadNhomDichvu = (inputValue, callback) => {
    clearTimeout(this.state.nhomdichvuTimeout);
    this.state.nhomdichvuTimeout = setTimeout(async () => {
      let filter = {};
      filter.page = 1;
      filter.pagesize = 1000;
      filter.count = true
      filter.filter = JSON.stringify({ Ten: cmFunction.regexText(inputValue), MaDanhMuc: "NhomDichVuUngDung" });
      filter = new URLSearchParams(filter).toString();
      let dsNhomDichVu = await tbDanhMucUngDung.getAll(filter);
      dsNhomDichVu = dsNhomDichVu && dsNhomDichVu._embedded ? dsNhomDichVu._embedded : [];
      let id = this.props.match.params.id;
      let find = dsNhomDichVu.find(ele => ele._id.$oid == id);
      find = find ? [find] : [];
      let nhomdichvu = cmFunction.convertSelectOptions(dsNhomDichVu, '_id.$oid', 'Ten', find);
      nhomdichvu.sort(function (a, b) {
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
      this.state.nhomdichvu = nhomdichvu;
      this.forceUpdate();
      callback(nhomdichvu);
    }, 500);
  };

  _handleNhomDichVuChange = (value) => {
    this.state.nhomdichvuSelected = value;
    this.forceUpdate();
  }

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
    let axiosRes = await tbUngDung.deleteById(id);
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
    let { form, isInsert, nhomdichvuSelected, dichvucungcap, donviSelected, checkDvcc } = this.state;
    let axiosReq = form;
    axiosReq.STT = Number(axiosReq.STT || 9999);
    axiosReq.DichVuCungCap = null;
    axiosReq.NhomDichVu = null;
    axiosReq.DonVi = null
    axiosReq.Cap = 0;
    if (nhomdichvuSelected) {
      axiosReq.NhomDichVu = cmFunction.clone(nhomdichvuSelected);
      delete axiosReq.NhomDichVu.value;
      delete axiosReq.NhomDichVu.label
    }
    if (donviSelected) {
      axiosReq.DonVi = cmFunction.clone(donviSelected);
      delete axiosReq.DonVi.value;
      delete axiosReq.DonVi.label;
    }
    // this.state.danhsachDVCC.forEach((item) => {
    //   if (item.checked) {
    //     DichVuCungCap.push(item)
    //   }
    // })
    // if (dichvucungcap) {
    axiosReq.DichVuCungCap = cmFunction.clone(dichvucungcap)
    delete axiosReq.DichVuCungCap.value;
    delete axiosReq.DichVuCungCap.label
    // }
    let axiosRes;
    if (isInsert) {
      axiosRes = await tbUngDung.create(axiosReq);
    } else {
      let id = this.props.match.params.id;
      axiosRes = await tbUngDung.updateById(id, axiosReq);
    }
    if (axiosRes) {
      this.props.dispatch(
        fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' })
      );
      if (isInsert) {
        this.state.form = {};
        this.state.nhomdichvuSelected = null;
        this.state.DichVuCungCap = null;
        this.state.donviSelected = null;
        this.forceUpdate();
      }
      if (!stay) cmFunction.goBack();
    }
  };

  _handleChangeElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.value;
    this.forceUpdate();
  };

  _handleChangeCheckElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.checked;
    this.forceUpdate();
  };

  _handleChangeSearchElement = (evt) => {
    this.state.search[evt.target.id] = evt.target.value
    this.forceUpdate()
  }

  _handleSearchDichVu = () => {
    this._getDanhSachDichVu(this._createFilterSearch())
  }

  _handleKeyDow = (evt) => {
    if (evt.key === 'Enter') {
      this._handleSearchDichVu();
      this.forceUpdate()
    }
  }

  _handleCheckAll = (evt) => {
    this.state.cbCheckAll = evt.target.checked;
    let check = evt.target.checked;
    if (check) {
      this.state.dichvucungcap = [];
      this.state.danhsachDVCC.forEach((item) => {
        this.state.dichvucungcap = [...this.state.dichvucungcap, item]
      })
    } else {
      this.state.dichvucungcap = []
    }
    if (this.state.dichvucungcap.length !== 0) {
      this.state.checkDvcc = true
    } else {
      this.state.checkDvcc = false
    }
    this.forceUpdate()
  };

  _handleCheckItem = (evt, data) => {
    let dichvucungcap = this.state.dichvucungcap
    let check = evt.target.checked
    if (check) {
      this.state.dichvucungcap = [...this.state.dichvucungcap, data]
    } else {
      let index = dichvucungcap.findIndex(x => x.code === data.code)
      if (index > -1) {
        dichvucungcap.splice(index, 1);
        this.state.dichvucungcap = dichvucungcap
      }
    }
    if (this.state.dichvucungcap.length !== 0) {
      this.state.checkDvcc = true
    }
    this.forceUpdate();
    this._checkAll();
  };

  _checkItem = (data) => {
    let { dichvucungcap } = this.state
    if (dichvucungcap) {
      let index = dichvucungcap.findIndex(x => x.code === data.code)
      return index > -1;
    }
    this.forceUpdate()
  }

  _checkAll = () => {
    let findItem = 0
    let check = true
    this.state.danhsachDVCC.forEach((item) => {
      findItem = this.state.dichvucungcap.findIndex(x => x.code === item.code)
      if (findItem === -1) {
        check = false
      }
    })
    this.state.cbCheckAll = check;
    this.forceUpdate()
  }

  _handleDeleteOptions = (index) => {
    confirmAlert({
      title: `Xóa dịch vụ cung cấp`,
      message: `Xác nhận xóa dịch vụ cung cấp`,
      buttons: [
        {
          label: 'Không',
          onClick: () => {
            return;
          },
        },
        {
          label: 'Có',
          onClick: () => {
            this.state.dichvucungcap.splice(index, 1)
            this.forceUpdate()
          }
        },
      ],
    });
  }

  _handleAddToggle = () => {
    this.state.modalIsOpen = !this.state.modalIsOpen
    this.forceUpdate()
    this._checkAll()
  }

  render() {
    let { isInsert, form, nhomdichvuSelected, dichvucungcap, donviSelected, checkDvcc } = this.state
    let { modalIsOpen, search, danhsachDVCC, cbCheckAll } = this.state
    let { page, pagesize, _size, _total_pages } = this.state
    try {
      return (
        <React.Fragment>
          <div className="main portlet">
            <BreadCrumbs
              title={'Chi tiết dịch vụ'}
              route={[
                { label: 'Ứng dụng kết nối', value: '/quan-tri-ket-noi/ung-dung-ket-noi' },
                { label: 'Thông tin dịch vụ', value: '/quan-tri-ket-noi/ung-dung-ket-noi/:id' },
              ]}
            />
            <div className="portlet-title">
              <div className="caption">
                <i className="fas fa-grip-vertical" />Thông tin CSDL/HTTT khai thác
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
                        required={true}
                        disabled={false}
                        readOnly={false}
                        onChange={this._handleChangeElement}
                        defaultValue={form.Ten || ''}
                        type="text"
                        id="Ten"
                        label="CSDL/HTTT Khai thác"
                        placeholder="Nhập tên CSDL/HTTT Khai thác"
                      />
                    </FormWrapper>
                    <FormWrapper>
                      <FormInput
                        parentClass="col-md-6"
                        labelClass="col-md-6"
                        inputClass="col-md-6"
                        required={true}
                        disabled={!isInsert}
                        readOnly={!isInsert}
                        onChange={this._handleChangeElement}
                        defaultValue={form.Ma || ''}
                        type="text"
                        id="Ma"
                        label="Mã CSDL/HTTT Khai thác"
                      />
                      <FormInput
                        parentClass="col-md-6"
                        labelClass="col-md-6"
                        inputClass="col-md-6"
                        required={false}
                        disabled={false}
                        readOnly={false}
                        pattern=""
                        onChange={this._handleChangeElement}
                        defaultValue={form.STT || ''}
                        type="number"
                        id="STT"
                        label="STT"
                        placeholder="Nhập số thứ tự"
                      />
                    </FormWrapper>
                    <FormWrapper>
                      <FormInput
                        loadOptions={this._handleLoadNhomDichvu}
                        onChange={this._handleNhomDichVuChange}
                        required={true}
                        defaultValue={nhomdichvuSelected}
                        isClearable={true}
                        isSearchable={true}
                        isDisabled={false}
                        defaultOptions={true}
                        type="select"
                        label="Nhóm dịch vụ ứng dụng"
                        placeholder="Chọn nhóm dịch vụ ứng dụng..."
                      />
                    </FormWrapper>
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
                    <hr />
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
                        label="Đơn vị chủ quản"
                        placeholder="Chọn đơn vị chủ quản..."
                      />
                    </FormWrapper>
                    <FormWrapper>
                      <FormInput
                        parentClass="col-md-6"
                        labelClass="col-md-6"
                        inputClass="col-md-6"
                        required={false}
                        disabled={false}
                        readOnly={false}
                        onChange={this._handleChangeElement}
                        defaultValue={form.NguoiLienHe || ''}
                        type="text"
                        id="NguoiLienHe"
                        label="Người liên hệ"
                        placeholder="Nhập tên người liên hệ"
                      />
                    </FormWrapper>
                    <FormWrapper>
                      <FormInput
                        required={false}
                        disabled={false}
                        readOnly={false}
                        onChange={this._handleChangeElement}
                        defaultValue={form.DiaChiLienHe || ''}
                        type="text"
                        id="DiaChiLienHe"
                        label="Địa chỉ"
                        placeholder="Nhập địa chỉ liên hệ"
                      />
                    </FormWrapper>
                    <FormWrapper>
                      <FormInput
                        parentClass="col-md-6"
                        labelClass="col-md-6"
                        inputClass="col-md-6"
                        required={false}
                        disabled={false}
                        readOnly={false}
                        pattern={CONSTANTS.VN_PHONE_NUMBER}
                        onChange={this._handleChangeElement}
                        defaultValue={form.SDT || ''}
                        type="text"
                        id="SDT"
                        label="SĐT liên hệ"
                        errorLabel="SĐT không hợp lệ"
                        placeholder="Nhập SĐT liên hệ"
                      />
                      <FormInput
                        parentClass="col-md-6"
                        labelClass="col-md-6"
                        inputClass="col-md-6"
                        required={false}
                        disabled={false}
                        readOnly={false}
                        pattern={CONSTANTS.EMAIL_PATTERN}
                        onChange={this._handleChangeElement}
                        defaultValue={form.Email || ''}
                        type="text"
                        id="Email"
                        label="Email"
                        placeholder="Nhập email liên hệ"
                      />
                    </FormWrapper>
                  </div>
                </div>
              </div>
            </div>
            <div className="card">
              <div
                className="card-header d-flex justify-content-between"
              // data-toggle="collapse"
              // data-target="#collapseDichVu"
              // aria-expanded="true"
              // aria-controls="collapseDichVu"
              >
                <div>
                  <span className="caption-subject">Dịch vụ cung cấp</span>
                  &nbsp;
                  &nbsp;
                  <button onClick={this._handleAddToggle} className="pull-left btn btn-sm btn-outline-primary border-radius">
                    <i className="fas fa-plus"></i>Thêm dịch vụ
                </button>
                </div>
                {/* <span>
                  <i className="fas fa-chevron-up" />
                  <i className="fas fa-chevron-down" />
                </span> */}
              </div>

              {checkDvcc && <div className="card-body fix-first">
                <div className="table-fix-head">
                  <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Tên dịch vụ cung cấp</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dichvucungcap.map((item, index) => {
                        return <tr key={index} >
                          <td className='text-center'>{index + 1}</td>
                          <td>{item.Ten}</td>
                          <td className="text-center">
                            <button onClick={() => this._handleDeleteOptions(index)} title="Xóa" className="btn btn-sm btn-outline-danger border-radius">
                              <i className="fas fa-trash" />
                            </button>
                          </td>
                        </tr>
                      })}
                    </tbody>
                  </table>
                </div>
              </div>}
            </div>
          </div>

          <Modal
            isOpen={modalIsOpen}
            onRequestClose={this._handleAddToggle}
          >
            <div className="card">
              <div className="card-header">
                <label className='caption'>Thêm dịch vụ cung cấp</label>
                <button onClick={this._handleAddToggle} className="pull-right btn btn-sm btn-outline-danger border-radius">
                  <i className="far fa-times-circle"></i>Đóng
                  </button>
              </div>
              <div className="card-body">
                <div className="form-row form-group form-custom">
                  <div className="col-md-4">
                    <input className="form-control" onChange={this._handleChangeSearchElement} onKeyDown={this._handleKeyDow}
                      value={search.TenModal || ''} type="text" id="TenModal" placeholder='Tìm kiếm dịch vụ cung cấp' />
                  </div>
                  <div className="col-md-4">
                    <button onClick={this._handleSearchDichVu} className="btn btn-outline-primary border-radius ">
                      <i className="fas fa-search" />Tìm kiếm
                    </button>
                  </div>
                </div>
                <div className="table-fix-head">
                  <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                    <thead>
                      <tr>
                        <th>STT</th>
                        <th>Dịch vụ cung cấp</th>
                        <th className='td-checkbox'><input type="checkbox" id='cbCheckAll'
                          checked={!!cbCheckAll}
                          onChange={(evt) => this._handleCheckAll(evt)} /></th>
                      </tr>
                    </thead>
                    <tbody>
                      {danhsachDVCC.map((item, index) => {
                        return <tr key={index} >
                          <td className='text-center'>{index + 1}</td>
                          <td>{item.Ten}</td>
                          <td className='text-center td-checkbox'>
                            <input
                              type="checkbox"
                              checked={this._checkItem(item)}
                              onChange={(evt) => this._handleCheckItem(evt, item)} />
                          </td>
                        </tr>
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card-footer">
                <Pagination history={this.props.history}
                  page={page} pagesize={pagesize}
                  _size={_size} _total_pages={_total_pages}
                />
              </div>
            </div>
          </Modal>
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
