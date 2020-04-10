<template>
  <div class="mt-4">
    <h4>All Backups</h4>
    <b-button class="mb-4" v-b-modal.backup-modal @click="backupData = {}">New Backup</b-button>
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
        <b-button size="sm" variant="info" @click="testConnection(row.item.id)">Test Connection</b-button>
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

<script lang="ts">
  import {Component, Vue} from 'nuxt-property-decorator'
  import axios from "axios";
  import {BToast} from "bootstrap-vue"
  import BackupModal from "~/components/BackupModal.vue";
  import Dumps from "~/components/Dumps.vue";
  import {Backup} from "~/types"
  import { SimpleCrypto } from "simple-crypto-js/build/SimpleCrypto";


  @Component({
    components: {BackupModal, Dumps}
  })
  export default class extends Vue {
    key: string = process.env.SECRET_KEY || ""
    fields: string[] = ['hostname', 'port', 'database', 'collections', 'schedule', 'username', 'authenticationDatabase',
      'actions', 'show_dumps']
    backups: Backup[] = []
    backupData: Backup | null = null

    async testConnection(id: string) {
      let res = await axios.get("api/db/test/" + id);
      try {
        if (res.status === 200) {
          this.$bvToast.toast(`Connection was successful`, {
            title: 'DB Connection',
            autoHideDelay: 1500,
            variant: 'success',
            solid: true,
          })
        }
      } catch (e) {
        this.$bvToast.toast(`Error: connection failed!`, {
          title: 'DB Connection',
          autoHideDelay: 1500,
          variant: 'danger',
          solid: true,
        })
      }
    }

    backupEdit(data: Backup) {
      const simpleCrypto = new SimpleCrypto(this.key);
      if (data.password && data.password.length > 0) data.password = simpleCrypto.decrypt(data.password).toString()
      // collection names to key value
      // let tagsArr: any = []
      // data.collections.forEach(element => {
      //   // @ts-ignore
      //   tagsArr.push({key: '', value: element.name})
      // })
      // data.collections = tagsArr

      this.backupData = data
      this.$bvModal.show('backup-modal')
    }

    async getAllBackups() {
      this.backups = await axios.get("api/backups");
    }

    async deleteBackup(id: string) {
      let val = await this.$bvModal.msgBoxConfirm('Are you sure?')
      if (val) {
        axios.delete("api/backups/" + id).then(res => {
          // @ts-ignore
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

    mounted() {
      this.getAllBackups();
    }
  }


</script>

<style scoped></style>
