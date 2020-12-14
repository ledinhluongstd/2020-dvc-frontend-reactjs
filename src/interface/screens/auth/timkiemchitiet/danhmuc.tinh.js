import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { fetchLoginRequest } from "../../../../controller/redux/login-fetch-reducers";
import Footer from "../../../navigation/layouts/Admin/Footer/index.jsx";
import * as cmFunction from "../../../../common/ulti/commonFunction";
import { __DEV__ } from "../../../../common/ulti/constants";
import * as publicServices from "../../../../controller/services/publicServices";
import * as CONSTANTS from "../../../../common/ulti/constants";
import queryString from "query-string";
import { Pagination } from "../../../components/index";
import { query } from "chartist";
import Select from "react-select";
import { InputSearch } from "../../../../interface/components";
import { FormInput, FormWrapper, BreadCrumbs } from "../../../../interface/components";
import ReactToPrint from "react-to-print";
import ReactDOM from "react-dom";
import XLSX from "xlsx";
import moment from "moment";
import Modal from "react-modal";
import { GSP_DMDC } from "../../../../../config";
import { Other } from '../../../../interface/screens/error'

class ComponentToPrint extends React.Component {
    render() {
        let { danhsach } = this.props;
        return (
            <div className="card-body fix-first">
                <h2 className="modal-title text-center"></h2>
                <br />
                <table className="table table-bordered" width="100%">
                    <thead>
                        <tr>
                            <th>STT</th>
                            {
                                danhsach[0] && Object.keys(danhsach[0]).map(function (key, index) {
                                    return (<th key={index}>{key}</th>)
                                })
                            }
                        </tr>
                    </thead>
                    <tbody>
                        {danhsach && danhsach.map((item, index) => {
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
        );
    }
}
class DanhMucQuocGia extends Component {
    constructor(props) {
        super(props)
        this.state = {
            danhsach: [],
            form: {},
            tendanhmuc: '',
            cbCheckAll: false,
            searchIsOpen: false,
            search: {},
            page: CONSTANTS.DEFAULT_PAGE,
            pagesize: CONSTANTS.DEFAULT_PAGESIZE,
            _size: 0,
            _total_pages: 0,
            filter: null,
            detail: null,
            modalIsOpen: false
        }
    }

    componentDidMount = async () => {
        this._getDanhSachDanhMuc(this._createNhomDanhMuc())
    }

    componentDidUpdate(prevProps) {
        let { location } = this.props
        if (location !== prevProps.location) {
            this._getDanhSachDanhMuc(this._createNhomDanhMuc())
        }
    }

    _createNhomDanhMuc = () => {
        let parsed = queryString.parse(this.props.location.search);
        let { danhmuc } = parsed
        return cmFunction.decode(danhmuc)
    }

    _createFilter = () => {
        let parsed = queryString.parse(this.props.location.search);
        let { page, pagesize, filter } = parsed
        filter = filter ? cmFunction.decode(filter) : filter
        parsed.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
        parsed.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
        parsed.count = true
        // parsed.sort_by = "STT"
        !filter ? delete parsed.filter : parsed.filter = filter
        this.state.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
        this.state.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
        this.state.filter = filter
        this.forceUpdate()
        return new URLSearchParams(parsed).toString()
    }

    _getDanhSachDanhMuc = async (url) => {
        let data = await publicServices.getDanhMucQuocGia('GET', url)
        this.state.danhsach = data //&& data._embedded ? data._embedded : [];
        this.state._size = data._size || 0
        this.state._total_pages = data._total_pages || 0
        this.state.cbCheckAll = false
        this.forceUpdate()
    }

    // EXPORT EXCEL
    _handleExportExcel = (ref) => {
        // ví dụ xuất excel tại bảng đang có
        let myRows = [['Thông tin danh mục quốc gia']], maxCol = 0
        let table = ReactDOM.findDOMNode(this.refs[`${ref}`]);
        for (let tbindex = 0; tbindex < table.children.length; tbindex++) {
            let tb = table.children[`${tbindex}`]
            for (let trindex = 0; trindex < tb.children.length; trindex++) {
                let row = []
                let tr = tb.children[`${trindex}`]
                maxCol = tr.children.length > maxCol ? tr.children.length : maxCol
                for (let thindex = 0; thindex < tr.children.length; thindex++) {
                    let th = tr.children[`${thindex}`]
                    row.push(th.innerText)
                }
                myRows.push(row)
            }
        }
        // set colspan và rowspan
        let merge = [
            // { s: { r: 0, c: 0 }, e: { r: 0, c: maxCol } },
            // { s: { r: 1, c: 6 }, e: { r: 1, c: 7 } }
        ]
        // xuất file
        let ws = XLSX.utils.aoa_to_sheet(myRows);
        ws["!merges"] = merge;
        let wb = XLSX.utils.book_new();
        //add thêm nhiều Sheet vào đây cũng đc
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        let date = cmFunction.timestamp2DateString(moment().valueOf())
        let name = 'TTdanhmuc_' + this.state.page + '_' + date + '.xlsx'
        XLSX.writeFile(wb, name)
    }

    _handleChangeSearchElement = (evt) => {
        this.state.search[evt.target.id] = evt.target.value
        this.forceUpdate()
    }

    _createFilterSearch = () => {
        let { search } = this.state
        let parsed = queryString.parse(this.props.location.search);
        let { page, pagesize } = parsed
        let filter = {}
        parsed.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
        parsed.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
        parsed.count = true
        // parsed.sort_by = "STT"
        if (search.Ten) {
            // filter['Ten'] = cmFunction.regexText(search.Ten.trim())
            filter['$or'] = [
                { 'Ten': cmFunction.regexText(search.Ten.trim()) },
                { 'Ma': cmFunction.regexText(search.Ten.trim()) }
            ]
            parsed.filter = JSON.stringify(filter)
        }
        this.state.page = parseInt(page) || CONSTANTS.DEFAULT_PAGE
        this.state.pagesize = parseInt(pagesize) || CONSTANTS.DEFAULT_PAGESIZE
        this.forceUpdate()
        return new URLSearchParams(parsed).toString()
    }

    _handleKeyDow = (evt) => {
        if (evt.key === 'Enter') {
            this._handleSearch();
            this.forceUpdate()
        }
    }

    _handleSearch = () => {
        this._getDanhSachDanhMuc(this._createNhomDanhMuc())
    }

    _checkItem = (item) => {
        if (item.DonViCha) { return item.DonViCha.Ten }
        if (item.KhoiDonVi) { return item.KhoiDonVi.Ten } else { return " " }
    }

    _setDetail = (data) => {
        this.state.detail = data
        this.forceUpdate()
        this._handleAddToggle()
    }

    _handleAddToggle = () => {
        this.state.modalIsOpen = !this.state.modalIsOpen
        this.forceUpdate()
    }


    render() {
        let { danhsach, cbCheckAll, modalIsOpen, detail } = this.state
        let { page, pagesize, _size, _total_pages, search } = this.state
        let parsed = queryString.parse(this.props.location.search);
        let { danhmuc, ten } = parsed
        let tenDanhMuc = cmFunction.decode(ten)
        try {
            return (
                <React.Fragment>
                    <div className="main portlet">
                        {/* <BreadCrumbs title={"Danh sách danh mục quốc gia"}
                            route={[
                                { label: 'Nhóm danh mục quốc gia', value: '/search' },
                                { label: tenDanhMuc, value: '' },
                            ]} /> */}
                        <div className="portlet-title">
                            <div className="caption">
                                <i className="fas fa-grip-vertical" />{tenDanhMuc}
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-header d-flex justify-content-between">
                                <strong>{`Tổng số: ${danhsach.length} bản ghi`}</strong>
                                <div>
                                    <button
                                        onClick={() => this._handleExportExcel("dataTable")}
                                        className="btn btn-sm btn-outline-info border-radius"
                                        title="Xuất excel"
                                    >
                                        <i className="fas fa-download" /> Xuất excel
                                            </button>
                                    <button
                                        className="btn btn-sm btn-outline-info border-radius"
                                        data-toggle="modal"
                                        data-target="#openModal"
                                        title="In danh sách"
                                    >
                                        <i className="fas fa-print" />
                                            In danh sách
                                            </button>
                                </div>
                            </div>
                            <div
                                className="modal fade"
                                id="openModal"
                                tabIndex="-1"
                                role="dialog"
                                aria-hidden="true"
                            >
                                <div className="modal-dialog modal-lg">
                                    <div className="modal-content">
                                        <ComponentToPrint
                                            danhsach={this.state.danhsach}
                                            ref={(el) => (this.componentRef = el)}
                                        />
                                        <div className="modal-footer">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-info border-radius"
                                                data-dismiss="modal"
                                            >
                                                Close
                                                        </button>
                                            <ReactToPrint
                                                trigger={() => (
                                                    <button
                                                        className="btn btn-sm btn-outline-info border-radius"
                                                        data-dismiss="modal"
                                                    >
                                                        <i className="fas fa-print" />
                                                                In danh sách
                                                    </button>
                                                )}
                                                content={() => this.componentRef}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body fix-first">
                                <div className="table-fix-head">
                                    <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                                        <thead>
                                            <tr>
                                                <th>STT</th>
                                                {
                                                    danhsach[0] && Object.keys(danhsach[0]).map(function (key, index) {
                                                        return (<th key={index}>{key}</th>)
                                                    })
                                                }
                                                <th>Hành động</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {danhsach && danhsach.map((item, index) => {
                                                return <tr key={index} >
                                                    <td className='text-center'>{index + 1}</td>
                                                    {
                                                        item && Object.keys(item).map(function (key, ind) {
                                                            return (<td key={ind}>{item[`${key}`]}</td>)
                                                        })
                                                    }
                                                    <td>
                                                        <button onClick={() => this._setDetail(item)} className="btn btn-outline-primary border-radius ">
                                                            <i className="fas fa-eye" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            {/* <div className="text-center">
                                <button
                                    onClick={() => cmFunction.goBack()}
                                    className="btn btn-outline-primary border-radius"
                                >
                                    <i className="fas fa-reply" />Quay lại
                                                </button>
                            </div> */}
                            <div className="card-footer">
                            </div>
                        </div>
                    </div>
                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={this._handleAddToggle}
                    >
                        <div className="card">
                            <div className="card-header">
                                <label className='caption'>Chi tiết</label>
                                <button onClick={this._handleAddToggle} className="pull-right btn btn-sm btn-outline-danger border-radius">
                                    <i className="far fa-times-circle"></i>
                                </button>
                            </div>

                            <div className="card-body">
                                <div className="form-body">
                                    {
                                        detail && Object.keys(detail).map(function (key, index) {
                                            return (
                                                <FormWrapper>
                                                    <FormInput
                                                        required={false}
                                                        disabled={true}
                                                        readOnly={true}
                                                        onChange={null}
                                                        defaultValue={detail[`${key}`] || ''}
                                                        type="text"
                                                        label={key}
                                                    />
                                                </FormWrapper>
                                            )
                                        })
                                    }
                                </div>
                            </div>
                            <div className="card-footer">
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

const mapStateToProps = (state) => {
    let { General } = state;
    return { General };
};
export default connect(mapStateToProps)(DanhMucQuocGia);
