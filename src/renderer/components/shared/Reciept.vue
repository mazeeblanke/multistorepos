<template>
  <div class="container">
    <div class="invoice" id="invoice">
      <header>
        <section>
          <h5>{{ settings.store.name }}</h5>
          <!-- <avatar :fullname="store.store" :image="avatarUrl" :size="60"></avatar> -->
          <br>
          <span>#{{ cart.sales_id }}</span>
          <br>
          <span>{{ settings.store.name }}</span>
          <br>
          <span>{{ settings.branch.address }}</span>
          <br>
          <span>{{ settings.store.phone || '093-4883-3434' }}</span>
          <br>
          <span>{{ settings.branch.email }}</span>
          <br>
          <span>{{ dateForHumans(new Date()) }}</span>
          <br>
          <span v-if="cart.customer">Customer: {{ cart.customer.full_name }}</span>
        </section>
      </header>

      <main>
        <section>
          <span>Product</span>
          <span>Unit</span>
          <span>Price</span>
        </section>

        <section>
          <figure v-for="item in items" v-if="item">
            <span><strong>{{ item.name }}</strong></span>
            <span>{{ item.quantity }}</span>
            <span>{{ money(item.unitprice) }}</span>
          </figure>
        </section>

        <section>
          <span>Sub total</span>
          <span>{{ money(cart.subTotal) }}</span>
        </section>
        <section>
         <span>Payment type</span>
          <span>{{ cart.payment_type }}</span>
        </section>
        <section>
         <span>Amount paid</span>
          <span>{{ money(cart.amountPaid) }}</span>
        </section>
        <section>
         <span>Discount({{ `${cart.discount}%` }})</span>
          <span>{{ money(cart.discountTotal) }}</span>
        </section>
        <section >
          <span>Tax({{ `${cart.tax}%` }})</span>
          <span>{{ money(cart.taxTotal) }}</span>
        </section>
        <section>
          <span>TOTAL</span>
          <span>{{ money(cart.total) }}</span>
        </section>
      </main>
      <footer>
        <p>{{ settings.branch.receiptinfo }}</p>
      </footer>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import { formatDate, formatStatus, formatMoney, dateForHumans } from '@/filters/format';
import MoneyMixin from '@/mixins/MoneyMixin';
import { mapState } from 'vuex';
import Avatar from 'vue-avatar-component';
// import jsPDF from 'jspdf';
import $ from 'jquery';
// import autotable from 'jspdf-autotable';
// import html2canvas from 'html2canvas';

export default {

  props: ['items', 'total', 'cart', 'printReceipt'],

  data() {
    return {
      isGeneratingPDF: false,
    };
  },

  methods: {
    ...{ formatDate, formatStatus, formatMoney, dateForHumans },
    // generateReceiptPdf() {
    //   this.isGeneratingPDF = true;
    //   // let img = new Image();
    //   html2canvas($('#invoice').get(0))
    //   .then((canvas) => {
    //     let img = canvas.toDataURL("image/png");
    //     let doc = new jsPDF({
    //       orientation: 'portrait',
    //       unit: 'mm',
    //       format: [250, 100],
    //     });
    //     doc.addImage(img,'JPEG',0,0);
    //     doc.autoPrint();
    //     window.open(doc.output('bloburl'), '_blank', "height=700,width=1000");
    //   });
    // },
  },

  mixins: [
    MoneyMixin,
  ],

  computed: {
    
    ...mapState('settings', [
      'settings',
    ]),

    avatarUrl() {
      return `${window.baseUrl}/assets/img/logo.jpg?time=${Date.now()}`;
    },

  },

  components: {
    Avatar
  }

};
</script>


<style lang="scss" scoped>

html, body {
  height: 100%;
}

body {
  padding: 0;
  margin: 0;
  display: -webkit-box;
  display: -moz-box;
  display: box;
  display: -webkit-flex;
  display: -moz-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-pack: center;
  -moz-box-pack: center;
  box-pack: center;
  -webkit-justify-content: center;
  -moz-justify-content: center;
  -ms-justify-content: center;
  -o-justify-content: center;
  justify-content: center;
  -ms-flex-pack: center;
  -webkit-box-align: start;
  -moz-box-align: start;
  box-align: start;
  -webkit-align-items: flex-start;
  -moz-align-items: flex-start;
  -ms-align-items: flex-start;
  -o-align-items: flex-start;
  align-items: flex-start;
  -ms-flex-align: start;
  background-color: #fe8888;
  font-family: "Roboto Condensed", sans-serif;
}
@media (min-height: 580px) {
  body {
    -webkit-box-align: center;
    -moz-box-align: center;
    box-align: center;
    -webkit-align-items: center;
    -moz-align-items: center;
    -ms-align-items: center;
    -o-align-items: center;
    align-items: center;
    -ms-flex-align: center;
  }
}

