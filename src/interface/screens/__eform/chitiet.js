import React, { Component } from "react";
import { connect } from "react-redux";
import { Page404, Other } from 'interface/screens/error'
import { BreadCrumbs, FormInput, FileUpload, FormWrapper } from "interface/components";
import { __DEV__ } from "../../../common/ulti/constants";
import * as CONSTANTS from 'common/ulti/constants';
import { confirmAlert } from 'react-confirm-alert';
import * as cmFunction from 'common/ulti/commonFunction'
import * as tbEform from 'controller/services/tbEformServices'
import * as tbLinhVuc from 'controller/services/tbLinhVucServices'
import * as tbDonVi from 'controller/services/tbDonViServices'
import * as tbThongTinEform from 'controller/services/tbThongTinEformServices'
import * as mediaServices from 'controller/services/mediaServices'
import { fetchToastNotify } from "../../../controller/redux/app-reducer";
import { Link } from "react-router-dom";

class ChiTiet extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isInsert: this.props.match.params.id == 0,
      isFileChanged: false,
      error: false,
      form: {},
      documents: [],
      thongtineform: [],

      linhvuc: [],
      linhvucSelected: null,
      linhvucTimeout: null,

      donvi: [],
      donviSelected: null,
      donviTimeout: null,

      loaivanban: [],
      loaivanbanSelected: null,
      loaivanbanTimeout: null,
    }
  }

  componentDidMount() {
    this._init()
  }

  componentDidUpdate(prevProps) {
    let { match } = this.props
    if (match.params.id !== prevProps.match.params.id) {
      this._init()
    }
  }

  _init = async () => {
    this.state.isInsert = this.props.match.params.id == 0
    let id = this.props.match.params.id
    if (!this.state.isInsert) {
      let data = await tbEform.getById(id)
      let thongtineform = await tbThongTinEform.getAll()
      thongtineform = thongtineform && thongtineform._embedded ? thongtineform._embedded : [];
      if (data) {
        this.state.form = data
        this.state.linhvucSelected = cmFunction.convertSelectedOptions(data.LinhVuc, '_id.$oid', 'Ten')
        this.state.donviSelected = cmFunction.convertSelectedOptions(data.DonVi, '_id.$oid', 'Ten')
        this.state.loaivanbanSelected = cmFunction.convertSelectedOptions(data.LoaiVanBan, '_id.$oid', 'Ten')
        this.state.documents = cmFunction.clone(data.NoiDung.documents)
        this.state.thongtineform = thongtineform;
      }
      if (!data) this.state.error = true
      this.forceUpdate()
    } else {
      let thongtineform = await tbThongTinEform.getAll()
      thongtineform = thongtineform && thongtineform._embedded ? thongtineform._embedded : [];
      this.state.thongtineform = thongtineform;
      this.forceUpdate();
    }
  }

  _handleChangeElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.value
    this.forceUpdate()
  }
  _handleChangeCheckElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.checked
    this.forceUpdate()
  }

  //SELECT LOAD DATA
  _handleLoadOptions = (inputValue, callback) => {
    clearTimeout(this.state.linhvucTimeout);
    this.state.linhvucTimeout = setTimeout(async () => {
      let filter = {}
      filter.page = 1
      filter.pagesize = 1000
      filter.count = true
      filter.sort_by = 'STT'
      filter.filter = JSON.stringify({ Ten: cmFunction.regexText(inputValue) });
      filter = new URLSearchParams(filter).toString()
      let dsLinhVuc = await tbLinhVuc.getAll(filter)
      dsLinhVuc = (dsLinhVuc && dsLinhVuc._embedded ? dsLinhVuc._embedded : [])
      let linhvuc = cmFunction.convertSelectOptions(dsLinhVuc, '_id.$oid', 'Ten')
      this.state.linhvuc = linhvuc
      this.forceUpdate()
      callback(linhvuc);
    }, 500);
  };

  _handleLoaiVanBanLoadOptions = (inputValue, callback) => {
    let { General } = this.props
    clearTimeout(this.state.loaivanbanTimeout);
    this.state.loaivanbanTimeout = setTimeout(async () => {
      let loaivanban = cmFunction.convertSelectOptions(General.DanhMuc[CONSTANTS.MA_DANH_MUC.LoaiVanBan.Ma], '_id.$oid', 'Ten')
      this.state.loaivanban = loaivanban
      this.forceUpdate()
      callback(loaivanban);
    }, 500);
  }

  _handleDonViLoadOptions = (inputValue, callback) => {
    clearTimeout(this.state.donviTimeout);
    this.state.donviTimeout = setTimeout(async () => {
      let filter = {}
      filter.page = 1
      filter.pagesize = 1000
      filter.count = true
      filter.sort_by = 'STT'
      filter.filter = JSON.stringify({ Ten: cmFunction.regexText(inputValue) });
      filter = new URLSearchParams(filter).toString()
      let dsDonVi = await tbDonVi.getAll(filter)
      dsDonVi = (dsDonVi && dsDonVi._embedded ? dsDonVi._embedded : [])
      let donvi = cmFunction.convertSelectOptions(dsDonVi, '_id.$oid', 'Ten')
      this.state.donvi = donvi
      this.forceUpdate()
      callback(donvi);
    }, 500);
  };

  _handleLinhVucChange = (sel) => {
    this.state.linhvucSelected = sel
    this.forceUpdate()
  }

  _handleDonViChange = (sel) => {
    this.state.donviSelected = sel
    this.forceUpdate()
  }

  _handleLoaiVanBanChange = (sel) => {
    this.state.loaivanbanSelected = sel
    this.forceUpdate()
  }

  //ACTION
  _handleConfirm = (_type = 0, _action, _stay = false) => {
    confirmAlert({
      title: `${!_type ? 'Sửa' : (_type < 0 ? 'Xóa' : 'Thêm')} dữ liệu`,
      message: `Xác nhận ${!_type ? 'sửa' : (_type < 0 ? 'xóa' : 'thêm')} dữ liệu`,
      buttons: [
        {
          label: 'Không',
          onClick: () => { return }
        },
        {
          label: 'Có',
          onClick: () => _action(_stay)
        }
      ]
    });
  }

  _handleDelete = async () => {
    if (this.state.isInsert) return
    let { id } = this.props.match.params
    let axiosRes = await tbEform.deleteById(id)
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: "Xóa thành công" }))
      cmFunction.goBack()
    }
  }

  _handleSave = (stay) => {
    if (cmFunction.formValidate(this, 'form')) {
      this._handleConfirm(this.state.isInsert, this._handleUpdateInfo, stay)
    } else {
      confirmAlert({
        title: 'Dữ liệu không hợp lệ',
        message: 'Vui lòng nhập đúng định dạng dữ liệu',
        buttons: [
          {
            label: 'Đồng ý',
            onClick: () => { return }
          }
        ]
      });
      return;
    }
  }

  _handleUpdateInfo = async (stay) => {
    let { form, linhvucSelected, donviSelected, loaivanbanSelected, isInsert, isFileChanged, documents } = this.state
    let axiosReq = form
    axiosReq.STT = Number(axiosReq.STT || 9999)
    axiosReq.LinhVuc = null
    axiosReq.CapThamQuyen = 0
    axiosReq.CapLinhVuc = 0
    if (isFileChanged) {
      let documentsRes = await mediaServices.uploadFiles({ documents: documents })
      if (!documentsRes) {
        this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Không thể tải tệp đính kèm, vui lòng kiểm tra lại' }))
        return
      }
      axiosReq.NoiDung = documentsRes
    }


    if (donviSelected) {
      axiosReq.DonVi = cmFunction.clone(donviSelected)
      axiosReq.CapDonVi = donviSelected.Cap
      delete axiosReq.DonVi.value
      delete axiosReq.DonVi.label
    }

    if (linhvucSelected) {
      axiosReq.LinhVuc = cmFunction.clone(linhvucSelected)
      axiosReq.CapLinhVuc = linhvucSelected.Cap
      delete axiosReq.LinhVuc.value
      delete axiosReq.LinhVuc.label
    }

    if (loaivanbanSelected) {
      axiosReq.LoaiVanBan = cmFunction.clone(loaivanbanSelected)
      delete axiosReq.LoaiVanBan.value
      delete axiosReq.LoaiVanBan.label
    }

    let axiosRes
    if (isInsert) {
      axiosRes = await tbEform.create(axiosReq)
    } else {
      let id = this.props.match.params.id;
      axiosRes = await tbEform.updateById(id, axiosReq)
    }
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' }))
      if (isInsert) {
        this.state.form = {}
        this.state.linhvucSelected = null
        this.state.donviSelected = null
        this.state.loaivanbanSelected = null
        this.state.documents = []
        this.state.isFileChanged = false
        this.forceUpdate()
      }
      if (!stay) cmFunction.goBack()
    }
  }

  onDropFiles = (files) => {
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
    this.state.isFileChanged = true
    this.forceUpdate();
  }

  onRemoveFile = (data) => {
    if (!data) return;
    let { documents } = this.state;
    let ind = documents.findIndex(ele => ele.name == data.name && ele.type == data.type && ele.size == data.size);
    if (ind >= 0) {
      documents.splice(ind, 1);
      this.forceUpdate();
    }
  }


  _renderOther = () => {
    let { thongtineform } = this.state
    return thongtineform.map((item, index) => {
      switch (item.KieuDuLieu.Ma) {
        case CONSTANTS.KIEU_DU_LIEU['number'].value:
          return <div key={index}>number</div>
        case CONSTANTS.KIEU_DU_LIEU['date'].value:
          return <div key={index}>date</div>
        case CONSTANTS.KIEU_DU_LIEU['select'].value:
          return <div key={index}>select</div>
        case CONSTANTS.KIEU_DU_LIEU['radio'].value:
          return <div key={index}>radio</div>
        case CONSTANTS.KIEU_DU_LIEU['checkbox'].value:
          return <div key={index}>checkbox</div>
        default:
          return <div key={index}>text</div>
      }
    })
  }

  render() {
    let { isInsert, form, error, linhvucSelected, donviSelected, loaivanbanSelected } = this.state
    let { documents } = this.state
    let { id } = this.props.match.params
    if (error)
      return <Page404 />
    try {
      return (
        <div className="main portlet fade-in">
          <BreadCrumbs title={"Chi tiết"}
            route={[{ label: 'Quản lý biểu mẫu', value: '/quan-ly/eform' }, { label: 'Thông tin biểu mẫu', value: '/quan-ly/eform/:id' }]}
          />
          <div className="portlet-title">
            <div className="caption">
              <i className="fas fa-grip-vertical" />Thông tin biểu mẫu
              </div>
            <div className="action">
              <button onClick={() => this._handleSave(false)} className="btn btn-sm btn-outline-primary border-radius">
                <i className="fas fa-save" />Lưu
                </button>
              <button onClick={() => this._handleSave(true)} className="btn btn-sm btn-outline-primary border-radius">
                <i className="far fa-save" />Lưu và tiếp tục
                </button>
              <div className="btn btn-sm dropdown">
                <button className="btn btn-sm btn-outline-primary border-radius dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i className="fas fa-share" />Khác
                </button>
                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <button onClick={cmFunction.goBack} className="btn btn-sm">
                    <i className="fas fa-reply" />Quay lại
                  </button>
                  <button onClick={this._init} className="btn btn-sm">
                    <i className="fas fa-sync" />Làm mới
                  </button>
                  {!isInsert && <button onClick={() => this._handleConfirm(-1, this._handleDelete)} className="btn btn-sm">
                    <i className="fas fa-trash" />
                    Xóa
                  </button>}
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between" data-toggle="collapse" data-target="#collapseExample" aria-expanded="true" aria-controls="collapseExample">
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
                      parentClass="col-md-6"
                      labelClass="col-md-6"
                      inputClass="col-md-6"
                      required={true}
                      disabled={false}
                      readOnly={false}
                      onChange={this._handleChangeElement}
                      defaultValue={form.Ten || ''}
                      type="text"
                      id="Ten"
                      label="Tên biểu mẫu"
                      placeholder="Nhập tên biểu mẫu" />
                    <FormInput
                      parentClass="col-md-6"
                      labelClass="col-md-6"
                      inputClass="col-md-6"
                      disabled={!isInsert}
                      readOnly={!isInsert}
                      required={true}
                      onChange={this._handleChangeElement}
                      defaultValue={form.Ma || ''}
                      type="text"
                      id="Ma"
                      label="Mã (Số hiệu)"
                      placeholder="Nhập mã (số hiệu)" />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      parentClass="col-md-6"
                      labelClass="col-md-6"
                      inputClass="col-md-6"
                      disabled={false}
                      readOnly={false}
                      required={true}
                      onChange={this._handleChangeElement}
                      defaultValue={form.ThongTu || ''}
                      type="text"
                      id="ThongTu"
                      label="Thông tư (Nghị định)"
                      placeholder="Nhập thông tư (nghị định) ban hành" />
                    <FormInput
                      parentClass="col-md-6"
                      labelClass="col-md-6"
                      inputClass="col-md-6"
                      disabled={false}
                      readOnly={false}
                      required={true}
                      onChange={this._handleChangeElement}
                      defaultValue={form.SoThongTu || ''}
                      type="text"
                      id="SoThongTu"
                      label="Số thông tư (Nghị định)"
                      placeholder="Nhập số thông tư (nghị định) ban hành" />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      loadOptions={this._handleDonViLoadOptions}
                      onChange={this._handleDonViChange}
                      required={true}
                      defaultValue={donviSelected}
                      isClearable={true}
                      isSearchable={true}
                      defaultOptions={true}
                      type="select"
                      label="Thẩm quyền ban hành"
                      placeholder="Chọn thẩm quyền..." />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      parentClass="col-md-6"
                      labelClass="col-md-6"
                      inputClass="col-md-6"
                      loadOptions={this._handleLoadOptions}
                      onChange={this._handleLinhVucChange}
                      required={true}
                      defaultValue={linhvucSelected}
                      isClearable={true}
                      isSearchable={true}
                      defaultOptions={true}
                      type="select"
                      label="Thuộc lĩnh vực"
                      placeholder="Chọn lĩnh vực..." />
                    <FormInput
                      parentClass="col-md-6"
                      labelClass="col-md-6"
                      inputClass="col-md-6"
                      loadOptions={this._handleLoaiVanBanLoadOptions}
                      onChange={this._handleLoaiVanBanChange}
                      required={true}
                      defaultValue={loaivanbanSelected}
                      isClearable={true}
                      isSearchable={true}
                      defaultOptions={true}
                      type="select"
                      label="Loại văn bản"
                      placeholder="Chọn loại văn bản..." />
                  </FormWrapper>
                  <FormWrapper>
                    <FileUpload
                      label="Tệp đính kèm"
                      accept=".docx, .doc"
                      startWith={10}
                      endWith={4}
                      required={true}
                      readOnly={false}
                      disabled={false}
                      disableClick={false}
                      multiple={false}
                      files={documents}
                      onDrop={this.onDropFiles}
                      onRemove={this.onRemoveFile}
                    />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      type="textarea"
                      onChange={this._handleChangeElement}
                      rows="3"
                      defaultValue={form.NoiDungTrichYeu || ''}
                      id="NoiDungTrichYeu"
                      label="Nội dung trích yếu" />
                  </FormWrapper>
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
                      placeholder="Nhập số thứ tự" />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      type="checkbox"
                      onChange={this._handleChangeCheckElement}
                      defaultValue={form.KichHoat}
                      id="KichHoat"
                      label="Kích hoạt" />
                  </FormWrapper>
                </div>
              </div>
              {/* <div className="card-footer">
              </div> */}
            </div>
          </div>

          {!isInsert && !cmFunction.isEmpty(form) && !cmFunction.isEmpty(form.NoiDung) ? <div className="card mb-4">
            <div className="card-header d-flex justify-content-between" data-toggle="collapse" data-target="#collapseEdit" aria-expanded="true" aria-controls="collapseEdit">
              <span className="caption-subject">Nội dung / tệp đính kèm</span>
              <span>
                <i className="fas fa-chevron-up" />
                <i className="fas fa-chevron-down" />
              </span>
            </div>
            <div className="collapse show" id="collapseEdit">
              <div className="card-body">
                <div className="form-body" ref="content">
                  <Link to={`/quan-ly/eform/${id}/chinh-sua/${form.NoiDung.documents[0].nextid}`}>
                    {form.NoiDung.documents[0].originalname} &nbsp; (Nhấn để chỉnh sửa)
                  </Link>
                </div>
              </div>
            </div>
          </div> : null}

          <div className="card">
            <div className="card-header d-flex justify-content-between" data-toggle="collapse" data-target="#collapseOther" aria-expanded="true" aria-controls="collapseOther">
              <span className="caption-subject">Thông tin khác</span>
              <span>
                <i className="fas fa-chevron-up" />
                <i className="fas fa-chevron-down" />
              </span>
            </div>
            <div className="collapse show" id="collapseOther">
              <div className="card-body">
                <div className="form-body" ref="other">
                  {this._renderOther()}
                </div>
              </div>
            </div>
          </div>

        </div>
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
export default connect(mapStateToProps)(ChiTiet);
