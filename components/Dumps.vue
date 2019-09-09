<template>
  <div class="mt-4">
    <div v-for="folder in dumps">
      <h5>{{folder.folder}}
        <b-btn variant="primary" size="sm" @click="dlDump(folder.folder, folder.db)">Download</b-btn>
        <b-btn variant="warning" size="sm" @click="restoreDump(folder.folder, folder.db)">Restore</b-btn>
      </h5>
      <ul>
        <li v-for="files in folder.dumps">
          {{files}}
        </li>
      </ul>
      <hr>
    </div>
  </div>
</template>

<script>
    export default {
        props: ['backupId'],
        data() {
            return {
                dumps: [],
            };
        },
        methods: {
            async restoreDump(folder) {
                let val = await this.$bvModal.msgBoxConfirm('Are you sure?')
                if(val){
                    let res = await this.$axios.$get("api/restore/dump/" + this.backupId + '/' + folder)
                    if(!res.success){
                        this.$bvToast.toast(res.message, {
                            title: 'Restore Error',
                            autoHideDelay: 1500,
                            variant: 'danger',
                            solid: true,
                        })
                    }else{
                        this.$bvToast.toast(`Backup successful restored`, {
                            title: 'Restore',
                            autoHideDelay: 1500,
                            variant: 'success',
                            solid: true,
                        })
                    }
                }
            },
            dlDump(folder, database) {
                this.$axios.$get("api/download/dump/" + this.backupId + '/' + folder, {responseType: 'blob'})
                    .then(response => {
                        if (!window.navigator.msSaveOrOpenBlob) {
                            // BLOB NAVIGATOR
                            var blob = new Blob([response], {type: "application/zip"});
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.setAttribute('download', database + '.zip');
                            document.body.appendChild(link);
                            link.click();
                        } else {
                            // BLOB FOR EXPLORER 11
                            const url = window.navigator.msSaveOrOpenBlob(new Blob([response]), database + '.zip');
                            window.open(url);
                        }
                    })
            },
            async getDumps() {
                const {dumps} = await this.$axios.$get("api/backups/dumps/" + this.backupId);
                this.dumps = dumps;
            }
        },
        mounted() {
            this.getDumps();
        }
    };
</script>

<style></style>
