<template>
  <div class="mt-4">
    <h4>All Backups</h4>
    <b-button class="mb-4" v-b-modal.backup-modal>New Backup</b-button>
    <BackupModal ref="backupModal" :backupData="backupData"/>
    <b-table striped hover :items="backups" :fields="fields">
      <template v-slot:cell(collections)="row">
        <div v-for="item in row.item.collections">
          <b-badge variant="info">{{ item.name }}</b-badge>
          <br>
        </div>
      </template>
      <template v-slot:cell(actions)="row">
        <b-button size="sm" variant="danger" @click="deleteBackup(row.item.id)" class="mr-1">
          X
        </b-button>
        <b-button size="sm" variant="primary" @click="backupEdit(row.item)">Edit</b-button>
      </template>
      <template v-slot:cell(show_dumps)="row">
        <b-button size="sm" @click="row.toggleDetails" class="mr-2">
          {{ row.detailsShowing ? 'Hide' : 'Show'}} Dumps
        </b-button>
      </template>
      <template v-slot:row-details="row">
        <b-card>
          <h4>Dumps
            <b-badge variant="secondary">Max: {{row.item.max_dumps}}</b-badge>
          </h4>
          <dumps :backup-id="row.item.id"></dumps>
        </b-card>
      </template>
    </b-table>
  </div>
</template>

<script>
    import BackupModal from "~/components/BackupModal";
    import Dumps from "~/components/Dumps";

    const SimpleCrypto = require("simple-crypto-js").default;
    const _secretKey = process.env.SECRET_KEY;
    const simpleCrypto = new SimpleCrypto(_secretKey);

    export default {
        name: "Backup",
        components: {
            BackupModal,
            Dumps
        },
        data() {
            return {
                key: _secretKey,
                fields: ['hostname', 'port', 'database', 'collections', 'schedule', 'username', 'authenticationDatabase',
                    {key: 'actions', label: 'Actions'}, 'show_dumps'],
                backups: [],
                backupData: {}
            };
        },
        methods: {
            backupEdit(data) {
                if (data.password && data.password.length > 0)
                    data.password = simpleCrypto.decrypt(data.password)
                // collection names to key value
                let tagsArr = []
                data.collections.forEach(element => {
                    tagsArr.push({key: '', value: element.name})
                })
                data.collections = tagsArr

                this.backupData = data
                this.$bvModal.show('backup-modal')
            },
            async getAllBackups() {
                this.backups = await this.$axios.$get("api/backups");
            },
            async deleteBackup(id) {
                let val = await this.$bvModal.msgBoxConfirm('Are you sure?')
                if(val){
                    this.$axios.$delete("api/backups/" + id).then(res => {
                        this.$parent.restartCron(); // restart cron to prevent still updates for the deleted server
                        this.getAllBackups();
                        this.$bvToast.toast(`Backup successful deleted`, {
                            title: 'Delete',
                            autoHideDelay: 1500,
                            variant: 'success',
                            solid: true,
                        })
                    }).catch(err => {
                        console.error(err)
                    })
                }
            }
        },
        mounted() {
            this.getAllBackups();
        }
    };
</script>

<style scoped></style>
