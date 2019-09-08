<template>
  <div class="mt-4">
    <h4>All Backups</h4>
    <CreateBackup/>
    <b-table striped hover :items="backups" :fields="fields">
      <template v-slot:cell(actions)="row">
        <b-button size="sm" variant="danger" @click="deleteBackup(row.item.id)" class="mr-1">
          X
        </b-button>
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
                fields: ['hostname', 'port', 'database', 'collection', 'schedule', 'username', 'authenticationDatabase',
                    {key: 'actions', label: 'Actions'}],
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
                  this.$bvToast.toast(`Backup successful deleted`, {
                      title: 'Delete',
                      autoHideDelay: 5000,
                      variant: 'success',
                      solid: true
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
