<template lang="pug">
  .AppBase
    NavBar
    //- progress-bar(
    //-   :progress="uploadProgress",
    //-   height=30,
    //-   :info-text="uploadingText",
    //-   v-if="uploadingFile",
    //-   :cancel-upload="cancelUpload",
    //- )
    #snap-screen.u-flex-fill
      router-view
    //- Dropzone(
    //-   v-show="false",
    //-   :id="dropzoneId",
    //-   ref="dropzone",
    //-   :maxNumberOfFiles="100" ,
    //-   :maxFileSizeInMB="1000",
    //-   :options="dropzoneOptions",
    //-   @vdropzone-upload-progress="updateFilename",
    //-   @vdropzone-files-added="handleFilesAdded",
    //-   @vdropzone-error="handleUploadError",
    //-   @vdropzone-total-upload-progress="progress",
    //-   @vdropzone-queuecomplete="handleUploadComplete",
    //-   @vdropzone-success="fileUploaded",
    //-   @vdropzone-mounted="initDropzone",
    //-   :parallelUploads="1",
    //- )
    //- SelectUploadFiles(
    //-   :start-upload="startUpload",
    //-   :cancel-files-to-upload-selection="cancelFilesToUploadSelection",
    //-   :remove-file="removeFile",
    //- )
</template>

<script>
/*eslint-disable */
import NavBar from '@/components/NavBar';
import { mapState, mapActions, mapGetters, mapMutations } from 'vuex';
import { ObjectToFormData } from '@/utils/helper';
// import Dropzone from 'vue2-dropzone';
// import SelectUploadFiles from '@/components/shared/SelectUploadFiles';
// import ProgressBar from '@/components/shared/ProgressBar';

