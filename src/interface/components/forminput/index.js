import React, { Component } from "react";
import AsyncSelect from 'react-select/async';
import Select, { components } from 'react-select';
import { GmapAddress } from "../../components";
import * as cmFunction from "common/ulti/commonFunction";
import * as CONSTANTS from "../../../common/ulti/constants"

const ERR_REQUIRED = 'Vui lòng điền đầy đủ thông tin'
const { Option } = components;
const IconOption = (props) => (
  <Option {...props}>
    <div className="input-select__option">
      <i className={`fas ${props.data.icon}`}></i>
      <span style={{ margin: 4 }}>{props.data.value}</span>
    </div>
  </Option>
);
const _SingleValue = (props) => (
  <components.SingleValue {...props}>
    {props.data && props.data.icon && props.data.value
      ? <div key={props.data.icon} className="input-select__single_select">
        <i className={`fas ${props.data.icon}`}></i>
        <span style={{ margin: 4 }}>{props.data.value}</span>
      </div>
      : null
    }
  </components.SingleValue>
);

class FormInput extends Component {
  constructor(props) {
    super(props)
    this.state = {
      requiredErr: props.required ? { state: true, msg: '' } : { state: false, msg: '' },
      valid: true
    }
  }

  _checkRequired = () => {
    let { required, defaultValue } = this.props;
    let { requiredErr } = this.state;
    if (required && !defaultValue && requiredErr && !requiredErr.state) {
      this.state.requiredErr = { state: true, msg: '' }
    }
  }

  _handleChangeElement = (evt) => {
    let { pattern, onChange, required, type } = this.props
    let val = type == 'select' ? evt : (type == 'checkbox' ? evt.target.checked : evt.target.value);
    if (required && !val) {
      this.state.requiredErr = { state: true, msg: ERR_REQUIRED }
    } else {
      if (pattern) {
        let valid = cmFunction.validateInput(val, pattern)
        this.state.valid = valid
      }
      this.state.requiredErr = { state: false, msg: '' }
    }
    onChange(evt)
    this.forceUpdate()
  }

  _handleOnBlur = async (evt) => {
    let { _handleCheck } = this.props;
    if (!_handleCheck) return;
    let checked = await _handleCheck();
    if (checked) {
      this.state.requiredErr = { state: true, msg: 'Dữ liệu trùng' }
    } else {
      this.state.requiredErr = { state: false, msg: '' }
      this._checkRequired()
    }
    this.forceUpdate()
  }

  _renderTextarea = (inputClass, value) => {
    return <textarea
      className={inputClass}
      value={value} id={this.props.id} rows={this.props.rows}
      onChange={this._handleChangeElement}
    />
  }

  _renderCheckbox = (inputClass, value) => {
    return <input
      className={inputClass}
      type="checkbox"
      id={this.props.id}
      checked={value}
      onChange={this._handleChangeElement}
    />
  }

  _renderInput = (inputClass, value) => {
    return <input
      autoComplete="new-password"
      className={inputClass}
      type={this.props.type || "text"}
      id={this.props.id}
      disabled={this.props.disabled}
      readOnly={this.props.readOnly}
      placeholder={this.props.placeholder || ""}
      value={value}
      onChange={this._handleChangeElement}
      onBlur={this._handleOnBlur}
    />
  }

  _renderGmapAddress = (value) => {
    return <GmapAddress
      className='form-control'
      value={value} id={this.props.id} placeholder={this.props.placeholder || ""}
      onChange={this._handleChangeElement}
    />
  }

  _renderIconSelect = (inputClass, value) => {
    return <div className={inputClass}>
      <Select
        cacheOptions={true}
        isClearable={this.props.isClearable || true}
        isSearchable={this.props.isSearchable || true}
        placeholder={this.props.placeholder || ''}
        isDisabled={!!this.props.isDisabled}
        defaultValue={value}
        value={value}
        options={this.props.options}
        components={{ Option: IconOption, SingleValue: _SingleValue }}
        styles={{
          singleValue: base => ({
            ...base,
            padding: 4,
            borderRadius: 4,
            background: 'white',
            color: 'black',
            display: 'flex',
          }),
        }}
        onChange={this._handleChangeElement}
        onBlur={this._handleOnBlur}
      />
    </div>
  }

  _renderAsyncSelect = (inputClass, value) => {
    return <div className={inputClass}>
      <AsyncSelect
        className=""
        classNamePrefix="form-control"
        isMulti={this.props.isMulti}
        isClearable={this.props.isClearable}
        isSearchable={this.props.isSearchable}
        defaultOptions={this.props.defaultOptions}
        placeholder={this.props.placeholder || ""}
        value={value || null}
        loadOptions={this.props.loadOptions}
        onChange={this._handleChangeElement}
        onBlur={this._handleOnBlur}
        isDisabled={!!this.props.isDisabled}
      />
    </div>
  }

  render() {
    this._checkRequired();
    let { parentClass, labelClass, inputClass, required, type,
      label, defaultValue, placeholder, errorLabel } = this.props;
    let { valid, requiredErr } = this.state;
    parentClass = `${parentClass || "col-md-12"} form-row form-wrap`;
    let wrapperClass = "col-md-12 form-row form-custom form-no-spacing";
    labelClass = `${labelClass || "col-md-3"} mb-0`;
    inputClass = `${inputClass || (type == "checkbox" ? "" : "col-md-9")} ${type == "select" ? " pl-0 pr-0" : " form-control"}`;
    placeholder = placeholder || "";
    let value = defaultValue || '';
    return (
      <div className={parentClass} >
        <div className={wrapperClass}>
          <label className={labelClass} >
            {label}
            {required ? <span className="required">*</span> : null}
          </label>
          {
            type == "textarea"
              ? this._renderTextarea(inputClass, value)
              : (
                type == "gmapaddress"
                  ? this._renderGmapAddress(value)
                  : (
                    type == "select"
                      ? (this.props.icon
                        ? this._renderIconSelect(inputClass, value)
                        : this._renderAsyncSelect(inputClass, value)
                      )
                      : (
                        type == "checkbox"
                          ? this._renderCheckbox(inputClass, value)
                          : (
                            this._renderInput(inputClass, value)
                          )
                      )
                  )
              )
          }
        </div>
        {!valid || requiredErr.msg || (requiredErr.state && !value)
          ? <label className={labelClass}></label>
          : null}
        {!valid || requiredErr.msg
          ?
          <label className={`${inputClass} form-label-err`}
            name={CONSTANTS.LABEL_VALID_ERROR_NAME}>{requiredErr.msg ? requiredErr.msg : errorLabel}
          </label>
          : (
            (requiredErr.state && !value)
              ? <input type="hidden" name={CONSTANTS.LABEL_VALID_ERROR_NAME} />
              : null
          )}
      </div>
    );
  }
}

export default FormInput;
