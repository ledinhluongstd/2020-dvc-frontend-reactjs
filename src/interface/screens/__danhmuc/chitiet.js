import React, { Component } from "react";
import { connect } from "react-redux";
import { Page404, Other } from 'interface/screens/error'
import { BreadCrumbs, FormInput, FormWrapper, FileUpload } from "interface/components";
import { __DEV__, SUPER } from "../../../common/ulti/constants";
import * as CONSTANTS from 'common/ulti/constants';
import { confirmAlert } from 'react-confirm-alert';
import AsyncSelect from 'react-select/async';
import * as mediaServices from 'controller/services/mediaServices'
import * as cmFunction from 'common/ulti/commonFunction'
import * as tbDanhMuc from 'controller/services/tbDanhMucServices'
import * as tbNhomDanhMuc from 'controller/services/tbNhomDanhMucServices'
import * as tbDanhMucUngDung from 'controller/services/tbDanhMucUngDungServices'
import * as tbLinhVuc from 'controller/services/tbLinhVucServices'
import Modal from 'react-modal';
import { fetchToastNotify } from "../../../controller/redux/app-reducer";
import { HOST_API, MEDIA_DOWNLOAD } from "../../../controller/api";
import * as Excel from "exceljs";
import { saveAs } from 'file-saver';
import moment from 'moment'
import { ExcelRenderer, OutTable } from "react-excel-renderer";
import { cssNumber } from "jquery";

