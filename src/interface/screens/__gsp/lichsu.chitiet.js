import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Page404, Other } from 'interface/screens/error';
import { BreadCrumbs, FormInput, FormWrapper } from 'interface/components';
import { __DEV__ } from '../../../common/ulti/constants';
import * as CONSTANTS from 'common/ulti/constants';
import { confirmAlert } from 'react-confirm-alert';
import axios from 'axios';
import moment from 'moment';
import * as cmFunction from 'common/ulti/commonFunction';
import * as tbLogApi from 'controller/services/tbLogApiServices'
import { fetchToastNotify } from '../../../controller/redux/app-reducer';

class ChiTiet extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isInsert: false,
      error: false,
      form: {},
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
      let data = await tbLogApi.getById(id);
      if (data) {
        this.state.form = data.request.body;
      }
      if (!data) this.state.error = true;
      this.forceUpdate();
    }
  };

  _handleChangeElement = (evt) => {
    return
    this.state.form[evt.target.id] = evt.target.value;
    this.forceUpdate();
  };


  render() {
    let { isInsert, form, error } = this.state;
    if (error) return <Page404 />;
    let keyNonDisplay = ['_id', 'BanGhi', '_etag', 'code', 'createdAt', 'createdBy', 'isActive', 'modifiedAt', 'modifiedBy']
    try {
      return (
        <div className="main portlet">
          <BreadCrumbs
            title={'Chi tiết'}
            route={[
              { label: 'Lịch sử import danh mục Quốc gia', value: '/quoc-gia/lich-su' },
              { label: 'Thông tin chi tiết danh mục Quốc gia', value: '/quoc-gia/lich-su/:id' },
            ]}
          />
          <div className="portlet-title">
            <div className="caption">
              <i className="fas fa-grip-vertical" />
              Thông tin chi tiết lịch sử import danh mục quốc gia
            </div>
            <div className="action">
              <button
                onClick={cmFunction.goBack}
                className="btn btn-sm btn-outline-primary border-radius"
              >
                <i className="fas fa-reply" />
                Quay lại
              </button>
              <button
                onClick={this._init}
                className="btn btn-sm btn-outline-primary border-radius"
              >
                <i className="fas fa-sync" />
                Làm mới
              </button>
            </div>
          </div>
          <div className="card">
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
                  {Object.keys(form).map(function (key, index) {
                    let checkKey = keyNonDisplay.findIndex(x => x === key)
                    if (checkKey === -1 && !!form[`${key}`]) {
                      return <React.Fragment key={index}> <FormWrapper>
                        <FormInput
                          required={false}
                          disabled={true}
                          readOnly={true}
                          onChange={null}
                          defaultValue={form[`${key}`] || ''}
                          type="text"
                          id={key}
                          label={key + ': '}
                          placeholder={key}
                        />
                      </FormWrapper>
                      </React.Fragment>
                    }
                  })}
                </div>
              </div>
              <div className="card-footer"></div>
            </div>
          </div>

          {!!form.BanGhi && <div className="card">
            <div
              className="card-header d-flex justify-content-between"
              data-toggle="collapse"
              data-target="#collapseBanGhi"
              aria-expanded="true"
              aria-controls="collapseBanGhi"
            >
              <span className="caption-subject">Bản ghi&nbsp;{form.BanGhi.length}</span>
              <span>
                <i className="fas fa-chevron-up" />
                <i className="fas fa-chevron-down" />
              </span>
            </div>
            <div className="collapse show" id="collapseBanGhi">
              <div className="card-body ">
                <div className="form-body">
                  <div className="col table-fix-head-custom">
                    <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                      <thead>
                        <tr>
                          <th>STT</th>
                          {
                            form.BanGhi[0] && Object.keys(form.BanGhi[0]).map(function (key, index) {
                              return (<th key={index}>{key}</th>)
                            })
                          }
                        </tr>
                      </thead>
                      <tbody>
                        {!!form.BanGhi && form.BanGhi.map((item, index) => {
                          return <tr key={index} >
                            <td className='text-center'>{index + 1}</td>
                            {
                              item && Object.keys(item).map(function (key, ind) {
                                return (<td key={ind}>{item[`${key}`]}</td>)
                              })
                            }
                          </tr>
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>}
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
