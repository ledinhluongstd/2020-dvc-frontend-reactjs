import React, { Component } from "react";
import AsyncSelect from 'react-select/async';
import Select, { components } from 'react-select';
import { GmapAddress } from "../../components";
import * as cmFunction from "common/ulti/commonFunction";
import * as CONSTANTS from "../../../common/ulti/constants"
import Dropzone from 'react-dropzone';

class FileUpload extends Component {
  constructor(props) {
    super(props)
    this.state = {
      requiredErr: props.required ? { state: true, msg: '' } : { state: false, msg: '' },
      valid: true
    }
  }

  _collapseFileName = (originName) => {
    if (!originName) return '';
    let { startWith, endWith } = this.props;
    if (startWith == 0 || endWith == 0) return originName;
    startWith = startWith ? startWith : 7;
    endWith = endWith ? endWith : 3;
    let anc = originName.lastIndexOf('.');
    if (anc <= 0) return originName;
    let fn = originName.slice(0, anc);
    let ext = originName.slice(anc + 1);
    if (fn.length > (startWith + endWith)) {
      let endTrunc = fn.slice(fn.length - endWith);
      let startTrunc = fn.slice(0, startWith);
      fn = `${startTrunc}...${endTrunc}`;
    }
    return `${fn}.${ext}`;
  }

  _bindIcon = () => {
    if (!this.props.files || !this.props.files.length) return;
    let icons = CONSTANTS.ICONSET_FOR_FILE;
    this.props.files.map(item => {
      let ic = icons.find(ele => ele.type.includes(item.type));
      if (ic) item["icon"] = ic;
      else item["icon"] = CONSTANTS.DEFAULT_IC_FOR_FILE;
    });
  }

  _checkRequired = () => {
    let { required, files } = this.props;
    let { requiredErr } = this.state;
    if (required && files && !files.length && requiredErr && !requiredErr.state) {
      this.state.requiredErr = { state: true, msg: '' }
    }
  }

  _onDrop = (newFiles) => {
    let { onDrop, files } = this.props
    let tmpFiles = [];
    newFiles.map(item => {
      let dupl = files.findIndex(file => (file.name == item.name || file.originalname == item.name) && file.size == item.size);
      if (dupl >= 0) return;
      tmpFiles.push(item);
    });
    onDrop(tmpFiles);
  }

  _renderSelectedList = (inputClass) => {
    this._bindIcon();
    return (
      <div className={`${inputClass} form-wrap`}>
        {
          this.props.files.map((file, index) => {
            return (
              <div key={index} className="form-row row-base-line">
                <div className={file.icon.class}>
                  <i className={`fa ${file.icon.name}`}></i>
                </div>
                <label className="align-text-bottom form-no-spacing" title={file.name}>
                  {this._collapseFileName(file.name || file.originalname)}
                </label>
                <button type="button" className="btn btn-sm ic-red form-no-spacing" onClick={() => this.props.onRemove(file)}>
                  <i className="fa fa-times"></i>
                </button>
              </div>
            )
          })
        }
      </div>
    )
  }

  render() {
    this._checkRequired();
    let { parentClass, labelClass, inputClass, readOnly, required, label, files, onDrop, onRemove } = this.props;
    let { requiredErr } = this.state;
    parentClass = `${parentClass || "col-md-12"} form-row form-wrap`;
    let wrapperClass = "col-md-12 form-row form-custom form-no-spacing";
    labelClass = `${labelClass || "col-md-3"} mb-0`;
    inputClass = `${inputClass || "col-md-9"} input-file form-no-spacing mb-0`;
    let selected = files && files.length;
    let selectedCount = selected ? files.length : 0;
    let placeholder = `${selected
      ? ("Đã chọn " + selectedCount + " files")
      : "Bấm để chọn file hoặc kéo thả file vào đây..."}`;
    return (
      <div className={parentClass} >
        <div className={wrapperClass}>
          <label className={labelClass}>
            {label}
            {required ? <span className="required">*</span> : null}
          </label>
          {this.props.multiple || !selected
            ? <div className={inputClass}>
              <Dropzone
                className="dropzone-files"
                disableClick={this.props.disableClick}
                disabled={this.props.disabled}
                multiple={this.props.multiple}
                accept={this.props.accept || ".doc,.docx"}
                onDrop={readOnly ? null : this._onDrop}
              >
                <label className={`${inputClass} .form-wrap`}>
                  {placeholder}
                </label>
              </Dropzone>
            </div>
            : this._renderSelectedList(inputClass)
          }
        </div>
        {
          selected
            ? (this.props.multiple
              ? <div className={wrapperClass}>
                <label className={labelClass}></label>
                {this._renderSelectedList(inputClass)}
              </div>
              : null
            )
            : (requiredErr.msg) ?
              <div className={wrapperClass}>
                <label className={labelClass}></label>
                <label className={`${inputClass} form-label-err`}
                  name={CONSTANTS.LABEL_VALID_ERROR_NAME}>{requiredErr.msg}
                </label>
              </div>
              : (
                (requiredErr.state)
                  ? <input type="hidden" name={CONSTANTS.LABEL_VALID_ERROR_NAME} />
                  : null
              )
        }
      </div>
    );
  }
}

export default FileUpload;
