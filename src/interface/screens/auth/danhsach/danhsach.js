import React, { Component } from "react";
import { connect } from "react-redux";
import * as cmFunction from '../../../../common/ulti/commonFunction'
import { __DEV__ } from "../../../../common/ulti/constants";
import * as publicServices from '../../../../controller/services/publicServices'
import ReactDOM from 'react-dom';
import XLSX from 'xlsx';
import moment from 'moment'
import ReactToPrint from "react-to-print";
import Modal from 'react-modal';
import { FormInput, FormWrapper } from "../../../../interface/components";
import * as Excel from "exceljs";
import { saveAs } from 'file-saver';

class ComponentToPrint extends React.Component {
    render() {
        let { thuoctinh, tendanhmuc, tbBanGhi } = this.props
        return (
            <div className="card-body fix-first">
                <h2 className="modal-title text-center">{tendanhmuc}</h2>
                <br />
                <table className="table table-bordered" width="100%">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên danh mục</th>
                            <th>Mã</th>
                            {thuoctinh.map((item, index) => {
                                return <th key={index}>{item.Ten}</th>
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {tbBanGhi.map((item, index) => {
                            let thuoctinh = item.ThuocTinh ? item.ThuocTinh : []
                            return <tr key={index} >
                                <td>{index + 1}</td>
                                <td>{item.TEN}</td>
                                <td>{item.MA}</td>
                                {thuoctinh.map((itemThuocTinh, indexThuocTinh) => {
                                    if (itemThuocTinh.KieuDuLieu.Ma == "number" || itemThuocTinh.KieuDuLieu.Ma == "text" || itemThuocTinh.KieuDuLieu.Ma == "date") {
                                        return <td key={indexThuocTinh}>{itemThuocTinh.LuaChon}</td>
                                    }
                                    else if (itemThuocTinh.KieuDuLieu.Ma == "select" || itemThuocTinh.KieuDuLieu.Ma == "radio") {
                                        let tieude = ""
                                        itemThuocTinh.LuaChon.map((itemLuaChon, indexLuaChon) => {
                                            if (itemLuaChon.Checked == true) {
                                                tieude = itemLuaChon.TieuDe
                                            }
                                        })
                                        return <td key={indexThuocTinh}>{tieude}</td>
                                    }
                                    else {
                                        let tieude = []
                                        itemThuocTinh.LuaChon.map((itemLuaChon, indexLuaChon) => {
                                            if (itemLuaChon.Checked == true) {
                                                tieude.push(itemLuaChon.TieuDe)
                                            }
                                        })

                                        return <td key={indexThuocTinh}>{
                                            tieude.map((itemTieuDe, indexTieude) => {
                                                return <div key={indexTieude}>{itemTieuDe}</div>
                                            })
                                        }</td>
                                    }
                                })}
                            </tr>
                        })}
                    </tbody>
                </table>
            </div>
        );
    }
}
class Danhsach extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isInsert: this.props.match.params.id == 0,
            danhsach: [],
            nhomdanhmuc: '',
            searchDanhmuc: [],
            search: '',
            tbBanGhi: [],
            thuoctinh: [],
            thuoctinhBanGhi: [],
            modalIsOpen: false,
            formModal: {},
            luachonSelected: [],
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
        if (!this.state.isInsert) {
            let id = this.props.match.params.id
            let data = await publicServices.getDanhMucById(id)
            this.state.danhsach = data
            this.state.searchDanhmuc = data.tbBanGhi
            this.state.tbBanGhi = data.tbBanGhi
            this.state.thuoctinh = cmFunction.clone(data.NhomDanhMuc.ThuocTinh)
            this.forceUpdate()
        }
    }

    _handleChangeSearchElement = (evt) => {
        this.state.search = evt.target.value
        if (evt.target.value.trim() === "") {
            this.state.searchDanhmuc = this.state.tbBanGhi
        }
        this.forceUpdate()
    }
    _handleKeyDow = (evt) => {
        if (evt.target.value.trim() !== "") {
            if (evt.key === 'Enter') {
                this._handleSearch();
                this.forceUpdate()
            }
        }
    }
    _handleSearch = () => {
        let list = this.state.tbBanGhi
        let text = this.state.search.trim()
        let searchList = list.filter((item) => {
            const textSearch = text;
            const itemDanhsach = cmFunction.changeAlias(item.TEN)
            return itemDanhsach.indexOf(textSearch) > -1
        })
        this.state.searchDanhmuc = searchList
        this.forceUpdate()
    }
    _handleOpenModal = (index) => {
        let luachonSelected = new Array(cmFunction.clone(this.state.searchDanhmuc).length)
        let thuoctinh = this.state.searchDanhmuc[`${index}`].ThuocTinh
        thuoctinh.map((itemThuocTinh, indexThuocTinh) => {
            if (itemThuocTinh.KieuDuLieu.Ma == "select") {
                itemThuocTinh.LuaChon.map((itemLuaChon, indexLuaChon) => {
                    if (itemLuaChon.Checked == true) {
                        luachonSelected[`${indexThuocTinh}`] = itemLuaChon
                    }
                })
            }
            else {
                luachonSelected[`${index}`] = []
            }
        })
        this.state.formModal = cmFunction.clone(this.state.searchDanhmuc[`${index}`])
        this.state.thuoctinhBanGhi = cmFunction.clone(this.state.searchDanhmuc[`${index}`].ThuocTinh)
        this.state.modalIsOpen = true
        this.forceUpdate()
    }
    _handleCloseModal = () => {
        this.state.formModal = {}
        this.state.thuoctinhBanGhi = []
        this.state.modalIsOpen = !this.state.modalIsOpen
        this.forceUpdate()
    }
    // EXPORT EXCEL
    // _handleExportExcel = (ref) => {
    //     // ví dụ xuất excel tại bảng đang có
    //     let myRows = [[this.state.danhsach.Ten]], maxCol = 0
    //     let table = ReactDOM.findDOMNode(this.refs[`${ref}`]);
    //     for (let tbindex = 0; tbindex < table.children.length; tbindex++) {
    //         let tb = table.children[`${tbindex}`]
    //         for (let trindex = 0; trindex < tb.children.length; trindex++) {
    //             let row = []
    //             let tr = tb.children[`${trindex}`]
    //             maxCol = tr.children.length > maxCol ? tr.children.length : maxCol
    //             for (let thindex = 0; thindex < tr.children.length; thindex++) {
    //                 let th = tr.children[`${thindex}`]
    //                 row.push(th.innerText)
    //             }
    //             myRows.push(row)
    //         }
    //     }
    //     // set colspan và rowspan
    //     let merge = [
    //         // { s: { r: 0, c: 0 }, e: { r: 0, c: maxCol } },
    //         // { s: { r: 1, c: 6 }, e: { r: 1, c: 7 } }
    //     ]
    //     // xuất file
    //     let ws = XLSX.utils.aoa_to_sheet(myRows);
    //     ws["!merges"] = merge;
    //     let wb = XLSX.utils.book_new();
    //     //add thêm nhiều Sheet vào đây cũng đc
    //     XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    //     let date = cmFunction.timestamp2DateString(moment().valueOf())
    //     let name = this.state.danhsach.Ten + '_' + date + '.xlsx'
    //     XLSX.writeFile(wb, name)
    // }
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
            for (let thindex = 0; thindex < tr.children.length-1; thindex++) {
              let th = tr.children[`${thindex}`]
              row.push(th.innerText)
            }
            myRows.push(row)
          }
        }
        let date = cmFunction.timestamp2DateString(moment().valueOf())
        let name = 'DSBanGhi_' + '_' + date
        const wb = new Excel.Workbook()
        const ws = wb.addWorksheet('DSBanGhi')
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
    renderBanGhi = () => {
        return <div>
            <div className="col-md-12 form-row form-custom form-no-spacing">
                <table className="table table-sm table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên</th>
                            <th>Mã</th>
                            {/* {this.state.thuoctinh.map((item, index) => {
                                return <th key={index}>{item.Ten}</th>
                            })} */}
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.searchDanhmuc.map((item, index) => {
                            let thuoctinh = item.ThuocTinh ? item.ThuocTinh : []
                            return <tr key={index} >
                                <td>{index + 1}</td>
                                <td>{item.TEN}</td>
                                <td>{item.MA}</td>
                                {/* {thuoctinh.map((itemThuocTinh, indexThuocTinh) => {
                                    if (itemThuocTinh.KieuDuLieu.Ma == "number" || itemThuocTinh.KieuDuLieu.Ma == "text" || itemThuocTinh.KieuDuLieu.Ma == "date") {
                                        return <td key={indexThuocTinh}>{itemThuocTinh.LuaChon}</td>
                                    }
                                    else if (itemThuocTinh.KieuDuLieu.Ma == "select" || itemThuocTinh.KieuDuLieu.Ma == "radio") {
                                        let tieude = ""
                                        itemThuocTinh.LuaChon.map((itemLuaChon, indexLuaChon) => {
                                            if (itemLuaChon.Checked == true) {
                                                tieude = itemLuaChon.TieuDe
                                            }
                                        })
                                        return <td key={indexThuocTinh}>{tieude}</td>
                                    }
                                    else {
                                        let tieude = []
                                        itemThuocTinh.LuaChon.map((itemLuaChon, indexLuaChon) => {
                                            if (itemLuaChon.Checked == true) {
                                                tieude.push(itemLuaChon.TieuDe)
                                            }
                                        })

                                        return <td key={indexThuocTinh}>{
                                            tieude.map((itemTieuDe, indexTieude) => {
                                                return <div key={indexTieude}>{itemTieuDe}</div>
                                            })
                                        }</td>
                                    }
                                })} */}
                                <td className="text-center" >
                                    <button onClick={() => this._handleOpenModal(index)} title="Xem" className="btn btn-sm btn-outline-info border-radius">
                                        <i className="fas fa-eye" />
                                    </button>
                                </td>
                            </tr>
                        })}
                    </tbody>

                </table>
                {/* </div> */}
            </div>
        </div>

    }
    renderThuocTinh = () => {
        return this.state.thuoctinhBanGhi.map((item, index) => {
            switch (item.KieuDuLieu.Ma) {
                case 'text':
                    return <FormWrapper key={index} >
                        <FormInput
                            id={index}
                            type="text"
                            required={false}
                            disabled={false}
                            readOnly={true}
                            label={item.Ten || ''}
                            placeholder=""
                            defaultValue={this.state.thuoctinhBanGhi[`${index}`].LuaChon || ''}
                        />
                    </FormWrapper>
                case 'number':
                    return <FormWrapper key={index} >
                        <FormInput
                            id={index}
                            type="number"
                            required={false}
                            disabled={false}
                            readOnly={true}
                            label={item.Ten || ''}
                            placeholder=""
                            defaultValue={this.state.thuoctinhBanGhi[`${index}`].LuaChon || ''}
                        />
                    </FormWrapper>
                case 'date':
                    return <FormWrapper key={index}>
                        <FormInput
                            id={index}
                            type="date"
                            required={false}
                            disabled={false}
                            readOnly={true}
                            label={item.Ten || ''}
                            placeholder=""
                            defaultValue={this.state.thuoctinhBanGhi[`${index}`].LuaChon || ''}
                        />
                    </FormWrapper>
                case "select":
                    return <FormWrapper key={index} >
                        <FormInput
                            type="select"
                            isDisabled={true}
                            required={false}
                            defaultValue={this.state.thuoctinhBanGhi[`${index}`] || ''}
                            isClearable={true}
                            isSearchable={true}
                            defaultOptions={true}
                            readOnly={true}
                            label={item.Ten || ''}
                        />
                    </FormWrapper>
                case "radio":
                    return <div key={index}>
                        <div className="row">
                            <div className="col-md-3" style={{ textAlign: 'right', paddingRight: '5px' }}>
                                {item.Ten || ''}
                            </div>
                            <div className="col-md-9">
                                {this.renderRadio(item, index)}
                            </div>
                        </div>
                    </div>
            }
        })
    }
    renderRadio = (item, index) => {
        let luachon = item.LuaChon
        return luachon.map((itemCheck, indexCheck) => {
            return <FormWrapper key={indexCheck} >
                <input
                    type="radio"
                    name={index}
                    value={itemCheck.TieuDe}
                    checked={this._checkItemRadio(item, indexCheck)}
                />
                <label style={{ paddingLeft: '10px' }}>{itemCheck.TieuDe}</label>
            </FormWrapper>
        })
    }
    _checkItemRadio = (item, indexCheck) => {
        return item.LuaChon[`${indexCheck}`].Checked
    }
    render() {
        let { danhsach, search, thuoctinh, searchDanhmuc, modalIsOpen, formModal, thuoctinhBanGhi, luachonSelected } = this.state
        return (
            <React.Fragment>
                <div className="main portlet">
                    <div className="row justify-content-center">
                        <div className=" col-lg-12">
                            <div className="portlet-title">
                                <div className="caption">
                                    <i className="fas fa-grip-vertical" />
                                    {danhsach.Ten}
                                </div>
                            </div>
                        </div>
                        <div className=" col-lg-12">
                            <div className="shadow p-3 mb-5 bg-white rounded">
                                <div className="card-body pt-3 pb-3 card-search">
                                    <div className="form-body">
                                        <div className="form-row form-group form-custom justify-content-center">
                                            <div className="col-md-8 text-center" >
                                                <input className="form-control" id="Ten" type="text" value={search || ''}
                                                    onChange={this._handleChangeSearchElement} onKeyDown={this._handleKeyDow}
                                                    placeholder="Nhập từ khóa tìm kiếm" />
                                            </div>
                                            <div className="col-md-2 text-center">
                                                <button
                                                    onClick={this._handleSearch} //disabled={!checkSearch}
                                                    className="btn btn-outline-primary border-radius"
                                                >
                                                    <i className="fas fa-search" />Tìm kiếm
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card mb-4">
                                    <div className="card-header d-flex justify-content-between" >
                                        <span className="caption-subject">Kết quả tìm kiếm: {searchDanhmuc.length} bản ghi</span>
                                        <div>
                                            <button onClick={() => this._handleExportExcel('dataTable')} className="btn btn-sm btn-outline-info border-radius" title="Xuất excel">
                                                <i className="fas fa-download" /> Xuất excel
                                            </button>
                                            <button className="btn btn-sm btn-outline-info border-radius" data-toggle="modal" data-target="#openModal" title="In danh sách">
                                                <i className="fas fa-print" />In danh sách
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal fade" id="openModal" tabIndex="-1" role="dialog" aria-hidden="true">
                                    <div className="modal-dialog modal-lg">
                                        <div className="modal-content">
                                            <ComponentToPrint thuoctinh={thuoctinh} tendanhmuc={danhsach.Ten} tbBanGhi={searchDanhmuc} ref={el => (this.componentRef = el)} />
                                            <div className="modal-footer">
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
                                {this.renderBanGhi()}
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
                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={this._handleCloseModal}
                    >
                        <div className="card">
                            <div className="card-header">
                                <label className='caption'>Thông tin bản ghi</label>
                                <button onClick={this._handleCloseModal} className="pull-right btn btn-sm btn-outline-danger border-radius">
                                    <i className="far fa-times-circle"></i>
                                </button>
                            </div>
                            <div className="card-body">
                                <div className="form-body" ref='formModal'>
                                    <FormWrapper>
                                        <FormInput
                                            required={true}
                                            disabled={false}
                                            readOnly={true}
                                            defaultValue={formModal.TEN || ''}
                                            type="text"
                                            id="TEN"
                                            label="Tên bản ghi"
                                            placeholder="Nhập tên bản ghi"
                                        />
                                    </FormWrapper>
                                    <FormWrapper>
                                        <FormInput
                                            required={true}
                                            disabled={false}
                                            readOnly={true}
                                            defaultValue={formModal.MA || ''}
                                            type="text"
                                            id="MA"
                                            label="Mã bản ghi"
                                            placeholder="Nhập mã bản ghi"
                                        />
                                    </FormWrapper>
                                    {this.renderThuocTinh()}
                                </div>
                            </div>
                            <div className="card-footer">
                                <button onClick={this._handleCloseModal} className="pull-right btn btn-sm btn-outline-danger border-radius">
                                    <i className="far fa-times-circle"></i>Đóng
                                </button>
                            </div>
                        </div>
                    </Modal>
                </div>
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => {
    let { General } = state;
    return { General };
};
export default connect(mapStateToProps)(Danhsach);