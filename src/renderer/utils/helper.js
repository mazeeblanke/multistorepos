import { AUTOSAVE_INTERVAL } from './constants'

const numeral = require('numeral')
/* eslint-disable */

export const ObjectToFormData = object => {
  let formData = new FormData();
  for (let key in object) {
    formData.append(key, object[key])
    // console.log(...formData);
  }
  return formData;
};



export const parseColData = data => {
  if (data === 'null' || !data) {
    return '-';
  }
  return data;
};



export const isLoggedIn = () => localStorage.getItem('pos_token');

export const multiplyCash = (a, b) => {
	return (a * b).toFixed(2)
}

export const sumCash = (cashList) => {
	return cashList.reduce((agg, cash) => {
		return agg + parseInt(cash)
	}, 0)
}

export const calculateDiscount = (subTotal, threshold, discount) => {
	return threshold && parseAmount((subTotal / threshold) * discount)
}

export const subtractCash = (cash1, cash2) => {
	return parseAmount(
    Math.max((cash1 - cash2), 0)
  )
}

// export const parseAmount = (amount) => parseFloat(amount.toPrecision(4))
export const parseAmount = (amount) => parseFloat(amount.toFixed(2))

export const calculatePercentInCash = (percent, total) => {
	return parseAmount(Math.max(((percent / 100) * total), 0));
}

export const ucFirst = s => s.charAt(0).toUpperCase() + s.slice(1);

export const money = (money) => {
  return numeral(money).format();
};

export const UPDATE_STATE = (state, payload, key) => {
  if (payload.message instanceof Object) {
     payload.message = Object.values(payload.message);
  }
  state[key] = { data: state[key].data.concat(payload.message), nextPage: payload.next_page };
}

export const clearAutoSavedForm = (key) => {
  // console.log('deleted key');
  localStorage.removeItem(key);
}

export const autoSaveForm = (FORM_OBJECT, key) => {
  clearInterval(window[`POS_${key}`]);
  window[`POS_${key}`] = setInterval(() => {
    // console.log(FORM_OBJECT);
    localStorage.setItem(key, JSON.stringify(FORM_OBJECT));
    // console.log('weyye yuuey uiereruieruierui uiereruiuierrui');
  }, AUTOSAVE_INTERVAL);
}


export const sync = (state, mutuation, t) => {
	// console.log(this.state)
	// console.log(mutuation)
	console.log(this)
	console.log(t)
	const SYNC_OBJECTS = {};
	Object.keys(t[state]).forEach((key, index) => {
		SYNC_OBJECTS[`_${key}`] = {
			get: () => {
				return t[state[key]]
			},
			set: (value) => {
        t[mutuation]({ key, value })
			}
		}
	})
	return SYNC_OBJECTS;
}


export const createImgOnCanvas = (url, callback) => {
	var img = new Image, data, ret={data: null, pending: true};

	img.onError = function() {
		throw new Error('Cannot load image: "'+url+'"');
	}
	img.onload = () => {
		var canvas = document.createElement('canvas');
		document.body.appendChild(canvas);
		canvas.width = img.width;
		canvas.height = img.height;

		var ctx = canvas.getContext('2d');
		ctx.drawImage(img, 0, 0);
		// Grab the image as a jpeg encoded in base64, but only the data
		data = canvas.toDataURL('image/jpeg').slice('data:image/jpeg;base64,'.length);
		// Convert the data to binary form
		data = atob(data)
		document.body.removeChild(canvas);

		ret['data'] = data;
		ret['pending'] = false;
		if (typeof callback === 'function') {
			callback(data);
		}
	}
	img.src = url;

	return ret;
}
