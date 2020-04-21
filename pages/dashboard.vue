<template>
  <div class="container">
    <div>
      <h2>
        MongoDB Backup App
      </h2>
      <div class="float-right">
        <h4 class="title">Cron Status:
          <b-badge :variant="cron_status === 'running' ? 'success' : 'danger'">{{ cron_status }}</b-badge>
        </h4>
        <b-button variant="warning"
                  @click="restartCron"
                  :disabled="cron_status === 'stopped'"
        ><b-icon icon="arrow-repeat" /> Restart
        </b-button>
        <b-button
          variant="success"
          @click="startCron"
          :disabled="cron_status === 'running'"
        ><b-icon icon="play-fill" /> Start
        </b-button>
        <b-button
          variant="danger"
          @click="stopCron"
          :disabled="cron_status === 'stopped'"
        ><b-icon icon="stop-fill" /> Stop
        </b-button>
        <b-alert
          v-if="message && message.length > 0"
          v-model="message"
          variant="warning"
          dismissible
        >

          {{ message }}
        </b-alert>
      </div>
      <Backup/>
    </div>
  </div>
</template>

<script lang="ts">
  import {Component, Vue} from 'nuxt-property-decorator'
  import Backup from "~/components/Backup.vue";
  import {BIcon, BIconArrowRepeat, BIconStopFill, BIconPlayFill} from 'bootstrap-vue'

  @Component({
    components: {Backup, BIcon, BIconArrowRepeat, BIconStopFill, BIconPlayFill},
    middleware: 'auth'
  })
  export default class extends Vue {
    key: string = process.env.SECRET_KEY || ""
    message: string | null = null
    cron_status: string = "waiting"

    async getCronStatus() {
      const data = await this.$axios.$get("/api/cron/status");
      this.cron_status = data.status;
    }

    async restartCron() {
      const data = await this.$axios.$get("/api/cron/restart");
      if (data.success) {
        await this.getCronStatus();
      } else {
        this.message = data.message;
      }
    }

    async startCron() {
      const data = await this.$axios.$get("/api/cron/start");
      if (data.success) {
        await this.getCronStatus();
      } else {
        this.message = data.message;
      }
    }

    async stopCron() {
      const data = await this.$axios.$get("/api/cron/stop");
      if (data.success) {
        await this.getCronStatus();
      } else {
        this.message = data.message;
      }
    }

    mounted() {
      this.getCronStatus();
    }
  }
</script>

<style></style>

