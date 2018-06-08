import _ from 'lodash'

const numeral = require('numeral')

export const isLoggedIn = () => localStorage.getItem('pos_token')

export const parseAmount = amount => parseFloat(amount.toFixed(2))

export const ucFirst = s => s.charAt(0).toUpperCase() + s.slice(1)

export const money = money => numeral(money).format()

export const multiplyCash = (a, b) => (a * b).toFixed(2)

export const calculateDiscount = (subTotal, threshold, discount) => {
  return threshold && parseAmount((subTotal / threshold) * discount)
}

export const subtractCash = (cash1, cash2) => {
  return parseAmount(Math.max(cash1 - cash2, 0))
}

export const calculatePercentInCash = (percent, total) => {
  return parseAmount(Math.max(percent / 100 * total, 0))
}

export const parseColData = data => {
  return data || '-'
}

export const calcSubTotal = (items) => {
  const subTotals = _.map(items, 'sub_total')
  return sumCash(subTotals)
}

export const sumCash = cashList => {
  return cashList.reduce((agg, cash) => {
    return agg + parseFloat(cash)
  }, 0)
}

export const UPDATE_STATE = (state, { data, lastPage, page, total }, key) => {
  if (!(data instanceof Array)) {
    state[key].data = [data, ...state[key].data]
  } else if (data instanceof Array && !page && !lastPage && !total) {
    state[key].data = [...data, ...state[key].data]
  } else {
    state[key] = {
      data: state[key].data.concat(data),
      lastPage,
      page,
      total
    }
  }
}

export const CMD = (filepath) => {
  switch (process.platform) {
    case 'darwin':
      return `open ${filepath}`
    case 'win32':
      return `"${filepath}"`
    case 'win64':
      return `"${filepath}"`
    default:
      return `xdg-open ${filepath}`
  }
}

export const createImgOnCanvas = (url, callback) => {
  let img = new Image()
  let data
  let ret = { data: null, pending: true }

  img.onError = function () {
    throw new Error('Cannot load image: "' + url + '"')
  }
  img.onload = () => {
    var canvas = document.createElement('canvas')
    document.body.appendChild(canvas)
    canvas.width = img.width
    canvas.height = img.height

    var ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)
    // Grab the image as a jpeg encoded in base64, but only the data
    data = canvas
      .toDataURL('image/jpeg')
      .slice('data:image/jpeg;base64,'.length)
    // Convert the data to binary form
    data = atob(data)
    document.body.removeChild(canvas)

    ret['data'] = data
    ret['pending'] = false
    if (typeof callback === 'function') {
      callback(data)
    }
  }
  img.src = url

  return ret
}
