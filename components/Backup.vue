<template>
  <div class="mt-4">
    <h4>All Backups</h4>
    <CreateBackup/>
    <b-table striped hover :items="backups" :fields="fields">
      <template v-slot:cell(collections)="row">
          <div v-for="item in row.item.collections">
            <b-badge variant="info">{{ item.name }}</b-badge> <br>
          </div>
      </template>
      <template v-slot:cell(actions)="row">
        <b-button size="sm" variant="danger" @click="deleteBackup(row.item.id)" class="mr-1">
          X
        </b-button>
      </template>
      <template v-slot:cell(show_dumps)="row">
        <b-button size="sm" @click="row.toggleDetails" class="mr-2">
          {{ row.detailsShowing ? 'Hide' : 'Show'}} Dumps
        </b-button>
      </template>
      <template v-slot:row-details="row">
        <b-card>
          <h4>Dumps</h4>
        </b-card>
      </template>
    </b-table>
  </div>
</template>

<script>
    import CreateBackup from "~/components/CreateBackup";

    export default {
        name: "Backup",
        components: {
            CreateBackup
        },
        data() {
            return {
                fields: ['hostname', 'port', 'database', 'collections', 'schedule', 'username', 'authenticationDatabase',
                    {key: 'actions', label: 'Actions'}, 'show_dumps'],
                backups: []
            };
        },
        methods: {
            async getAllBackups() {
                this.backups = await this.$axios.$get("api/backups");
            },
            deleteBackup(id){
              this.$axios.$delete("api/backups/"+id).then(res => {
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
        },
        mounted() {
            this.getAllBackups();
        }
    };
</script>

<style scoped></style>
