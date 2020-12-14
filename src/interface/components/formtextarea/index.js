import React, { Component } from "react";
import * as cmFunction from "common/ulti/commonFunction";
import * as CONSTANTS from "../../../common/ulti/constants"

const ERR_REQUIRED = 'Vui lòng điền đầy đủ thông tin'

class FormTextarea extends Component {
  constructor(props) {
    super(props)
    this.state = {
      requiredErr: props.required ? { state: true, msg: '' } : { state: false, msg: '' },
      valid: true,
      val: ''
    }
  }

  _handleChangeElement = (evt) => {
    this.state.val = evt.target.value
    let { pattern, onChange, required } = this.props
    if (required && !this.state.val) {
      this.state.requiredErr = { state: true, msg: ERR_REQUIRED }
    } else {
      if (pattern) {
        let valid = this.state.val == '' || cmFunction.validateInput(this.state.val, pattern)
        this.state.valid = valid
      }
      this.state.requiredErr = { state: false, msg: '' }
    }
    onChange(evt)
    this.forceUpdate()
  }

  render() {
    let { parentClass, labelClass, inputClass, required, rows, id,
      label, preVal, errorLabel } = this.props;
    let { valid, val, requiredErr } = this.state;
    return (
      <div className={`${parentClass || "col-md-12"} form-row form-wrap`} >
        <div className={"col-md-12 form-row form-custom form-no-spacing"}>
          <label className={`${labelClass || "col-md-3"} mb-0`} >
            {label}
            {required ? <span className="required">*</span> : null}
          </label>
          <textarea className={`${inputClass || "col-md-9"} form-control`}
            onChange={this._handleChangeElement}
            value={val || preVal || ''}
            id={id}
            rows={rows} />
        </div>
        {!valid || requiredErr.msg ? <label className={`${labelClass || "col-md-3"} mb-0`}></label> : null}
        {!valid || requiredErr.msg ?
          <label className={`${inputClass || "col-md-9"} mb-0 form-label-err`}
            name={CONSTANTS.LABEL_VALID_ERROR_NAME}>{requiredErr.state ? requiredErr.msg : errorLabel}
          </label>
          : null}
      </div>
    );
  }
}

export default FormTextarea;
