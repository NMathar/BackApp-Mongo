<template>
  <div class="container">
    <div>
      <h1 class="title">Cron Status --> {{ cron_status }}</h1>
      <h2 class="subtitle">
        Backup your MongoDB Databases
      </h2>
      <b-button variant="warning"
                @click="restartCron"
                :disabled="cron_status === 'stopped'"
      >Restart</b-button>
      <b-button
        variant="success"
        @click="startCron"
        :disabled="cron_status === 'running'"
        >Start</b-button
      >
      <b-button
        variant="danger"
        @click="stopCron"
        :disabled="cron_status === 'stopped'"
        >Stop</b-button
      >
      <b-alert
        v-if="message.length > 0"
        v-model="message"
        variant="warning"
        dismissible
      >
        {{ message }}
      </b-alert>
      <Backup />
    </div>
  </div>
</template>

<script>
import Backup from "~/components/Backup";
export default {
  components: {
    Backup
  },
  data() {
    return {
      message: "",
      cron_status: "running"
    };
  },
  methods: {
    async getCronStatus() {
      const { status } = await this.$axios.$get("api/cron/status");
      this.cron_status = status;
    },
    async restartCron() {
      const { success, message } = await this.$axios.$get("api/cron/restart");
      if (success) {
        this.getCronStatus();
      } else {
        this.message = message;
      }
    },
    async startCron() {
      const { success, message } = await this.$axios.$get("api/cron/start");
      if (success) {
        this.getCronStatus();
      } else {
        this.message = message;
      }
    },
    async stopCron() {
      const { success, message } = await this.$axios.$get("api/cron/stop");
      if (success) {
        this.getCronStatus();
      } else {
        this.message = message;
      }
    }
  },
  mounted() {
    this.getCronStatus();
  }
};
</script>

<style></style>
