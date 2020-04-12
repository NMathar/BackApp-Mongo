<template>
  <div class="mt-4">
    <div v-for="folder in dumps">
      <hr>
      <h5>{{folder.folder}}
        <b-btn variant="primary" size="sm" @click="dlDump(folder.folder, folder.db)">Download</b-btn>
        <b-btn variant="warning" size="sm" @click="restoreDump(folder.folder, folder.db)">Restore</b-btn>
      </h5>
      <ul>
        <li v-for="files in folder.dumps">
          {{files}}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
  import axios from "axios";
  import {Prop, Component, Vue, Watch} from "nuxt-property-decorator";
  import {Dump} from "~/types";

  @Component({})
  export default class extends Vue {
    @Prop()
    backupId!: string
    @Watch('backupId')
    onIdChange(val: string, oldVal: string) {
      console.log(val)
    }
    dumps: Dump[] = []

    async restoreDump(folder: string) {
      let val = await this.$bvModal.msgBoxConfirm('Are you sure?')
      if (val) {
        try {
          const {data} = await axios.get("api/restore/dump/" + this.backupId + '/' + folder)
          if (!data.success) {
            this.$bvToast.toast(data.message, {
              title: 'Restore Error',
              autoHideDelay: 1500,
              variant: 'danger',
              solid: true,
            })
          } else {
            this.$bvToast.toast(`Backup successful restored`, {
              title: 'Restore',
              autoHideDelay: 1500,
              variant: 'success',
              solid: true,
            })
          }
        } catch (e) {
          this.$bvToast.toast("Restore Error", {
            title: 'Error',
            autoHideDelay: 1500,
            variant: 'danger',
            solid: true,
          })
        }
      }
    }

    async dlDump(folder: string, database: string) {
      const {data} = await axios.get("api/download/dump/" + this.backupId + '/' + folder, {responseType: 'blob'})
      if (!window.navigator.msSaveOrOpenBlob) {
        // BLOB NAVIGATOR
        var blob = new Blob([data], {type: "application/zip"});
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', database + '.zip');
        document.body.appendChild(link);
        link.click();
      } else {
        // BLOB FOR EXPLORER 11
        const url = window.navigator.msSaveOrOpenBlob(new Blob([data]), database + '.zip');
        console.log(url)
        window.open("/");
      }
    }

    async getDumps() {
      const {data} = await axios.get("api/backups/dumps/" + this.backupId);
      this.dumps = data.dumps;
    }

    mounted() {
      this.getDumps();
    }
  }
</script>
