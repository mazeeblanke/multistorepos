import accounting from 'accounting'
import moment from 'moment'

export const formatStatus = (status) => {
  const statusIconMap = {
    pending: 'hourglass_empty',
    approved: 'done_all',
    endorsed: 'done',
    rejected: 'close',
    held: 'pause'
  }
  const icon = statusIconMap[status]
  return `<span class="icon">
    <i class="material-icons">${icon}</i>
  </span> ${status}`
}

export const formatDate = date => new Date(date).toLocaleDateString()

export const formatTimeAgo = date => moment(date).fromNow()

export const dateForHumans = date => moment(date).format('MMM Do YYYY, h:mm a')
// export const dateForHumans = date => moment(date).format('MMM Do YYYY, h:mm a')

export const formatMoney = (amount, sym) => accounting.formatMoney(amount, sym || '₦')

export const formatExpiry = (date) => {
  let dateString = formatDate(date)
  const diff = moment(date).diff(moment(), 'months')
  if (diff <= 3) {
    dateString = `${dateString} <span class="icon is-danger">
      <i class="material-icons">warning</i>
    </span>`
  }
  return dateString
}