export default {
  data() {
    return {
      dropzoneOptions: {
        url: 'https://httpbin.org/post',
        thumbnailWidth: 150,
        maxFilesize: 1000,
        addRemoveLinks: true,
        autoProcessQueue: true,
        autoQueue: false,
        dictDefaultMessage: "<i class='is-size-150 fa fa-cloud-upload'></i>",
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        parallelUploads: 1,
        timeout: 11145000,
      },
    };
  },
  watch: {
    currentUser() {
      this.access = this.currentUser.access;
    },
  },
  mounted() {

    if (!this.currentUser) {
      window.location.href = '/';
      this.$router.push('/');
    } else {
      this.access = this.currentUser.access;
      this.$router.push('/app/new_sale');
      console.log(Object.keys(this.currentBranch));
      if (Object.keys(this.currentBranch).length === 0) {
        this._loadBranches();
      }
    }
    // if (!this.isLoggedIn || !this.currentUser) {
    //   this.$router.push('/');
    // }
  },
  methods: {
    ...mapActions('branch', [
      'loadBranches',
    ]),
    ...mapMutations('branch', [
      'SET_CURRENT_BRANCH',
    ]),
    _loadBranches(query) {
      if (query !== '') {
        this.loadingBranches = true;
        this.loadBranches(ObjectToFormData({
          allbranches: 'allbranches',
        }))
        .then((res) => {
          if (typeof res[0] === 'object') {
            this.SET_CURRENT_BRANCH(res[0]);
          } else {
            this.$snackbar.open({
              message: 'Setup the branch this POS is installed at',
              type: 'is-warning',
              position: 'is-top',
              actionText: 'Setup',
              indefinite: true,
              duration: 100000,
              onAction: () => {
                this.router.push(
                  { name: 'SettingsView'}
                )
              }
            })
          }
          this.branch_suggestions = res;
          this.loadingBranches = false;
        })
        .catch(() => {
          this.loadingBranches = false;
        });
      }
    },
    // ...mapActions('upload', [
    //   'addFiles',
    //   'resetProgress',
    //   'setUploadingFile',
    //   'setTotalAcceptedFilesLength',
    //   'removeAddedFile',
    //   'setUploadProgress',
    //   'cancelledUpload',
    //   'handleFilesAdded',
    //   'updateFilename',
    //   'updateProgress',
    //   'setFilesSelectingState',
    //   'clearAddedFiles',
    //   'clearAddedFilesType',
    //   'setAddedFilesType',
    //   'setAddedFiles',
    //   'setProcessedFiles',
    //   'setUploadUrl',
    // ]),
    // ...mapActions('materials', [
    //   'updateExpeditionItem',
    //   'updateCustomDuty',
    //   'updateInboundLogistics',
    // ]),
    // initDropzone() {
    //   this.$refs.dropzone.dropzone.on('sending', (file, xhr, formData) => {
    //     formData.append('document_type', file.documentType);
    //     formData.append('documentFile', file);
    //     for(let i of formData){
    //       console.log(i);
    //     }
    //     console.log(this.$refs.dropzone.dropzone);
    //   });
    //   this.$refs.dropzone.dropzone.on('processing', (file) => {
    //     this.$refs.dropzone.setOption('headers', { 'X-Access-Token': this.currentUser.token });
    //     this.$refs.dropzone.setOption('url', file.uploadUrl);
    //   });
    // },
    // handleUploadError(file, message) {
    //   if (file.status && file.status === 'canceled') {
    //     this.$snackbar.open(`${message} (${file.name}) !`);
    //   } else {
    //     this.$snackbar.open({
    //       type: 'is-danger',
    //       message: `${message} (${file.name}) !`,
    //     });
    //   }
    //   this.setUploadingFile(null);
    //   this.setProcessedFiles(this.processedFiles + 1);
    //   this.$refs.dropzone.processQueue();
    // },
    // getUploadingFilesLength() {
    //   return (
    //     this.$refs.dropzone && !!this.$refs.dropzone.getUploadingFiles().length
    //   );
    // },
    // removeFile(fileObj) {
    //   this.$refs.dropzone.dropzone.removeFile(fileObj.file);
    //   this.removeAddedFile(fileObj);
    // },
    // progress(totaluploadprogress) {
    //   this.updateProgress(totaluploadprogress);
    // },
    // handleUploadComplete() {
    //   this.$refs.dropzone.dropzone.removeAllFiles(true);
    //   this.resetProgress();
    //   this.clearAddedFilesType();
    // },
    // fileUploaded(file, res) {
    //   this.$snackbar.open(`Successfully uploaded ${file.name}`);
    //   this.updateFiles(res[0]);
    //   this.$refs.dropzone.removeFile(file);
    //   this.setUploadProgress(0);
    //   if (this.$refs.dropzone.getQueuedFiles().length) {
    //     this.setProcessedFiles(this.processedFiles + 1);
    //     this.$refs.dropzone.processQueue();
    //   } else {
    //     this.resetProgress();
    //     this.setUploadingFile(null);
    //   }
    // },
    // isExpeditingItem(uploadedFile) {
    //   return uploadedFile.documentableType === 'ExpeditionItem';
    // },
    // isCustomDuty(uploadedFile) {
    //   return uploadedFile.documentableType === 'custom';
    // },
    // isInboundLogisitics(uploadedFile) {
    //   return uploadedFile.documentableType === 'Inbound Logistics';
    // },
    // isViewingSelectedExpeditingItem(uploadedFile) {
    //   const expeditingItem = { ...this.selectedExpeditionItem };
    //   return (
    //     expeditingItem &&
    //     uploadedFile.documentableId === expeditingItem.id &&
    //     expeditingItem.expedition_item_document
    //   )
    // },
    // isViewingSelectedCustomDuty(uploadedFile) {
    //   const customDutyItem = { ...this.selectedCustomDuty };
    //   return (
    //     customDutyItem &&
    //     uploadedFile.documentableId === customDutyItem.id &&
    //     customDutyItem.custom_duty_document
    //   )
    // },
    // isViewingSelectedInboundLogistics(uploadedFile) {
    //    const inboundLogisitics = { ...this.selectedInboundLogistics };
    //    return (
    //     inboundLogisitics &&
    //     uploadedFile.documentableId === inboundLogisitics.id &&
    //     inboundLogisitics.inbound_logistics_documents
    //    )
    // },
    // updateFiles(uploadedFile) {
    //   if (this.isExpeditingItem(uploadedFile) && this.isViewingSelectedExpeditingItem(uploadedFile)) {
    //     const expeditingItem = { ...this.selectedExpeditionItem };
    //     expeditingItem.expedition_item_document.push(uploadedFile);
    //     this.updateExpeditionItem(expeditingItem);
    //   } else if(this.isCustomDuty(uploadedFile) && this.isViewingSelectedCustomDuty(uploadedFile)) {
    //     const customDutyItem = { ...this.selectedCustomDuty };
    //     customDutyItem.custom_duty_document.push(uploadedFile);
    //     this.updateCustomDuty(customDutyItem);
    //   } else if(this.isInboundLogisitics(uploadedFile) && this.isViewingSelectedInboundLogistics(uploadedFile)) {
    //     const inboundLogisitics = { ...this.selectedInboundLogistics };
    //     inboundLogisitics.inbound_logistics_documents.push(uploadedFile);
    //     this.updateInboundLogistics(inboundLogisitics);
    //   }
    // },
    // cancelUpload() {
    //   console.log(this.uploadingFile);
    //   this.$refs.dropzone.dropzone.removeFile(this.uploadingFile);
    //   // this.setProcessedFiles(this.processedFiles + 1);
    //   this.setUploadProgress(0);
    // },
    // startUpload() {
    //   this.setTotalAcceptedFilesLength(
    //     this.addedFiles.length + this.totalAcceptedFilesLength,
    //   );
    //   this.$refs.dropzone
    //     .getAcceptedFiles()
    //     .filter(f => f.status === 'added')
    //     .forEach((f) => {
    //       this.$refs.dropzone.dropzone.enqueueFile(f);
    //       const fileObject = this.addedFiles.find(fileObj =>
    //         _.isEqual(fileObj.file, f),
    //       );
    //       f.documentType = fileObject.documentType;
    //       f.uploadUrl = this.uploadUrl;
    //     });
    //   this.$refs.dropzone.processQueue();
    //   this.setUploadingFile(this.$refs.dropzone.getUploadingFiles()[0]);
    //   this.clearAddedFilesType();
    //   this.clearAddedFiles();
    //   this.setFilesSelectingState(false);
    // },
    // cancelFilesToUploadSelection() {
    //   this.clearAddedFilesType();
    //   this.clearAddedFiles();
    //   this.setFilesSelectingState(false);
    //   this.$refs.dropzone
    //     .getAcceptedFiles()
    //     .filter(f => f.status === 'added')
    //     .forEach((f) => {
    //       this.$refs.dropzone.dropzone.removeFile(f);
    //     });
    //   this.setUploadUrl('');
    // },
  },
  computed: {
    ...mapGetters('users', [
      'isLoggedIn',
    ]),
    ...mapState('users', ['currentUser']),
    ...mapState('branch', ['selectedBranch', 'branches', 'branchSuggestions', 'currentBranch']),
    ...mapState('store', ['store']),
    ...mapState('users', [
      'currentUser',
      'isLoggedIn',
    ]),
    // ...mapState('upload', [
    //   'addedFiles',
    //   'isSelectingFilesForUpload',
    //   'addedFilesType',
    //   'totalAcceptedFilesLength',
    //   'processedFiles',
    //   'uploadingFile',
    //   'uploadProgress',
    //   'uploadUrl',
    //   'dropzoneId',
    // ]),
    // ...mapState('materials', [
    //   'selectedExpeditionItem',
    //   'selectedCustomDuty',
    //   'selectedInboundLogistics',
    // ]),
    // ...mapGetters('upload', [
    //   'uploadingText',
    //   'hasAddedFiles',
    // ]),
  },
  components: {
    NavBar,
    // Dropzone,
    // SelectUploadFiles,
    // ProgressBar,
  },
};
</script>
