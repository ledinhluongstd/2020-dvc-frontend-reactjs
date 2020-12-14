import React, { Component } from "react";
import { connect } from "react-redux";
import { Page404, Other } from 'interface/screens/error'
import { BreadCrumbs, FormInput, FormWrapper } from "interface/components";
import { __DEV__ } from "../../../common/ulti/constants";
import * as CONSTANTS from 'common/ulti/constants';
import { confirmAlert } from 'react-confirm-alert';
import moment from 'moment'
import * as cmFunction from 'common/ulti/commonFunction'
import * as tbLinhVuc from 'controller/services/tbLinhVucServices'
import * as tbDonVi from 'controller/services/tbDonViServices'
import { fetchToastNotify } from "../../../controller/redux/app-reducer";

class ChiTiet extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isInsert: this.props.match.params.id == 0,
      error: false,
      form: {},

      linhvuc: [],
      linhvucSelected: null,

      donvi: [],
      donviSelected: [],

      linhvucTimeout: null,
      donviTimeout: null
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
    let id = this.props.match.params.id
    this.state.isInsert = id == 0
    if (!this.state.isInsert) {
      let data = await tbLinhVuc.getById(id)
      if (data) {
        this.state.form = data
        this.state.linhvucSelected = cmFunction.convertSelectedOptions(data.LinhVucCha, '_id.$oid', 'Ten')
        this.state.donviSelected = cmFunction.convertSelectedOptions(data.DonVi, '_id.$oid', 'Ten')
      }
      if (!data) this.state.error = true
      this.forceUpdate()
    }
  }

  _handleCheckMaLV = async () => {
    if (!this.state.form.Ma) return false;
    let filter = { filter: {} };
    filter.count = true;
    filter.page = 1;
    filter.pagesize = 1;
    filter.filter['Ma'] = this.state.form.Ma;
    filter.filter = JSON.stringify(filter.filter)
    filter = new URLSearchParams(filter).toString()
    let data = await tbLinhVuc.getAll(filter)
    return data._returned;
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
      filter.filter = JSON.stringify({ Ten: cmFunction.regexText(inputValue) });
      filter = new URLSearchParams(filter).toString()
      let dsLinhVuc = await tbLinhVuc.getAll(filter)
      dsLinhVuc = (dsLinhVuc && dsLinhVuc._embedded ? dsLinhVuc._embedded : [])
      let id = this.props.match.params.id;
      let find = dsLinhVuc.find(ele => ele._id.$oid == id);
      find = find ? [find] : [];
      let linhvuc = cmFunction.convertSelectOptions(dsLinhVuc, '_id.$oid', 'Ten', find)
      this.state.linhvuc = linhvuc
      this.forceUpdate()
      callback(linhvuc);
    }, 500);
  };

  _handleLinhVucChange = (sel) => {
    this.state.linhvucSelected = sel
    this.forceUpdate()
  }

  _handleDonViLoadOptions = (inputValue, callback) => {
    clearTimeout(this.state.donviTimeout);
    this.state.donviTimeout = setTimeout(async () => {
      let filter = {}
      filter.page = 1
      filter.pagesize = 1000
      filter.count = true
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

  _handleDonViChange = (sel) => {
    this.state.donviSelected = sel
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
    let axiosRes = await tbLinhVuc.deleteById(id)
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
    let { form, linhvucSelected, donviSelected, isInsert } = this.state
    let axiosReq = form
    axiosReq.STT = Number(axiosReq.STT || 9999)
    axiosReq.LinhVucCha = null
    axiosReq.Cap = 0

    axiosReq.DonVi = null

    if (linhvucSelected) {
      axiosReq.LinhVucCha = cmFunction.clone(linhvucSelected)
      axiosReq.Cap = Number(linhvucSelected.Cap) + 1
      delete axiosReq.LinhVucCha.value
      delete axiosReq.LinhVucCha.label
    }

    if (donviSelected) {
      axiosReq.DonVi = cmFunction.clone(donviSelected)
      delete axiosReq.DonVi.value
      delete axiosReq.DonVi.label
    }

    let axiosRes
    if (isInsert) {
      axiosRes = await tbLinhVuc.create(axiosReq)
    } else {
      let id = this.props.match.params.id;
      axiosRes = await tbLinhVuc.updateById(id, axiosReq)
    }
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' }))
      if (isInsert) {
        this.state.form = {}
        this.state.linhvucSelected = null
        this.state.donviSelected = null
        this.forceUpdate()
      }
      if (!stay) cmFunction.goBack()
    }
  }

  render() {
    let { isInsert, form, error, linhvucSelected, donviSelected } = this.state
    if (error)
      return <Page404 />
    try {
      return (
        <div className="main portlet fade-in">
          <BreadCrumbs title={"Chi tiết"}
            route={[{ label: 'Quản lý lĩnh vực', value: '/danh-muc-dtdc/linh-vuc' }, { label: 'Thông tin lĩnh vực', value: '/danh-muc-dtdc/linh-vuc/:id' }]}
          />
          <div className="portlet-title">
            <div className="caption">
              <i className="fas fa-grip-vertical" />Thông tin lĩnh vực
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
          <div className="card">
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
                      label="Tên lĩnh vực"
                      placeholder="Nhập tên lĩnh vực" />
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
                      label="Mã lĩnh vực"
                      // _handleCheck={this._handleCheckMaLV} 
                      />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      loadOptions={this._handleLoadOptions}
                      onChange={this._handleLinhVucChange}
                      required={false}
                      defaultValue={linhvucSelected}
                      isClearable={true}
                      isSearchable={true}
                      defaultOptions={true}
                      type="select"
                      label="Thuộc nhóm"
                      placeholder="Chọn nhóm lĩnh vực..." />
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
                      label="Đơn vị"
                      placeholder="Chọn đơn vị trực thuộc ..." />
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
              <div className="card-footer">
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
