import React, { Component } from "react";
import { connect } from "react-redux";
import * as cmFunction from '../../../../common/ulti/commonFunction'
import { __DEV__ } from "../../../../common/ulti/constants";
import * as publicServices from '../../../../controller/services/publicServices'


class Chitiet extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isInsert: this.props.match.params.id == 0,
            danhmuc: [],
            donvi: '',
            nhomdanhmuc: '',
            vanbansuadoi: []
        }
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
        this.state.isInsert = this.props.match.params.id == 0
        let id = this.props.match.params.id
        if (!this.state.isInsert) {
            let data = await publicServices.getDanhMucById(id)
            this.state.danhmuc = data
            this.state.donvi = data.DonViCha.Ten
            this.state.nhomdanhmuc = data.NhomDanhMuc.Ten
            if (data.VBBanHanhSuaDoi === [] || data.VBBanHanhSuaDoi === undefined) {
                this.state.vanbansuadoi = []
            } else {
                this.state.vanbansuadoi = data.VBBanHanhSuaDoi
            }
            this.forceUpdate()
        }
    }

    render() {
        let { danhmuc, donvi, nhomdanhmuc, vanbansuadoi } = this.state
        return (
            <div className="main portlet">
                <div className=" col-lg-12">
                    <div className="portlet-title">
                        <div className="caption">
                            <i className="fas fa-grip-vertical" />
                                    Thông tin dữ liệu danh mục
                                </div>
                    </div>
                </div>
                <div className=" col-lg-12">
                    <div className="card">
                        <div className="shadow p-3 mb-5 bg-white rounded">
                            <div
                                className="card-header d-flex justify-content-between"
                                data-toggle="collapse"
                                data-target="#collapseExample"
                                aria-expanded="true"
                                aria-controls="collapseExample"
                            >
                                <span className="caption-subject">
                                    Thông tin danh mục: {danhmuc.Ten}
                                </span>
                                <span>
                                    <i className="fas fa-chevron-up" />
                                    <i className="fas fa-chevron-down" />
                                </span>
                            </div>
                            <div className="collapse show" id="collapseExample">
                                <div className="card-body">
                                    <div className="form-body" ref="form">
                                        <table className="table table-hover table-bordered">
                                            <tbody>
                                                <tr >
                                                    <td> Tên danh mục</td>
                                                    <td >{danhmuc.Ten}</td>
                                                </tr>
                                                <tr>
                                                    <td>Mã danh mục</td>
                                                    <td>{danhmuc.Ma}</td>
                                                </tr>
                                                <tr>
                                                    <td>Nhóm danh mục</td>
                                                    <td>{nhomdanhmuc}</td>
                                                </tr>
                                                <tr>
                                                    <td>Đơn vị quản lý</td>
                                                    <td>{donvi}</td>
                                                </tr>
                                                <tr>
                                                    <td>Cơ quan ban hành</td>
                                                    <td>{danhmuc.CoQuanBanHanhVB || ''}</td>
                                                </tr>
                                                <tr>
                                                    <td>Ngày ban hành</td>
                                                    <td>{danhmuc.NgayBanHanh || ''}</td>
                                                </tr>
                                                <tr>
                                                    <td>Văn bản ban hành/sửa đổi</td>
                                                    <td>{vanbansuadoi.Ten || ''}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="card-footer"></div>
                                </div>
                            </div>
                            <div className="text-center">
                                <button
                                    onClick={() => cmFunction.goBack()}
                                    className="btn btn-outline-primary border-radius"
                                >
                                    <i className="fas fa-reply" />Quay lại
                                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    let { General } = state;
    return { General };
};
export default connect(mapStateToProps)(Chitiet);