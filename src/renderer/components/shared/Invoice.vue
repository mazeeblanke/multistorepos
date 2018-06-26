<template lang="pug">
  .invoice#k
    .header
      .columns
        .column.is-3
          p {{ settings.branch.address }}
          p Call: {{ settings.store.phone }}
          // p {{ store.address }}
          p www.officelanding.com
        .column.is-6
          h4.title.is-4.has-text-centered {{ settings.store.name }}
        .column.is-3
          .columns
            .column.is-6
            .column.is-6
          h5.title.is-5.mb-10.mt-20.has-text-right Receipt / Invoice
          table.table.is-bordered
            thead
              tr
                th Date
                th Receipt #
            tbody
              tr
                td.has-text-right {{ formatDate(new Date()) }}
                td.has-text-left # {{ cart.sales_id  }}
    .billing
      .columns
        .column
          .billing-card
            .billing-card-header
              h6.title.is-6 Bill To
            .billing-card-body
          .billing-info
            span Sales Person :: ASSET
        .column
          .billing-card
            .billing-card-header
              h6.title.is-6 Ship To
            .billing-card-body
          .billing-info
            span Delivery Date: 12/21/2017
    .main
      table.table.is-bordered.is-fullwidth
        thead
          tr
            th ITEM
            th(colspan="3") DESCRIPTION
            th QUANTITY
            th RATE
            th AMOUNT
        tbody
          tr(v-for="item in items")
            td {{ item.id }}
            td(colspan="3") {{ item.name }}
            td {{ item.quantity }}
            td {{ money(item.unitprice) }}
            td {{ money(item.unitprice * item.quantity) }}
          tr
            td(colspan="7") Comment ::
          tr
            td.has-text-right(colspan="6")
              strong TOTAL AMOUNT
            td.has-text-right {{ money(cart.subTotal) }}
          tr
            td.has-text-right(colspan="6")
              strong Sales Discount
            td.has-text-right {{ cart.loyalty_charge ? money(cart.discountTotal) : 0 }}
          tr
            td.has-text-right(colspan="6")
              strong Billing Amount
            td.has-text-right {{ money(cart.total) }}
          tr
            td.has-text-right(colspan="6")
              strong Paid Amount
            td.has-text-right {{ money(cart.amountPaid) }}
          tr
            td.has-text-right(colspan="6")
              strong Balance Return Amount
            td.has-text-right {{ money(cart.cashChange) }}
          tr
            td.has-text-right(colspan="4")
              strong Total Billing Amount in Word
            td.has-text-left(colspan="3")
              strong ***** THIRTY NINE THOUSAND TWO HUNDRED NAIRA ONLY
          tr
            td.has-text-right(colspan="4")
            td.has-text-right INTERSWITCH
            td
            td.has-text-right Cash Amt
          tr
            td.has-text-right(colspan="4")
            td.has-text-right
              strong {{ money(cart.subTotal) }}
            td.has-text-right
              strong 0.00
            td.has-text-right
              strong 0.00
    .footer
      .signature
      hr
      div.invoice-note
        p.has-text-centered * ITEM DELIVERED IN GOOD CONDITION * NO REFUND * NO EXCHANGE * NO WARRNATY ON INKS, TONERS & POWER PACKS * NO GARUANTEE
</template>

<script>
/* eslint-disable */
import { mapState } from 'vuex'
import { formatDate } from '@/filters/format'
import MoneyMixin from '@/mixins/MoneyMixin'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
const path = require('path')
pdfMake.vfs = pdfFonts.pdfMake.vfs
const base64Img = require('base64-img')
const numberWords = require('number-words')

