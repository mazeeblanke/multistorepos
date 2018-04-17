/* eslint-disable */
import { autoSaveForm } from '@/utils/helper';

const ucFirst = s => s.charAt(0).toUpperCase() + s.slice(1)

export default {
  data() {
    return {

    };
  },
  methods: {
    initForm(STORAGE_KEY) {
      // console.log(localStorage.getItem(STORAGE_KEY));
      if (!localStorage.getItem(STORAGE_KEY)) {
        console.log('12 12 12 12 1 2121');
        autoSaveForm(this.$data[this.formKey], STORAGE_KEY)
        return;
      }
      setTimeout(() => {
        const SAVED_FORM = JSON.parse(localStorage.getItem(STORAGE_KEY));
        const WRITTEN_SOMETHING = SAVED_FORM.data
        .filter(key => {
          // console.log(SAVED_FORM[key]);
          // console.log('--------------------------------');
          // console.log(SAVED_FORM[key] && !(SAVED_FORM[key] instanceof Array));
          return key;
        });
        // console.log(WRITTEN_SOMETHING);
        console.log(WRITTEN_SOMETHING);
        if (WRITTEN_SOMETHING.length <= 0) {
          localStorage.removeItem(STORAGE_KEY);
          autoSaveForm(this.$data[this.formKey], STORAGE_KEY);
          console.log(22222222);
        } else {
          this.prompt(STORAGE_KEY);
          // console.log(34543444444444444444)
        }
      }, 1000);
    },
    prompt(STORAGE_KEY) {
      this.$swal({
        text: 'Do you want to load previous form ?',
        type: 'info',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      })
      .then((res) => {
        if (res.value) {
          this.loadForm(STORAGE_KEY);
          autoSaveForm(this.$data[this.formKey], STORAGE_KEY);
        } else {
          autoSaveForm(this.$data[this.formKey], STORAGE_KEY);
        }
      })
      // .catch(() => {
      //   // localStorage.removeItem(STORAGE_KEY);
      //   // console.log(JSON.parse(JSON.stringify(this.$data[this.formKey])));
      //   // autoSaveForm(this.$data[this.formKey], STORAGE_KEY)
      // });
    },
    loadForm(key) {
      const SAVED_FORM = localStorage.getItem(key);
      this.$data[this.formKey] = JSON.parse(SAVED_FORM);
      this.$snackbar.open('Successfully loaded previous form!');
    },
  },
};
