<template>
  <div class="float-right mt-1">
    <b-button @click="logout"><b-icon icon="power" /></b-button>
  </div>
</template>

<script lang="ts">
  import {Component, Vue} from 'nuxt-property-decorator'
  import {BIcon, BIconPower} from 'bootstrap-vue'

  const Cookie = process.client ? require("js-cookie") : undefined

  @Component({
    components: {BIcon, BIconPower}
  })
  export default class extends Vue {
    logout() {
      Cookie.remove("token")
      this.$store.commit("setToken", "")
      this.$router.push("/")
    }
  }
</script>

<style></style>
