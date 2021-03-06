<template>
  <div class="mt-4">
    <h4>All Backups</h4>
    <b-button class="mb-4" v-b-modal.backup-modal @click="backupData = empty_backup">
      <b-icon icon="plus"/>
      New Backup
    </b-button>
    <BackupModal ref="backupModal" :backupData="backupData"/>
    <b-table striped hover :items="backups" :fields="fields">
      <template v-slot:cell(collections)="row">
        <div v-for="item in row.item.collections">
          <b-badge variant="info" aria-hidden="true">{{ item }}</b-badge>
          <br>
        </div>
      </template>
      <template v-slot:cell(actions)="row">
        <b-button size="sm" variant="danger" @click="deleteBackup(row.item.id)" class="mr-1">
          <b-icon icon="trash-fill" aria-hidden="true"></b-icon>
        </b-button>
        <b-button size="sm" variant="primary" @click="backupEdit(row.item)">
          <b-icon icon="pencil" aria-hidden="true"></b-icon>
        </b-button>
        <b-button size="sm" variant="info" @click="testConnection(row.item.id)" :disabled="testConnectionRunning">
          <b-spinner v-if="testConnectionRunning" small></b-spinner>
          <span v-if="testConnectionRunning" class="sr-only">Loading...</span>
          Test Connection
        </b-button>
      </template>
      <template v-slot:cell(show_dumps)="row">
        <b-button size="sm" @click="row.toggleDetails" class="mr-2">
          Dumps
          <b-icon :icon="row.detailsShowing ? 'caret-down-fill' : 'caret-left-fill'" aria-hidden="true" />
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
  import {BIcon, BIconPlus, BIconTrashFill, BIconPencil, BIconCaretLeftFill, BIconCaretDownFill} from 'bootstrap-vue'
  import axios from "axios";
  import {BToast} from "bootstrap-vue"
  import BackupModal from "~/components/BackupModal.vue";
  import Dumps from "~/components/Dumps.vue";
  import {Backup} from "~/types"
  import Rabbit from "crypto-js/rabbit"
  import ENC from "crypto-js/enc-utf8"

  @Component({
    components: {
      BackupModal,
      Dumps,
      BIcon,
      BIconPlus,
      BIconTrashFill,
      BIconPencil,
      BIconCaretLeftFill,
      BIconCaretDownFill
    }
  })
  export default class extends Vue {
    key: string = process.env.SECRET_KEY || ""
    fields: string[] = ['hostname', 'port', 'database', 'collections', 'schedule', 'username', 'authenticationDatabase',
      'actions', 'show_dumps']
    backups: Backup[] = []
    backupData: Backup | null = null
    testConnectionRunning: boolean = false
    empty_backup: Backup = {
      database: '',
      collections: [],
      hostname: '', port: 0,
      username: '', password: '',
      schedule: '',
      authenticationDatabase: '',
      max_dumps: 3
    }

    async testConnection(id: string) {
      this.testConnectionRunning = true
      const data = await this.$axios.$get("/api/db/test/" + id);
      try {
        if (data.connection) {
          this.$bvToast.toast(`Connection was successful`, {
            title: 'DB Connection',
            autoHideDelay: 1500,
            variant: 'success',
            solid: true,
          })
        } else {
          this.$bvToast.toast(`Error: connection failed!`, {
            title: 'DB Connection',
            autoHideDelay: 1500,
            variant: 'danger',
            solid: true,
          })
        }
        this.testConnectionRunning = false
      } catch (e) {
        this.$bvToast.toast(`Error: connection failed!`, {
          title: 'DB Connection',
          autoHideDelay: 1500,
          variant: 'danger',
          solid: true,
        })
        this.testConnectionRunning = false
      }
    }

    backupEdit(data: Backup) {
      if (data.password) data.password = Rabbit.decrypt(data.password, this.key).toString(ENC)
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
      const data = await this.$axios.$get("/api/backups");
      this.backups = data
    }

    async deleteBackup(id: string) {
      let val = await this.$bvModal.msgBoxConfirm('Are you sure?')
      if (val) {
        try{
          await this.$axios.$delete("/api/backups/" + id)
          // @ts-ignore
          this.$parent.restartCron(); // restart cron to prevent still updates for the deleted server
          this.getAllBackups();
          this.$bvToast.toast(`Backup successful deleted`, {
            title: 'Delete',
            autoHideDelay: 1500,
            variant: 'success',
            solid: true,
          })
        }catch (e) {
          console.error(e)
        }
      }
    }

    mounted() {
      this.getAllBackups();
    }
  }


</script>

<style scoped></style>
