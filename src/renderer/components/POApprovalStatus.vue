<template lang="pug">
  .ApprovalStatus
    Loading(loading-text="Loading approval users" v-if="!selectedPurchase_order")
    .level
      .level-left
      .level-right(v-if="currentUser.id === managerID && selectedPurchase_order.status !== 'approved'")
        //- div(v-if="!editStatus")
          .level-item.has-text-centered
            div(style="margin-top: 9%")
              template
                .dropdown.is-hoverable
                  .dropdown-trigger
                    button.button.is-primary.is-medium(
                        aria-haspopup="true",
                        aria-controls="dropdown-menu",
                        title="Click to add single personnels",
                      )
                      span.has-text-weight-light(@click="singlePersonnel",)
                        | Add New Personnel
                      span.icon.is-small(@click="toggleDropDownActive")
                        i.fa.fa-angle-down(aria-hidden="true")
                  .dropdown-menu#dropdown-menu(role="menu")
                    .dropdown-content
                      a.dropdown-item.subtitle.is-6(@click="addMultiplePersonnel")
                        | Add Multiple Personnel
              p.mt-10
                small.is-6 Click on the drop down to add multiple people

            .level-item.has-text-centered
              div
                template
                  .button.is-medium#edit(@click="toggleEditMode")
                    i.material-icons edit
        //- template(v-else)
          .level-item(style="margin-top: 4vw;")
            .button.is-medium(@click="cancelSave") Cancel
          .level-item(style="margin-top: 4vw;")
            .button.is-medium.is-primary(:class="[savingApprovalUser ? 'is-loading':'']", @click="saveMultipleAdd") Save
    FullscreenDialog(@closed="closeFullScreen", :active="addMultiplePersonnelActive")
      template
        section(style="width: 100%")
          .button.is-info.is-inverted.is-outlined.is-medium(style="margin-bottom: 2%;", @click="saveMultipleAdd") Save &nbsp
            i.material-icons.icon save
          table.table.is-fullwidth
            thead
              tr
                th S/N
                th.has-text-centered
                  .button.is-primary(@click="multiplePersonnel") Add New Role &nbsp
                    i.material-icons.icon add
                th Role
                th User
                th
            draggable(
              v-model="formatedSelectedApprover",
              :element="'tbody'",
              :options="{draggable:'.item'}",
              :move="onEnd"
              )
              template(v-for="(users, parentIndex) in selectedApprover")
                tr(
                  v-for="(user, index) in users",
                  v-if="user.id !== managerID",
                  :key="user.id",
                  :class="user.PurchaseOrderUsers.role === 'endorser' ? 'item' : ''"
                )
                  td
                    small {{ calcIndex(parentIndex, index) }}
                  td.has-text-centered(title="Click and Drag to reorder")
                    i.fa.fa-arrows(
                      v-if="user.id !== managerID",
                      aria-hidden="true"
                    )
                  td
                    small.is-capitalized(v-if="user.PurchaseOrderUsers.role === '-'") {{ user.PurchaseOrderUsers.role}}
                    small.is-capitalized(v-else) {{ user.PurchaseOrderUsers.role}}
                  td
                    Multiselect(
                      disabled="user.id === managerID"
                      v-if="user.id === managerID",
                      v-model="selectedApprover[parentIndex][index]",
                      :options="approvedUsersOption",
                      :multiple="false",
                      :close-on-select="true",
                      :clear-on-select="false",
                      :hide-selected="true",
                      :preserve-search="true",
                      :allow-empty="false",
                      placeholder="Pick an Endorser",
                      track-by="name",
                      label="email",
                      @input="updateUser(selectedApprover[parentIndex][index], index, parentIndex)"
                    )
                    Multiselect(
                      v-if="user.id !== managerID",
                      v-model="selectedApprover[parentIndex][index]",
                      :options="approvedUsersOption",
                      :multiple="false",
                      :close-on-select="true",
                      :clear-on-select="false",
                      :hide-selected="true",
                      :preserve-search="true",
                      :allow-empty="false",
                      placeholder="Pick an Endorser",
                      track-by="name",
                      label="name",
                      @input="updateUser(selectedApprover[parentIndex][index], index, parentIndex)"
                    )
                  td
                    i.material-icons.icon(title="Remove personnel" @click="deleteRow(index, selectedApprover[parentIndex])") close
                    //- .button(@click="deleteRow(index, selectedApprover[parentIndex])") Remove &nbsp
                    //-   i.material-icons.icon close

    draggable.approval-steps(
        :options="{'disabled':!editStatus, draggable:'.item'}",
        v-model="formatedSelectedApprover",
        :move="onEnd"
      )
      div(v-for="(users, outerIndex) in selectedApprover", :class="[(outerIndex % 2 === 0) ? 'notReversed' : 'reversed']")
        .approval-step(
          v-for="(user, index) in users",
          :class="[index === 0 ? 'first':'', users.length === index+1 ? 'last':'',  user.PurchaseOrderUsers.status === 'endorsed' || user.PurchaseOrderUsers.status === 'approved' ? 'is-success':'', { item:user.PurchaseOrderUsers.role === 'endorser'}]"
        ) 
          //- p(style="margin-left: 9vw;")
          //-   i.material-icons(v-show="user.id !== managerID") clear
          UserIcon
          //- p {{ selectedApprover[outerIndex][index].PurchaseOrderUsers.role }}
          template(v-if="user.id !== managerID")
            template(v-if="editStatus")
              Multiselect.approvalUserMultiSelect(
                v-model="selectedApprover[outerIndex][index]",
                :options="approvedUsersOption",
                :multiple="false",
                :close-on-select="true",
                :clear-on-select="false",
                :hideSelected="true",
                :allow-empty="false",
                :preserve-search="true",
                placeholder="Select endorser",
                track-by="name",
                value="selectedApprover[outerIndex][index]",
                label="name",
                @input="updateUser(selectedApprover[outerIndex][index], index, outerIndex)"
              )
          template(v-if="user.PurchaseOrderUsers.role")
            p(v-if="user.id === managerID && editStatus", style="padding-bottom: 7%") {{ user.name || user.email }}
            p(v-if="!editStatus") {{ user.name || user.email }}
            template.approvalUserSmall
              small.humanize-display.is-capitalized(v-if="user.PurchaseOrderUsers.role !== '-' && editStatus") {{ selectedApprover[outerIndex][index].PurchaseOrderUsers.role }}
              small.humanize-display.is-capitalized(v-if="user.PurchaseOrderUsers.role === '-' && editStatus") {{ selectedApprover[outerIndex][index].PurchaseOrderUsers.role }}
              small.humanize-display.is-capitalized(v-if="user.PurchaseOrderUsers.role !== '-' && !editStatus") {{ selectedApprover[outerIndex][index].PurchaseOrderUsers.role }}


    p.has-text-centered.subtitle.is-6.has-text-grey-light(style="margin-top: 9%")
      | Click and &nbsp
      i.material-icons.icon open_with
      | &nbsp Drag to Rearrange Order
