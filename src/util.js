'use strict';

// String functions

// // Parameter-based string formatting
// // based on code from StackOverflow:
// // http://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
// if (!String.prototype.format) {
//     String.prototype.format = function() {
//         var str = this.toString();
//         if (!arguments.length)
//             return str;
//         var args = typeof arguments[0],
//             args = (("string" == args || "number" == args) ? arguments : arguments[0]);
//         for (arg in args)
//             str = str.replace(RegExp("\\{" + arg + "\\}", "gi"), args[arg]);
//         return str;
//     }
// }

// Returns true iff str ends with suffix
export function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}


// Function for loading/setting preferences

var prefix = 'dx7edit';
var storage = null;
if (typeof(Storage) !== "undefined") {
	storage = localStorage;
}

export function setPrefs(name, value) {
	let key = prefix + '.' + name;
  let json = JSON.stringify(value);
	if (storage) {
		// Use local storage
		storage.setItem(key, json);
	} else {
		// Use a cookie
		setCookie(key, json, 100);
	}
}

export function getPrefs(name) {
	var key = prefix + '.' + name;
  let str = '';
  if (storage) {
		// Use local storage
		str = storage.getItem(key);
	} else {
		// Use a cookie
		str = getCookie(key);
	}
  return JSON.parse(str);
}


// Cookie manipulation (from w3schools)

export function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

export function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return null;
}


// Building UInt8Arrays

// Elements can be Array, UInt8Array or integer
export function buildUint8Array()
{
	// Sum up length
	var length = 0;
	for (var i = 0; i < arguments.length; i++) {
	    var obj = arguments[i];
	    if (obj instanceof Array || obj instanceof Uint8Array) {
	    	length += obj.length;
	    } else {
	    	length++;
	    }
  	}

  	// Create and fill typed array
  	var arr = new Uint8Array(length);
  	var offset = 0;
		for (var i = 0; i < arguments.length; i++) {
	    var obj = arguments[i];
	    if (obj instanceof Array || obj instanceof Uint8Array)
	    {
	    	arr.set(obj, offset);
	    	offset += obj.length;
	    }
	    else
	    {
	    	arr.set([obj], offset);
	    	offset++;
	    }
  	}
  	return arr;
}



// Utility/debug
export function toHexStrings(data) {
	//return data.map(function(d){return d.toString(16);});
	// Ugly, but works with both Uint8Array and Array:
	var arr = [];
	for (var i = 0; i < data.length; i++) {
		arr.push('0x' + data[i].toString(16));
	}
	return arr;
};

export function getHexDataDumpString(data) {
	var s = '[';
	for (var i = 0; i < data.length; i++) {
		s += ('0x' + data[i].toString(16) + ',');
		if (i % 18 == 0) s += '\n';
	}
	s += ']';
	return s;
};
