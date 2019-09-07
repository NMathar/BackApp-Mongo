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

<script>
    export default {
        data(){
            return {
                message : "Test1"
            }
        }
    }
</script>

<style>
</style>