export default {
  props: ['items', 'total', 'salesid', 'cart', 'printReceipt'],
  data () {
    return {
      isGeneratingPDF: false
    }
  },
  watch: {
    printReceipt (newVal) {
      if (newVal) {
        this.generateReceiptPdf()
      }
    }
  },
  methods: {
    ...{ formatDate },
    generateReceiptPdf () {
      var docDefinition = {
        pageSize: 'A4',
        pageMargins: [20, 120, 20, 60],
        content: [
          // TODO display condtionally if background image is null
          // { text: this.store.store, style: "header" },
          {
            columns: [this.getStoreInfo(), this.getReceiptInfo()],
            columnGap: 100,
            marginBottom: 30
          },
          {
            columns: [
              [
                {
                  table: {
                    widths: [260],
                    heights: [15, 100],
                    body: [['Bill To'], ['']]
                  },
                  layout: this.getLightLayout()
                }
              ],
              [
                {
                  table: {
                    widths: [260],
                    heights: [15, 100],
                    body: [['Ship To'], ['']]
                  },
                  layout: this.getLightLayout()
                }
              ]
            ],
            columnGap: 10,
            marginBottom: 10
          },
          {
            columns: [
              [
                {
                  table: {
                    widths: [260],
                    heights: [20],
                    body: [['Sales Person:: ASSETS']]
                  },
                  layout: this.getLightLayout()
                }
              ],
              [
                {
                  table: {
                    widths: [260],
                    heights: [20],
                    body: [['Delivery Date: 2/34/2017']]
                  },
                  layout: this.getLightLayout()
                }
              ]
            ],
            columnGap: 10,
            marginBottom: 15
          },
          {
            table: {
              body: [
                ['ITEM', 'DESCRIPTION', 'QUANTITY', 'RATE', 'AMOUNT'],
                ...this.items.map(i => {
                  return [
                    i.id,
                    i.name,
                    i.quantity,
                    this.money(i.unitprice),
                    this.money(i.unitprice * i.quantity)
                  ]
                }),
                [{ colSpan: 5, text: 'Comment::', marginLeft: 15 }],
                [
                  { colSpan: 4, text: 'TOTAL AMOUNT', alignment: 'right' },
                  '',
                  '',
                  '',
                  this.money(this.cart.total)
                ],
                [
                  {
                    colSpan: 4,
                    text: `Sales Discount(${this.cart.discount}%)`,
                    alignment: 'right'
                  },
                  '',
                  '',
                  '',
                  this.cart.loyalty_charge ? this.money(this.cart.discountTotal) : 0
                ],
                [
                  {
                    colSpan: 4,
                    text: `Tax(${this.cart.tax}%)`,
                    alignment: 'right'
                  },
                  '',
                  '',
                  '',
                  this.money(this.cart.taxTotal)
                ],
                [
                  { colSpan: 4, text: 'Subtotal', alignment: 'right' },
                  '',
                  '',
                  '',
                  this.money(this.cart.subTotal)
                ],
                [
                  { colSpan: 4, text: 'Paid Amount', alignment: 'right' },
                  '',
                  '',
                  '',
                  this.money(this.cart.amountPaid)
                ],
                [
                  {
                    colSpan: 4,
                    text: 'Balance Return Amount',
                    alignment: 'right'
                  },
                  '',
                  '',
                  '',
                  this.money(this.cart.cashChange)
                ],
                [
                  {
                    colSpan: 3,
                    text: 'Total Billing Amount in words',
                    alignment: 'right'
                  },
                  '',
                  '',
                  {
                    colSpan: 2,
                    text: `***** ${(numberWords.convert(Math.round(this.cart.total))).toUpperCase()} NAIRA ONLY`,
                    alignment: 'left',
                    fontSize: 12
                  }
                ],
                [
                  {
                    colSpan: 3,
                    text: 'INTERSWITCH',
                    alignment: 'right'
                  },
                  '',
                  {
                    colSpan: 1,
                    text: ''
                  },
                  '',
                  {
                    colSpan: 1,
                    text: 'Cash Amount'
                  }
                ],
                [
                  {
                    colSpan: 3,
                    text: this.money(this.cart.total),
                    alignment: 'right'
                  },
                  '',
                  {
                    colSpan: 1,
                    text: ''
                  },
                  '0.00',
                  {
                    colSpan: 1,
                    text: '0.00'
                  }
                ]
              ]
            },
            layout: this.getLightLayout(),
            marginBottom: 50
          },
          ...this.getReceiptFooter()
        ],
        background: currentPage => this.getReceiptBg(currentPage),
        styles: {
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
            marginBottom: 30
          },
          anotherStyle: {
            italic: true,
            alignment: 'right'
          }
        }
      }
      return new Promise((resolve, reject) => {
        resolve(pdfMake.createPdf(docDefinition))
          // .getBlob((result) => {
          //   resolve(result)
          // })
        pdfMake
          .createPdf(docDefinition)
          .download(this.cart.sales_id)  
      }) 
    },
    getReceiptBg (currentPage) {
      if (currentPage === 1) {
        return [
          {
            image: base64Img.base64Sync(path.join(__static, 'AXXIMUTH2.jpg')),
            width: 600
          }
        ]
      }
    },
    getReceiptInfo () {
      return [
        {
          text: 'Receipt / Invoice',
          alignment: 'right',
          fontSize: 14,
          marginBottom: 5,
          marginTop: 50
        },
        {
          marginLeft: 5,
          table: {
            widths: [100, 100],
            body: [
              ['Date', 'Receipt #'],
              [
                formatDate(new Date()),
                this.cart.sales_id
              ]
            ]
          },
          layout: this.getLightLayout()
        }
      ]
    },
    getReceiptFooter () {
      return [
        {
          text: Array(75)
            .fill(null)
            .map(i => '=')
            .join(''),
          alignment: 'center',
          marginBottom: 20
        },
        {
          text:
            '* ITEM DELIVERED IN GOOD CONDITION * NO REFUND * NO EXCHANGE * NO WARRNATY ON INKS, TONERS & POWER PACKS * NO GARUANTEE',
          alignment: 'center',
          fontSize: 8
        }
      ]
    },
    getStoreInfo () {
      return [
        { text: this.settings.branch.address, marginBottom: 5 },
        { text: `Call: ${this.settings.store.phone}`, marginBottom: 5 },
        // { text: this.store.address, marginBottom: 5 },
        { text: 'www.officelanding.com', marginBottom: 5 }
      ]
    },
    getLightLayout () {
      return {
        hLineWidth: () => 1,
        vLineWidth: () => 1,
        hLineColor: () => 'gray',
        vLineColor: () => 'gray'
      }
    }
  },
  mixins: [MoneyMixin],
  computed: {
    ...mapState('settings', ['settings']),
    avatarUrl () {
      return `${window.baseUrl}/assets/img/logo.jpg?time=${Date.now()}`
    }
  }
}
</script>

<style lang="sass" scoped>
figure
  display: flex
hr
  background-color: #ffffff
  border: none
  display: block
  height: 1px
  margin: 1.5rem 0
  border-top: 1px solid black
  border-bottom: 1px solid black
  height: 5px
.header
  height: 260px
  table
    width: 160%
    position: relative
    right: 60%
.main
  .table
    margin-top: 20px
.table
  td, th
    border-color: #000000 !important
.invoice
  background: white
  padding: 40px 20px 0px 20px
  width: 50%
.invoice-note
  width: 99%
.billing-card
  height: 160px
  border: 1px solid black
.billing-info
  height: 30px
  border: 1px solid black
  margin-top: 17px
  padding: 4px 5px
.billing-card-header
  padding: 10px 5px
  border-bottom: 1px solid black
.footer
  background: white !important
</style>
