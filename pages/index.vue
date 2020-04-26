<template>
  <div class="container">
    <Login/>
  </div>
</template>

<script lang="ts">
  import {Component, Vue} from 'nuxt-property-decorator'
  import Login from "~/components/Login.vue"

  @Component({
    components: {Login}
  })
  export default class extends Vue {

  }
</script>

<style></style>
