import { AUTHORIZATION_COOKIE, __DEV__ } from "./constants";
import * as cmFunction from "./commonFunction";

function byteLength(str) {
  // returns the byte length of an utf8 string
  var s = str.length;
  for (var i = str.length - 1; i >= 0; i--) {
    var code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff) s++;
    else if (code > 0x7ff && code <= 0xffff) s += 2;
    if (code >= 0xDC00 && code <= 0xDFFF) i--; //trail surrogate
  }
  return s;
}

const getCookie = function (cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return null;
}

const setCookie = function (cname, cvalue, exdays) {
  var d = new Date();
  if (__DEV__) console.log('setCookie byteLength', byteLength(cvalue))
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

const deleteCookie = function (name, path, domain) {
  if (getCookie(name))
    setCookie(name, "", -1, path, domain);
}

const checkCookie = function (Authorization) {
  try {
    if (cmFunction.isEmpty(Authorization)) {
      return false;
    } else {
      let tokenDecode = cmFunction.parseJwt(Authorization.access_token)
      let now = new Date().getTime();
      let { exp } = tokenDecode
      let checkExpiryDate = (exp * 10000) > now
      if (cmFunction.isEmpty(Authorization.access_token) || !checkExpiryDate) {
        deleteCookie(AUTHORIZATION_COOKIE)
        return false
      }
      return true
    }
  } catch (e) {
    deleteCookie(AUTHORIZATION_COOKIE)
    return false
  }
}


export { setCookie, getCookie, deleteCookie, checkCookie }
