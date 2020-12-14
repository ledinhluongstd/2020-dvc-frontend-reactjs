import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Other, Page404} from 'interface/screens/error';
import {BreadCrumbs} from "interface/components";
import {__DEV__} from '../../../common/ulti/constants';
import * as CONSTANTS from 'common/ulti/constants';
import * as cmFunction from 'common/ulti/commonFunction';
import {Chart} from "react-google-charts";
import queryString from 'query-string'
import moment from 'moment'
import {HOST_API} from '../../../controller/api';
import * as tbDichVu from 'controller/services/tbDVCServices'
import * as tbUngDung from 'controller/services/tbUngDungServices';
import * as tbCauHinhKetNoi from 'controller/services/tbCauHinhKetNoiServices'
import * as dashboardServices from 'controller/services/dashboardServices'

class ChiTiet extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isInsert: this.props.match.params.id == 0,
            error: false,
            form: {},
            nhomdichvu: [],
            urlDichVu: [],
            check: false,
            idDVCC: '',
            timeUpdate: '',
            page: CONSTANTS.DEFAULT_PAGE,
            pagesize: CONSTANTS.DEFAULT_PAGESIZE,
            _size: 0,
            _total_pages: 0,
            codeDichVu: '',
            dsdvKhaiThac: [],
            dsDonVi: [],
            dataYear: [],
            dataMonth: [],
            dataWeek: [],
            dataDay: [],
            checkNam: true,
            checkThang: false,
            checkTuan: false,
            checkNgay: false,

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
        this.state.idDVCC = id;
        if (!this.state.isInsert) {
            let data = await tbDichVu.getById(id);
            this.state.form = data
            this.state.nhomdichvu = data.NhomDichVu
            this.state.urlDichVu = data.Url
            this.state.urlQuery = data.Url.Ma
            this.state.timeUpdate = this._dateModified(data)
            this.state.codeDichVu = data.code
            if (!data) this.state.error = true;
            this.forceUpdate();
        }
        this._getDanhSachCSDL(this._createFilterCSDL());
        this._getDanhSachDonVi(this._createFilterDonVi());
        this._getdataYear()
    };

    _dateModified = (item) => {
        if (item.modifiedAt) { return item.modifiedAt.$numberLong } else { return item.createdAt.$numberLong }
    }
    _createFilterCSDL = () => {
        let parsed = {}
        let { codeDichVu } = this.state
        let filter = {}
        parsed.count = true
        filter['$or'] = [
            { 'DichVuCungCap.code': cmFunction.regexText(codeDichVu.trim()) },

        ]
        parsed.filter = JSON.stringify(filter)
        this.forceUpdate()
        return new URLSearchParams(parsed).toString()
    }
    _getDanhSachCSDL = async (query) => {
        let data = await tbUngDung.getAll(query)
        this.state.dsdvKhaiThac = data && data._embedded ? data._embedded : []
        this.forceUpdate()
    }
    _createFilterDonVi = () => {
        let parsed = queryString.parse(this.props.location.search);
        let { codeDichVu } = this.state
        let filter = {}
        parsed.count = true
        filter['$or'] = [
            { 'DichVuUngDung.DichVuCungCap.code': cmFunction.regexText(codeDichVu.trim()) },

        ]
        parsed.filter = JSON.stringify(filter)
        this.forceUpdate()
        return new URLSearchParams(parsed).toString()
    }
    _getDanhSachDonVi = async (query) => {
        let data = await tbCauHinhKetNoi.getAll(query)
        this.state.dsDonVi = data && data._embedded ? data._embedded : []
        this.forceUpdate()
    }

    _getdataYear = async () => {
        let { urlQuery } = this.state
        let currentYear = new Date().getFullYear();
        let year = [];
        let SUCCESS = []
        let ERROR = []
        for (let y = currentYear; y > (currentYear - 5); y--) {
            let nam = y.toString()
            year.push(nam)
        }
        for (let y = 0; y < 5; y++) {
            let firstofYear = this._getfirstday(year[y], 0)
            let lastofYear = this._getlastday(year[y], 12)
            let query = `Url=${urlQuery}&TuNgay=${firstofYear}&ToiNgay=${lastofYear}`
            let countSuccessOrError = await dashboardServices.statisticalSuccessOrErrorServiceByTime(query)
            ERROR[y] = 0;
            SUCCESS[y] = 0
            let data = countSuccessOrError.data
            data.forEach(item => {
                if (item.KQ === "ERROR") { ERROR[y] = item.count }
                if (item.KQ === "SUCCESS") { SUCCESS[y] = item.count }
            })
        }
        this.state.dataYear = this._pushData(year, SUCCESS, ERROR)
        this.forceUpdate()
    }
    _getfirstday = (year, month) => {
        let firstofYear = new Date(year, month, 1)
        return Date.parse(firstofYear);
    }
    _getlastday = (year, month) => {
        let lastofYear = new Date(year, month, 0, 24, 0, -1);
        return Date.parse(lastofYear);
    }
    _pushData = (data, SUCCESS, ERROR) => {
        let array = [
            ['x', 'Thành công', 'Không thành công'],
        ]
        for (let i = data.length - 1; i >= 0; i--) {
            array.push([data[i], SUCCESS[i], ERROR[i]])
        }
        return array
    }
    _getdataMonth = async () => {
        let { urlQuery } = this.state
        let now = new Date()
        let month = []
        let SUCCESS = []
        let ERROR = []
        for (let m = 0; m < 12; m++) {
            let before = new Date(now.getFullYear(), now.getMonth() - m, 1);
            let currentMonth = before.getMonth();
            let currentYear = before.getFullYear();
            let firstofMonth = this._getfirstday(currentYear, currentMonth)
            let lastofMonth = this._getlastday(currentYear, currentMonth + 1)
            let monthyear = currentMonth + 1 + '/' + currentYear
            month.push(monthyear)
            let query = `Url=${urlQuery}&TuNgay=${firstofMonth}&ToiNgay=${lastofMonth}`
            let countSuccessOrError = await dashboardServices.statisticalSuccessOrErrorServiceByTime(query)
            ERROR[m] = 0;
            SUCCESS[m] = 0
            let data = countSuccessOrError.data
            data.forEach(item => {
                if (item.KQ === "ERROR") { ERROR[m] = item.count }
                if (item.KQ === "SUCCESS") { SUCCESS[m] = item.count }
            })
        }
        this.state.dataMonth = this._pushData(month, SUCCESS, ERROR)
        this.forceUpdate()
    }
    _getdataWeek = async () => {
        let date = new Date()
        let year = date.getFullYear()
        let week = []
        let weekNo = this._weekNumber(date)
        let day = 31
        let weeklastYear = '';
        let SUCCESS = []
        let ERROR = []
        do {
            let d = new Date(year - 1, 11, day--);
            weeklastYear = this._weekNumber(d);
        } while (weeklastYear == 1);
        if (weekNo >= 12) {
            for (let w = weekNo, m = 0; w > (weekNo - 12); w--, m++) {
                week.push(w + '.' + year)
                let query = this._querybyWeek(year, w)
                let countSuccessOrError = await dashboardServices.statisticalSuccessOrErrorServiceByTime(query)
                ERROR[m] = 0;
                SUCCESS[m] = 0
                let data = countSuccessOrError.data
                data.forEach(item => {
                    if (item.KQ === "ERROR") { ERROR[m] = item.count }
                    if (item.KQ === "SUCCESS") { SUCCESS[m] = item.count }
                })
            }
        } else {
            let weekBefore = 12 - weekNo;
            let m = 0
            for (let w = weekNo; w > 0; w--, m++) {
                week.push(w + '.' + year)
                let query = this._querybyWeek(year, w)
                let countSuccessOrError = await dashboardServices.countSuccessOrError(
                    query
                );
                ERROR[m] = 0;
                SUCCESS[m] = 0
                let data = countSuccessOrError.data
                data.forEach(item => {
                    if (item.KQ === "ERROR") { ERROR[m] = item.count }
                    if (item.KQ === "SUCCESS") { SUCCESS[m] = item.count }
                })
            }
            let yearBefore = year - 1
            for (let wb = weeklastYear; weekBefore > 0; weekBefore--, wb--, m++) {
                week.push(wb + '.' + yearBefore)
                let query = this._querybyWeek(yearBefore, wb);
                let countSuccessOrError = await dashboardServices.countSuccessOrError(query);
                ERROR[m] = 0;
                SUCCESS[m] = 0
                let data = countSuccessOrError.data
                data.forEach(item => {
                    if (item.KQ === "ERROR") { ERROR[m] = item.count }
                    if (item.KQ === "SUCCESS") { SUCCESS[m] = item.count }
                })
            }
        }
        this.state.dataWeek = this._pushData(week, SUCCESS, ERROR)
        this.forceUpdate()
    }
    _querybyWeek = (year, week) => {
        let { urlQuery } = this.state
        let monday = moment().day("Monday").year(year).week(week).toDate();
        monday.setHours(0, 0, 0)
        let sunday = moment().day("Sunday").year(year).week(week + 1).toDate();
        sunday.setHours(23, 59, 59)
        let firstofWeek = Date.parse(monday)
        let lastofWeek = Date.parse(sunday)
        return `Url=${urlQuery}&TuNgay=${firstofWeek}&ToiNgay=${lastofWeek}`
    }
    _weekNumber = (date) => {
        date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        date.setHours(0, 0, 0)
        date.setDate(date.getDate() + 4 - (date.getDay() || 7));
        let yearStart = new Date(date.getFullYear(), 0, 1);
        return Math.ceil((((date - yearStart) / 86400000) + 1) / 7)
    }
    _getdataDay = async () => {
        let { urlQuery } = this.state
        let date = new Date()
        let today = Date.parse(date)
        let day = []
        let SUCCESS = []
        let ERROR = []
        for (let d = 0; d < 7; d++) {
            let bfday = today - 86400000;
            let myObj = new Date(today).toString()
            let dayyyy = new Date(myObj)
            let startDay = dayyyy.setHours(0, 0, 0);
            let endDay = dayyyy.setHours(23, 59, 59)
            let query = `Url=${urlQuery}&TuNgay=${startDay}&ToiNgay=${endDay}`
            let countSuccessOrError = await dashboardServices.statisticalSuccessOrErrorServiceByTime(query)
            ERROR[d] = 0;
            SUCCESS[d] = 0
            let data = countSuccessOrError.data
            data.forEach(item => {
                if (item.KQ === "ERROR") { ERROR[d] = item.count }
                if (item.KQ === "SUCCESS") { SUCCESS[d] = item.count }
            })
            let date = dayyyy.getDate()
            let month = dayyyy.getMonth() + 1
            let year = dayyyy.getFullYear()
            today = bfday
            day.push(date + '/' + month + '/' + year)
        }
        this.state.dataDay = this._pushData(day, SUCCESS, ERROR)
        this.forceUpdate()
    }

    _clickNam = () => {
        this.state.checkNam = true;
        this.state.checkThang = false;
        this.state.checkTuan = false;
        this.state.checkNgay = false;
        this.forceUpdate();
    };
    _clickThang = () => {
        this._getdataMonth()
        this.state.checkNam = false;
        this.state.checkThang = true;
        this.state.checkTuan = false;
        this.state.checkNgay = false;
        this.forceUpdate();
    };
    _clickTuan = () => {
        this._getdataWeek()
        this.state.checkNam = false;
        this.state.checkThang = false;
        this.state.checkTuan = true;
        this.state.checkNgay = false;
        this.forceUpdate();
    };
    _clickNgay = () => {
        this._getdataDay()
        this.state.checkNam = false;
        this.state.checkThang = false;
        this.state.checkTuan = false;
        this.state.checkNgay = true;
        this.forceUpdate();
    };

    render() {
        let { form, error, idDVCC, nhomdichvu, urlDichVu, timeUpdate, dsdvKhaiThac, dsDonVi } = this.state;
        let { dataYear, dataMonth, dataWeek, dataDay, checkNam, checkThang, checkTuan, checkNgay, } = this.state
        if (error) return <Page404 />;
        try {
            return (
                <React.Fragment>
                    <div className="main portlet">
                        <BreadCrumbs
                            title={'Chi tiết dịch vụ'}
                            route={[
                                { label: 'Dịch vụ cung cấp', value: '/dich-vu-cung-cap' },
                                { label: 'Chi tiết dịch vụ', value: '/dich-vu-cung-cap/:id' },
                            ]}
                        />
                        <div className="portlet-title">
                            <div className="caption">
                                <i className="fas fa-grip-vertical" />
                            Chi tiết dịch vụ
                            </div>
                            <div className="action">
                                <button onClick={(e) => {
                                    e.preventDefault();
                                    window.location.href = '#/dich-vu-cung-cap/' + idDVCC;
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
                                <span >Nhóm: &nbsp;<span className='font-weight-bold'>{nhomdichvu.Ten || ''}</span></span><br />
                                <span >Dịch vụ:&nbsp;<span className='font-weight-bold'>{form.Ten}</span> </span><br />
                                <span>Url: &nbsp;<span className='font-italic text-info'>{HOST_API}{urlDichVu.Ma || ''}</span></span><br />
                                {/* <span >Đăng ký:&nbsp;(???)</span><br /> */}
                                <span>Version : &nbsp;<span className='font-weight-bold'>{urlDichVu.Version || ''}</span></span><br />
                                <span className='text-muted font-italic'>Ngày cập nhật:&nbsp;{cmFunction.timestamp2DateString(timeUpdate, 'HH:mm:ss DD/MM/YYYY')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="main portlet">
                        <div className="card">
                            <div
                                className="card-header d-flex justify-content-between"
                                data-toggle="collapse"
                                data-target="#collapseThongKe"
                                aria-expanded="true"
                                aria-controls="collapseThongKe"
                            >
                                <span className="caption-subject">Thống kê giao dịch </span>
                                <span>
                                    <i className="fas fa-chevron-up" />
                                    <i className="fas fa-chevron-down" />
                                </span>
                            </div>
                            <div className="collapse show" id="collapseThongKe">
                                <div className="card-body">
                                    <nav>
                                        <div className="nav nav-tabs" id="nav-tab" role="tablist">
                                            <a
                                                className="nav-item nav-link active"
                                                id="nam-tab"
                                                data-toggle="tab"
                                                href="#nam"
                                                role="tab"
                                                aria-controls="nam"
                                                aria-selected="true"
                                                onClick={this._clickNam}
                                            >
                                                Năm
                    </a>
                                            <a
                                                className="nav-item nav-link"
                                                id="thang-tab"
                                                data-toggle="tab"
                                                href="#thang"
                                                role="tab"
                                                aria-controls="thang"
                                                aria-selected="false"
                                                onClick={this._clickThang}
                                            >
                                                Tháng
                    </a>
                                            <a
                                                className="nav-item nav-link"
                                                id="tuan-tab"
                                                data-toggle="tab"
                                                href="#tuan"
                                                role="tab"
                                                aria-controls="tuan"
                                                aria-selected="false"
                                                onClick={this._clickTuan}
                                            >
                                                Tuần
                    </a>
                                            <a
                                                className="nav-item nav-link"
                                                id="ngay-tab"
                                                data-toggle="tab"
                                                href="#ngay"
                                                role="tab"
                                                aria-controls="ngay"
                                                aria-selected="false"
                                                onClick={this._clickNgay}
                                            >
                                                Ngày
                    </a>
                                        </div>
                                    </nav>

                                    <div
                                        className="tab-pane fade show active"
                                        id="nam"
                                        role="tabpanel"
                                        aria-labelledby="nam-tab"
                                    >
                                        {checkNam && (
                                            <Chart
                                                height={'500px'}
                                                chartType="AreaChart"
                                                loader={<div>Loading...</div>}
                                                data={dataYear}
                                                options={{
                                                    hAxis: { title: 'Năm', titleTextStyle: { color: '#333' } },
                                                    vAxis: { minValue: 0 },
                                                    // For the legend to fit, we make the chart area smaller
                                                    chartArea: { width: '75%', height: '70%' },
                                                    // lineWidth: 25
                                                    animation: {
                                                        duration: 1000,
                                                        easing: 'out',
                                                        startup: true
                                                    }
                                                }}
                                                // For tests
                                                rootProps={{ 'data-testid': '1' }}
                                            />
                                        )}
                                    </div>

                                    <div
                                        className="tab-pane fade"
                                        id="thang"
                                        role="tabpanel"
                                        aria-labelledby="thang-tab"
                                    >
                                        {checkThang && (
                                            <Chart
                                                height={'500px'}
                                                chartType="AreaChart"
                                                loader={<div>Loading...</div>}
                                                data={dataMonth}
                                                options={{
                                                    hAxis: { title: 'Tháng', titleTextStyle: { color: '#333' } },
                                                    vAxis: { minValue: 0 },
                                                    // For the legend to fit, we make the chart area smaller
                                                    chartArea: { width: '75%', height: '70%' },
                                                    // lineWidth: 25
                                                    animation: {
                                                        duration: 1000,
                                                        easing: 'out',
                                                        startup: true
                                                    },
                                                }}
                                                // For tests
                                                rootProps={{ 'data-testid': '1' }}
                                            />
                                        )}
                                    </div>

                                    <div
                                        className="tab-pane fade"
                                        id="tuan"
                                        role="tabpanel"
                                        aria-labelledby="tuan-tab"
                                    >
                                        {checkTuan && (
                                            <Chart
                                                height={'500px'}
                                                chartType="AreaChart"
                                                loader={<div>Loading...</div>}
                                                data={dataWeek}
                                                options={{
                                                    hAxis: { title: 'Tuần', titleTextStyle: { color: '#333' } },
                                                    vAxis: { minValue: 0 },
                                                    // For the legend to fit, we make the chart area smaller
                                                    chartArea: { width: '75%', height: '70%' },
                                                    // lineWidth: 25
                                                    animation: {
                                                        duration: 1000,
                                                        easing: 'out',
                                                        startup: true
                                                    }
                                                }}
                                                // For tests
                                                rootProps={{ 'data-testid': '1' }}

                                            />
                                        )}
                                    </div>

                                    <div
                                        className="tab-pane fade"
                                        id="ngay"
                                        role="tabpanel"
                                        aria-labelledby="ngay-tab"
                                    >
                                        {checkNgay && (
                                            <Chart
                                                height={'500px'}
                                                chartType="AreaChart"
                                                loader={<div>Loading...</div>}
                                                data={dataDay}
                                                options={{
                                                    hAxis: { title: 'Ngày', titleTextStyle: { color: '#333' } },
                                                    vAxis: { minValue: 0 },
                                                    // For the legend to fit, we make the chart area smaller
                                                    chartArea: { width: '75%', height: '70%' },
                                                    // lineWidth: 25
                                                    animation: {
                                                        duration: 1000,
                                                        easing: 'out',
                                                        startup: true
                                                    }
                                                }}
                                                // For tests
                                                rootProps={{ 'data-testid': '1' }}

                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="main portlet">
                        <div className="card">
                            <div
                                className="card-header d-flex justify-content-between"
                                data-toggle="collapse"
                                data-target="#collapseDonVi"
                                aria-expanded="true"
                                aria-controls="collapseDonVi"
                            >
                                <span className="caption-subject">Danh sách đơn vị khai thác dịch vụ</span>
                                <span>
                                    <i className="fas fa-chevron-up" />
                                    <i className="fas fa-chevron-down" />
                                </span>
                            </div>
                            <div className="collapse show" id="collapseDonVi">
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
                                                        <th>Đơn vị khai thác dịch vụ</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dsDonVi.map((item, index) => {
                                                        return <tr key={index} >
                                                            <td className='text-center' style={{ width: '5%' }}>{index + 1}</td>
                                                            <td>
                                                                <span>Đơn vị:&nbsp;<span className="font-weight-bold">{item.DonVi.Ten || ''}</span></span><br />
                                                                <span className='text-muted font-italic'>Ngày cập nhật:&nbsp;{cmFunction.timestamp2DateString(this._dateModified(item), 'HH:mm:ss DD/MM/YYYY')}</span>
                                                            </td>
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

                    <div className="main portlet">
                        <div className="card">
                            <div
                                className="card-header d-flex justify-content-between"
                                data-toggle="collapse"
                                data-target="#collapseCSDLHTTT"
                                aria-expanded="true"
                                aria-controls="collapseCSDLHTTT"
                            >
                                <span className="caption-subject">Danh sách CSDL/HTTT khai thác dịch vụ</span>
                                <span>
                                    <i className="fas fa-chevron-up" />
                                    <i className="fas fa-chevron-down" />
                                </span>
                            </div>
                            <div className="collapse show" id="collapseCSDLHTTT">
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
                                                        <th>CSDL/HTTT khai thác dịch vụ</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {dsdvKhaiThac.map((item, index) => {
                                                        return <tr key={index} >
                                                            <td className='text-center' style={{ width: '5%' }}>{index + 1}</td>
                                                            <td>
                                                                <span>CSDL/HTTT:&nbsp;<span className="font-weight-bold">{item.Ten}</span></span><br />
                                                                <span>Nhóm:&nbsp;<span className='font-weight-bold'>{item.NhomDichVu.Ten}</span> </span><br />
                                                                <span>Mã:&nbsp;<span className="font-italic text-info">{item.Ma}</span></span><br />
                                                                <span className='text-muted font-italic'>Ngày cập nhật:&nbsp;<span >
                                                                    {cmFunction.timestamp2DateString(this._dateModified(item), 'HH:mm:ss DD/MM/YYYY')}
                                                                </span></span>
                                                            </td>
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
