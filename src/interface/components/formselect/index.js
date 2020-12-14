import React, { Component } from "react";
import AsyncSelect from 'react-select/async';
import * as cmFunction from "common/ulti/commonFunction";
import * as CONSTANTS from "../../../common/ulti/constants"

const ERR_REQUIRED = 'Vui lòng điền đầy đủ thông tin'

class FormSelect extends Component {
  constructor(props) {
    super(props)
    this.state = {
      requiredErr: props.required ? { state: true, msg: '' } : { state: false, msg: '' },
      valid: true,
      value: null
    }
  }

  _handleChangeElement = (evt) => {
    this.state.value = evt
    let { onChange, required } = this.props
    if (required && !this.state.value) {
      this.state.requiredErr = { state: true, msg: ERR_REQUIRED }
    } else {
      this.state.requiredErr = { state: false, msg: '' }
    }
    onChange(evt)
    this.forceUpdate()
  }

  render() {
    let { parentClass, labelClass, inputClass, required, _handleLoadOptions,
      label, selected, placeholder, isClearable, isSearchable, defaultOptions, isDisabled } = this.props;
      console.log('selected: ', selected);
    let { value, requiredErr } = this.state;
    return (
      <div className={`${parentClass || "col-md-12"} form-row form-wrap`} >
        <div className={"col-md-12 form-row form-custom form-no-spacing"}>
          <label className={`${labelClass || "col-md-3"} mb-0`} >
            {label}
            {required ? <span className="required">*</span> : null}
          </label>
          <div className={`${inputClass || "col-md-9"} pl-0 pr-0`}>
            <AsyncSelect
              className=""
              classNamePrefix="form-control"
              placeholder={placeholder || ''}
              loadOptions={_handleLoadOptions}
              // onInputChange={this._handleInputChange}
              onChange={this._handleChangeElement}
              value={value || selected || null}
              isClearable={isClearable || true}
              isSearchable={isSearchable || true}
              defaultOptions={defaultOptions || true}
              isDisabled={!!isDisabled}
            />
          </div>
        </div>
        {requiredErr.msg ? <label className={`${labelClass || "col-md-3"} mb-0`}></label> : null}
        {
          requiredErr.msg ?
            <label className={`${inputClass || "col-md-9"} mb-0 form-label-err`}
              name={CONSTANTS.LABEL_VALID_ERROR_NAME}>{requiredErr.msg}
            </label>
            : null
        }
      </div >
    );
  }
}

export default FormSelect;
