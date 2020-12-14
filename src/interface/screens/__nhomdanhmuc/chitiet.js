import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Page404, Other } from 'interface/screens/error';
import { BreadCrumbs, FormInput, FormWrapper } from 'interface/components';
import { __DEV__ } from '../../../common/ulti/constants';
import * as CONSTANTS from 'common/ulti/constants';
import { confirmAlert } from 'react-confirm-alert';
import * as cmFunction from 'common/ulti/commonFunction';
import * as tbNhomDanhMuc from 'controller/services/tbNhomDanhMucServices'
import * as tbThuocTinhDanhMuc from 'controller/services/tbThuocTinhDanhMucServices'
import { fetchToastNotify } from '../../../controller/redux/app-reducer';

class ChiTiet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isInsert: this.props.match.params.id == 0,
      error: false,
      form: {},
      danhmuc: [],
      danhsachthuoctinh: [],
      danhmucchaSelected: null,
      searchTimeout: null,
      //searchDonViTimeout: null,
      check: false,
      cbCheckAll: false,
      thuoctinh: [],
      /*documents: [],
      vanbansuadoi: {
        Ten: "",
        Link: "",
        File: []
      },
      isFileChanged: false,
      donvi: [],
      checkDoc: false*/
    };
  }

  componentDidMount() {
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
      let data = await tbNhomDanhMuc.getById(id);
      if (data) {
        this.state.form = data;
        /*if (data.VBBanHanhSuaDoi) {
          this.state.vanbansuadoi = data.VBBanHanhSuaDoi
          if (data.VBBanHanhSuaDoi.File.length === 0 || data.VBBanHanhSuaDoi.File.documents.length === 0) {
            this.state.documents = [];
            this.state.checkDoc = false
          } else {
            this.state.documents = cmFunction.clone(data.VBBanHanhSuaDoi.File.documents)
            this.state.checkDoc = true
          }
        }*/
        this.state.danhmucchaSelected = cmFunction.convertSelectedOptions(
          data.NhomDanhMucCha,
          '_id.$oid',
          'Ten'
        );
        /*this.state.donviSelected = cmFunction.convertSelectedOptions(
          data.DonViCha,
          '_id.$oid',
          'Ten'
        );*/
        if (data.ThuocTinh) {
          this.state.thuoctinh = data.ThuocTinh
        }
      }
      if (!data) this.state.error = true;
      this.forceUpdate();
    }
    let filter = {}
    filter.page = 1;
    filter.pagesize = 1000;
    filter.count = true;
    filter.filter = JSON.stringify({ KichHoat: true, isActive: true })
    filter = new URLSearchParams(filter).toString();
    let data = await tbThuocTinhDanhMuc.getAll(filter)
    let danhsachthuoctinh = data && data._embedded ? data._embedded : [];
    danhsachthuoctinh.sort(function (a, b) {
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
    this.state.danhsachthuoctinh = danhsachthuoctinh;
    this.state._size = data._size || 0
    this.state._total_pages = data._total_pages || 0
    this.forceUpdate()
    this._checkAll();
  };


  //SELECT LOAD DATA
  _handleLoadOptions = (inputValue, callback) => {
    clearTimeout(this.state.searchTimeout);
    this.state.searchTimeout = setTimeout(async () => {
      let filter = {};
      filter.page = 1;
      filter.pagesize = 1000;
      filter.count = true;
      filter.filter = JSON.stringify({ Ten: cmFunction.regexText(inputValue), KichHoat: true });
      filter = new URLSearchParams(filter).toString();
      let dsDanhMuc = await tbNhomDanhMuc.getAll(filter);
      dsDanhMuc = dsDanhMuc && dsDanhMuc._embedded ? dsDanhMuc._embedded : [];
      let id = this.props.match.params.id;
      let find = dsDanhMuc.find(ele => ele._id.$oid == id);
      find = find ? [find] : [];
      let danhmuc = cmFunction.convertSelectOptions(dsDanhMuc, '_id.$oid', 'Ten', find);
      danhmuc.sort(function (a, b) {
        if (a.Cap !== b.Cap) {
          return a.Cap - b.Cap
        }
        var nameA = cmFunction.changeAlias(a.Ten);
        var nameB = cmFunction.changeAlias(b.Ten);
        if (nameA === nameB) {
          return 0;
        }
        return nameA > nameB ? 1 : -1
      });
      this.state.danhmuc = danhmuc;
      this.forceUpdate();
      callback(danhmuc);
    }, 500);
  };

  /*_handleLoadDonViCha = (inputValue, callback) => {
    clearTimeout(this.state.searchDonViTimeout);
    this.state.searchDonViTimeout = setTimeout(async () => {
      let filter = {};
      filter.page = 1;
      filter.pagesize = 1000;
      filter.count = true
      filter.filter = JSON.stringify({ Ten: cmFunction.regexText(inputValue), KichHoat: true });
      filter = new URLSearchParams(filter).toString();
      let dsDonVi = await tbDonVi.getAll(filter);
      dsDonVi = dsDonVi && dsDonVi._embedded ? dsDonVi._embedded : [];
      let id = this.props.match.params.id;
      let find = dsDonVi.find(ele => ele._id.$oid == id);
      find = find ? [find] : [];
      let donvi = cmFunction.convertSelectOptions(dsDonVi, '_id.$oid', 'Ten', find);
      donvi.sort(function (a, b) {
        if (a.Cap !== b.Cap) {
          return a.Cap - b.Cap
        }
        var nameA = cmFunction.changeAlias(a.Ten);
        var nameB = cmFunction.changeAlias(b.Ten);
        if (nameA === nameB) {
          return 0;
        }
        return nameA > nameB ? 1 : -1
      });
      this.state.donvi = donvi;
      this.forceUpdate();
      callback(donvi);
    }, 500);
  };*/


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
    let axiosRes = await tbNhomDanhMuc.deleteById(id);
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
    let { form, danhmucchaSelected, isInsert, thuoctinh, isFileChanged, vanbansuadoi, documents, donviSelected } = this.state;
    let axiosReq = form;
    axiosReq.STT = Number(axiosReq.STT || 9999);
    axiosReq.NhomDanhMucCha = null;
    axiosReq.Cap = 0;
    //axiosReq.VBBanHanhSuaDoi = null;

    /*if (isFileChanged) {
      let documentsRes = await mediaServices.uploadFiles({ documents: documents })
      if (!documentsRes) {
        this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Không thể tải tệp đính kèm, vui lòng kiểm tra lại' }))
        return
      }
      vanbansuadoi.File = documentsRes
    }

    if (vanbansuadoi) {
      axiosReq.VBBanHanhSuaDoi = vanbansuadoi
    }*/

    if (danhmucchaSelected) {
      let dvTmp = cmFunction.clone(danhmucchaSelected)
      axiosReq.NhomDanhMucCha = dvTmp;
      axiosReq.Cap = (dvTmp.Cap + 1)
      delete axiosReq.NhomDanhMucCha.value;
      delete axiosReq.NhomDanhMucCha.label;
    }
    /*if (donviSelected) {
      let dvTmp = cmFunction.clone(donviSelected)
      axiosReq.DonViCha = dvTmp;
      delete axiosReq.DonViCha.value;
      delete axiosReq.DonViCha.label;
    }*/
    if (thuoctinh) {
      let temp = cmFunction.clone(thuoctinh)
      axiosReq.ThuocTinh = temp;
    }
    let axiosRes;
    if (isInsert) {
      axiosRes = await tbNhomDanhMuc.create(axiosReq);
    } else {
      let id = this.props.match.params.id;
      axiosRes = await tbNhomDanhMuc.updateById(id, axiosReq);
    }
    if (axiosRes) {
      this.props.dispatch(
        fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' })
      );
      if (isInsert) {
        this.state.form = {};
        this.state.danhmucchaSelected = null;
        /*this.state.donviSelected = null;
        this.state.isFileChanged = false
        this.state.VBBanHanhSuaDoi = {}
        this.state.documents = []*/
        this.state.thuoctinh = []
        this.forceUpdate();
      }
      if (!stay) cmFunction.goBack();
    }
  };

  /*onDropFiles = (files) => {
    let fileTemp = [];
    let icons = CONSTANTS.ICONSET_FOR_FILE;
    files.map(item => {
      let dupl = this.state.documents.findIndex(file => file.name == item.name && file.size == item.size);
      if (dupl >= 0) return;
      let ic = icons.find(ele => ele.type.includes(item.type));
      if (ic) item["icon"] = ic;
      else item["icon"] = CONSTANTS.DEFAULT_IC_FOR_FILE;
      fileTemp.push(item);
    });
    if (!fileTemp.length) return;
    if (fileTemp.length > 1) fileTemp = fileTemp.splice(0, 1);
    this.state.documents = fileTemp;
    this.state.vanbansuadoi.File = fileTemp
    this.state.isFileChanged = true
    this.forceUpdate();
  }*/

  /*onRemoveFile = (data) => {
    if (!data) return;
    let { documents } = this.state;
    let ind = documents.findIndex(ele => ele.name == data.name && ele.type == data.type && ele.size == data.size);
    if (ind >= 0) {
      documents.splice(ind, 1);
      this.state.vanbansuadoi.File.documents = documents
      this.state.checkDoc = false
      this.forceUpdate();
    }
  }*/

  _handleCheckAll = (evt) => {
    this.state.cbCheckAll = evt.target.checked;
    let check = evt.target.checked;
    if (check) {
      this.state.thuoctinh = [];
      this.state.danhsachthuoctinh.forEach((item, index) => {
        this.state.thuoctinh = [...this.state.thuoctinh, item]
      })
    } else {
      this.state.thuoctinh = []
    }
    this.forceUpdate()
  };

  _handleCheckItem = (evt, data) => {
    let thuoctinh = this.state.thuoctinh
    let check = evt.target.checked
    if (check) {
      this.state.thuoctinh = [...this.state.thuoctinh, data]
    } else {
      let index = thuoctinh.findIndex(x => x.code === data.code)
      if (index > -1) {
        thuoctinh.splice(index, 1);
        this.state.thuoctinh = thuoctinh
      }
    }
    this.forceUpdate();
    this._checkAll();
  };

  _checkItem = (data) => {
    let thuoctinh = this.state.thuoctinh
    if (thuoctinh) {
      let index = thuoctinh.findIndex(x => x.code === data.code)
      if (index > -1) {
        return true
      } else { return false }
    }
  }

  _checkAll = () => {
    let findItem = 0
    let check = true
    this.state.danhsachthuoctinh.forEach((item) => {
      findItem = this.state.thuoctinh.findIndex(x => x.code === item.code)
      if (findItem === -1) {
        check = false
      }
    })
    if (check) {
      this.state.cbCheckAll = true
    } else {
      this.state.cbCheckAll = false
    }
    this.forceUpdate()
  }

  /*_handleDonviChange = (value) => {
    this.state.donviSelected = value;
    this.forceUpdate();
  }*/

  _handleDanhMucChaChange = (sel) => {
    this.state.danhmucchaSelected = sel;
    if (sel) {
      this.state.thuoctinh = sel.ThuocTinh
    } else {
      if (this.state.form.ThuocTinh === undefined) {
        this.state.thuoctinh = []
      } else {
        this.state.thuoctinh = this.state.form.ThuocTinh
      }
    }
    this.forceUpdate();
    this._checkAll();
  };

  _handleCheckMaDV = async () => {
    if (!this.state.form.Ma) return false;
    let filter = { filter: {} };
    filter.count = true;
    filter.page = 1;
    filter.pagesize = 1;
    filter.filter['Ma'] = this.state.form.Ma;
    filter.filter = JSON.stringify(filter.filter)
    filter = new URLSearchParams(filter).toString()
    let data = await tbNhomDanhMuc.getAll(filter)
    return data._returned;
  }

  _handleChangeElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.value;
    this.forceUpdate();
  };

  /*_handleChangeVanBanSuaDoi = (evt) => {
    this.state.vanbansuadoi[evt.target.id] = evt.target.value
    this.forceUpdate()
  }*/

  /*_handleDownload = async () => {
    let documents = this.state.form.VBBanHanhSuaDoi.File.documents[0]
    let filename = documents.filename
    let originalname = documents.originalname
    let url2 = `${HOST_API}${MEDIA_DOWNLOAD}?q=${filename}`
    saveAs(url2, originalname)
  }*/

  _handleChangeCheckElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.checked;
    this.forceUpdate();
  };

  render() {
    let { isInsert, form, error, danhmucchaSelected, donviSelected } = this.state;
    let { cbCheckAll, danhsachthuoctinh, documents, vanbansuadoi, checkDoc } = this.state
    if (error) return <Page404 />;
    try {
      return (
        <div className="main portlet">
          <BreadCrumbs
            title={'Chi tiết'}
            route={[
              { label: 'Quản lý nhóm danh mục', value: '/danh-muc-dtdc/nhom-danh-muc' },
              { label: 'Thông tin nhóm danh mục', value: '/danh-muc-dtdc/nhom-danh-muc/:id' },
            ]}
          />
          <div className="portlet-title">
            <div className="caption">
              <i className="fas fa-grip-vertical" />
                            Thông tin nhóm danh mục
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

          <div className="card mb-4">
            <div
              className="card-header d-flex justify-content-between"
              data-toggle="collapse"
              data-target="#collapseExample"
              aria-expanded="true"
              aria-controls="collapseExample"
            >
              <span className="caption-subject">Thông tin cơ bản</span>
              <span>
                <i className="fas fa-chevron-up" />
                <i className="fas fa-chevron-down" />
              </span>
            </div>
            <div className="collapse show" id="collapseExample">
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
                      label="Tên nhóm danh mục"
                      placeholder="Nhập tên danh mục"
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
                      label="Mã nhóm danh mục"
                      placeholder="Nhập mã danh mục"
                    // _handleCheck={this._handleCheckMaDV} 
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
                  {/*<FormWrapper>
                    <FormInput
                      loadOptions={this._handleLoadDonViCha}
                      onChange={this._handleDonviChange}
                      required={true}
                      defaultValue={donviSelected}
                      isClearable={true}
                      isSearchable={true}
                      defaultOptions={true}
                      type="select"
                      label="Đơn vị quản lý"
                      placeholder="Chọn đơn vị quản lý ..."
                    />
                  </FormWrapper>*/}
                  <FormWrapper>
                    <FormInput
                      loadOptions={this._handleLoadOptions}
                      onChange={this._handleDanhMucChaChange}
                      required={false}
                      defaultValue={danhmucchaSelected}
                      isClearable={true}
                      isSearchable={true}
                      defaultOptions={true}
                      type="select"
                      label="Thuộc nhóm danh mục"
                      placeholder="Chọn nhóm danh mục trực thuộc ..."
                    />
                  </FormWrapper>
                  {/*<FormWrapper>
                    <FormInput
                      type="text"
                      onChange={this._handleChangeElement}
                      required={false}
                      disabled={false}
                      readOnly={false}
                      defaultValue={form.CoQuanBanHanhVB || ''}
                      id="CoQuanBanHanhVB"
                      label="Cơ quan ban hành"
                      placeholder="Nhập cơ quan ban hành"
                    />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      type="date"
                      onChange={this._handleChangeElement}
                      required={false}
                      disabled={false}
                      readOnly={false}
                      defaultValue={form.NgayBanHanh || ''}
                      id="NgayBanHanh"
                      label="Ngày ban hành"
                    />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      required={false}
                      disabled={false}
                      readOnly={false}
                      onChange={this._handleChangeVanBanSuaDoi}
                      defaultValue={vanbansuadoi.Ten || ''}
                      type="text"
                      id="Ten"
                      label="Văn bản ban hành/sửa đổi"
                      placeholder="Tên văn bản ban hành sửa đổi"
                    />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      required={false}
                      disabled={false}
                      readOnly={false}
                      onChange={this._handleChangeVanBanSuaDoi}
                      defaultValue={vanbansuadoi.Link || ''}
                      type="url"
                      id="Link"
                      label="Link"
                      placeholder="Link văn bản ban hành sửa đổi"
                    />
                  </FormWrapper>
                  <FormWrapper>
                    <FileUpload
                      label="Tệp đính kèm"
                      accept=".docx, .doc, .pdf, .xls, .xlsx"
                      startWith={10}
                      endWith={4}
                      required={false}
                      readOnly={false}
                      disabled={false}
                      disableClick={false}
                      multiple={false}
                      files={documents}
                      onDrop={this.onDropFiles}
                      onRemove={this.onRemoveFile}
                    />
                  </FormWrapper>*/}
                  <FormWrapper>
                    <FormInput
                      type="textarea"
                      onChange={this._handleChangeElement}
                      rows="3"
                      defaultValue={form.GhiChu || ''}
                      id="GhiChu"
                      label="Ghi chú" />
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
              {/*<div className="card-footer">
                {checkDoc && <div className="text-right">
                  <button
                    onClick={() => this._handleDownload()}
                    className="btn btn-sm btn-outline-primary border-radius" >
                    <i className="fas fa-save" />Tải về tệp đính kèm</button>
                </div>}
              </div>*/}
            </div>
          </div>

          <div className="card">
            <div
              className="card-header d-flex justify-content-between"
              data-toggle="collapse"
              data-target="#collapseChucNang"
              aria-expanded="true"
              aria-controls="collapseChucNang"
            >
              <span className="caption-subject">Thuộc tính</span>
              <span>
                <i className="fas fa-chevron-up" />
                <i className="fas fa-chevron-down" />
              </span>
            </div>
            <div className="collapse show" id="collapseChucNang">
              <div className="card-body ">
                <div className="form-body">
                  <div className="col">
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
                          <th>Tên</th>
                          <th >
                            <input
                              type="checkbox"
                              id="POST"
                              checked={!!cbCheckAll}
                              onChange={(evt) =>
                                this._handleCheckAll(evt)
                              }
                            />&nbsp;
                                                        Thêm
                                                    </th>
                        </tr>
                      </thead>
                      <tbody>
                        {danhsachthuoctinh.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td className="text-center">{index + 1}</td>
                              <td>{item.Ten}</td>
                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  checked={this._checkItem(item)}
                                  onChange={(evt) =>
                                    this._handleCheckItem(evt, item)
                                  }
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    } catch (e) {
      if (__DEV__) console.log(e);
      return <Other data={e} />;
    }
  }
}

const mapStateToProps = (state) => {
  let { LoginRes, General } = state;
  return { LoginRes, General };
};
export default connect(mapStateToProps)(ChiTiet);
