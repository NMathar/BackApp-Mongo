<template>
  <div class="container">
    <div>
      <logo />
      <h1 class="title">
        BackApp-Mongo --> {{message}}
      </h1>
      <h2 class="subtitle">
        Backup your MongoDB Databases
      </h2>
      <div class="links">
        <a
          href="https://nuxtjs.org/"
          target="_blank"
          class="button--green"
        >
          Documentation
        </a>
        <a
          href="https://github.com/nuxt/nuxt.js"
          target="_blank"
          class="button--grey"
        >
          GitHub
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from "nuxt-property-decorator";
import {
  createDumpCommand,
  executeCommand,
  createRestoreCommand
} from "ale-mongoutils";

interface Credentials {
  database: string;
  dist: string;
  host: string;
  username?: string;
  password?: string;
  collections?: Array<{ name: string; query?: string }>;
  authenticationDatabase?: string;
}

@Component
export default class Index extends Vue {
  message: string = "This is a message";
  mongoutils_instaled: boolean = true;

  async mounted() {
    // this.mongoutils_instaled = await checkInstalled();
  }
}
</script>

<style>
</style>