class ChiTiet extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isInsert: this.props.match.params.id == 0,
      error: false,
      form: {},
      nhomdanhmucSelected: [],
      nhomdanhmucSelectedAddNew: [],
      danhmucSelected: null,
      nhomdanhmuc: [],
      linhvuc: [],
      loaidanhmuc: [],
      thuoctinh: [],
      thuoctinhBanGhi: [],
      luachon: [],
      luachonSelected: [],
      linhvucSelected: [],
      nhomtieudeSelected: [],
      loaidanhmucSelected: null,
      searchTimeout: null,
      searchLoaiDanhMucTimeout: null,
      searchLinhVucTimeout: null,
      TimeOut: [],
      documents: [],
      vanbansuadoi: {
        Ten: "",
        Link: "",
        File: []
      },
      isFileChanged: false,
      PheDuyet: 1,
      modalIsOpen: false,
      tbBanGhi: [],
      modalEditIndex: -1,
      formModal: {},
      modalMission: true,
      checkdanhmuc: false,
      checknhomdanhmuc: false,
      checklinhvuc: false,
      saveAction: true
    }
  }

  componentDidMount() {
    this._init()
  }
  componentDidUpdate(prevProps) {
  }
  _init = async () => {
    this.state.isInsert = this.props.match.params.id == 0
    let id = this.props.match.params.id
    if (!this.state.isInsert) {
      let data = await tbDanhMuc.getById(id)
      if (data) {
        delete data.pwd
        this.state.danhmucSelected = data
        this.state.form = data
        this.state.tbBanGhi = data.tbBanGhi
        this.state.linhvucSelected = data.LinhVuc
        // updatefile
        if (data.VBBanHanhSuaDoi) {
          this.state.vanbansuadoi = data.VBBanHanhSuaDoi
          if (!cmFunction.isEmpty(data.VBBanHanhSuaDoi.File.documents)) {
            this.state.documents = cmFunction.clone(data.VBBanHanhSuaDoi.File.documents)
            this.state.checkDoc = true
          } else {
            this.state.documents = []
            this.state.checkDoc = false
          }
        }
        // 
        this.state.nhomdanhmucSelected = cmFunction.convertSelectedOptions(data.NhomDanhMuc, '_id.$oid', 'Ten')
        this.state.loaidanhmucSelected = cmFunction.convertSelectedOptions(data.LoaiDanhMuc, '_id.$oid', 'Ten')
        this.state.linhvucSelected = cmFunction.convertSelectedOptions(data.LinhVuc, '_id.$oid', 'Ten')
        this.state.thuoctinh = cmFunction.clone(data.NhomDanhMuc.ThuocTinh)
        let luachonSelected = new Array(data.NhomDanhMuc.ThuocTinh.length)
        let thuoctinh = cmFunction.clone(data.NhomDanhMuc.ThuocTinh)
        thuoctinh = thuoctinh.map((item, index) => {
          if (item.KieuDuLieu.Ma == "select") {
            item.LuaChon = item.LuaChon.map((itemLuaChon, indexLuaChon) => {
              if (itemLuaChon.Checked == true) {
                luachonSelected[index] = itemLuaChon
              }
            })
          }
          else {
            luachonSelected[index] = []
          }
        })
        this.state.luachonSelected = luachonSelected
        let timeout = []
        for (let i = 0; i < thuoctinh.length; i++) {
          timeout.push({ "searchTieuDeTimeout": null })
        }
        this.state.TimeOut = timeout
        this.forceUpdate()
      }
      if (!data) this.state.error = true
      this.forceUpdate()
    }

  }

  //Change
  _handleChangeElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.value
    this.forceUpdate()
  }
  _handleChangeThuocTinh = (evt) => {
    this.state.thuoctinhBanGhi[evt.target.id].LuaChon = evt.target.value
    this.forceUpdate()
  }
  _handleChangeCheckElement = (evt) => {
    this.state.form[evt.target.id] = evt.target.checked
    this.forceUpdate()
  }
  _handleLinhVucChange = (sel) => {
    let linhvuc = cmFunction.clone(sel)
    this.state.linhvucSelected = linhvuc
    this.state.form.LinhVuc = linhvuc
    this.state.form.DonViCha = linhvuc.DonViCha
    this.forceUpdate()
  }
  _handleModalChangeElement = (evt) => {
    this.state.formModal[evt.target.id] = evt.target.value;
    this.forceUpdate();
  };
  _handleChangeCheckBox = (indexCheck, index) => {
    let check = this.state.thuoctinhBanGhi[index].LuaChon[indexCheck].Checked
    check = !check
    this.state.thuoctinhBanGhi[index].LuaChon[indexCheck].Checked = check
    this.forceUpdate()
  }
  _handleChangeRadio = (indexCheck, index, item) => {
    let luachon = cmFunction.clone(item.LuaChon)
    let luachonSelected = luachon[indexCheck]
    let arr = []
    luachon = luachon.map((item, indexLuaChon) => {
      if (cmFunction.compareObject(item, luachonSelected)) {
        item.Checked = true
      }
      else {
        item.Checked = false
      }
      arr[indexLuaChon] = item
    })
    luachon = arr
    this.state.thuoctinhBanGhi[index].LuaChon = luachon
    this.forceUpdate()
  }
  _handleNhomDanhMucChange = (sel) => {
    let nhomdanhmuc = cmFunction.clone(sel)
    let thuoctinh = cmFunction.clone(sel.ThuocTinh)
    this.state.form.NhomDanhMuc = nhomdanhmuc
    this.state.form.Cap = nhomdanhmuc.Cap
    this.state.form.DonViCha = nhomdanhmuc.DonViCha
    this.state.nhomdanhmucSelected = cmFunction.clone(sel)
    let arr = []
    thuoctinh = thuoctinh.map((item, index) => {
      if (item.LuaChon) {
        item.LuaChon.map((itemLuaChon, indexLuaChon) => {
          itemLuaChon.Checked = false
          item.LuaChon[indexLuaChon] = itemLuaChon
        })
        arr[index] = item
      }
      else {
        arr[index] = item
      }
    })
    thuoctinh = arr
    this.state.thuoctinh = thuoctinh
    this.state.luachonSelected = new Array(thuoctinh.length)

    let timeout = []
    for (let i = 0; i < thuoctinh.length; i++) {
      timeout.push({ "searchTieuDeTimeout": null })
    }
    this.state.TimeOut = timeout
    this.state.tbBanGhi = []
    this.state.thuoctinhBanGhi = cmFunction.clone(thuoctinh)
    this.forceUpdate()
  }
  _handleNhomDanhMucChangeAddNew = (sel) => {
    this.state.nhomdanhmucSelectedAddNew = sel
    this.forceUpdate()
  }
  _handleLoaiDanhMucChange = (sel) => {
    let loaidanhmuc = cmFunction.clone(sel)
    this.state.loaidanhmucSelected = loaidanhmuc
    this.state.form.LoaiDanhMuc = loaidanhmuc
    this.forceUpdate()
  }
  _handleLSelectChange = (sel, index) => {
    let luachonSelected = cmFunction.clone(sel)
    let luachon = cmFunction.clone(this.state.thuoctinh[index].LuaChon)
    luachon = cmFunction.convertSelectOptions(luachon, "GiaTri", "TieuDe")
    let arr = []
    luachon = luachon.map((item, index) => {
      if (cmFunction.compareObject(item, luachonSelected)) {
        item.Checked = true
      }
      else {
        item.Checked = false
      }
      arr[index] = item
    })
    luachon = arr
    this.state.thuoctinhBanGhi[index].LuaChon = luachon
    this.state.luachonSelected[index] = luachonSelected
    this.forceUpdate()
  }
  _handleChangeVanBanSuaDoi = (evt) => {
    this.state.vanbansuadoi[evt.target.id] = evt.target.value
    this.forceUpdate()
  }


  //Load
  _handleLoadOptions = (inputValue, callback) => {
    clearTimeout(this.state.searchTimeout);
    this.state.searchTimeout = setTimeout(async () => {
      let filter = {}
      filter.page = 1
      filter.pagesize = 1000
      filter.count = true
      filter.filter = JSON.stringify({ Ten: cmFunction.regexText(inputValue), KichHoat: true });
      filter = new URLSearchParams(filter).toString()
      let dsNhomDanhMuc = await tbNhomDanhMuc.getAll(filter)
      dsNhomDanhMuc = (dsNhomDanhMuc && dsNhomDanhMuc._embedded ? dsNhomDanhMuc._embedded : [])
      let nhomdanhmuc = cmFunction.convertSelectOptions(dsNhomDanhMuc, '_id.$oid', 'Ten')
      this.state.nhomdanhmuc = nhomdanhmuc
      this.forceUpdate()
      callback(nhomdanhmuc);
    }, 500);
  };
  _handleLoadOptionsLinhVuc = (inputValue, callback) => {
    clearTimeout(this.state.searchLinhVucTimeout);
    this.state.searchLinhVucTimeout = setTimeout(async () => {
      let filter = {}
      filter.page = 1
      filter.pagesize = 1000
      filter.count = true
      filter.filter = JSON.stringify({ Ten: cmFunction.regexText(inputValue), KichHoat: true });
      filter = new URLSearchParams(filter).toString()
      let dsLinhVuc = await tbLinhVuc.getAll(filter)
      dsLinhVuc = (dsLinhVuc && dsLinhVuc._embedded ? dsLinhVuc._embedded : [])
      let linhvuc = cmFunction.convertSelectOptions(dsLinhVuc, '_id.$oid', 'Ten')
      this.state.linhvuc = linhvuc
      this.forceUpdate()
      callback(linhvuc);
    }, 500);
  };
  _handleLoadLoaiDanhMucOptions = (inputValue, callback) => {
    clearTimeout(this.state.searchLoaiDanhMucTimeout);
    this.state.searchLoaiDanhMucTimeout = setTimeout(async () => {
      let filter = {}
      filter.page = 1
      filter.pagesize = 1000
      filter.count = true
      filter.filter = JSON.stringify({ 'MaDanhMuc': 'LoaiDanhMuc' });
      filter = new URLSearchParams(filter).toString()
      let LoaiDanhMuc = await tbDanhMucUngDung.getAll(filter)
      LoaiDanhMuc = (LoaiDanhMuc && LoaiDanhMuc._embedded ? LoaiDanhMuc._embedded : [])
      let loaidanhmuc = cmFunction.convertSelectOptions(LoaiDanhMuc, '_id.$oid', 'Ten')
      this.state.loaidanhmuc = loaidanhmuc
      this.forceUpdate()
      callback(loaidanhmuc);
    }, 500);
  };
  _handleLoadTieuDeOptions = (inputValue, callback, index) => {
    clearTimeout(this.state.TimeOut[index].searchTieuDeTimeout);
    this.state.TimeOut[index].searchTieuDeTimeout = setTimeout(async () => {
      let nhomtieude = cmFunction.clone(this.state.thuoctinh[index].LuaChon)
      nhomtieude = cmFunction.convertSelectOptions(nhomtieude, 'GiaTri', 'TieuDe')
      this.forceUpdate()
      callback(nhomtieude);
    }, 500);
  };

  // Check
  _checkRole = (LoginRes) => {
    let check = LoginRes.roles.Ma
    let flag = false
    if (check) {
      check = check.map((item, index) => {
        if (item === "QUAN_LY_DANH_MUC" || item === 'QUAN_TRI_HE_THONG') {
          flag = true
        }
      })
    }
    return flag
  }
  _checkRoleThuTruong = (LoginRes) => {
    let check = LoginRes.roles.Ma
    let flag = false
    check = check.map((item, index) => {
      if (item === "THU_TRUONG_DON_VI") {
        flag = true
      }
    })
    return flag
  }
  _checkItemCheckBox = (item, indexCheck) => {
    return item.LuaChon[indexCheck].Checked
  }
  _checkItemRadio = (item, indexCheck) => {
    return item.LuaChon[indexCheck].Checked
  }
  _checkDanhMuc = async (Ma) => {
    let flag = false
    if (Ma) {
      let filter = {}
      filter.page = 1
      filter.pagesize = 1000
      filter.count = true
      filter.filter = JSON.stringify({ 'Ma': Ma });
      filter = new URLSearchParams(filter).toString()
      let dsdanhmuc = await tbDanhMuc.getAll(filter)
      dsdanhmuc = (dsdanhmuc && dsdanhmuc._embedded ? dsdanhmuc._embedded : [])
      if (dsdanhmuc.length > 0) {
        flag = true
      }
    }
    this.state.checkdanhmuc = flag
    this.forceUpdate
  }
  _checkNhomDanhMuc = async (Ma) => {
    let flag = false
    let nhomdanhmuc = this.state.nhomdanhmuc
    nhomdanhmuc.map((item, index) => {
      if (item.Ma === Ma) {
        flag = true
      }
    })
    this.state.checknhomdanhmuc = flag
    this.forceUpdate()
  }
  _checLinhVuc = (Ten) => {
    let flag = false
    let linhvuc = this.state.linhvuc
    linhvuc.map((item, index) => {
      if (Ten == item.Ten) {
        flag = true
      }
    })
    this.state.checklinhvuc = flag
    this.forceUpdate
  }
  _checkThuocTinh = (ThuocTinh) => {
    let flag = false
    ThuocTinh.map((item, index) => {
      if (item) {
        flag = true
      }
    })
    return flag
  }
  // Confirm
  _handleConfirm = (_type = 0, _action, _stay = false) => {
    confirmAlert({
      title: `${!_type ? 'Sửa' : (_type < 0 ? 'Xóa' : 'Thêm')} dữ liệu`,
      message: `Xác nhận ${!_type ? 'sửa' : (_type < 0 ? 'xóa' : 'thêm')} dữ liệu`,
      buttons: [
        {
          label: 'Không',
          onClick: () => { return }
        },
        {
          label: 'Có',
          onClick: () => _action(_stay)
        }
      ]
    });
  }
  _handleConfirmApproveDanhMuc = () => {
    confirmAlert({
      title: 'Yêu cầu phê duyệt danh mục',
      message: 'Bạn muốn yêu cầu phê duyệt danh mục này',
      buttons: [
        {
          label: 'Không',
          onClick: () => { return }
        },
        {

          label: 'Có',
          onClick: () => {
            this.state.form.PheDuyet = 1
            this.forceUpdate()
            this._handleSave(false)
            if (cmFunction.formValidate(this, 'form')) {
              this._handleUpdateInfo(false)
            } else {
              ///
              setTimeout(() => {
                confirmAlert({
                  title: 'Dữ liệu không hợp lệ',
                  message: 'Vui lòng nhập đúng định dạng dữ liệu',
                  buttons: [
                    {
                      label: 'Đồng ý',
                      onClick: () => {
                        this.state.form.PheDuyet = 2
                        this.forceUpdate()
                        return
                      }
                    }
                  ]
                });
              }, 500)

              return;
            }
          }
        }
      ]
    });
  }
  _handleConfirmApprove = (id) => {
    confirmAlert({
      title: 'Phê duyệt danh mục',
      message: 'Bạn muốn phê duyệt danh mục này',
      buttons: [
        {
          label: 'Không',
          onClick: () => { return }
        },
        {
          label: 'Có',
          onClick: () => this._handleApprove(id)
        }
      ]
    });
  }
  _handleConfirmUnapprove = (id) => {
    confirmAlert({
      title: 'Bỏ phê duyệt danh mục',
      message: 'Bạn muốn hủy phê duyệt danh mục này',
      buttons: [
        {
          label: 'Không',
          onClick: () => { return }
        },
        {
          label: 'Có',
          onClick: () => this._handleUnapprove(id)
        }
      ]
    });
  }
  _handleConfirmImportExcelUpdate = async (event) => {
    let fileObj = event.target.files[0];
    //just pass the fileObj as parameter
    ExcelRenderer(fileObj, (err, resp) => {
      if (err) {
        console.log(err);
      } else {
        this.setState({
          cols: resp.cols,
          rows: resp.rows
        })
      }
    });
    event.target.value = null;
    setTimeout(() => {
      confirmAlert({
        title: 'Import file excel danh sách bản ghi',
        message: 'Bạn muốn import file excel',
        buttons: [
          {
            label: 'Không',
            onClick: () => {
              this.forceUpdate()
              return
            }
          },
          {
            label: 'Có',
            onClick: () => {
              this._handleImportExcelUpdate()
            }
          }
        ]
      })
    }, 500)
    this.forceUpdate()
  }
  _handleConfirmImportExcelAddNew = async (event) => {
    let fileObj = event.target.files[0];
    ExcelRenderer(fileObj, (err, resp) => {
      if (err) {
        console.log(err);
      } else {
        this.setState({
          cols: resp.cols,
          rows: resp.rows
        })
      }
    });
    event.target.value = null;
    setTimeout(() => {
      confirmAlert({
        title: 'Import file excel danh mục mới',
        message: 'Bạn muốn import file excel',
        buttons: [
          {
            label: 'Không',
            onClick: () => {
              this.forceUpdate()
              return
            }
          },
          {
            label: 'Có',
            onClick: () => {
              this._handleImportExcelAddNew()
            }
          }
        ]
      })
    }, 500)
    this.forceUpdate()
  }
  _handleConfirmImport = (position, index, name) => {
    if (index > 0) {
      setTimeout(() => {
        confirmAlert({
          title: 'File excel chưa nhập ' + name + ' ở vị trí ' + position + '-' + index,
          message: 'Mời bạn import file excel nhập đúng mẫu',
          buttons: [
            {
              label: 'Quay lại',
              onClick: () => {
                this.forceUpdate()
                return
              }
            },
          ]
        });
      }, 500)
    }

    else {
      switch (index) {
        case -1:
          setTimeout(() => {
            confirmAlert({
              title: 'Mã nhóm danh mục không được thay đổi',
              message: 'Mời bạn kiểm tra lại mã nhómdanh mục',
              buttons: [
                {
                  label: 'Quay lại',
                  onClick: () => {
                    this.forceUpdate()
                    return
                  }
                },
              ]
            });
          }, 500)
          break;
        case -2:
          setTimeout(() => {
            confirmAlert({
              title: 'Mã danh mục đã tồn tại',
              message: 'Mời bạn kiểm tra lại mã danh mục',
              buttons: [
                {
                  label: 'Quay lại',
                  onClick: () => {
                    this.forceUpdate()
                    return
                  }
                },
              ]
            });
          }, 500)
          break;
        case -3:
          setTimeout(() => {
            confirmAlert({
              title: 'Tên lĩnh vực không có',
              message: 'Mời bạn kiểm tra lại tên lĩnh vực',
              buttons: [
                {
                  label: 'Quay lại',
                  onClick: () => {
                    this.forceUpdate()
                    return
                  }
                },
              ]
            });
          }, 500)
          break;
        case -4:
          setTimeout(() => {
            confirmAlert({
              title: 'File excel chưa nhập bản ghi',
              message: 'Mời bạn import file excel đã nhập dữ liệu',
              buttons: [
                {
                  label: 'Quay lại',
                  onClick: () => {
                    this.state.value = ''
                    this.forceUpdate()
                    return
                  }
                },
              ]
            });
          }, 500)
          break;
        case -5:
          setTimeout(() => {
            confirmAlert({
              title: 'File excel chưa nhập đúng',
              message: 'Mời bạn import file excel đúng mẫu',
              buttons: [
                {
                  label: 'Quay lại',
                  onClick: () => {
                    this.state.value = ''
                    this.forceUpdate()
                    return
                  }
                },
              ]
            });
          }, 500)
          break;
      }
    }
  }
  // File
  onDropFiles = (files) => {
    let fileTemp = [];
    let icons = CONSTANTS.ICONSET_FOR_FILE;
    files.map(item => {
      let dupl = this.state.documents.findIndex(file => file.name == item.name && file.size == item.size);
      if (dupl >= 0) return;
      let ic = icons.find(ele => ele.type.includes(item.type));
      if (ic) item["icon"] = ic;
      else item["icon"] = CONSTANTS.DEFAULT_IC_FOR_FILE;
      fileTemp.push(item);
    });
    if (!fileTemp.length) return;
    if (fileTemp.length > 1) fileTemp = fileTemp.splice(0, 1);
    this.state.documents = fileTemp;
    this.state.vanbansuadoi.File = fileTemp
    this.state.isFileChanged = true
    this.state.checkDoc = false
    this.forceUpdate();
  }
  onRemoveFile = (data) => {
    if (!data) return;
    let { documents } = this.state;
    let ind = documents.findIndex(ele => ele.name == data.name && ele.type == data.type && ele.size == data.size);
    if (ind >= 0) {
      documents.splice(ind, 1);
      this.state.vanbansuadoi.File.documents = documents
      this.state.checkDoc = false
      this.forceUpdate();
    }
  }
  _handleDownload = async () => {
    let documents = this.state.form.VBBanHanhSuaDoi.File.documents[0]
    let filename = documents.filename
    let originalname = documents.originalname
    let url2 = `${HOST_API}${MEDIA_DOWNLOAD}?q=${filename}`
    saveAs(url2, originalname)
  }
  // data
  dataTableUpdate = () => {
    let danhmucSelected = this.state.danhmucSelected
    let tbBanGhi = []
    let thuoctinh = this.state.nhomdanhmucSelected.ThuocTinh
    if (danhmucSelected) {
      tbBanGhi = danhmucSelected.tbBanGhi
    }
    let danhmucTable = []
    let rowDanhMuc = new Array(1 + thuoctinh.length)
    rowDanhMuc[0] = "STT"
    rowDanhMuc[1] = "Tên bản ghi"
    rowDanhMuc[2] = "Mã bản ghi"
    thuoctinh.map((item, index) => {
      if (item.KieuDuLieu.Ma == "number" || item.KieuDuLieu.Ma == "text") {
        rowDanhMuc[3 + index] = item.Ten + ' (' + item.KieuDuLieu.Ma + ')'
      }
      else if (item.KieuDuLieu.Ma == "date") {
        rowDanhMuc[3 + index] = item.Ten + ' (' + item.KieuDuLieu.Ma + ' mm/dd/yyyy)'
      }
      else {
        rowDanhMuc[3 + index] = item.Ten
      }
    })
    danhmucTable.push(rowDanhMuc)
    tbBanGhi.map((item, index) => {
      let rowDanhMuc = new Array(thuoctinh.length)
      rowDanhMuc[0] = index + 1
      rowDanhMuc[1] = item.TEN
      rowDanhMuc[2] = item.MA

      if (thuoctinh.length > 0) {
        item.ThuocTinh.map((itemThuocTinh, indexThuocTinh) => {
          if (itemThuocTinh.KieuDuLieu.Ma == "number" || itemThuocTinh.KieuDuLieu.Ma == "text") {
            rowDanhMuc[3 + indexThuocTinh] = itemThuocTinh.LuaChon ? itemThuocTinh.LuaChon : ""
          }
          if (itemThuocTinh.KieuDuLieu.Ma == "select" || itemThuocTinh.KieuDuLieu.Ma == "radio") {
            rowDanhMuc[3 + indexThuocTinh] = ""
            itemThuocTinh.LuaChon.map((itemLuaChon, indexLuaChon) => {
              if (itemLuaChon.Checked == true) {
                rowDanhMuc[3 + indexThuocTinh] = itemLuaChon.TieuDe
              }
            })
          }
          if (itemThuocTinh.KieuDuLieu.Ma == "date") {

            if (itemThuocTinh.LuaChon) {
              let date = this._handleConvertDate(itemThuocTinh.LuaChon)
              rowDanhMuc[3 + indexThuocTinh] = date ? date : ""
            }

          }
        })
      }
      danhmucTable.push(rowDanhMuc)
    })
    return danhmucTable

  }
  dataTableAddNew = () => {
    let { nhomdanhmucSelectedAddNew, linhvuc, loaidanhmuc } = this.state
    let thuoctinh = nhomdanhmucSelectedAddNew.ThuocTinh ? nhomdanhmucSelectedAddNew.ThuocTinh : []
    let danhmucTable = []
    let rowDanhMuc = new Array(12 + thuoctinh.length)
    rowDanhMuc[0] = "STT"
    rowDanhMuc[1] = "Tên Danh Mục (Bắt buộc)"
    rowDanhMuc[2] = "Mã Danh Mục (Bắt buộc)"
    rowDanhMuc[3] = "Cơ quan ban hành văn bản"
    rowDanhMuc[4] = "Ngày ban hành (date mm/dd/yyyy)"
    rowDanhMuc[5] = "Văn bản ban hành sửa đổi"
    rowDanhMuc[6] = "Link văn bản"
    rowDanhMuc[7] = "Loại Danh Mục"
    rowDanhMuc[8] = "Mã Nhóm danh mục (Không được thay đổi)"
    rowDanhMuc[9] = "Lĩnh vực (bắt buộc)"
    rowDanhMuc[10] = "Tên bản ghi"
    rowDanhMuc[11] = "Mã bản ghi"
    thuoctinh.map((item, index) => {
      if (item.KieuDuLieu.Ma == "text" || item.KieuDuLieu.Ma == "number") {
        rowDanhMuc[12 + index] = item.Ten + '(' + item.KieuDuLieu.Ma + ')'
      }
      else if (item.KieuDuLieu.Ma == "date") {
        rowDanhMuc[12 + index] = item.Ten + '(' + item.KieuDuLieu.Ma + ' mm/dd/yyyy)'
      }
      else {
        rowDanhMuc[12 + index] = item.Ten
      }
    })
    danhmucTable.push(rowDanhMuc)
    rowDanhMuc = new Array(12 + thuoctinh.length)
    rowDanhMuc[0] = ""
    rowDanhMuc[1] = ""
    rowDanhMuc[2] = ""
    rowDanhMuc[3] = ""
    rowDanhMuc[4] = ""
    rowDanhMuc[5] = ""
    rowDanhMuc[6] = ""
    rowDanhMuc[7] = ""
    rowDanhMuc[8] = nhomdanhmucSelectedAddNew.Ma
    rowDanhMuc[9] = ""
    rowDanhMuc[10] = ""
    rowDanhMuc[11] = ""
    thuoctinh.map((item, index) => {
      rowDanhMuc[12 + index] = ""
    })
    danhmucTable.push(rowDanhMuc)
    return danhmucTable
  }

  //ACTION
  _handleConvertDate = (Date) => {
    var splitDate = Date.split('-');
    if (splitDate.count == 0) {
      return null;
    }
    var year = splitDate[0];
    var month = splitDate[1];
    var day = splitDate[2];
    return month + '/' + day + '/' + year;
  }
  _handleConvertString = (Date) => {
    var splitDate = Date.split('/');
    if (splitDate.count == 0) {
      return null;
    }
    var month = splitDate[0];
    var day = splitDate[1];
    var year = splitDate[2];
    return year + '-' + month + '-' + day;
  }
  _handleFindNhomDanhMuc = (Ma) => {
    let nhomdanhmuc = this.state.nhomdanhmuc
    let nhomdanhmucFinded = {}
    nhomdanhmuc = nhomdanhmuc.map((item, index) => {
      if (Ma === item.Ma) {
        nhomdanhmucFinded = item
      }
    })
    return nhomdanhmucFinded
  }
  _handleFindLinhVuc = (Ten) => {
    let linhvuc = this.state.linhvuc
    let linhvucFinded = {}
    linhvuc.map((item, index) => {
      if (Ten === item.Ten) {
        linhvucFinded = item
      }
    })
    return linhvucFinded
  }
  _handleFindLoaiDanhMuc = (Ten) => {
    let loaidanhmuc = this.state.loaidanhmuc
    let loaidanhmucFinded = {}
    loaidanhmuc.map((item, index) => {
      if (Ten === item.Ten) {
        loaidanhmucFinded = item
      }
    })
    return loaidanhmucFinded
  }
  _handleUpdateInfo = async (stay) => {
    let { form, isInsert, isFileChanged, vanbansuadoi, documents } = this.state
    form.tbBanGhi = this.state.tbBanGhi
    if (isInsert) {
      form.PheDuyet = this.state.PheDuyet
    }
    let axiosRes, axiosReq = cmFunction.clone(form)
    axiosReq.STT = Number(axiosReq.STT || 9999);
    axiosReq.VBBanHanhSuaDoi = null;
    if (isFileChanged) {
      let documentsRes = await mediaServices.uploadFiles({ documents: documents })
      if (!documentsRes) {
        this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Không thể tải tệp đính kèm, vui lòng kiểm tra lại' }))
        return
      }
      vanbansuadoi.File = documentsRes
    }
    if (vanbansuadoi) {
      axiosReq.VBBanHanhSuaDoi = vanbansuadoi
    }
    if (isInsert) {
      axiosRes = await tbDanhMuc.create(axiosReq)
    } else {
      let id = this.props.match.params.id;
      axiosRes = await tbDanhMuc.updateById(id, axiosReq)
    }
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' }))
      if (isInsert) {
        this.state.form = {}
        this.state.loaidanhmucSelected = []
        this.state.nhomdanhmucSelected = []
        this.state.nhomtieudeSelected = []
        this.state.luachonSelected = []
        this.state.luachon = []
        this.state.thuoctinh = []
        this.state.vanbansuadoi = {
          Ten: "",
          Link: "",
          File: []
        }
        this.state.luachonSelected = []
        this.state.thuoctinhBanGhi = []
        this.state.formModal = {}
        this.state.tbBanGhi = []
        this.state.linhvucSelected = []
        this.forceUpdate()
      }
      if (!stay) cmFunction.goBack()
    }
    else {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Không thành công' }))
    }
  }
  _handleApprove = async (id) => {
    let axiosReq = { PheDuyet: 3 }//await tbUsers.getById(id);
    let axiosRes = await tbDanhMuc.updateById(id, axiosReq);
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' }))
      cmFunction.goBack()
    }
    else {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Không thành công' }))
    }
  }
  _handleUnapprove = async (id) => {
    let axiosReq = { PheDuyet: 2 }//await tbUsers.getById(id);
    let axiosRes = await tbDanhMuc.updateById(id, axiosReq);
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' }))
      cmFunction.goBack()

    }
    else {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Không thành công' }))
    }
  }
  _handleAddToggle = () => {
    this.state.modalIsOpen = !this.state.modalIsOpen
    this.state.modalEditIndex = -1
    this.forceUpdate()
  }
  _handleModalMission = (modalMission) => {
    if (modalMission) {
      let thuoctinh = cmFunction.clone(this.state.thuoctinh)
      thuoctinh.map((item, index) => {
        if (item.KieuDuLieu.Ma == 'select' || item.KieuDuLieu.Ma == 'radio') {
          item.LuaChon.map((itemLuaChon, indexLuaChon) => {
            itemLuaChon.Checked = false
            item.LuaChon[indexLuaChon] = itemLuaChon
          })
          thuoctinh[index] = item
        }
        else {
          item.LuaChon = ""
          thuoctinh[index] = item
        }
      })
      this.state.saveAction = true
      this.state.formModal = {}
      this.state.luachonSelected = new Array(this.state.thuoctinhBanGhi.length)
      this.state.thuoctinhBanGhi = thuoctinh
    }
    this.state.modalMission = modalMission
    this.state.modalIsOpen = !this.state.modalIsOpen
    this.state.modalEditIndex = -1
    this.forceUpdate()
  }
  _handleEditOptions = (index) => {
    let tbBanGhi = cmFunction.clone(this.state.tbBanGhi)
    let thuoctinh = tbBanGhi[index].ThuocTinh
    let luachonSelected = new Array(cmFunction.clone(thuoctinh.length))
    thuoctinh.map((itemThuocTinh, indexThuocTinh) => {
      if (itemThuocTinh.KieuDuLieu.Ma == "select") {
        let dsluachon = cmFunction.convertSelectOptions(itemThuocTinh.LuaChon, "TieuDe", "GiaTri")
        dsluachon.map((itemLuaChon, indexLuaChon) => {
          if (itemLuaChon.Checked == true) {
            luachonSelected[indexThuocTinh] = itemLuaChon
          }
        })
      }
      else {
        luachonSelected[indexThuocTinh] = []
      }
    })
    this.state.saveAction = false
    this.state.luachonSelected = luachonSelected
    this.state.formModal = cmFunction.clone(tbBanGhi[index])
    this.state.thuoctinhBanGhi = cmFunction.clone(tbBanGhi[index].ThuocTinh)
    this.state.modalEditIndex = index
    this.state.modalIsOpen = true
    this.forceUpdate()
  }
  _handleDeleteOptions = (index) => {
    this.state.tbBanGhi.splice(index, 1)
    this.forceUpdate()
  }
  _handleDelete = async () => {
    if (this.state.isInsert) return
    let { id } = this.props.match.params
    let axiosRes = await tbDanhMuc.deleteById(id)
    if (axiosRes) {
      this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: "Xóa thành công" }))
      cmFunction.goBack()
    }
  }
  _handleSave = (stay) => {
    if (cmFunction.formValidate(this, 'form')) {
      this._handleConfirm(this.state.isInsert, this._handleUpdateInfo, stay)
    } else {
      confirmAlert({
        title: 'Dữ liệu không hợp lệ',
        message: 'Vui lòng nhập đúng định dạng dữ liệu',
        buttons: [
          {
            label: 'Đồng ý',
            onClick: () => { return }
          }
        ]
      });
      return;
    }
  }
  _handleSaveOptions = (stay) => {
    let { formModal, modalEditIndex, thuoctinh, thuoctinhBanGhi, saveAction } = this.state
    formModal.ThuocTinh = cmFunction.clone(thuoctinhBanGhi)
    if (cmFunction.formValidate(this, 'formModal')) {
      if (modalEditIndex !== -1) {
        this.state.tbBanGhi[modalEditIndex] = cmFunction.clone(formModal)
      } else {
        this.state.tbBanGhi.push(cmFunction.clone(formModal))
        this.state.formModal = {}
      }

      if (!stay) {
        this.forceUpdate()
        this._handleAddToggle()
      }
      else {
        if (saveAction) {
          let thuoctinh = cmFunction.clone(this.state.thuoctinh)
          thuoctinh.map((item, index) => {
            if (item.KieuDuLieu.Ma == 'select' || item.KieuDuLieu.Ma == 'radio') {
              item.LuaChon.map((itemLuaChon, indexLuaChon) => {
                itemLuaChon.Checked = false
                item.LuaChon[indexLuaChon] = itemLuaChon
              })
              thuoctinh[index] = item
            }
            else {
              item.LuaChon = ""
              thuoctinh[index] = item
            }
          })
          this.state.formModal = {}
          this.state.luachonSelected = new Array(this.state.thuoctinhBanGhi.length)
          this.state.thuoctinhBanGhi = thuoctinh
        }
        this.forceUpdate()
      }
    } else {
      confirmAlert({
        title: 'Dữ liệu không hợp lệ',
        message: 'Vui lòng nhập đúng định dạng dữ liệu',
        buttons: [
          {
            label: 'Đồng ý',
            onClick: () => {
              return;
            },
          },
        ],
      });
      return;
    }
  }
  _handleDownloadUpdate = async () => {
    let danhmucTable = this.dataTableUpdate()
    setTimeout(() => {
      this._handleExportExcelUpdate(danhmucTable)
    }, 500)
  }
  _handleDownloadAddNew = async () => {
    let danhmucTable = this.dataTableAddNew()
    setTimeout(() => {
      this._handleExportExcelAddNew(danhmucTable)
    }, 500)
  }
  _handleExportExcelUpdate = async (danhmucTable) => {
    const wb = new Excel.Workbook();
    const ws = wb.addWorksheet('DsBanGhi');
    let { danhmucSelected, nhomdanhmucSelected } = this.state
    let dataTable = []
    let soLuongBanGhi = danhmucSelected.tbBanGhi.length
    let tbBanGhi = danhmucSelected.tbBanGhi
    let thuoctinh = nhomdanhmucSelected.ThuocTinh
    let date = cmFunction.timestamp2DateString(moment().valueOf())

    ws.addRows(danhmucTable);
    thuoctinh.map((item, index) => {
      if (item.KieuDuLieu.Ma == "select" || item.KieuDuLieu.Ma == "radio") {
        let luachonThuocTinh = ''
        for (let i = 0; i < item.LuaChon.length; i++) {
          luachonThuocTinh += item.LuaChon[i].TieuDe + ','
        }
        for (let i = 0; i < soLuongBanGhi + 100; i++) {
          ws.getCell(String.fromCharCode(67 + index + 1) + (2 + i)).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: ['"' + luachonThuocTinh + '"']
          };
        }
      }
      if (item.KieuDuLieu.Ma == "date") {
        for (let i = 0; i < soLuongBanGhi + 100; i++) {
          ws.getCell(String.fromCharCode(67 + index + 1) + (2 + i)).dataValidation = {
            type: 'date',
            operator: 'greaterThan',
            showErrorMessage: true,
            allowBlank: true,
            formulae: [new Date(1910, 0, 1)],
            error: 'Giá trị nhập vào là kiểu date'
          };
          ws.getColumn(4 + index).numFmt = 'mm/dd/yyyy';

        }
      }
      if (item.KieuDuLieu.Ma == "number") {
        for (let i = 0; i < soLuongBanGhi + 100; i++) {
          ws.getCell(String.fromCharCode(67 + index + 1) + (2 + i)).dataValidation = {
            type: 'whole',
            showErrorMessage: true,
            errorStyle: 'error',
            errorTitle: 'Five',
            error: 'Giá trị nhập vào là kiểu number'
          };
        }
      }
      if (item.KieuDuLieu.Ma == "text") {
        for (let i = 0; i < soLuongBanGhi + 100; i++) {
          ws.getCell(String.fromCharCode(67 + index + 1) + (2 + i)).dataValidation = {
            type: 'textLength',
            showErrorMessage: true,
            allowBlank: true,
            error: 'Giá trị nhập vào là kiểu text'
          };
        }
      }
    })
    ws.getRow(1).font = { name: 'Times New Roman', family: 2, size: 10, bold: true };
    for (let i = 0; i < thuoctinh.length + 3; i++) {
      ws.getCell(String.fromCharCode(65 + i) + 1).alignment = { vertical: 'top', horizontal: 'center' };
    }

    for (let i = 0; i < soLuongBanGhi + 1; i++) {
      for (let j = 0; j < thuoctinh.length + 3; j++) {
        ws.getCell(String.fromCharCode(65 + j) + (i + 1)).border = {
          top: { style: 'thin', color: { argb: '00000000' } },
          left: { style: 'thin', color: { argb: '00000000' } },
          bottom: { style: 'thin', color: { argb: '00000000' } },
          right: { style: 'thin', color: { argb: '00000000' } }
        }
      }
    }
    for (let i = 1; i < soLuongBanGhi + 1; i++) {
      for (let j = 0; j < thuoctinh.length + 3; j++) {
        ws.getCell(String.fromCharCode(65 + j) + (i + 1)).alignment = { vertical: 'top', horizontal: 'left' };
      }
    }
    wb.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
      saveAs(blob, 'DanhMuc_' + danhmucSelected.Ten + '_' + date + '.xlsx');
    });


  }
  _handleExportExcelAddNew = async (danhmucTableAddNew) => {
    const wb = new Excel.Workbook();
    const ws = wb.addWorksheet('ThemDanhMuc');
    let { nhomdanhmucSelectedAddNew, loaidanhmuc, linhvuc } = this.state
    let thuoctinh = nhomdanhmucSelectedAddNew.ThuocTinh
    ws.addRows(danhmucTableAddNew);
    let luachonLoaiDanhMuc = ''
    let luachonLinhVuc = ''
    loaidanhmuc.map((item, index) => {
      luachonLoaiDanhMuc += item.Ten + ','
    })
    linhvuc.map((item, index) => {
      luachonLinhVuc += item.Ten + ','
    })

    ws.getCell('H2').dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"' + luachonLoaiDanhMuc + '"']
    };

    ws.getCell('J2').dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: ['"' + luachonLinhVuc + '"']
    };

    thuoctinh.map((item, index) => {
      if (item.KieuDuLieu.Ma == "select" || item.KieuDuLieu.Ma == "radio") {
        let luachonThuocTinh = ''
        for (let i = 0; i < item.LuaChon.length; i++) {
          luachonThuocTinh += item.LuaChon[i].TieuDe + ','
        }
        for (let i = 0; i < 100; i++) {
          ws.getCell(String.fromCharCode(76 + index + 1) + (2 + i)).dataValidation = {
            type: 'list',
            allowBlank: true,
            formulae: ['"' + luachonThuocTinh + '"']
          };
        }
      }
      if (item.KieuDuLieu.Ma == "date") {
        for (let i = 0; i < 100; i++) {
          ws.getCell(String.fromCharCode(76 + index + 1) + (2 + i)).dataValidation = {
            type: 'date',
            operator: 'greaterThan',
            showErrorMessage: true,
            allowBlank: true,
            formulae: [new Date(1900, 0, 1)],
            error: 'Giá trị nhập vào là kiểu date'
          };
          ws.getColumn(13 + index).numFmt = 'mm/dd/yyyy';
        }
      }
      if (item.KieuDuLieu.Ma == "number") {
        for (let i = 0; i < 100; i++) {
          ws.getCell(String.fromCharCode(76 + index + 1) + (2 + i)).dataValidation = {
            type: 'whole',
            showErrorMessage: true,
            errorStyle: 'error',
            errorTitle: 'Five',
            error: 'Giá trị nhập vào là kiểu number'
          };
        }
      }
      if (item.KieuDuLieu.Ma == "text") {
        for (let i = 0; i < 100; i++) {
          ws.getCell(String.fromCharCode(76 + index + 1) + (2 + i)).dataValidation = {
            type: 'textLength',
            showErrorMessage: true,
            allowBlank: true,
            error: 'Giá trị nhập vào là kiểu text'
          };
        }
      }
    })
    ws.getRow(1).font = { name: 'Times New Roman', family: 2, size: 10, bold: true };
    for (let i = 0; i < 12 + thuoctinh.length; i++) {
      ws.getCell(String.fromCharCode(65 + i) + 1).alignment = { vertical: 'top', horizontal: 'center' };
    }

    for (let i = 0; i < 2; i++) {
      for (let j = 0; j < 12 + thuoctinh.length; j++) {
        ws.getCell(String.fromCharCode(65 + j) + (i + 1)).border = {
          top: { style: 'thin', color: { argb: '00000000' } },
          left: { style: 'thin', color: { argb: '00000000' } },
          bottom: { style: 'thin', color: { argb: '00000000' } },
          right: { style: 'thin', color: { argb: '00000000' } }
        }
      }
    }
    for (let j = 0; j < 12 + thuoctinh.length; j++) {
      ws.getCell(String.fromCharCode(65 + j) + 2).alignment = { vertical: 'top', horizontal: 'left' };
    }

    ws.getCell('E2').dataValidation = {
      type: 'date',
      operator: 'greaterThan',
      showErrorMessage: true,
      allowBlank: true,
      formulae: [new Date(2010, 0, 1)],
      error: 'Giá trị nhập vào là kiểu date'
    }

    ws.getColumn(5).numFmt = 'mm/dd/yyyy'

    wb.xlsx.writeBuffer().then((data) => {
      const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
      saveAs(blob, 'ThemDanhMuc.xlsx');
    });

  }
  _handleImportExcelUpdate = async () => {
    let { danhmucSelected, nhomdanhmucSelected } = this.state
    let rows = this.state.rows
    let flag = true
    let form = {}
    let tbBanGhi = []
    let thuoctinhMau = nhomdanhmucSelected.ThuocTinh ? cmFunction.clone(nhomdanhmucSelected.ThuocTinh) : []
    thuoctinhMau.map((item, index) => {
      if (item.KieuDuLieu.Ma == 'select' || item.KieuDuLieu.Ma == 'radio') {
        item.LuaChon.map((itemLuaChon, indexLuaChon) => {
          itemLuaChon.Checked = false
          item.LuaChon[indexLuaChon] = itemLuaChon
        })
        thuoctinhMau[index] = item
      }
      else {
        item.LuaChon = ""
        thuoctinhMau[index] = item
      }
    })
    if (rows.length > 1) {
      rows = rows.map((item, index) => {
        if (index > 0 && item.length > 0) {

          let banghi = {}
          let thuoctinh = cmFunction.clone(thuoctinhMau)
          form.STT = item[0]
          form.Ten = danhmucSelected.Ten
          form.Ma = danhmucSelected.Ma
          form.CoQuanBanHanhVB = danhmucSelected.CoQuanBanHanhVB ? danhmucSelected.CoQuanBanHanhVB : null
          form.NgayBanHanh = danhmucSelected.NgayBanHanh ? danhmucSelected.NgayBanHanh : null
          form.vanbansuadoi = danhmucSelected.VBBanHanhSuaDoi ? danhmucSelected.VBBanHanhSuaDoi : {}
          form.LoaiDanhMuc = danhmucSelected.LoaiDanhMuc ? danhmucSelected.LoaiDanhMuc : []
          form.NhomDanhMuc = danhmucSelected.NhomDanhMuc
          form.Cap = danhmucSelected.NhomDanhMuc.Cap
          form.LinhVuc = danhmucSelected.LinhVuc
          form.DonViCha = danhmucSelected.LinhVuc
          form.KichHoat = true

          let itemthuoctinh = []
          thuoctinh.map((itemThuocTinh, indexThuocTinh) => {
            itemthuoctinh.push(item[3 + indexThuocTinh])
          })
          let checkthuoctinh = this._checkThuocTinh(itemthuoctinh)
          let checkitem1 = Boolean(item[1])
          let checkitem2 = Boolean(item[2])

          if (!checkitem1 && checkitem2) {
            flag = false
            this._handleConfirmImport('B', index + 1, 'tên bản ghi')
          }
          else if (checkitem1 && !checkitem2) {
            flag = false
            this._handleConfirmImport('C', index + 1, 'mã bản ghi')
          }
          else if (!checkitem1 && !checkitem2) {
            if (checkthuoctinh) {
              flag = false
              this._handleConfirmImport('B, C', index + 1, 'tên và mã bản ghi')
            }
          }
          else {
            if (checkthuoctinh) {
              banghi.TEN = item[1]
              banghi.MA = item[2]
              thuoctinh.map((itemThuocTinh, indexThuocTinh) => {
                if (itemThuocTinh.KieuDuLieu.Ma == "number" || itemThuocTinh.KieuDuLieu.Ma == "text") {
                  itemThuocTinh.LuaChon = item[3 + indexThuocTinh]
                }
                else if (itemThuocTinh.KieuDuLieu.Ma == "date") {
                  if (typeof item[3 + indexThuocTinh] === "number") {
                    let date = new Date((cmFunction.clone(item[3 + indexThuocTinh]) - (25567 + 2)) * 86400 * 1000);
                    itemThuocTinh.LuaChon = cmFunction.timestamp2DateString(date, "YYYY-MM-DD")
                  }
                  else if (typeof item[3 + indexThuocTinh] === "string") {
                    itemThuocTinh.LuaChon = this._handleConvertString(item[3 + indexThuocTinh])
                  }
                }
                else {
                  itemThuocTinh.LuaChon.map((itemLuaChon, indexLuaChon) => {
                    if (itemLuaChon.TieuDe == item[3 + indexThuocTinh]) {
                      itemThuocTinh.LuaChon[indexLuaChon].Checked = true
                    }
                  })
                }
                thuoctinh[indexThuocTinh] = itemThuocTinh
              })
              banghi.ThuocTinh = thuoctinh
              tbBanGhi.push(banghi)
            }
            else {
              banghi.TEN = item[1]
              banghi.MA = item[2]
              banghi.ThuocTinh = thuoctinh
              tbBanGhi.push(banghi)
            }
          }
        }
      }
      )
      form.tbBanGhi = tbBanGhi
      if (flag) {
        let axiosRes, axiosReq = cmFunction.clone(form)
        let id = this.props.match.params.id
        axiosRes = await tbDanhMuc.updateById(id, axiosReq)
        if (axiosRes) {
          this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' }))
        }
        else {
          this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Không thành công' }))
        }
        this.forceUpdate()
      }
    }
    else {
      this._handleConfirmImport('', 0)
    }
    // cmFunction.goBack()
  }
  _handleImportExcelAddNew = async () => {
    let rows = cmFunction.clone(this.state.rows)
    let flag = true
    let form = {}
    let tbBanGhi = []
    let thuoctinhMau = []
    if (rows.length > 1) {
      this._checkDanhMuc(rows[1][2])
      this._checkNhomDanhMuc(rows[1][8])
      this._checLinhVuc(rows[1][9])
      setTimeout(async () => {
        let { checknhomdanhmuc, checkdanhmuc, checklinhvuc } = this.state
        if (!checkdanhmuc && checknhomdanhmuc && checklinhvuc && rows[1][1] && rows[1][2]) {
          rows = rows.map((item, index) => {
            if (index == 1 && item.length > 0) {
              let banghi = {}
              let vanbansuadoi = {}
              let nhomdanhmuc = this._handleFindNhomDanhMuc(item[8]) ? this._handleFindNhomDanhMuc(item[8]) : ''
              let linhvuc = this._handleFindLinhVuc(item[9])
              let loaidanhmuc = this._handleFindLoaiDanhMuc(item[7])
              let thuoctinh = nhomdanhmuc.ThuocTinh
              thuoctinh.map((item, index) => {
                if (item.LuaChon) {
                  item.LuaChon.map((itemLuaChon, indexLuaChon) => {
                    itemLuaChon.Checked = false
                    item.LuaChon[indexLuaChon] = itemLuaChon
                  })
                  thuoctinh[index] = item
                }
                else {
                  thuoctinh[index] = item
                }
              })
              thuoctinhMau = cmFunction.clone(thuoctinh)
              form.STT = item[0]
              form.Ten = item[1]
              form.Ma = item[2]
              form.CoQuanBanHanhVB = item[3]
              if (item[4] == "") {
                form.NgayBanHanh = ""
              }
              else if (typeof item[4] === "number") {
                let date = new Date((item[4] - (25567 + 2)) * 86400 * 1000);
                form.NgayBanHanh = cmFunction.timestamp2DateString(date, "YYYY-MM-DD")
              }
              else if (typeof item[4] === "string") {
                form.NgayBanHanh = this._handleConvertString(item[4])
              }
              vanbansuadoi.Ten = item[5] ? item[5] : ""
              vanbansuadoi.Link = item[6] ? item[6] : ""
              vanbansuadoi.File = []
              form.LoaiDanhMuc = loaidanhmuc ? loaidanhmuc : ""
              form.VBBanHanhSuaDoi = vanbansuadoi
              form.NhomDanhMuc = nhomdanhmuc
              form.Cap = nhomdanhmuc.Cap
              form.LinhVuc = linhvuc
              form.DonViCha = linhvuc.DonViCha
              form.KichHoat = true
              let itemthuoctinh = []
              thuoctinh.map((itemThuocTinh, indexThuocTinh) => {
                itemthuoctinh.push(item[12 + indexThuocTinh])
              })
              let checkthuoctinh = this._checkThuocTinh(itemthuoctinh)
              let checkitem10 = Boolean(item[10])
              let checkitem11 = Boolean(item[11])

              if (!checkitem10 && checkitem11) {
                flag = false
                this._handleConfirmImport('K', index + 1, 'tên bản ghi')
              }
              else if (checkitem10 && !checkitem11) {
                flag = false
                this._handleConfirmImport('L', index + 1, 'mã bản ghi')
              }
              else if (!checkitem10 && !checkitem11) {
                if (checkthuoctinh) {
                  flag = false
                  this._handleConfirmImport('K, L', index + 1, 'tên và mã bản ghi')
                }
              }
              else {
                if (checkthuoctinh) {
                  banghi.TEN = item[10]
                  banghi.MA = item[11]
                  thuoctinh.map((itemThuocTinh, indexThuocTinh) => {
                    if (itemThuocTinh.KieuDuLieu.Ma == "number" || itemThuocTinh.KieuDuLieu.Ma == "text") {
                      itemThuocTinh.LuaChon = item[12 + indexThuocTinh]
                    }
                    else if (itemThuocTinh.KieuDuLieu.Ma == "date") {
                      if (item[12 + indexThuocTinh] == "") {
                        itemThuocTinh.LuaChon = ""
                      }
                      else if (typeof item[12 + indexThuocTinh] === "number") {
                        let date = new Date((item[12 + indexThuocTinh] - (25567 + 2)) * 86400 * 1000);
                        itemThuocTinh.LuaChon = cmFunction.timestamp2DateString(date, "YYYY-MM-DD")

                      }
                      else if (typeof item[12 + indexThuocTinh] === "string") {
                        itemThuocTinh.LuaChon = this._handleConvertString(item[12 + indexThuocTinh])
                      }
                    }
                    if (itemThuocTinh.KieuDuLieu.Ma == "select" || itemThuocTinh.KieuDuLieu.Ma == "radio") {
                      itemThuocTinh.LuaChon.map((itemLuaChon, indexLuaChon) => {
                        if (itemLuaChon.TieuDe == item[12 + indexThuocTinh]) {
                          itemThuocTinh.LuaChon[indexLuaChon].Checked = true
                        }
                      })
                    }
                    thuoctinh[indexThuocTinh] = itemThuocTinh
                  })
                  banghi.ThuocTinh = thuoctinh
                  tbBanGhi.push(banghi)
                }
                else {
                  banghi.TEN = item[10]
                  banghi.MA = item[11]
                  banghi.ThuocTinh = thuoctinh
                  tbBanGhi.push(banghi)
                }
              }
            }
            if (index > 1 && item.length > 0) {
              let banghi = {}
              let thuoctinh = cmFunction.clone(thuoctinhMau)
              let itemthuoctinh = []
              thuoctinh.map((itemThuocTinh, indexThuocTinh) => {
                itemthuoctinh.push(item[12 + indexThuocTinh])
              })
              let checkthuoctinh = this._checkThuocTinh(itemthuoctinh)
              let checkitem10 = Boolean(item[10])
              let checkitem11 = Boolean(item[11])

              if (!checkitem10 && checkitem11) {
                flag = false
                this._handleConfirmImport('K', index + 1, 'tên bản ghi')
              }
              else if (checkitem10 && !checkitem11) {
                flag = false
                this._handleConfirmImport('L', index + 1, 'mã bản ghi')
              }
              else if (!checkitem10 && !checkitem11) {
                if (checkthuoctinh) {
                  flag = false
                  this._handleConfirmImport('K, L', index + 1, 'tên và mã bản ghi')
                }
              }
              else {
                if (checkthuoctinh) {
                  banghi.TEN = item[10]
                  banghi.MA = item[11]
                  thuoctinh.map((itemThuocTinh, indexThuocTinh) => {
                    if (itemThuocTinh.KieuDuLieu.Ma == "number" || itemThuocTinh.KieuDuLieu.Ma == "text") {
                      itemThuocTinh.LuaChon = item[12 + indexThuocTinh]
                    }
                    else if (itemThuocTinh.KieuDuLieu.Ma == "date") {
                      if (item[12 + indexThuocTinh] == "") {
                        itemThuocTinh.LuaChon = ""
                      }
                      else if (typeof item[12 + indexThuocTinh] === "number") {
                        let date = new Date((item[12 + indexThuocTinh] - (25567 + 2)) * 86400 * 1000);
                        itemThuocTinh.LuaChon = cmFunction.timestamp2DateString(date, "YYYY-MM-DD")
                      }
                      else if (typeof item[12 + indexThuocTinh] === "string") {
                        itemThuocTinh.LuaChon = this._handleConvertString(item[12 + indexThuocTinh])
                      }
                    }
                    if (itemThuocTinh.KieuDuLieu.Ma == "select" || itemThuocTinh.KieuDuLieu.Ma == "radio") {
                      itemThuocTinh.LuaChon.map((itemLuaChon, indexLuaChon) => {
                        if (itemLuaChon.TieuDe == item[12 + indexThuocTinh]) {
                          itemThuocTinh.LuaChon[indexLuaChon].Checked = true
                        }
                      })
                    }
                    thuoctinh[indexThuocTinh] = itemThuocTinh
                  })
                  banghi.ThuocTinh = thuoctinh
                  tbBanGhi.push(banghi)
                }
                else {
                  banghi.TEN = item[10]
                  banghi.MA = item[11]
                  banghi.ThuocTinh = thuoctinh
                  tbBanGhi.push(banghi)
                }
              }
            }
          })
          if (flag) {
            form.tbBanGhi = tbBanGhi
            let axiosRes, axiosReq = cmFunction.clone(form)
            axiosRes = await tbDanhMuc.create(axiosReq)
            if (axiosRes) {
              this.props.dispatch(fetchToastNotify({ type: CONSTANTS.SUCCESS, data: 'Thành công' }))
            }
            else {
              this.props.dispatch(fetchToastNotify({ type: CONSTANTS.ERROR, data: 'Không thành công' }))
            }
            this.forceUpdate()
          }

        }
        else if (!checknhomdanhmuc) {
          this._handleConfirmImport('', -1, '')
        }
        else if (checkdanhmuc) {
          this._handleConfirmImport('', -2, '')
        }
        else if (!checklinhvuc) {
          this._handleConfirmImport('', -3, '')
        }
        else if (rows[1][1] == "" || rows[1][1] == null) {
          this._handleConfirmImport('B', 2, 'tên danh mục')
        }
        else if (rows[1][2] == "" || rows[1][2] == null) {
          this._handleConfirmImport('C', 2, 'mã danh mục')
        }
        else {
          this._handleConfirmImport('', -5, '')
        }
      }, 1000)

    }
    else {
      this._handleConfirmImport('', -4, '')
    }
  }

  // Render
  renderBanGhi = () => {
    return <div>
      <div className="col-md-12 form-row form-custom form-no-spacing mb-1">
        <button onClick={() => this._handleModalMission(true)} className="pull-left btn btn-sm btn-outline-primary border-radius">
          <i className="fas fa-plus"></i>Thêm bản ghi
          </button>
      </div>
      <div className="col-md-12 form-row form-custom form-no-spacing">
        {/* <div className='col-md-9 offset-md-3  pl-0 pr-0 fix-first'> */}
        <table className="table table-sm table-bordered" id="dataTable" width="100%" cellSpacing="0" ref="dataTable">
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên</th>
              <th>Mã</th>
              {this.state.thuoctinh.map((item, index) => {
                return <th key={index}>{item.Ten}</th>
              })}
              <th>#</th>
            </tr>
          </thead>
          <tbody>
            {this.state.tbBanGhi.map((item, index) => {
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
                <td className="text-center">
                  <button onClick={() => this._handleEditOptions(index)} title="Sửa" className="btn btn-sm btn-outline-info border-radius">
                    <i className="fas fa-pencil-alt" />
                  </button>
                  <button onClick={() => this._handleDeleteOptions(index)} title="Xóa" className="btn btn-sm btn-outline-danger border-radius">
                    <i className="fas fa-trash" />
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
  renderInput = () => {
    let luachonSelected = this.state.luachonSelected
    return this.state.thuoctinhBanGhi.map((item, index) => {
      switch (item.KieuDuLieu.Ma) {
        case 'text':
          return <FormWrapper key={index} >
            <FormInput
              id={index}
              type="text"
              required={false}
              disabled={false}
              readOnly={false}
              label={item.Ten || ''}
              placeholder=""
              defaultValue={this.state.thuoctinhBanGhi[index].LuaChon || ''}
              onChange={this._handleChangeThuocTinh}
            />
          </FormWrapper>
        case 'number':
          return <FormWrapper key={index} >
            <FormInput
              id={index}
              type="number"
              required={false}
              disabled={false}
              readOnly={false}
              label={item.Ten || ''}
              placeholder=""
              defaultValue={this.state.thuoctinhBanGhi[index].LuaChon || ''}
              onChange={this._handleChangeThuocTinh}
            />
          </FormWrapper>
        case 'date':
          return <FormWrapper key={index}>
            <FormInput
              id={index}
              type="date"
              required={false}
              disabled={false}
              readOnly={false}
              label={item.Ten || ''}
              placeholder=""
              defaultValue={this.state.thuoctinhBanGhi[index].LuaChon || ''}
              onChange={this._handleChangeThuocTinh}
            />
          </FormWrapper>
        case "select":
          return <FormWrapper key={index} >
            <FormInput
              type="select"
              loadOptions={(e, v) => this._handleLoadTieuDeOptions(e, v, index)}
              onChange={(e) => this._handleLSelectChange(e, index)}
              required={false}
              defaultValue={luachonSelected[index]}
              isClearable={true}
              isSearchable={true}
              defaultOptions={true}
              label={item.Ten || ''}
              placeholder="Chọn tiêu đề thuộc tính" />
          </FormWrapper>
        case "checkbox":
          return <div key={index}>
            <div className="row">
              <div className="col-md-3" style={{ textAlign: 'right', paddingRight: '5px' }}>
                {item.Ten || ''}
              </div>
              <div className="col-md-9" >
                {this.renderCheckbox(item, index)}
              </div>
            </div>
          </div>
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
  renderCheckbox = (item, index) => {
    let luachon = item.LuaChon
    return luachon.map((itemCheck, indexCheck) => {
      return <FormWrapper key={indexCheck} >
        <input type="checkbox"
          name={item.Ten}
          id={indexCheck}
          checked={this._checkItemCheckBox(item, indexCheck)}
          onChange={(evt) => this._handleChangeCheckBox(indexCheck, index)}
        />
        <label style={{ paddingLeft: '10px' }}>{itemCheck.TieuDe}</label>
      </FormWrapper>
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
          onChange={(evt) => this._handleChangeRadio(indexCheck, index, item)}
          checked={this._checkItemRadio(item, indexCheck)}
        />
        <label style={{ paddingLeft: '10px' }}>{itemCheck.TieuDe}</label>
      </FormWrapper>
    })
  }
  renderDonViCha = (linhvucSelected) => {
    if (linhvucSelected.hasOwnProperty('DonViCha')) {
      let donvicha = linhvucSelected.DonViCha
      return <FormWrapper>
        <FormInput
          id={donvicha.Ten}
          type="text"
          required={true}
          disabled={false}
          readOnly={true}
          label="Đơn vị quản lý"
          defaultValue={donvicha.Ten || ''}
        />
      </FormWrapper>
    }
  }

  render() {
    let { isInsert, form, error } = this.state
    let { nhomdanhmucSelected, loaidanhmucSelected, linhvucSelected, modalIsOpen,
      modalEditIndex, formModal, modalMission, nhomdanhmucSelectedAddNew, saveAction
    } = this.state
    let { documents, vanbansuadoi, checkDoc } = this.state
    let { LoginRes } = this.props
    let checkSuperAdmin = LoginRes.roles === SUPER.roles
    let huypheduyet = form.PheDuyet === 2
    let yeucaupheduyet = form.PheDuyet === 1
    let pheduyet = form.PheDuyet === 3
    if (error)
      return <Page404 />
    try {
      return (
        <div className="main portlet fade-in">
          <BreadCrumbs title={"Chi tiết"}
            route={[{ label: 'Quản lý danh mục', value: '/danh-muc-dtdc/danh-muc' }, { label: 'Thông tin danh mục', value: '/danh-muc-dtdc/danh-muc/:id' }]}
          />
          <div className="portlet-title">
            <div className="caption">
              <i className="fas fa-grip-vertical" />Thông tin danh mục
              </div>
            <div className="action">
              {!isInsert && (checkSuperAdmin || !this._checkRoleThuTruong(LoginRes)) && (checkSuperAdmin || this._checkRole(LoginRes)) && <a onClick={() => this._handleDownloadUpdate()} className="pull-left" style={{ fontStyle: 'italic', paddingRight: '10px', marginTop: '10px' }}>
                Tải file Excel
                </a>}
              {isInsert && (checkSuperAdmin || !this._checkRoleThuTruong(LoginRes)) && (checkSuperAdmin || this._checkRole(LoginRes)) && <a onClick={() => this._handleModalMission(false)} className="pull-left" style={{ fontStyle: 'italic', paddingRight: '10px', marginTop: '10px' }}>
                Tải file Excel
                </a>}
              {(checkSuperAdmin || !this._checkRoleThuTruong(LoginRes)) && (checkSuperAdmin || this._checkRole(LoginRes) || !pheduyet) && <button onClick={() => this._handleSave(false)} className="btn btn-sm btn-outline-primary border-radius">
                <i className="fas fa-save" />Lưu
                </button>}
              {(checkSuperAdmin || !this._checkRoleThuTruong(LoginRes)) && (checkSuperAdmin || this._checkRole(LoginRes) || !pheduyet) && <button onClick={() => this._handleSave(true)} className="btn btn-sm btn-outline-primary border-radius">
                <i className="far fa-save" />Lưu và tiếp tục
                </button>}
              {!isInsert && huypheduyet && !checkSuperAdmin && !this._checkRole(LoginRes) && !this._checkRoleThuTruong(LoginRes) && <button onClick={() => this._handleConfirmApproveDanhMuc()} className="btn btn-sm btn-outline-primary border-radius">
                <i className="far fa-save" />Yêu cầu phê duyệt
                </button>}
              {!isInsert && yeucaupheduyet && (checkSuperAdmin || this._checkRole(LoginRes)) && <button onClick={() => this._handleConfirmApprove(form._id.$oid || form._id)} className="btn btn-sm btn-outline-primary border-radius">
                <i className="far fa-save" />Phê duyệt yêu cầu`
                </button>}
              {!isInsert && (yeucaupheduyet || pheduyet) && (checkSuperAdmin || this._checkRole(LoginRes)) && <button onClick={() => this._handleConfirmUnapprove(form._id.$oid || form._id)} className="btn btn-sm btn-outline-primary border-radius">
                <i className="far fa-save" />Hủy phê duyệt yêu cầu
                </button>}
              {checkDoc && <span className=" text-right" >
                <button
                  onClick={() => this._handleDownload()}
                  className="btn btn-sm btn-outline-primary border-radius">
                  <i className="fas fa-save" />Tải về tệp đính kèm
                </button>
              </span>}
              {!isInsert && (checkSuperAdmin || !this._checkRoleThuTruong(LoginRes)) && (checkSuperAdmin || this._checkRole(LoginRes)) && <span>
                <label htmlFor="file-upload" className="btn btn-sm btn-outline-primary border-radius" style={{ marginTop: "7px", marginLeft: "2px", marginRight: "-5px" }}>
                  <i className="fas fa-upload"></i>Import excel
                </label>
                <input
                  id="file-upload"
                  className="btn btn-sm btn-outline-primary border-radius"
                  type="file"
                  value={this.state.value}
                  onChange={this._handleConfirmImportExcelUpdate.bind(this)}
                  style={{ display: 'none' }}
                />
              </span>
              }
              {isInsert && (checkSuperAdmin || !this._checkRoleThuTruong(LoginRes)) && (checkSuperAdmin || this._checkRole(LoginRes)) && <span>
                <label htmlFor="file-upload" className="btn btn-sm btn-outline-primary border-radius" style={{ marginTop: "7px", marginLeft: "2px", marginRight: "-5px" }}>
                  <i className="fas fa-upload"></i>Import excel
                </label>
                <input
                  id="file-upload"
                  className="btn btn-sm btn-outline-primary border-radius"
                  type="file"
                  value={this.state.value}
                  onChange={this._handleConfirmImportExcelAddNew.bind(this)}
                  style={{ display: 'none' }}
                />
              </span>
              }
              <div className="btn btn-sm dropdown">
                <button className="btn btn-sm btn-outline-primary border-radius dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i className="fas fa-share" />Khác
                </button>
                <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                  <button onClick={cmFunction.goBack} className="btn btn-sm">
                    <i className="fas fa-reply" />Quay lại
                  </button>
                  {(checkSuperAdmin || !this._checkRoleThuTruong(LoginRes)) && (checkSuperAdmin || this._checkRole(LoginRes) || !pheduyet) && <button onClick={this._init} className="btn btn-sm">
                    <i className="fas fa-sync" />Làm mới
                  </button>}
                  {!isInsert && (checkSuperAdmin || !this._checkRoleThuTruong(LoginRes)) && (checkSuperAdmin || this._checkRole(LoginRes) || !pheduyet) && <button onClick={() => this._handleConfirm(-1, this._handleDelete)} className="btn btn-sm">
                    <i className="fas fa-trash" />
                    Xóa
                  </button>}
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-header d-flex justify-content-between" data-toggle="collapse" data-target="#collapseExample" aria-expanded="true" aria-controls="collapseExample">
              <span className="caption-subject">Thông tin cơ bản</span>
              <span>
                <i className="fas fa-chevron-up" />
                <i className="fas fa-chevron-down" />
              </span>
            </div>
            <div className="collapse show" id="collapseExample">
              <div className="card-body ">
                <div className="form-body" ref="form">
                  <FormWrapper>
                    <FormInput
                      id="Ten"
                      type="text"
                      required={true}
                      disabled={false}
                      readOnly={false}
                      label="Tên danh mục"
                      placeholder="Nhập tên danh mục"
                      defaultValue={form.Ten || ''}
                      onChange={this._handleChangeElement} />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      parentClass="col-md-6"
                      labelClass="col-md-6"
                      inputClass="col-md-6"
                      required={true}
                      disabled={!isInsert}
                      readOnly={!isInsert}
                      onChange={this._handleChangeElement}
                      defaultValue={form.Ma || ''}
                      type="text"
                      id="Ma"
                      label="Mã danh mục"
                      placeholder="Nhập mã danh mục"
                    />
                    <FormInput
                      parentClass="col-md-6"
                      labelClass="col-md-6"
                      inputClass="col-md-6"
                      required={false}
                      disabled={false}
                      readOnly={false}
                      pattern=""
                      onChange={this._handleChangeElement}
                      defaultValue={form.STT || ''}
                      type="number"
                      id="STT"
                      label="STT"
                      placeholder="Nhập số thứ tự"
                    />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      id="CoQuanBanHanhVB"
                      type="text"
                      required={false}
                      disabled={false}
                      readOnly={false}
                      label="Cơ quan ban hành văn bản"
                      placeholder="Nhập cơ quan ban hành văn bản danh mục"
                      defaultValue={form.CoQuanBanHanhVB || ''}
                      onChange={this._handleChangeElement}
                    />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      id="NgayBanHanh"
                      type="date"
                      required={false}
                      disabled={false}
                      readOnly={false}
                      label="Ngày ban hành"
                      placeholder="Nhập ngày ban hành danh mục"
                      defaultValue={form.NgayBanHanh || ''}
                      onChange={this._handleChangeElement}
                    />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      required={false}
                      disabled={false}
                      readOnly={false}
                      onChange={this._handleChangeVanBanSuaDoi}
                      defaultValue={vanbansuadoi.Ten || ''}
                      type="text"
                      id="Ten"
                      label="Văn bản ban hành/sửa đổi"
                      placeholder="Tên văn bản ban hành sửa đổi"
                    />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      required={false}
                      disabled={false}
                      readOnly={false}
                      onChange={this._handleChangeVanBanSuaDoi}
                      defaultValue={vanbansuadoi.Link || ''}
                      type="url"
                      id="Link"
                      label="Link"
                      placeholder="Link văn bản ban hành sửa đổi"
                    />
                  </FormWrapper>
                  <FormWrapper>
                    <FileUpload
                      label="Tệp đính kèm"
                      accept=".docx, .doc, .pdf, .xls, .xlsx"
                      startWith={10}
                      endWith={4}
                      required={false}
                      readOnly={false}
                      disabled={false}
                      disableClick={false}
                      multiple={false}
                      files={documents}
                      onDrop={this.onDropFiles}
                      onRemove={this.onRemoveFile}
                    />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      loadOptions={this._handleLoadLoaiDanhMucOptions}
                      onChange={this._handleLoaiDanhMucChange}
                      required={false}
                      defaultValue={loaidanhmucSelected}
                      isClearable={true}
                      isSearchable={true}
                      defaultOptions={true}
                      type="select"
                      label="Loại danh mục"
                      placeholder="Chọn loại danh mục ..." />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      loadOptions={this._handleLoadOptions}
                      onChange={this._handleNhomDanhMucChange}
                      required={true}
                      defaultValue={nhomdanhmucSelected}
                      isClearable={false}
                      isSearchable={true}
                      defaultOptions={true}
                      type="select"
                      label="Nhóm danh mục"
                      placeholder="Chọn nhóm danh mục ..." />
                  </FormWrapper>
                  <FormWrapper>
                    <FormInput
                      loadOptions={this._handleLoadOptionsLinhVuc}
                      onChange={this._handleLinhVucChange}
                      required={true}
                      defaultValue={linhvucSelected}
                      isClearable={false}
                      isSearchable={true}
                      defaultOptions={true}
                      type="select"
                      label="Lĩnh vực"
                      placeholder="Chọn lĩnh vực ..." />
                  </FormWrapper>
                  {this.renderDonViCha(linhvucSelected)}
                  <FormWrapper>
                    <FormInput
                      type="checkbox"
                      onChange={this._handleChangeCheckElement}
                      defaultValue={form.KichHoat}
                      id="KichHoat"
                      label="Kích hoạt"
                    />
                  </FormWrapper>
                </div>
              </div>
              <div className="card-footer">
              </div>
            </div>
          </div>
          <hr></hr>
          <div className="card">
            <div className="card-header d-flex justify-content-between" data-toggle="collapse" data-target="#collapseBanGhi" aria-expanded="true" aria-controls="collapseExample">
              <span className="caption-subject">Thông tin bản ghi</span>
              <span>
                <i className="fas fa-chevron-up" />
                <i className="fas fa-chevron-down" />
              </span>

            </div>
            <div className="collapse show" id="collapseBanGhi">
              <div className="card-body ">
                {this.renderBanGhi()}
              </div>
            </div>
          </div>
          <Modal
            isOpen={modalIsOpen}
            onRequestClose={this._handleAddToggle}
          >
            {modalMission && <div className="card">
              <div className="card-header">
                <label className='caption'>{modalEditIndex === -1 ? 'Thêm mới' : 'Cập nhật'}</label>
              </div>
              <div className="card-body">
                <div className="form-body" ref='formModal'>
                  <FormWrapper>
                    <FormInput
                      required={true}
                      disabled={false}
                      readOnly={false}
                      onChange={this._handleModalChangeElement}
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
                      readOnly={false}
                      onChange={this._handleModalChangeElement}
                      defaultValue={formModal.MA || ''}
                      type="text"
                      id="MA"
                      label="Mã bản ghi"
                      placeholder="Nhập mã bản ghi"
                    />
                  </FormWrapper>
                  {this.renderInput()}
                </div>
              </div>
              <div className="card-footer">
                <button onClick={this._handleAddToggle} className="btn btn-sm btn-outline-info border-radius">
                  <i className="far fa-times-circle"></i>Đóng
                </button>

                <button onClick={() => this._handleSaveOptions(false)} className="btn btn-sm btn-outline-info border-radius">
                  <i className="fas fa-save"></i>Lưu
                </button>
                {saveAction && <button onClick={() => this._handleSaveOptions(true)} className="btn btn-sm btn-outline-info border-radius">
                  <i className="far fa-save"></i>Lưu và tiếp tục
                </button>}
                {!saveAction && <button onClick={() => this._handleSaveOptions(true)} className="btn btn-sm btn-outline-info border-radius">
                  <i className="far fa-save"></i>Lưu và tiếp tục
                </button>}
              </div>
            </div>}
            {!modalMission && <div className="card">
              <div className="card-header">
                <label className='caption'>Chọn nhóm danh mục</label>
              </div>
              <div className="card-body">
                <div className="form-body" ref='formModal'>
                  <FormWrapper>
                    <FormInput
                      loadOptions={this._handleLoadOptions}
                      onChange={this._handleNhomDanhMucChangeAddNew}
                      required={true}
                      defaultValue={nhomdanhmucSelectedAddNew}
                      isClearable={true}
                      isSearchable={true}
                      defaultOptions={true}
                      type="select"
                      label="Nhóm danh mục"
                      placeholder="Chọn nhóm danh mục ..." />
                  </FormWrapper>
                  <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />
                </div>
              </div>
              <div className="card-footer">
                <button onClick={this._handleAddToggle} className="btn btn-sm btn-outline-info border-radius">
                  <i className="far fa-times-circle"></i>Đóng
                </button>
                <button onClick={
                  this._handleDownloadAddNew
                } className="btn btn-sm btn-outline-info border-radius" title="Xuất excel">
                  <i className="fas fa-download" />
                </button>
              </div>
            </div>}
          </Modal>
        </div>
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
export default connect(mapStateToProps)(ChiTiet);
