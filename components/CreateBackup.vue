<template>
  <div>
    <b-button class="mb-4" v-b-modal.new-backup-modal>New Backup</b-button>


    <b-modal
      id="new-backup-modal"
      ref="modal"
      title="Create New Backup"
      @show="resetModal"
      @hidden="resetModal"
      @ok="handleOk"
    >
      <form ref="form" @submit.stop.prevent="handleSubmit">
        <b-form-group
          label="Server"
          label-for="server-input"
          invalid-feedback="Server is required"
        >
          <b-form-input
            id="server-input"
            v-model="new_backup.hostname"
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Port"
          label-for="port-input"
          invalid-feedback="Port is required"
        >
          <b-form-input
            id="port-input"
            v-model="new_backup.port"
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Database"
          label-for="database-input"
          invalid-feedback="Database is required"
        >
          <b-form-input
            id="database-input"
            v-model="new_backup.database"
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Collection"
          label-for="collection-input"
          invalid-feedback="Collection is required"
        >
<!--          <b-form-input-->
<!--            id="collection-input"-->
<!--            v-model="new_backup.collections"-->
<!--            required-->
<!--          ></b-form-input>-->
          <tags-input element-id="collection-input"
                      :add-tags-on-blur="true"
                      v-model="new_backup.collections"></tags-input>
        </b-form-group>
        <b-form-group
          label="Auth Database"
          label-for="auth-database-input"
        >
          <b-form-input
            id="auth-database-input"
            v-model="new_backup.authenticationDatabase"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Schedule"
          label-for="schedule-input"
          invalid-feedback="Schedule is required"
        >
          <b-form-input
            id="schedule-input"
            v-model="new_backup.schedule"
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Username"
          label-for="username-input"
        >
          <b-form-input
            id="username-input"
            v-model="new_backup.username"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Password"
          label-for="password-input"
        >
          <b-form-input
            type="password"
            id="password-input"
            v-model="new_backup.password"
          ></b-form-input>
        </b-form-group>
      </form>
    </b-modal>
  </div>
</template>

<script>
    //TODO: validate form in frontend
    export default {
        name: "CreateBackup",
        data() {
            return {
                new_backup: {
                    database: '',
                    collections: [],
                    hostname: '',
                    port: '',
                    username: '', password: '',
                    schedule: '',
                    authenticationDatabase: '',
                    max_dumps: 3
                },
                empty_backup: {
                    database: '',
                    collections: [],
                    hostname: '',
                    port: '',
                    username: '', password: '',
                    schedule: '',
                    authenticationDatabase: '',
                    max_dumps: 3
                }
            }
        },
        methods: {
            // checkFormValidity() {
            //     const valid = this.$refs.form.checkValidity()
            //     this.nameState = valid ? 'valid' : 'invalid'
            //     return valid
            // },
            resetModal() {
                this.new_backup = this.empty_backup
            },
            handleOk(bvModalEvt) {
                // Prevent modal from closing
                bvModalEvt.preventDefault()
                // Trigger submit handler
                this.handleSubmit()
            },
            handleSubmit() {
                // Exit when the form isn't valid
                // if (!this.checkFormValidity()) {
                //     return
                // }

                //send infos to the server
                this.$axios.$post("api/backups", this.new_backup).then(res => {
                    this.$axios.$get("api/cron/restart") // restart cron to add the new server
                    // Hide the modal manually
                    this.$parent.getAllBackups()
                    this.$nextTick(() => {
                        this.$refs.modal.hide()
                    })
                }).catch(err => {
                    console.error(err)
                });
            }
        }
    }
</script>

<style scoped>

</style>
