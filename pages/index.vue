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
        >Restart
        </b-button>
        <b-button
          variant="success"
          @click="startCron"
          :disabled="cron_status === 'running'"
        >Start
        </b-button>
        <b-button
          variant="danger"
          @click="stopCron"
          :disabled="cron_status === 'stopped'"
        >Stop
        </b-button>
        <b-alert
          v-if="message.length > 0"
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
  import axios from "axios";
  import Backup from "~/components/Backup.vue";

  @Component({
    components: {Backup}
  })
  export default class extends Vue {
    key: string = process.env.SECRET_KEY || ""
    message: string | null = null
    cron_status: string = "running"

    async getCronStatus() {
      const {status} = await axios.get("api/cron/status");
      this.cron_status = status;
    }

    async restartCron() {
      const {success, message} = await axios.get("api/cron/restart");
      if (success) {
        this.getCronStatus();
      } else {
        this.message = message;
      }
    }

    async startCron() {
      const {success, message} = await axios.get("api/cron/start");
      if (success) {
        this.getCronStatus();
      } else {
        this.message = message;
      }
    }

    async stopCron() {
      const {success, message} = await axios.get("api/cron/stop");
      if (success) {
        this.getCronStatus();
      } else {
        this.message = message;
      }
    }

    mounted() {
      this.getCronStatus();
    }
  }
</script>

<style></style>