</template>

<script>
import { mapState, mapActions } from 'vuex'
import draggable from 'vuedraggable'
import Multiselect from 'vue-multiselect'
import FullscreenDialog from '@/components/shared/FullscreenDialog'
import Loading from '@/components/shared/Loading'
import UserIcon from '../assets/img/user.svg'

/* eslint-disable */

export default {
  props: {
    purchase_order: Object,
    managerID: Number,
  },
  data() {
    return {
      dropDownActive: false,
      sorted: false,
      approvedUsers: [],
      approvedUsersOption: [],
      savingApprovalUser: false,
      selectedApprover: [],
      counter: 0,
      endorsers: '',
      buyer: '',
      approver: '',
      editStatus: false,
      editSelectMenu: false,
      addMultiplePersonnelActive: false,
      approvalUserRole: 'endorser',
      nextLineImgCountFive: 8,
      nextLineImgCountFour: 4,
      approvalUsers: [
        {
          id: 874,
          email: 'wehuce@ehe.ki',
          passwordResetToken: null,
          passwordResetExpires: null,
          name: 'Myra Parsons',
          gender: 'Male',
          phone: null,
          location: 'Lagos',
          created_at: '2017-11-27T21:49:15.665Z',
          updated_at: '2017-11-27T21:49:15.665Z',
          organization_id: 1,
          PurchaseOrderUsers: {
            status: 'pending',
            role: 'approver',
            position: 4,
            created_at: '2017-11-27T21:49:16.621Z',
            updated_at: '2017-11-27T21:49:36.749Z',
            requisition_id: 317,
            user_id: 874,
          },
        },
        {
          id: 1,
          email: 'megamee2011@gmail.com',
          passwordResetToken: null,
          passwordResetExpires: null,
          name: 'Mega Mee',
          gender: 'male',
          phone: '09090903903',
          location: null,
          created_at: '2017-03-04T18:09:35.036Z',
          updated_at: '2017-03-04T18:09:35.036Z',
          organization_id: 1,
          PurchaseOrderUsers: {
            status: 'pending',
            role: 'buyer',
            position: 1,
            created_at: '2017-11-27T21:49:16.761Z',
            updated_at: '2017-11-27T21:49:36.745Z',
            requisition_id: 317,
            user_id: 1,
          },
        },
        {
          id: 873,
          email: 'je@hegtoek.zm',
          passwordResetToken: null,
          passwordResetExpires: null,
          name: 'Jonathan Lindsey',
          gender: 'Male',
          phone: null,
          location: 'Lagos',
          created_at: '2017-11-27T21:49:15.662Z',
          updated_at: '2017-11-27T21:49:15.662Z',
          organization_id: 1,
          PurchaseOrderUsers: {
            status: 'pending',
            role: 'endorser',
            position: 3,
            created_at: '2017-11-27T21:49:16.559Z',
            updated_at: '2017-11-27T21:49:36.748Z',
            requisition_id: 317,
            user_id: 873,
          },
        },
        {
          id: 872,
          email: 'lo@tet.bg',
          passwordResetToken: null,
          passwordResetExpires: null,
          name: 'Minerva Schmidt',
          gender: 'Female',
          phone: null,
          location: 'Lagos',
          created_at: '2017-11-27T21:49:15.663Z',
          updated_at: '2017-11-27T21:49:15.663Z',
          organization_id: 1,
          PurchaseOrderUsers: {
            status: 'pending',
            role: 'endorser',
            position: 2,
            created_at: '2017-11-27T21:49:16.556Z',
            updated_at: '2017-11-27T21:49:36.747Z',
            requisition_id: 317,
            user_id: 872,
          },
        },
      ],
    };
  },
  mounted() {
    // this.selectedPurchase_order.approvalUsers = this.approvalUsers;
    const organizationId = this.selectedPurchase_order.organization_id;
    this.loadOrganizationUsers({ organizationId });
    this.approvedUsersOption = this.organizationUsers.filter(
      (user, index) => this.managerID !== user.id,
    );
    this.initializeApprovers(this.selectedPurchase_order.users);
  },

  methods: {
    // ...mapActions('requisitions', ['saveApprovalUsers', 'removeApprovalUsers']),
    ...mapActions('organizations', ['loadOrganizationUsers']),
    initializeApprovers(allApprovalUsers) {
      let usersWithoutRole = [];

      this.endorsers = allApprovalUsers.filter(
        user => user.id !== this.managerID,
      );
      this.buyer = allApprovalUsers.filter(user => user.id === this.managerID);

      if (this.buyer[0].PurchaseOrderUsers.role !== null) {
        this.endorsers.forEach((user, index) => {
          if (user.PurchaseOrderUsers.role === 'approver') {
            this.approver = this.endorsers.splice(index, 1);
          }
        });
      } else {
        this.approver = this.endorsers.splice(this.endorsers.length - 1, 1);
      }
      let approverUser = this.approver[0];
      let buyer = this.buyer[0];
      if (buyer.PurchaseOrderUsers.role === null) {
        buyer.PurchaseOrderUsers = {
          status: 'pending',
          role: 'buyer',
          position: 1,
          user_id: buyer.id,
          requisition_id: this.selectedPurchase_order.id,
        };
        usersWithoutRole.push(buyer);
      }
      this.endorsers.forEach((user, index) => {
        if (user.PurchaseOrderUsers.role === null) {
          user.PurchaseOrderUsers = {
            status: 'pending',
            role: 'endorser',
            position: index + 2,
            user_id: user.id,
            requisition_id: this.selectedPurchase_order.id,
          };
        }
        usersWithoutRole.push(user);
      });
      if (approverUser.PurchaseOrderUsers.role === null) {
        approverUser.PurchaseOrderUsers = {
          status: 'pending',
          role: 'approver',
          position: this.selectedPurchase_order.users.length,
          user_id: approverUser.id,
          requisition_id: this.selectedPurchase_order.id,
        };
        usersWithoutRole.push(approverUser);
      }
      // console.log(usersWithoutRole, 'users without role');
      if (usersWithoutRole.length > 3) {
        let usersList = [];
        // usersWithoutRole = [buyer, ...this.endorsers, approverUser];
        usersWithoutRole.forEach((user, index) => {
          usersList.push({
            userId: user.PurchaseOrderUsers.user_id,
            role: user.PurchaseOrderUsers.role.toLowerCase(),
            position: index + 1,
          });
        });
        const finalList = {};
        finalList['usersList'] = usersList;
        const id = this.selectedPurchase_order.id;
        // console.log(finalList, id);
        this.saveApprovalUsers({ id, usersList: finalList })
          .then(() => {
            this.buyer = buyer;
            this.approver = approverUser;
            this.endorsers = _.sortBy(this.endorsers, [
              function(user) {
                return user.PurchaseOrderUsers.position;
              },
            ]);
            // this.selectedPurchase_order.approvalUsers = [
            //   this.buyer,
            //   ...this.endorsers,
            //   this.approver
            // ];
            let availableUsers = [this.buyer, ...this.endorsers, this.approver];
            if (this.currentUser.id === this.managerID) {
              // const allUsers = [this.buyer, ...this.endorsers, this.approver];
              this.selectedApprover = _.chunk(availableUsers, 4);
              // console.log('is here');
            } else {
              const outerthis = this;
              let user = _.find(availableUsers, function(user) {
                return user.id === outerthis.currentUser.id;
              });
              const users = availableUsers.slice(
                0,
                user.PurchaseOrderUsers.position,
              );
              // console.log(user.PurchaseOrderUsers.position, 'user can see');
              this.selectedApprover = _.chunk(users, 4);
            }
            // this.initializeApprovers(this.selectedPurchase_order.approvalUsers);
            // this.$snackbar.open(`Personnel added successfully`);
            // this.savingApprovalUser = !this.savingApprovalUser;
            // this.editStatus = !this.editStatus;
            // console.log(this.selectedPurchase_order.approvalUsers);
          })
          .catch(err => {
            // this.$snackbar.open(`An error occured. Try again`);
            // this.savingApprovalUser = !this.savingApprovalUser;
            console.log(err);
          });
      } else {
        this.buyer = buyer;
        this.approver = approverUser;
        this.endorsers = _.sortBy(this.endorsers, [
          function(user) {
            return user.PurchaseOrderUsers.position;
          },
        ]);
        // this.selectedPurchase_order.approvalUsers = [
        //   this.buyer,
        //   ...this.endorsers,
        //   this.approver
        // ];
        let availableUsers = [this.buyer, ...this.endorsers, this.approver];
        if (this.currentUser.id === this.managerID) {
          // const allUsers = [this.buyer, ...this.endorsers, this.approver];
          this.selectedApprover = _.chunk(availableUsers, 4);
          // console.log('is here');
        } else {
          const outerthis = this;
          let user = _.find(availableUsers, function(user) {
            return user.id === outerthis.currentUser.id;
          });
          const users = availableUsers.slice(
            0,
            user.PurchaseOrderUsers.position,
          );
          // console.log(user.PurchaseOrderUsers.position, 'user can see');
          this.selectedApprover = _.chunk(users, 4);
        }
      }
      // console.log(this.selectedApprover[0][1]);
      // console.log(usersWithoutRole, buyer, approverUser, 'users without role');
    },
    setStatus() {
      const outerthis = this;
      this.selectedPurchase_order.users.forEach((user, index) => {
        if (user.PurchaseOrderUsers) {
          if (user === this.selectedPurchase_order.users[0]) {
            user.PurchaseOrderUsers = {
              status: 'pending',
              role: 'Approver',
              position: 0,
              user_id: user.id,
              requisition_id: this.selectedPurchase_order.id,
            };
            // console.log(user.PurchaseOrderUsers.role);
          }

          if (user.id === this.managerID) {
            user.PurchaseOrderUsers = {
              status: 'pending',
              role: 'Buyer',
              position: 0,
              user_id: user.id,
              requisition_id: this.selectedPurchase_order.id,
            };
            // console.log(user.PurchaseOrderUsers.role);
          }

          if (
            user !== this.selectedPurchase_order.users[0] &&
            user.id !== this.managerID
          ) {
            user.PurchaseOrderUsers = {
              status: 'pending',
              role: 'endorser',
              position: 0,
              user_id: user.id,
              requisition_id: this.selectedPurchase_order.id,
            };
            // console.log(user.PurchaseOrderUsers.role);
          }
        }
      });
      // this.selectedApprover = this.requisition.approvalUsers;
      this.swapArrayElements(
        this.selectedApprover,
        0,
        this.selectedApprover.length - 1,
      );
      // console.log(this.selectedApprover, 'something');
    },
    toggleDropDownActive() {
      this.dropDownActive = !this.dropDownActive;
    },
    swapArrayElements(arr, indexA, indexB) {
      const array = arr;
      const temp = array[indexA];
      array[indexA] = array[indexB];
      array[indexB] = temp;
      return array;
    },
    formatedIndex(index, outerIndex) {
      // if (this.formatedSelectedApprover.length > 1) {
      //   let arr = _.size(_.flatten(this.formatedSelectedApprover)) + index;
      //   console.log(arr);
      //   return arr;
      // } else {
      //   return index;
      //   // return this.counter;
      // }
    },
    updateUser(value, userIndex, outerIndex) {
      const countSelectedApprover = _.flattenDeep(this.selectedApprover);
      // console.log(value);
      if (value.PurchaseOrderUsers === undefined) {
        value.PurchaseOrderUsers = {
          status: 'pending',
          role: 'endorser',
          position: countSelectedApprover.length + 1,
          user_id: value.id,
          requisition_id: this.selectedPurchase_order.id,
        };
      }

      if (value === this.selectedApprover[outerIndex][userIndex]) {
        // this.selectedApprover = _.flatten(...this.selectedApprover);
        // console.log(this.selectedApprover);
        // this.selectedApprover.forEach(user => {
        //   if (
        //     user.PurchaseOrderUsers.role !== 'Buyer' &&
        //     user.PurchaseOrderUsers.role === 'Approver' &&
        //     user !== value
        //   ) {
        //     user.PurchaseOrderUsers.role = 'Endorser';
        //   } else {
        //     value.PurchaseOrderUsers.role = 'Approver';
        //   }
        // });
        console.log('Was here');
      }
      // console.log(this.selectedApprover[outerIndex].length - 1);
      // this.selectedApprover = _.chunk(this.selectedApprover, 4);
      // console.log(userIndex, value, outerIndex);
    },
    addMultiplePersonnel() {
      this.addMultiplePersonnelActive = !this.addMultiplePersonnelActive;
    },
    addRandomUser() {
      const randomNumber = Math.floor(
        Math.random() * this.organizationUsers.length,
      );
      const randomUser = this.organizationUsers[randomNumber];
      return randomUser;
    },
    randomPersonnel() {
      // let randomUser = this.generateEmptyPersonnel();
      // this.selectedApprover.splice(
      //   this.selectedApprover.length - 1,
      //   0,
      //   randomUser
      // );
      // this.approvedUsersOption[this.approvedUsersOption.length] = randomUser;
      // return randomUser;
    },
    generateEmptyPersonnel() {
      let item = {
        name: '',
        PurchaseOrderUsers: {
          status: 'pending',
          role: '-',
          position: 0,
          user_id: '',
          requisition_id: this.selectedPurchase_order.id,
        },
      };
      return item;
    },
    singlePersonnel() {
      this.editStatus = true;
      let item = this.generateEmptyPersonnel();
      this.selectedApprover = _.flattenDeep(this.selectedApprover);
      this.selectedApprover.splice(this.selectedApprover.length - 1, 0, item);
      this.selectedApprover = _.chunk(this.selectedApprover, 4);
      console.log(this.selectedApprover);
    },
    multiplePersonnel() {
      // this.editStatus = true;
      // let item = this.generateEmptyPersonnel();
      // this.selectedApprover.splice(this.selectedApprover.length - 1, 0, item);
      let item = this.generateEmptyPersonnel();
      this.selectedApprover = _.flattenDeep(this.selectedApprover);
      this.selectedApprover.splice(this.selectedApprover.length - 1, 0, item);
      this.selectedApprover = _.chunk(this.selectedApprover, 4);
      // console.log(this.selectedApprover);
      this.announce(`New personnel added`);
    },
    saveMultipleAdd() {
      // show the loading button before it is saved
      this.savingApprovalUser = !this.savingApprovalUser;
      let flattened = _.flattenDeep(this.selectedApprover);
      let isUnique = _.uniqBy(flattened, 'email');
      let emptyPersonnel = _.find(flattened, function(user) {
        return user.PurchaseOrderUsers.role === '-';
      });

      let goodToSave = false;
      if (isUnique.length === flattened.length) {
        if (emptyPersonnel) {
          goodToSave = false;
          this.savingApprovalUser = !this.savingApprovalUser;
          this.$snackbar.open(`You cannot save until you select a personnel`);
        } else {
          goodToSave = true;
        }
      } else {
        this.editStatus = true;
        this.savingApprovalUser = !this.savingApprovalUser;
        goodToSave = false;
        this.$snackbar.open('You cannot select a personnel multiple times');
      }

      if (this.addMultiplePersonnelActive === true) {
        this.addMultiplePersonnelActive = false;
      }

      if (goodToSave === true) {
        // this.selectedApprover = _.chunk(flattened, 4);
        let listOfApprover = _.flattenDeep(this.selectedApprover);
        let usersList = [];
        // listOfApprover = listOfApprover.filter(user => {
        //   return user.id !== this.managerID;
        // });
        listOfApprover.forEach((user, index) => {
          usersList.push({
            userId: user.PurchaseOrderUsers.user_id,
            role: user.PurchaseOrderUsers.role.toLowerCase(),
            position: index + 1,
          });
        });
        const finalList = {};
        finalList['usersList'] = usersList;
        const id = this.selectedPurchase_order.id;
        console.log(finalList, id);
        this.saveApprovalUsers({ id, usersList: finalList })
          .then(() => {
            // this.initializeApprovers(this.selectedPurchase_order.approvalUsers);
            this.$snackbar.open(`Personnel added successfully`);
            this.savingApprovalUser = !this.savingApprovalUser;
            this.editStatus = !this.editStatus;
            console.log(this.selectedPurchase_order.users);
          })
          .catch(err => {
            this.$snackbar.open(`An error occured. Try again`);
            this.savingApprovalUser = !this.savingApprovalUser;
            console.log(err);
          });
      }
      // this.selectedApprover = _.chunk(this.selectedApprover, 4);
    },
    cancelSave() {
      let currApprovalUsers = [this.buyer, ...this.endorsers, this.approver];
      this.selectedApprover = _.chunk(currApprovalUsers, 4);
      this.editStatus = false;
    },
    announce(message) {
      if (message === 'msg') {
        this.$snackbar.open(`Changes saved successfully`);
      } else if (message === 'multiAddMsg') {
        this.$snackbar.open(`Personnel added`);
      } else {
        this.$snackbar.open(message);
      }
    },
    toggleEditMode() {
      this.editStatus = !this.editStatus;
    },
    deleteRow(index, rows) {
      let flattened = _.flattenDeep(this.selectedApprover);
      if (
        rows[index].id === this.managerID ||
        rows[index].PurchaseOrderUsers.role === 'approver'
      ) {
        this.$snackbar.open(`Sorry, you can not remove this personnel`);
      } else if (flattened.length <= 4) {
        this.$snackbar.open(`You must have at least 4 personnels`);
      } else {
        // rows.splice(index, 1);
        // console.log(rows[index].id, this.requisition.id);
        this.removeApprovalUsers({
          id: this.selectedPurchase_order.id,
          userId: rows[index].id,
        })
          .then(() => {
            rows.splice(index, 1);
            this.$snackbar.open(
              `${rows[index].name} was removed from personnel list`,
            );
          })
          .catch(err => {
            this.$snackbar.open('An error occured. Try again.');
          });
      }
      // console.log(rows[index].id);
    },
    dragStart(e, index) {
      // console.log(e);
      this.$snackbar.open(`The Order of personnels was changed`);
    },
    moved(e) {
      // console.log(e.draggedContext);
    },
    onStart(e) {
      // let outerthis = this;
      // let buyerIndex = _.findIndex(this.selectedApprover, function(user) {
      //   return user.PurchaseOrderUsers.user_id === outerthis.managerID;
      // });
      // let buyer = this.selectedApprover[buyerIndex];
      // this.selectedApprover.splice(buyerIndex, 1);
      // this.selectedApprover.splice(0, 0, buyer);
      // console.log(buyer);
    },
    calcIndex(parentIndex, childIndex) {
      return parentIndex * 4 + childIndex + 1;
    },
    onEnd(e) {},
    closeFullScreen() {
      this.addMultiplePersonnelActive = !this.addMultiplePersonnelActive;
    },
  },
  watch: {
    selectedPurchase_order() {
      this.initializeApprovers(this.selectedPurchase_order.users);
    },
  },
  computed: {
    ...mapState('organizations', ['organizationUsers']),
    ...mapState('purchase_orders', ['selectedPurchase_order']),
    ...mapState('users', ['currentUser']),
    formatedSelectedApprover: {
      get() {
        return _.flattenDeep(this.selectedApprover);
      },
      set(value) {
        // let flattened = value;
        // let buyer = flattened.filter(user => user.id === this.managerID);
        // let others = flattened.filter(user => user.id !== this.managerID);
        // flattened = [...buyer, ...others];
        // this.selectedApprover = _.chunk(flattened, 4);
        // console.log(flattened, this.selectedApprover);
        // return flattened;

        // console.log(value);
        // if (value[0].id !== this.managerID) {
        //   let buyer = value.filter()
        //   this.swapArrayElements(value, 0, 1);
        // }
        // console.log(value[0].email);
        this.selectedApprover = _.chunk(value, 4);
        // console.log(value);
        // _.flattenDeep(this.selectedApprover);
      },
      // return _.chunk(this.selectedApprover, 4);
      // let result = _.chunk(this.selectedApprover, 4);
      // let count = 1;
      // result.forEach((row, index) => {
      //   if (result.length > 1) {
      //     result[count] = _.reverse(result[count]);
      //     count += 2;
      //   }
      // });
      // result = _.flatten(result);
      // let finalResult = [];
      // result.forEach((user, index) => {
      //   if (user !== undefined) {
      //     finalResult.push(user);
      //   }
      // });
      // console.log(_.flatten(finalResult));
      // finalResult = this.swapArrayElements(finalResult, finalResult[0], finalResult[finalResult.length - 1])
      // return finalResult;
    },
    formatedIndexsec() {
      //   let arr = _.size(_.flatten(...this.formatedSelectedApprover));
      //   console.log(arr);
    },
  },
  components: {
    UserIcon,
    Multiselect,
    draggable,
    FullscreenDialog,
    Loading,
  },
};
</script>

