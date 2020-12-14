import { isEqual } from "lodash";
import { Base64 } from 'js-base64';
import * as CONSTANTS from './constants'
import ReactDOM from 'react-dom';
import moment from 'moment'

var jwtDecode = require("jwt-decode");

function goBack(e) {
  if (e) e.preventDefault()
  window.history.back()
}

function showToast(message) {

}

function converDanhSachMaDanhMuc() {
  let options = []
  Object.keys(CONSTANTS.MA_DANH_MUC).map(function (key, index) {
    options.push({
      Ma: CONSTANTS.MA_DANH_MUC[key].Ma,
      Ten: CONSTANTS.MA_DANH_MUC[key].Ten,
      value: CONSTANTS.MA_DANH_MUC[key].Ma,
      label: CONSTANTS.MA_DANH_MUC[key].Ten
    })
  });
  return options
}

const parseJwt = function (token) {
  var decoded = jwtDecode(token);
  if (!decoded) return 0;
  return decoded;
};

const isEmpty = function (obj) {
  if (!obj) return !obj;
  return Object.getOwnPropertyNames(obj).length === 0;
};

const clone = function (obj) {
  // return Object.assign({}, obj)
  return JSON.parse(JSON.stringify(obj));
};

const compareObject = function (obj1, obj2) {
  return isEqual(obj1, obj2);
};

const compare = function (a, b, key) {
  const A = parseInt(a['STT'])
  const B = parseInt(b['STT'])

  let comparison = 0;
  if (A > B) {
    comparison = 1;
  } else if (A < B) {
    comparison = -1;
  }
  return comparison;
}

const decode = function (string) {
  return Base64.decode(string)
}

const encode = function (string) {
  return Base64.encode(string)
}

const checkRole = function (type, roles) {
  let index = roles.findIndex(x => x === type);
  return index !== -1;
};

const checkEmail = function (email) {
  return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
    email
  );
};
const checkPhoneNumber = function (phone) {
  return /((09|03|07|08|05)+([0-9]{8})\b)/g.test(phone);
};

const checkValidate = function (self, formRef) {
  return listBlock === 0;
};

function changeAlias(alias) {
  if (!alias || !alias.length) return "";
  var str = alias;
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    " "
  );
  str = str.replace(/ + /g, " ");
  str = str.trim();
  return str;
}

function regexText(str) {
  str = str != undefined ? str : '';
  str = str.toLowerCase();
  str = str.replace('.', '\\.');
  str = str.replace('*', '\\*');
  str = str.replace('?', '\\?');
  str = str.replace('(', '\\(');
  str = str.replace(')', '\\)');
  str = str.replace('{', '\\{');
  str = str.replace('}', '\\}');
  str = str.replace('[', '\\[');
  str = str.replace(']', '\\]');
  str = str.replace('$', '\\$');
  str = str.replace('%', '\\%');
  str = str.replace('+', '(.{1})');

  str = str.replace(
    /a|à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,
    '(a|à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)'
  );
  str = str.replace(/e|è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, '(e|è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)');
  str = str.replace(/i|ì|í|ị|ỉ|ĩ/g, '(i|ì|í|ị|ỉ|ĩ)');
  str = str.replace(
    /o|ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,
    '(o|ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)'
  );
  str = str.replace(/u|ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, '(u|ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)');
  str = str.replace(/y|ỳ|ý|ỵ|ỷ|ỹ/g, '(y|ỳ|ý|ỵ|ỷ|ỹ)');
  str = str.replace(/d|đ/g, '(d|đ)');

  return { $regex: '(?i).*' + str + '.*' };
}

function toDateDisplay(data) {
  let date = new Date(data);
  return `${("0" + date.getDate()).slice(-2)}-${("0" + (date.getMonth() + 1)).slice(-2)}-${date.getFullYear()}`;
}

function convertSelectOptions(array, value, label, valueDisabled = []) {
  let arr = []
  array.map((item) => {
    let checkDisabed = valueDisabled.findIndex(x => (x[value] || x._id.$oid || x._id) === (item[value] || item._id.$oid || item._id)) !== -1
    item.value = item[value] || item._id.$oid || item._id
    item.label = item[label]
    item.isDisabled = checkDisabed
    arr.push(item)
  })
  return arr
}

