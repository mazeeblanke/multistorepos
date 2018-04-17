import { AUTOSAVE_INTERVAL } from './constants'

const numeral = require('numeral')

export const documentTypes = {
  word: 'fa fa-file-word-o fa-3x',
  image: 'image',
  spreadsheet: 'fa fa-table fa-3x',
  pdf: 'fa fa-file-pdf-o fa-3x'
}
/* eslint-disable */

export function processMaterials() {
  const requisition = this.requisition || this.selectedRequisition;
  const parsedMaterials = [];
  const materials = this.$lodash.map(requisition.materials, this.$lodash.clone);
  if (!materials.length) {
    return Promise.reject(new Error('You need to have at least one material'));
  }

  for (let i = 0; i < materials.length; i += 1) {
    if (!materials[i]) {
      return Promise.reject(
        new Error('Oops! You need to select a material. (Tip: Check the material section)'),
      );
    } else if (!materials[i].quantity || materials[i].quantity === 0) {
      return Promise.reject(new Error('Your quantities need to have actual values'));
    } else if (!materials[i].selected_vendors.length) {
      return Promise.reject(new Error('You must select at least one vendor for each material'));
    }

    parsedMaterials.push({
      item_id: materials[i].id,
      quantity: parseInt(materials[i].quantity, 10),
      selected_vendors: materials[i].selected_vendors.map(v => v.id),
    });
  }

  return Promise.resolve(parsedMaterials);
}

export const calcExpenseCost = (percentage, total) => percentage * total / 100;

export const getGoogleDocsPreviewLink = fileUrlLink =>
  `https://docs.google.com/gview?url=${fileUrlLink}&embedded=true`;

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

export const money = (money) => {
  return numeral(money).format();
};

export const clearAutoSavedForm = (key) => {
  console.log('deleted key');
  localStorage.removeItem(key);
}

export const autoSaveForm = (FORM_OBJECT, key) => {
  clearInterval(window[`POS_${key}`]);
  window[`POS_${key}`] = setInterval(() => {
    console.log(FORM_OBJECT);
    localStorage.setItem(key, JSON.stringify(FORM_OBJECT));
    console.log('weyye yuuey uiereruieruierui uiereruiuierrui');
  }, AUTOSAVE_INTERVAL);
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
