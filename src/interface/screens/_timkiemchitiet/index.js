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
import { FormInput, FormWrapper } from "../../../../interface/components";
import ReactToPrint from "react-to-print";
import ReactDOM from "react-dom";
import XLSX from "xlsx";
import moment from "moment";
import Modal from "react-modal";
import { GSP_DMDC } from "../../../../../config";

class ComponentToPrint extends React.Component {
    render() {
        let { thuoctinh, tendanhmuc, tbBanGhi } = this.props;
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
                                return <th key={index}>{item.Ten}</th>;
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {tbBanGhi.map((item, index) => {
                            let thuoctinh = item.ThuocTinh ? item.ThuocTinh : [];
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.TEN}</td>
                                    <td>{item.MA}</td>
                                    {thuoctinh.map((itemThuocTinh, indexThuocTinh) => {
                                        if (
                                            itemThuocTinh.KieuDuLieu.Ma == "number" ||
                                            itemThuocTinh.KieuDuLieu.Ma == "text" ||
                                            itemThuocTinh.KieuDuLieu.Ma == "date"
                                        ) {
                                            return (
                                                <td key={indexThuocTinh}>{itemThuocTinh.LuaChon}</td>
                                            );
                                        } else if (
                                            itemThuocTinh.KieuDuLieu.Ma == "select" ||
                                            itemThuocTinh.KieuDuLieu.Ma == "radio"
                                        ) {
                                            let tieude = "";
                                            itemThuocTinh.LuaChon.map((itemLuaChon, indexLuaChon) => {
                                                if (itemLuaChon.Checked == true) {
                                                    tieude = itemLuaChon.TieuDe;
                                                }
                                            });
                                            return <td key={indexThuocTinh}>{tieude}</td>;
                                        } else {
                                            let tieude = [];
                                            itemThuocTinh.LuaChon.map((itemLuaChon, indexLuaChon) => {
                                                if (itemLuaChon.Checked == true) {
                                                    tieude.push(itemLuaChon.TieuDe);
                                                }
                                            });

                                            return (
                                                <td key={indexThuocTinh}>
                                                    {tieude.map((itemTieuDe, indexTieude) => {
                                                        return <div key={indexTieude}>{itemTieuDe}</div>;
                                                    })}
                                                </td>
                                            );
                                        }
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    }
}
class ComponentToPrintQG extends React.Component {
    render() {
        let { danhsach } = this.props;
        return (
            <div className="card-body fix-first">
                <h2 className="modal-title text-center">Danh mục Điện tử Quốc Gia</h2>
                <br />
                <table className="table table-bordered" width="100%">
                    <thead>
                        <tr>
                            <th>STT</th>
                            <th>Tên danh mục</th>
                            <th>Mã</th>
                        </tr>
                    </thead>
                    <tbody>
                        {danhsach.map((item, index) => {
                            return (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.CategoryName}</td>
                                    <td>{item.CategoryCode}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    }
}
class TimKiemChiTiet extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dslinhvuc: [],
            linhvucSelected: null,
            searchTimeout: null,
            danhmuc: [],
            danhmucSelected: null,
            DanhmucTimeout: null,
            waiting: false,
            thuoctinh: [],
            dsThuocTinh: [],
            searchThuocTinh: [],
            searchTT: "",
            tendanhmuc: "",
            modalIsOpen: false,
            luachonSelected: [],
            formModal: {},
            thuoctinhBanGhi: [],
            clickDungChung: false,
            clickQuocGia: false,
            danhsach: [],
            search: {},
            danhsachclone: []
        };
    }

    componentDidMount = async () => { };
    componentDidUpdate(prevProps) { }

    _handleLoadLinhVuc = (inputValue, callback) => {
        clearTimeout(this.state.searchTimeout);
        this.state.searchTimeout = setTimeout(async () => {
            let filter = {};
            filter.page = 1;
            filter.pagesize = 1000;
            filter.count = true;
            filter.filter = JSON.stringify({
                Ten: cmFunction.regexText(inputValue),
                KichHoat: true,
            });
            filter = new URLSearchParams(filter).toString();
            let dsLinhVuc = await publicServices.getLinhVuc(filter);
            dsLinhVuc = dsLinhVuc && dsLinhVuc._embedded ? dsLinhVuc._embedded : [];
            let linhvuc = cmFunction.convertSelectOptions(
                dsLinhVuc,
                "_id.$oid",
                "Ten"
            );
            linhvuc.sort(function (a, b) {
                if (a.Cap !== b.Cap) {
                    return a.Cap - b.Cap;
                }
                var nameA = cmFunction.changeAlias(a.Ten);
                var nameB = cmFunction.changeAlias(b.Ten);
                if (nameA === nameB) {
                    return 0;
                }
                return nameA > nameB ? 1 : -1;
            });
            this.state.dsLinhVuc = linhvuc;
            this.forceUpdate();
            callback(linhvuc);
        }, 500);
    };
    _handleLinhVucChange = (value) => {
        this.state.linhvucSelected = cmFunction.clone(value);
        this._handleDanhMucChange(null);
        this.state.waiting = true;
        this.forceUpdate();
        setTimeout(() => {
            this.state.waiting = false;
            this.forceUpdate();
        }, 500);
        this.forceUpdate();
    };
    renderDanhMuc = (linhvucSelected, waiting) => {
        if (linhvucSelected && !waiting) {
            return (
                <FormWrapper>
                    <FormInput
                        loadOptions={(e, v) => this._handleLoadDanhmuc(e, v, linhvucSelected)}
                        onChange={this._handleDanhMucChange}
                        required={false}
                        defaultValue={this.state.danhmucSelected}
                        isClearable={true}
                        isSearchable={true}
                        defaultOptions={true}
                        type="select"
                        label="Danh mục tìm kiếm"
                        placeholder="Danh mục ..."
                    />
                </FormWrapper>
            );
        }
    };
    _handleLoadDanhmuc = (inputValue, callback, linhvucSelected) => {
        clearTimeout(this.state.DanhmucTimeout);
        this.state.DanhmucTimeout = setTimeout(async () => {
            let filter = {};
            filter.page = 1;
            filter.pagesize = 1000;
            filter.count = true;
            filter.filter = JSON.stringify({
                Ten: cmFunction.regexText(inputValue),
                ["LinhVuc.code"]: cmFunction.regexText(linhvucSelected.code),
                PheDuyet: 3,
            });
            filter = new URLSearchParams(filter).toString();
            let dsDanhMuc = await publicServices.getDanhMuc(filter);
            dsDanhMuc = dsDanhMuc && dsDanhMuc._embedded ? dsDanhMuc._embedded : [];
            let danhmuc = cmFunction.convertSelectOptions(
                dsDanhMuc,
                "_id.$oid",
                "Ten"
            );
            // this.state.danhmuc = danhmuc;
            console.log('danhmuc', danhmuc)
            this.forceUpdate();
            callback(danhmuc);
        }, 500);
    };
    _handleDanhMucChange = (value) => {
        if (value === null) {
            this.state.danhmucSelected = null;
            this.state.tendanhmuc = "";
            this.state.thuoctinh = [];
            this.state.searchThuocTinh = [];
            this.state.dsThuocTinh = [];
        } else {
            this.state.danhmucSelected = cmFunction.clone(value);
            this.state.tendanhmuc = cmFunction.clone(value.Ten);
            this.state.thuoctinh = this.state.danhmucSelected.NhomDanhMuc.ThuocTinh;
            this.state.searchThuocTinh = cmFunction.clone(value.tbBanGhi);
            this.state.dsThuocTinh = cmFunction.clone(value.tbBanGhi);
        }

        this.forceUpdate();
        this.renderThuocTinh();
    };
    renderThuocTinh = () => {
        if (this.state.searchThuocTinh.length > 0) {
            return (
                <div>
                    <FormWrapper>
                        <FormInput
                            required={false}
                            disabled={false}
                            readOnly={false}
                            onChange={this._handleChangeSearchElement}
                            defaultValue={this.state.searchTT || ""}
                            type="text"
                            id="Ten"
                            label="Nhập từ khóa tìm kiếm"
                            placeholder="Nhập từ khóa tìm kiếm"
                        />
                    </FormWrapper>
                    <div className="text-center">
                        <button
                            onClick={this._handleSearch} //disabled={!checkSearch}
                            className="btn btn-outline-primary border-radius"
                        >
                            <i className="fas fa-search" />
                        Tìm kiếm
                        </button>
                    </div>
                    <br></br>
                    <div className="card mb-4">
                        <div className="card-header d-flex justify-content-between">
                            <span className="caption-subject">
                                Kết quả tìm kiếm: {this.state.searchThuocTinh.length} bản ghi
                            </span>
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
                                    thuoctinh={this.state.thuoctinh}
                                    tendanhmuc={this.state.tendanhmuc}
                                    tbBanGhi={this.state.searchThuocTinh}
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
                    {this.renderBanGhi()}
                </div>
            );
        }
    };
    // EXPORT EXCEL
    _handleExportExcel = (ref) => {
        // ví dụ xuất excel tại bảng đang có
        let myRows = [[this.state.tendanhmuc || 'Danh mục Điện tử Quốc Gia']],
            maxCol = 0;
        let table = ReactDOM.findDOMNode(this.refs[ref]);
        for (let tbindex = 0; tbindex < table.children.length; tbindex++) {
            let tb = table.children[tbindex];
            for (let trindex = 0; trindex < tb.children.length; trindex++) {
                let row = [];
                let tr = tb.children[trindex];
                maxCol = tr.children.length > maxCol ? tr.children.length : maxCol;
                for (let thindex = 0; thindex < tr.children.length; thindex++) {
                    let th = tr.children[thindex];
                    row.push(th.innerText);
                }
                myRows.push(row);
            }
        }
        // set colspan và rowspan
        let merge = [
            // { s: { r: 0, c: 0 }, e: { r: 0, c: maxCol } },
            // { s: { r: 1, c: 6 }, e: { r: 1, c: 7 } }
        ];
        // xuất file
        let ws = XLSX.utils.aoa_to_sheet(myRows);
        ws["!merges"] = merge;
        let wb = XLSX.utils.book_new();
        //add thêm nhiều Sheet vào đây cũng đc
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        let date = cmFunction.timestamp2DateString(moment().valueOf());
        let name = [this.state.tendanhmuc || "Danh_muc_dien_tu_Quoc_Gia"] + "_" + date + ".xlsx";
        XLSX.writeFile(wb, name);
    };
    _handleChangeSearchElement = (evt) => {
        this.state.searchTT = evt.target.value;
        if (evt.target.value.trim() === "") {
            this.state.searchThuocTinh = this.state.dsThuocTinh;
        }
        this.forceUpdate();
    };
    _handleKeyDow = (evt) => {
        if (evt.target.value.trim() !== "") {
            if (evt.key === "Enter") {
                this._handleSearch();
                this.forceUpdate();
            }
        }
    };
    _handleSearch = () => {
        let list = this.state.dsThuocTinh;
        let text = this.state.searchTT.trim();
        let searchList = list.filter((item) => {
            const textSearch = text;
            const itemDanhsach = `
                ${cmFunction.changeAlias(item.TEN)}}
                `;
            return itemDanhsach.indexOf(textSearch) > -1;
        });
        this.state.searchThuocTinh = searchList;
        this.forceUpdate();
    };
    renderBanGhi = () => {
        return (
            <div>
                <div className="col-md-12 form-row form-custom form-no-spacing">
                    <table
                        className="table table-sm table-bordered"
                        id="dataTable"
                        width="100%"
                        cellSpacing="0"
                        ref="dataTable"
                    >
                        <thead>
                            <tr>
                                <th>STT</th>
                                <th>Tên</th>
                                <th>Mã</th>
                                {/* {this.state.thuoctinh.map((item, index) => {
                                    return <th key={index}>{item.Ten}</th>;
                                })} */}
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.searchThuocTinh.map((item, index) => {
                                let thuoctinh = item.ThuocTinh ? item.ThuocTinh : [];
                                return (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{item.TEN}</td>
                                        <td>{item.MA}</td>
                                        {/* {thuoctinh.map((itemThuocTinh, indexThuocTinh) => {
                                            if (
                                                itemThuocTinh.KieuDuLieu.Ma == "number" ||
                                                itemThuocTinh.KieuDuLieu.Ma == "text" ||
                                                itemThuocTinh.KieuDuLieu.Ma == "date"
                                            ) {
                                                return (
                                                    <td key={indexThuocTinh}>{itemThuocTinh.LuaChon}</td>
                                                );
                                            } else if (
                                                itemThuocTinh.KieuDuLieu.Ma == "select" ||
                                                itemThuocTinh.KieuDuLieu.Ma == "radio"
                                            ) {
                                                let tieude = "";
                                                itemThuocTinh.LuaChon.map(
                                                    (itemLuaChon, indexLuaChon) => {
                                                        if (itemLuaChon.Checked == true) {
                                                            tieude = itemLuaChon.TieuDe;
                                                        }
                                                    }
                                                );
                                                return <td key={indexThuocTinh}>{tieude}</td>;
                                            } else {
                                                let tieude = [];
                                                itemThuocTinh.LuaChon.map(
                                                    (itemLuaChon, indexLuaChon) => {
                                                        if (itemLuaChon.Checked == true) {
                                                            tieude.push(itemLuaChon.TieuDe);
                                                        }
                                                    }
                                                );

                                                return (
                                                    <td key={indexThuocTinh}>
                                                        {tieude.map((itemTieuDe, indexTieude) => {
                                                            return <div key={indexTieude}>{itemTieuDe}</div>;
                                                        })}
                                                    </td>
                                                );
                                            }
                                        })} */}
                                        <td className="text-center">
                                            <button
                                                onClick={() => this._handleOpenModal(index)}
                                                title="Xem"
                                                className="btn btn-sm btn-outline-info border-radius"
                                            >
                                                <i className="fas fa-eye" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };
    _handleOpenModal = (index) => {
        let luachonSelected = new Array(
            cmFunction.clone(this.state.searchThuocTinh).length
        );
        let thuoctinh = this.state.searchThuocTinh[index].ThuocTinh;
        thuoctinh.map((itemThuocTinh, indexThuocTinh) => {
            if (itemThuocTinh.KieuDuLieu.Ma == "select") {
                itemThuocTinh.LuaChon.map((itemLuaChon, indexLuaChon) => {
                    if (itemLuaChon.Checked == true) {
                        luachonSelected[indexThuocTinh] = itemLuaChon;
                    }
                });
            } else {
                luachonSelected[index] = [];
            }
        });
        this.state.formModal = cmFunction.clone(this.state.searchThuocTinh[index]);
        this.state.thuoctinhBanGhi = cmFunction.clone(
            this.state.searchThuocTinh[index].ThuocTinh
        );
        this.state.modalIsOpen = true;
        this.forceUpdate();
    };
    _handleCloseModal = () => {
        this.state.formModal = {};
        this.state.thuoctinhBanGhi = [];
        this.state.modalIsOpen = !this.state.modalIsOpen;
        this.forceUpdate();
    };
    ChiTietThuocTinh = () => {
        return this.state.thuoctinhBanGhi.map((item, index) => {
            switch (item.KieuDuLieu.Ma) {
                case "text":
                    return (
                        <FormWrapper key={index}>
                            <FormInput
                                id={index}
                                type="text"
                                required={false}
                                disabled={false}
                                readOnly={true}
                                label={item.Ten || ""}
                                placeholder=""
                                defaultValue={this.state.thuoctinhBanGhi[index].LuaChon || ""}
                            />
                        </FormWrapper>
                    );
                case "number":
                    return (
                        <FormWrapper key={index}>
                            <FormInput
                                id={index}
                                type="number"
                                required={false}
                                disabled={false}
                                readOnly={true}
                                label={item.Ten || ""}
                                placeholder=""
                                defaultValue={this.state.thuoctinhBanGhi[index].LuaChon || ""}
                            />
                        </FormWrapper>
                    );
                case "date":
                    return (
                        <FormWrapper key={index}>
                            <FormInput
                                id={index}
                                type="date"
                                required={false}
                                disabled={false}
                                readOnly={true}
                                label={item.Ten || ""}
                                placeholder=""
                                defaultValue={this.state.thuoctinhBanGhi[index].LuaChon || ""}
                            />
                        </FormWrapper>
                    );
                case "select":
                    return (
                        <FormWrapper key={index}>
                            <FormInput
                                type="select"
                                isDisabled={true}
                                required={false}
                                defaultValue={this.state.thuoctinhBanGhi[index] || ""}
                                isClearable={true}
                                isSearchable={true}
                                defaultOptions={true}
                                readOnly={true}
                                label={item.Ten || ""}
                            />
                        </FormWrapper>
                    );
                case "radio":
                    return (
                        <div key={index}>
                            <div className="row">
                                <div
                                    className="col-md-3"
                                    style={{ textAlign: "right", paddingRight: "5px" }}
                                >
                                    {item.Ten || ""}
                                </div>
                                <div className="col-md-9">{this.renderRadio(item, index)}</div>
                            </div>
                        </div>
                    );
            }
        });
    };
    renderRadio = (item, index) => {
        let luachon = item.LuaChon;
        return luachon.map((itemCheck, indexCheck) => {
            return (
                <FormWrapper key={indexCheck}>
                    <input
                        type="radio"
                        name={index}
                        value={itemCheck.TieuDe}
                        checked={this._checkItemRadio(item, indexCheck)}
                    />
                    <label style={{ paddingLeft: "10px" }}>{itemCheck.TieuDe}</label>
                </FormWrapper>
            );
        });
    };
    _checkItemRadio = (item, indexCheck) => {
        return item.LuaChon[indexCheck].Checked;
    };

    _Danhmucdungchung = () => {
        this.state.clickDungChung = true;
        this.state.clickQuocGia = false;
        this.forceUpdate();
    };
    _Danhmucquocgia = () => {
        this.state.clickDungChung = false;
        // this._handleLinhVucChange(null);
        this.state.clickQuocGia = true;
        this._getDanhMucQuocGia(this._createFilter());
        this.forceUpdate();
    };

    _getDanhMucQuocGia = async (query) => {
        let data = await publicServices.getDanhMucQuocGia("GET", GSP_DMDC);
        this.state.danhsach = data;
        this.state.danhsachclone = cmFunction.clone(data)
        this.forceUpdate();
    };
    _createFilter = () => {
        let parsed = {}
        parsed.count = true;
        this.forceUpdate();
        return new URLSearchParams(parsed).toString();
    };
    _convertName = (item) => {
        return item.CategoryName
    }
    _handleChangeSearchElementQG = (evt) => {
        this.state.search[evt.target.id] = evt.target.value
        this.forceUpdate()
    }
    _handleKeyDowQG = (evt) => {
        if (evt.key === 'Enter') {
            this._handleSearchQG();
            this.forceUpdate()
        }
    }
    _handleSearchQG = () => {
        let { danhsachclone, search } = this.state
        let danhsach = danhsachclone.filter(function (item) {
            const itemDanhsach = `
                ${cmFunction.changeAlias(item.CategoryName)}}
                ${cmFunction.changeAlias(item.CategoryCode)}}
                `;
            const textSearch = cmFunction.changeAlias(search.Ten);
            return itemDanhsach.indexOf(textSearch) > -1;
        });
        this.state.danhsach = danhsach
        this.forceUpdate()
    }
    render() {
        let {
            linhvucSelected, waiting, thuoctinh, modalIsOpen,
            formModal, clickDungChung, clickQuocGia, danhsach,
            search,
        } = this.state;
        return (
            <React.Fragment>
                <div className="main portlet trich-xuat">
                    <div className="p-4 mb-4 search-block-title">
                        <div className="portlet-title">
                            <div className="caption">
                                {" "}
                                <i className="fas fa-search" /> TÌM KIẾM CHI TIẾT{" "}
                            </div>
                        </div>
                        <div className="form-body" ref="form">
                        <br></br>
                            <div className="form-row form-group form-custom form-wrap">
                                <div className="col-md-12 form-row form-wrap">
                                    <div className="col-md-12 form-row form-custom form-no-spacing">
                                        <div className="col-md-3 text-right pr-3">Tìm theo</div>
                                        <div className="col-md-9 pl-0 pr-0">
                                            <div className="custom-control custom-radio custom-control-inline">
                                                <input
                                                    type="radio"
                                                    id="Danhmucdungchung"
                                                    name="Danhmucdungchung"
                                                    className="custom-control-input"
                                                    onChange={this._Danhmucdungchung}
                                                />
                                                <label
                                                    className="custom-control-label"
                                                    for="Danhmucdungchung"
                                                >
                                                    Danh mục điện tử dùng chung
                                                </label>
                                            </div>
                                            <div className="custom-control custom-radio custom-control-inline">
                                                <input
                                                    type="radio"
                                                    id="Danhmucquocgia"
                                                    name="Danhmucdungchung"
                                                    className="custom-control-input"
                                                    onChange={this._Danhmucquocgia}
                                                />
                                                <label
                                                    className="custom-control-label"
                                                    for="Danhmucquocgia"
                                                >
                                                    Danh mục điện tử quốc gia{" "}
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <br></br>
                                </div>
                            </div>
                            {clickDungChung && (
                                <FormWrapper>
                                    <FormInput
                                        loadOptions={this._handleLoadLinhVuc}
                                        onChange={this._handleLinhVucChange}
                                        required={false}
                                        defaultValue={linhvucSelected}
                                        isClearable={true}
                                        isSearchable={true}
                                        isDisabled={false}
                                        defaultOptions={true}
                                        type="select"
                                        label="Lĩnh vực tìm kiếm"
                                        placeholder="Lĩnh vực ..."
                                    />
                                </FormWrapper>
                            )}

                            {clickDungChung && this.renderDanhMuc(linhvucSelected, waiting)}
                            {clickDungChung && this.renderThuocTinh(thuoctinh)}

                            {clickQuocGia && (<div>
                                <div className="card-body pt-3 pb-3 row justify-content-center">
                                    <div className="form-body col-md-12">
                                        <div className="form-row form-group form-custom">
                                            <div className="col-md-1">

                                            </div>
                                            <div className="col-md-8">
                                                <input className="form-control" onChange={this._handleChangeSearchElementQG} onKeyDown={this._handleKeyDowQG}
                                                    value={search.Ten || ''} type="text" id="Ten" placeholder='Tìm kiếm tên, mã danh mục quốc gia' />
                                            </div>
                                            <div className="col-md-2">
                                                <button onClick={this._handleSearchQG} className="btn btn-outline-primary border-radius ">
                                                    <i className="fas fa-search" />Tìm kiếm
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card">
                                    <div className="card-header d-flex justify-content-between">
                                        <strong>{`Tổng số: ${danhsach.length} danh mục`}</strong>
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
                                        <div
                                            className="modal fade"
                                            id="openModal"
                                            tabIndex="-1"
                                            role="dialog"
                                            aria-hidden="true"
                                        >
                                            <div className="modal-dialog modal-lg">
                                                <div className="modal-content">
                                                    <ComponentToPrintQG
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
                                    </div>
                                    <div className="card-body fix-first">
                                        <div className="table-fix-head">
                                            <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
                                                <thead>
                                                    <tr>
                                                        <th>STT</th>
                                                        <th>Tên</th>
                                                        <th>Mã</th>
                                                        <th>Hành động</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {danhsach.map((item, index) => {
                                                        return <tr key={index} >
                                                            <td className='text-center'>{index + 1}</td>
                                                            <td>{this._convertName(item)}</td>
                                                            <td>{item.CategoryCode}</td>
                                                            <td>
                                                                {item.TotalItem ?
                                                                    <Link target="_blank" to={'/search/danh-muc?danhmuc=' + (cmFunction.encode(item.UrlGetList)) + '&ten=' + (cmFunction.encode(item.CategoryName))} title="Chi tiết" className="btn btn-sm btn-outline-info border-radius"><i className="fas fa-eye"></i></Link>
                                                                    : null}
                                                            </td>
                                                        </tr>
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            )}
                        </div>
                    </div>

                    <Modal isOpen={modalIsOpen} onRequestClose={this._handleCloseModal}>
                        <div className="card">
                            <div className="card-header">
                                <label className="caption">Thông tin bản ghi</label>
                                <button
                                    onClick={this._handleCloseModal}
                                    className="pull-right btn btn-sm btn-outline-danger border-radius"
                                >
                                    <i className="far fa-times-circle"></i>
                                </button>
                            </div>
                            <div className="card-body">
                                <div className="form-body" ref="formModal">
                                    <FormWrapper>
                                        <FormInput
                                            required={true}
                                            disabled={false}
                                            readOnly={true}
                                            defaultValue={formModal.TEN || ""}
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
                                            defaultValue={formModal.MA || ""}
                                            type="text"
                                            id="MA"
                                            label="Mã bản ghi"
                                            placeholder="Nhập mã bản ghi"
                                        />
                                    </FormWrapper>
                                    {this.ChiTietThuocTinh()}
                                </div>
                            </div>
                            <div className="card-footer">
                                <button
                                    onClick={this._handleCloseModal}
                                    className="pull-right btn btn-sm btn-outline-danger border-radius"
                                >
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

const mapStateToProps = (state) => {
    let { General } = state;
    return { General };
};
export default connect(mapStateToProps)(TimKiemChiTiet);