function convertSelectedOptions(obj, value, label) {
  if (!obj) return null
  if (obj.length !== undefined && obj != 0) {
    obj.forEach((item, index) => {
      let vl = item[value] || (item._id ? (item._id.$oid || item._id) : null)
      let lb = item[label] || item.Ten
      obj[index].value = vl
      obj[index].label = lb
    })
  } else {
    let vl = obj[value] || (obj._id ? (obj._id.$oid || obj._id) : null)
    let lb = obj[label] || obj.Ten
    if (vl && lb) {
      obj.value = vl
      obj.label = lb
    } else {
      obj = null
    }
  }
  return obj
}

function insertParam(key, value, history) {
  key = encodeURI(key);
  let kvp = history.location.search.substr(1).split('&');
  let i = kvp.length;
  let x;
  while (i--) {
    x = kvp[i].split('=');
    if (x[0] == key) {
      if (value) {
        x[1] = value;
        kvp[i] = x.join('=');
        break;
      } else {
        for (let j = i; j < kvp.length - 1; j++) {
          kvp[j] = kvp[j + 1];
        }
        kvp = kvp.slice(0, -1)
        break;
      }
    }
  }
  if (i < 0) {
    if (value) {
      kvp[kvp.length] = [key, value].join('=');
    } else {

      return
    }
  }
  history.location.search = kvp.join('&');
  history.push({ search: history.location.search })
}

async function insertMultiParams(listParams, history) {
  if (!Array.isArray(listParams)) return
  let kvp = history.location.search.substr(1).split('&');
  let x;
  if (Array.isArray(kvp)) {
    await kvp.map((item, index) => {
      if (!item) {
        kvp.splice(index, 1)
      }
    })
  }

  for (let i = 0; i < listParams.length; i++) {
    const param = listParams[i];
    if (param[0] && param[1]) {
      const key = param[0];
      const value = param[1];
      let indexParam = null

      for (let j = 0; j < kvp.length; j++) {
        const item = kvp[j];
        x = item.split('=');
        if (x.length === 2 && x[0] === key) {
          x[1] = value;
          indexParam = key;
          kvp[j] = x.join('=')
        }
      }
      if (!indexParam) {
        await kvp.push(`${key}=${value}`)
      }
    }
  }

  history.location.search = kvp.join('&');
  history.push({ search: history.location.search })
}

function validateInput(val, regex) {
  return regex.test(String(val).toLowerCase());
}

function formValidate(component, formName) {
  let form = ReactDOM.findDOMNode(component.refs[formName]);
  return !formChildValidate(form);
}

function formChildValidate(tag) {
  let count = 0;
  if (tag.children.length <= 0) return count;
  for (let i = tag.children.length - 1; i >= 0; i--) {
    let element = tag.children[i]
    let name = element.getAttribute("name");
    if (name === CONSTANTS.LABEL_VALID_ERROR_NAME) {
      return 1
    } else {
      count += formChildValidate(element)
    }
  }
  return count;
}

function findCommonElements2(arr1, arr2) {
  let obj = {};
  for (let i = 0; i < arr1.length; i++) {
    if (!obj[arr1[i]]) {
      const element = arr1[i];
      obj[element] = true;
    }
  }
  for (let j = 0; j < arr2.length; j++) {
    if (obj[arr2[j]]) {
      return true;
    }
  }
  return false;
}

function timestamp2DateString(timestamp, format = "DD/MM/YYYY") {
  // if (timestamp === '01/01/1970') return;
  // timestamp = timestamp ? timestamp : moment().timestampOf();
  // if (jQuery.isPlainObject(timestamp) && timestamp.$numberLong) {
  //   timestamp = timestamp.$numberLong;
  //   if (timestamp.length > 14) timestamp = timestamp.substring(0, timestamp.length - 3);
  //   timestamp = parseFloat(timestamp);
  // }
  //timestamp = jQuery.isPlainObject(timestamp)?parseFloat(timestamp.$numberLong):timestamp;
  // if (jQuery.type(timestamp) == 'string') {
  //   if (timestamp.match(/[ /-]/g) && timestamp.substr(0, 1) !== '-') {
  //     return timestamp;
  //   }
  //   timestamp = parseFloat(timestamp);
  // }
  timestamp = Number(timestamp)
  return moment(timestamp).format(format);
};

export {
  toDateDisplay,
  checkPhoneNumber,
  changeAlias,
  checkEmail,
  parseJwt,
  isEmpty,
  checkValidate,
  clone,
  showToast,
  compareObject,
  checkRole,
  goBack,
  decode,
  encode,
  compare,
  convertSelectOptions,
  convertSelectedOptions,
  insertParam,
  insertMultiParams,
  regexText,
  converDanhSachMaDanhMuc,
  validateInput,
  formValidate,
  findCommonElements2,
  timestamp2DateString
};
