import React, { Component } from "react";
import { connect } from "react-redux";
import { Page404, Other } from 'interface/screens/error'
import { BreadCrumbs, FormInput, FormWrapper } from "interface/components";
import { __DEV__ } from "../../../common/ulti/constants";
import * as CONSTANTS from 'common/ulti/constants';
import { confirmAlert } from 'react-confirm-alert';
import AsyncSelect from 'react-select/async';
import * as cmFunction from 'common/ulti/commonFunction'
import * as tbYKienDongGop from 'controller/services/tbYKienDongGopServices'
import Modal from 'react-modal';
import { fetchToastNotify } from "../../../controller/redux/app-reducer";
import { isEmpty } from "../../../common/ulti/commonFunction";

class ChiTiet extends Component {
  constructor(props) {
    super(props)
    this.state = {
      error: false,
      form: {},
      donvi: [],
      isInsert: true,
      donviSelected: null,
      random: 0,
      modalIsOpen: false
    }
  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps) {
  }


  _handleChangeElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.value
    this.forceUpdate()
  }

  //ACTION
  _handleConfirm = (_type = 0, _action, _stay = false) => {
    confirmAlert({
      title: 'Gửi đánh giá',
      message: 'Xác nhận gửi đánh giá',
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

  _handleSave = (stay) => {
    if (this._formValidate()) {
      this.getNumber()
      this._handleAddToggle()
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
    }
  }

  _handleSend = () => {
    let { form, random } = this.state
    if (Number(form.randomInput) === Number(random)) {
      this._handleAddToggle()
      setTimeout(() => {
        this._handleConfirm(this.state.isInsert, this._handleUpdateInfo, false)
      }, 100)
    } else {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Mã xác thực không chính xác' }))
      this.state.form.randomInput = ''
      this._handleAddToggle()
    }
  }

  _formValidate = () => {
    let { form } = this.state
    if (isEmpty(form.name) || isEmpty(form.SoDienThoai) || isEmpty(form.email) || isEmpty(form.GhiChu))
      return false
    return true
  }

  _handleUpdateInfo = async (stay) => {
    let { form, isInsert } = this.state
    let axiosRes, axiosReq = cmFunction.clone(form)
    axiosRes = await tbYKienDongGop.create(axiosReq)

    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Hệ thống đã tiếp nhận ý kiến đóng góp của bạn' }))
      if (isInsert) {
        this.state.form = {}
        this.forceUpdate()
      }
      cmFunction.goBack()
    }
  }

  getNumber = () => {
    const min = 100000;
    const max = 999999;
    const rand = min + Math.random() * (max - min);
    this.state.random = parseInt(rand)
    this.forceUpdate()
  }

  renderNumber = () => {
    let { random, modalIsOpen } = this.state
    if (!modalIsOpen) return
    return random
  }

  _handleAddToggle = () => {
    this.state.modalIsOpen = !this.state.modalIsOpen
    this.forceUpdate()
  }

  render() {
    let { form, error, random, modalIsOpen } = this.state
    if (error)
      return <Page404 />
    try {
      return (
        <React.Fragment>
          <div className="form-dong-gop-y-kien">
            <div className="container-contact100">
              <div className="wrap-contact100" >
                <form className="contact100-form validate-form">
                  <span className="contact100-form-title">
                    ĐÓNG GÓP Ý KIẾN
			          </span>
                  <div className="wrap-input100 rs1-wrap-input100 validate-input">
                    <span className="label-input100">Họ Tên<span className="required">(*)</span></span>
                    <input
                      className="input100" type="text" placeholder="Nhập họ tên" id="name" onChange={this._handleChangeElement} />
                    <span className="focus-input100"></span>
                  </div>
                  <div className="wrap-input100 rs1-wrap-input100 validate-input" >
                    <span className="label-input100">Số Điện Thoại<span className="required">(*)</span></span>
                    <input
                      className="input100" type="text" placeholder="Nhập số điện thoại" id="SoDienThoai" onChange={this._handleChangeElement} />
                    <span className="focus-input100"></span>
                  </div>
                  <div className="wrap-input100 rs1-wrap-input validate-input">
                    <span className="label-input100">Email<span className="required">(*)</span></span>
                    <input
                      className="input100" type="text" placeholder="Nhập email" id="email" onChange={this._handleChangeElement} />
                    <span className="focus-input100"></span>
                  </div>
                  <div className="wrap-input100 validate-input">
                    <span className="label-input100">Ý Kiến Đóng Góp<span className="required">(*)</span></span>
                    <textarea className="input100" placeholder="Đóng góp ý kiến của bạn ở đây..." id="GhiChu" onChange={this._handleChangeElement} />
                    <span className="focus-input100"></span>
                  </div>
                  <div className="container-contact100-form-btn">
                    <div className="contact100-form-btn" onClick={() => this._handleSave(false)}>
                      <span>
                        Gửi ý kiến
                    </span>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <Modal
            isOpen={modalIsOpen}
            onRequestClose={this._handleAddToggle}
            // className="ModalAuthNumber"
          >
            <div className="card">
              <div className="card-header">
                <label className='caption'>Vui lòng nhập mã xác thực</label>
                <button onClick={this._handleAddToggle} className="pull-right btn btn-sm btn-outline-danger border-radius">
                  <i className="far fa-times-circle"></i>
                </button>
              </div>

              <div className="card-body">
                <div className="form-body col">
                  <div className="form-row form-group form-custom">
                    <label className="col-md-12 mb-0 text-center">
                      <strong style={{ fontSize: 20, userSelect: 'none' }} >{this.renderNumber()}</strong>
                    </label>
                  </div>
                  <div className="form-row form-group form-custom">
                    <input className="col-md-12 form-control" onChange={this._handleChangeElement} value={form.randomInput || ''} type="text" id="randomInput" placeholder="Nhập mã xác thực" />
                  </div>
                </div>
              </div>
              <div className="card-footer">
                <button onClick={() => this._handleSend()} className="pull-right btn btn-sm btn-outline-primary border-radius">
                  <i className="fas fa-save"></i>Gửi ý kiến
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
