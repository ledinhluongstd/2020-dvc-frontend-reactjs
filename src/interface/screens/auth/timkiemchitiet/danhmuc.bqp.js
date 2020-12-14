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
import * as Excel from "exceljs";
import { saveAs } from 'file-saver';

class ComponentToPrint extends React.Component {
    render() {
        let { form } = this.props;
        return (
            <div className="card-body fix-first">
                <h2 className="modal-title text-center">{form.CategoryName}</h2>
                <br />
                <table className="table table-bordered" width="100%">
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
        );
    }
}
class DanhMucQuocGia extends Component {
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
            let data = await publicServices.getDanhMucQuocGiaBQPById(id);
            if (data) {
                this.state.form = data;
            }
            if (!data) this.state.error = true;
            this.forceUpdate();
        }
    };

    _handleExportExcel = (ref) => {
        // ví dụ xuất excel tại bảng đang có
        let myRows = [], maxCol = 0
        let table = ReactDOM.findDOMNode(this.refs[`${ref}`]);
        for (let tbindex = 0; tbindex < table.children.length; tbindex++) {
            let tb = table.children[`${tbindex}`]
            for (let trindex = 0; trindex < tb.children.length; trindex++) {
                let row = []
                let tr = tb.children[`${trindex}`]
                maxCol = tr.children.length > maxCol ? tr.children.length : maxCol
                for (let thindex = 0; thindex < tr.children.length - 1; thindex++) {
                    let th = tr.children[`${thindex}`]
                    row.push(th.innerText)
                }
                myRows.push(row)
            }
        }
        let date = cmFunction.timestamp2DateString(moment().valueOf())
        let name = 'DS_DMDCQG_' + '_' + date
        const wb = new Excel.Workbook()
        const ws = wb.addWorksheet(name)
        ws.addRows(myRows)
        ws.getRow(1).font = { name: 'Times New Roman', family: 2, size: 10, bold: true };
        for (let i = 0; i < myRows[1].length; i++) {
            ws.getCell(String.fromCharCode(65 + i) + 1).alignment = { vertical: 'top', horizontal: 'center' };
        }
        for (let i = 0; i < myRows.length; i++) {
            for (let j = 0; j < myRows[1].length; j++) {
                ws.getCell(String.fromCharCode(65 + j) + (i + 1)).border = {
                    top: { style: 'thin', color: { argb: '00000000' } },
                    left: { style: 'thin', color: { argb: '00000000' } },
                    bottom: { style: 'thin', color: { argb: '00000000' } },
                    right: { style: 'thin', color: { argb: '00000000' } }
                }
            }
        }
        wb.xlsx.writeBuffer().then((data) => {
            const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' })
            saveAs(blob, name + ".xlsx")
        })
    }


    render() {
        let { isInsert, form, error } = this.state;
        if (error) return <Page404 />;
        let keyNonDisplay = ['_id', 'BanGhi', '_etag', 'code', 'createdAt', 'createdBy', 'isActive', 'modifiedAt', 'modifiedBy']
        try {
            return (
                <div className="main portlet">
                    <div className="portlet-title">
                        <div className="caption">
                            <i className="fas fa-grip-vertical" />
                            {form.CategoryName}
                        </div>
                    </div>
                    {/* <div className="card">
                        <div
                            className="card-header d-flex justify-content-between"
                            data-toggle="collapse"
                            data-target="#collapseExample"
                            aria-expanded="true"
                            aria-controls="collapseExample"
                        >
                            <span className="caption-subject">Thông tin danh mục</span>
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
                    </div> */}

                    {!!form.BanGhi && <div className=" col-lg-12">
                        <div className="shadow p-3 mb-5 bg-white rounded">
                            <div className="card mb-4">
                                <div className="card-header d-flex justify-content-between" >
                                    <span className="caption-subject">Kết quả tìm kiếm: {form.BanGhi.length} bản ghi</span>
                                    <div>
                                        <button onClick={() => this._handleExportExcel('dataTable')} className="btn btn-sm btn-outline-info border-radius" title="Xuất excel">
                                            <i className="fas fa-download" /> Xuất excel
                                            </button>
                                        <button className="btn btn-sm btn-outline-info border-radius" data-toggle="modal" data-target="#openModal" title="In danh sách">
                                            <i className="fas fa-print" />In danh sách
                                            </button>
                                        <button
                                            onClick={() => cmFunction.goBack()}
                                            className="btn btn-sm btn-outline-info border-radius"
                                        >
                                            <i className="fas fa-reply" />Quay lại
                                                </button>
                                    </div>
                                </div>
                            </div>
                            <div className="modal fade" id="openModal" tabIndex="-1" role="dialog" aria-hidden="true">
                                <div className="modal-dialog modal-xl">
                                    <div className="modal-content">
                                        <ComponentToPrint form={form} ref={el => (this.componentRef = el)} />
                                        <div className="modal-footer ">
                                            <button type="button" className="btn btn-sm btn-outline-info border-radius" data-dismiss="modal">Close</button>
                                            <ReactToPrint
                                                trigger={() => <button className="btn btn-sm btn-outline-info border-radius" data-dismiss="modal">
                                                    <i className="fas fa-print" />In danh sách</button>}
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
export default connect(mapStateToProps)(DanhMucQuocGia);
