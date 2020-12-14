import React, { Component } from "react";
import { connect } from "react-redux";
import { Page404, Other } from 'interface/screens/error'
import { BreadCrumbs, FormInput, FormWrapper } from "interface/components";
import { __DEV__ } from "../../../common/ulti/constants";
import * as CONSTANTS from 'common/ulti/constants';
import * as cmFunction from 'common/ulti/commonFunction'
import * as tbYKienDongGop from 'controller/services/tbYKienDongGopServices'
import Modal from 'react-modal';
import { fetchToastNotify } from "../../../controller/redux/app-reducer";

class ChiTiet extends Component {
  constructor(props) {
    super(props)
    this.state = {
      error: false,
      form: {},

    }
  }

  componentDidMount() {
    this._init()
  }

  componentDidUpdate(prevProps) {
  }

  _init = async () => {
    this.state.isInsert = this.props.match.params.id == 0
    let id = this.props.match.params.id
    if (!this.state.isInsert) {
      let data = await tbYKienDongGop.getById(id)
      if (data) {
        delete data.pwd
        this.state.form = data
        this.state.donviSelected = cmFunction.convertSelectedOptions(data.DonVi, '_id.$oid', 'Ten')
      }
      if (!data) this.state.error = true
      this.forceUpdate()
    }
  }

  _handleChangeElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.value
    this.forceUpdate()
  }

  _handleAddToggle = () => {
    this.state.modalIsOpen = !this.state.modalIsOpen
    this.forceUpdate()
  }

  _handleReply = async () => {
    let { form, isInsert } = this.state
    let axiosReq = form
    axiosReq.PheDuyet = true
    let axiosRes
    if (isInsert) {
      axiosRes = await tbYKienDongGop.create(axiosReq)
    } else {
      let id = this.props.match.params.id;
      axiosRes = await tbYKienDongGop.updateById(id, axiosReq)
    }
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' }))
      cmFunction.goBack()
    }
  }
  //ACTION

  render() {
    let { form, error, modalIsOpen } = this.state
    if (error)
      return <Page404 />
    try {
      return (
        <React.Fragment>
          <div className="main portlet fade-in">
            <BreadCrumbs title={"Chi tiết"}
              route={[{ label: 'Đóng góp ý kiến', value: '/dong-gop-y-kien' }]}
            />
            <div className="portlet-title">
              <div className="caption">
                <i className="fas fa-grip-vertical" />Chi tiết ý kiến đóng góp
            </div>
              <div className="action">
                <button onClick={this._handleAddToggle} className="btn btn-sm btn-outline-primary border-radius" >
                  <i className="fas fa-save" />Phản hồi
                </button>
                <button onClick={cmFunction.goBack} className="btn btn-sm btn-outline-primary border-radius" >
                  <i className="fas fa-reply" />Quay lại
                </button>
              </div>
            </div>
            <div className="card">
              <div className="card-header d-flex justify-content-between" data-toggle="collapse" data-target="#collapseExample" aria-expanded="true" aria-controls="collapseExample">
                <span className="caption-subject">Thông tin</span>
                <span>
                  <i className="fas fa-chevron-up" />
                  <i className="fas fa-chevron-down" />
                </span>

              </div>
              <div className="collapse show" id="collapseExample">
                <div className="card-body ">
                  <div className="form-body" ref="form">
                    <FormWrapper>
                      <b>Họ Tên:&nbsp;</b>{form.name}
                    </FormWrapper>
                    <FormWrapper>
                      <b>Email:&nbsp;</b>{form.email}
                    </FormWrapper>
                    <FormWrapper>
                      <b>Số điện thoại:&nbsp;</b>{form.SoDienThoai}
                    </FormWrapper>
                    <FormWrapper>
                      <b>Nội dung:&nbsp;</b><p style={{ width: "100%", overflow: "auto" }}>{form.GhiChu}</p>
                    </FormWrapper>
                    <hr />
                    <FormWrapper>
                      <b>Phản hồi:&nbsp;</b><p style={{ width: "100%", overflow: "auto" }}>{form.NoiDungPhanHoi}</p>
                    </FormWrapper>
                  </div>
                </div>
                <div className="card-footer">
                </div>
              </div>
            </div>
          </div>

          <Modal
            isOpen={modalIsOpen}
            onRequestClose={this._handleAddToggle}
          >
            <div className="card">
              <div className="card-header">
                <label className='caption'>Phản hồi hộp thư góp ý</label>
                <button onClick={this._handleAddToggle} className="pull-right btn btn-sm btn-outline-danger border-radius">
                  <i className="far fa-times-circle"></i>
                </button>
              </div>

              <div className="card-body">
                <div className="form-body col">
                  <div className="form-row form-group form-custom">
                    <label className="col-md-3 mb-0 text-left">Nội dung</label>
                  </div>
                  <div className="form-row form-group form-custom">
                    <textarea className="col-md-12 form-control" placeholder="Nhập nội dung phản hồi" onChange={this._handleChangeElement} value={form.NoiDungPhanHoi || ''} id="NoiDungPhanHoi" rows="15" />
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <button onClick={this._handleReply} className="pull-right btn btn-sm btn-outline-primary border-radius">
                  <i className="fas fa-save"></i>Phản hồi
            </button>
                <button onClick={this._handleAddToggle} className="pull-right btn btn-sm btn-outline-danger border-radius">
                  <i className="far fa-times-circle"></i>Đóng
            </button>
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
export default connect(mapStateToProps)(ChiTiet);