<style lang="sass" scoped>
.ApprovalStatus

  .approvalUserMultiSelect
    width: 14vw
    left: 4.3vw
    margin-bottom: 1vw

  small
    font-size: 1.1vw;
    font-weight: 600;

  #edit
    border: none

  .approvalUserSmall
    padding-bottom: 2vw;

  .reversed, .notReversed
    display: flex
    flex-wrap: wrap
    min-height: 150px
    align-items: flex-start

  .reversed
    flex-direction: row-reverse
    justify-content: flex-start

    &:only-child:before, &:only-child:after
      display:none

    .approval-step
      position: relative
      width: 25%
      margin-bottom: 4vw;
      text-align: center
      color: #787878

      &:before, &:after
        content: ""
        position: absolute
        top: 1.9rem
        height: 3px
        background: #CCC

      &.last:before, &.first:after
        top: 1.9rem
        position: absolute
        display: inline-block

      &.first:after
        content: url('../assets/img/Path1.png')
        margin-top: -5vw;
        width: 0;
        margin-left: -4vw;
        height: 2vw;

      &.last:before
        display: none

      &:after
        right: 0
        left: 250px

      &:before
        left: 0
        right: 250px

      &:first-child:before
        left: 0
        right: 250px

      &:last-child:after
        right: 0
        left: 250px

      svg
        fill: #CCC
        width: 4rem

        &.is-success
          color: green
          svg
            fill: green
          &:after, &:before
            background: green

  .notReversed
    justify-content: flex-start
    &:first-child > .first
      &.first:before
        display: none

    .approval-step
      position: relative
      width: 25%
      margin-bottom: 4vw;
      text-align: center
      color: #787878

      &:before, &:after
        content: ""
        position: absolute
        top: 1.9rem
        height: 3px
        background: #CCC

      &.first:before, &.last:before
        top: 1.9rem
        position: absolute
        display: inline-block

      &.first:before
        margin-top: -5vw;
        margin-left: 5vw;
        height: 2vw;
        width: 0vw;
        content: url('../assets/img/Path2.png')

      &.first:before
        // display: none
        // background-color: red

      &:after
        right: 0
        left: 250px

      &:before
        left: 0
        right: 250px

      &.last:after
        display: none

      svg
        fill: #CCC
        width: 4rem

      &.is-success
        color: green
        svg
          fill: green
        &:after, &:before
          background: green

</style>