.container {
  width: 100%;
  max-width: 420px;
  padding-right: 20px;
  padding-left: 20px;
}

.invoice {
  background-color: #ffffff;
  // border-radius: 10px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.13);
  margin: 50px 0;
  padding: 50px 14px 30px;
}
.invoice header {
  overflow: hidden;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  text-align: center;
}
.invoice header section:nth-of-type(1) {
  float: left;
}
.invoice header section:nth-of-type(1) h1 {
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 2px;
  color: #344760;
  font-size: 25px;
  margin-top: 0;
  margin-bottom: 5px;
}
.invoice header section:nth-of-type(1) span {
  color: #b7bcc3;
  font-size: 14px;
  letter-spacing: 2px;
}
.invoice header section:nth-of-type(2) {
  float: right;
}
.invoice header section:nth-of-type(2) span {
  font-size: 21px;
  color: #b7bcc3;
  letter-spacing: 1px;
}
.invoice header section:nth-of-type(2) span:before {
  content: "#";
}
.invoice main {
  // border: 1px dashed #b7bcc3;
  border-left-width: 0px;
  border-right-width: 0px;
  padding-top: 30px;
  padding-bottom: 30px;
}
.invoice main section {
  overflow: hidden;
}
.invoice main section span {
  float: left;
  color: #344760;
  font-size: 16px;
  letter-spacing: .5px;
}
.invoice main section span:nth-of-type(1) {
  width: 45%;
  margin-right: 5%;
}
.invoice main section span:nth-of-type(2) {
  width: 22.5%;
  margin-right: 5%;
}
.invoice main section span:nth-of-type(2), .invoice main section span:nth-of-type(3) {
  text-align: right;
}
.invoice main section span:nth-of-type(3) {
  width: 22.5%;
}
.invoice main section:nth-of-type(1) {
  margin-bottom: 30px;
}
.invoice main section:nth-of-type(1) span {
  color: #b7bcc3;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 13px;
}
.invoice main section:nth-of-type(2) {
  margin-bottom: 30px;
}
.invoice main section:nth-of-type(2) figure {
  overflow: hidden;
  margin: 0;
  margin-bottom: 20px;
  line-height: 160%;
}
.invoice main section:nth-of-type(2) figure:last-of-type {
  margin-bottom: 0;
}
.invoice main section:nth-of-type(3) span:nth-of-type(1) {
  width: 72.5%;
  font-weight: bold;
}
.invoice main section:nth-of-type(3) span:nth-of-type(2) {
  margin-right: 0 !important;
}
.invoice footer {
  text-align: center;
  margin-top: 30px;
}
.invoice footer a {
  font-size: 19px;
  font-weight: bold;
  text-decoration: none;
  text-transform: uppercase;
  position: relative;
  letter-spacing: 1px;
}
.invoice footer a:after {
  content: "";
  width: 0%;
  height: 4px;
  position: absolute;
  right: 0;
  bottom: -10px;
  background-color: inherit;
  -webkit-transition: width 0.2s ease-in-out;
  -moz-transition: width 0.2s ease-in-out;
  transition: width 0.2s ease-in-out;
}
.invoice footer a:hover:after {
  width: 100%;
}
.invoice footer a:nth-of-type(1) {
  color: #b7bcc3;
  margin-right: 30px;
}
.invoice footer a:nth-of-type(1):after {
  background-color: #b7bcc3;
}
.invoice footer a:nth-of-type(2) {
  color: #fe8888;
}
.invoice footer a:nth-of-type(2):after {
  background-color: #fe8888;
}

.invoice main section:nth-of-type(n + 3) {
  display: flex;
  justify-content: space-between;
}

.invoice main section:nth-of-type(n + 3) span {
    margin: 0px !important;
}

h5{
  background-color: #4a4a4a;
  color: white;
  padding: 10px 0px;
}

// .avatar{
//   border-radius: 0px !important
// }

</style>
