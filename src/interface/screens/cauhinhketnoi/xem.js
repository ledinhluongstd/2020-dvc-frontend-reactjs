import React, { Component } from "react";
import { connect } from "react-redux";
import { BreadCrumbs} from 'interface/components';
import { Other } from 'interface/screens/error'
import { __DEV__} from "../../../common/ulti/constants";
import * as cmFunction from 'common/ulti/commonFunction';
import * as tbCauHinhKetNoi from 'controller/services/tbCauHinhKetNoiServices'
import { HOST_API } from "../../../controller/api";

class DanhSach extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isInsert: this.props.match.params.id == 0,
            form: {},
            error: false,
            idCauHinh: '',
            donvi: [],
            nhomdichvu: [],
            date: '',
            dichvucungcap: [],

        }
    }

    componentDidMount = async () => {
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
        this.state.idCauHinh = id
        if (!this.state.isInsert) {
            let data = await tbCauHinhKetNoi.getById(id)
            if (data) {
                this.state.form = data
                console.log('data', data)
                this.state.donvi = data.DonVi;
                this.state.nhomdichvu = data.DichVuUngDung
                if (data.DichVuUngDung) {
                    this.state.dichvucungcap = data.DichVuUngDung.DichVuCungCap
                }
                if (data.modifiedAt) {
                    this.state.date = cmFunction.timestamp2DateString(data.modifiedAt.$numberLong, 'HH:mm:ss DD/MM/YYYY')
                } else {
                    this.state.date = cmFunction.timestamp2DateString(data.createdAt.$numberLong, 'HH:mm:ss DD/MM/YYYY')
                }
            }
            if (!data) this.state.error = true;
            this.forceUpdate();
        }
        this.forceUpdate();
    };

    render() {
        let { form, idCauHinh, donvi, nhomdichvu, date, dichvucungcap } = this.state
        try {
            return (
                <React.Fragment>
                    <div className="main portlet">
                        <BreadCrumbs
                            title={'Chi tiết dịch vụ'}
                            route={[
                                { label: 'Cấu hình kết nối', value: '/quan-tri-ket-noi/cau-hinh-ket-noi' },
                                { label: 'Thông tin cấu hình', value: '/quan-tri-ket-noi/cau-hinh-ket-noi/:id' },
                            ]}
                        />
                        <div className="portlet-title">
                            <div className="caption">
                                <i className="fas fa-grip-vertical" />Chi tiết cấu hình kết nối
                            </div>
                            <div className="action">
                                <button onClick={(e) => {
                                    e.preventDefault();
                                    window.location.href = '#/quan-tri-ket-noi/cau-hinh-ket-noi/' + idCauHinh;
                                }}
                                    className="btn btn-sm btn-outline-primary border-radius">
                                    <i className="fas fa-pencil-alt" />
                                    Sửa
                            </button>
                                <button onClick={this._init} className="btn btn-sm btn-outline-primary border-radius">
                                    <i className="fas fa-sync" />
                                    Làm mới
                            </button>
                                <button onClick={cmFunction.goBack} className="btn btn-sm btn-outline-primary border-radius">
                                    <i className="fas fa-reply" />
                                    Quay lại
                            </button>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-body fix-first">
                                <span >Đơn vị khai thác dịch vụ: &nbsp;<span className='font-weight-bold'>{donvi.Ten || ''}</span></span><br />
                                <span >Nhóm dịch vụ: &nbsp;<span className='font-weight-bold'>{nhomdichvu.Ten || ''}</span></span><br />
                                <span>Consumer key: &nbsp;<span className='text-danger'>{form.Ma || ''}</span></span><br />
                                <span className='text-muted font-italic'>Ngày cập nhật:&nbsp;<span >{date}</span></span>
                            </div>
                        </div>
                    </div>

                    <div className="main portlet">
                        <div className="card">
                            <div
                                className="card-header d-flex justify-content-between"
                                data-toggle="collapse"
                                data-target="#collapseDichVu"
                                aria-expanded="true"
                                aria-controls="collapseDichVu"
                            >
                                <span className="caption-subject">Dịch vụ cung cấp</span>
                                <span>
                                    <i className="fas fa-chevron-up" />
                                    <i className="fas fa-chevron-down" />
                                </span>
                            </div>
                            <div className="collapse show" id="collapseDichVu">
                                <div className="card-body">
                                    <div className="form-body" ref="form">
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
                                                        <th>Tên dịch vụ cung cấp</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dichvucungcap.map((item, index) => {
                                                        return <tr key={index} >
                                                            <td>{index + 1}</td>
                                                            <td className="text-left">
                                                                <span>{item.Ten}</span><br />
                                                                <span className="text-info">{HOST_API + item.Url.Ma}</span></td>
                                                        </tr>
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
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
export default connect(mapStateToProps)(DanhSach);
