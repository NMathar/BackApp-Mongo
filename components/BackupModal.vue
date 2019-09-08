<template>
  <div>
    <b-modal
      id="backup-modal"
      ref="modal"
      title="Create New Backup"
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
            v-model="backupData.hostname"
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
            v-model="backupData.port"
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
            v-model="backupData.database"
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
                      v-model="backupData.collections"></tags-input>
        </b-form-group>
        <b-form-group
          label="Auth Database"
          label-for="auth-database-input"
        >
          <b-form-input
            id="auth-database-input"
            v-model="backupData.authenticationDatabase"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Schedule"
          label-for="schedule-input"
          invalid-feedback="Schedule is required"
        >
          <b-form-input
            id="schedule-input"
            v-model="backupData.schedule"
            required
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Max Dumps"
          label-for="max-dumps-input"
        >
          <b-form-input
            type="number"
            id="max-dumps-input"
            v-model="backupData.max_dumps"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Username"
          label-for="username-input"
        >
          <b-form-input
            id="username-input"
            v-model="backupData.username"
          ></b-form-input>
        </b-form-group>
        <b-form-group
          label="Password"
          label-for="password-input"
        >
          <b-form-input
            :type="pw_switch ? 'text' : 'password'"
            id="password-input"
            v-model="backupData.password"
          ></b-form-input>
          <b-form-checkbox v-model="pw_switch" size="sm">Show Password</b-form-checkbox>
        </b-form-group>
      </form>
    </b-modal>
  </div>
</template>

<script>
    //TODO: validate form in frontend
    export default {
        props: {
            backupData: {
                type: Object,
                default: function () {
                    return {
                        id: '',
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
            }
        },
        name: "CreateBackup",
        data() {
            return {
                pw_switch: false,
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
        computed: {
            cleanBackupData () {
                this.backupData = this.empty_backup
            }
        },
        methods: {
            // checkFormValidity() {
            //     const valid = this.$refs.form.checkValidity()
            //     this.nameState = valid ? 'valid' : 'invalid'
            //     return valid
            // },
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

                if (this.backupData.id && this.backupData.id.length > 0) {
                    this.$axios.$put("api/backups/" + this.backupData.id, this.backupData).then(res => {
                        this.$axios.$get("api/cron/restart") // restart cron to add the new server
                        // Hide the modal manually
                        this.$parent.getAllBackups()
                        this.$nextTick(() => {
                            this.$refs.modal.hide()
                        })
                    }).catch(err => {
                        console.error(err)
                    });
                } else {
                    delete this.backupData.id
                    //send infos to the server
                    this.$axios.$post("api/backups", this.backupData).then(res => {
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
    }
</script>

<style scoped>

</style>
