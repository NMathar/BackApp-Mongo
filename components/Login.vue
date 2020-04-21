<template>
  <div class="login">
    <b-row>
      <b-col md="3"></b-col>
      <b-col md="6">
        <b-card title="Login">
          <b-card-body>
            <b-input-group class="mb-2 mr-sm-2 mb-sm-0">
              <b-input-group-prepend is-text>
                <b-icon icon="lock-fill"/>
              </b-input-group-prepend>
              <b-input type="password" id="password-input" v-model="password" placeholder="Password"></b-input>
            </b-input-group>
            <b-button variant="primary" class="mt-3" @click="userLogin">Submit</b-button>
          </b-card-body>
        </b-card>
      </b-col>
      <b-col md="3"></b-col>
    </b-row>
  </div>
</template>

<script lang="ts">
  import {Component, Vue} from 'nuxt-property-decorator'
  import {BIcon, BIconLockFill} from 'bootstrap-vue'

  @Component({components: {BIcon, BIconLockFill}})
  export default class extends Vue {
    password: string = ""

    async userLogin() {
      try {
        // @ts-ignore
        let response = await this.$auth.loginWith('local', {data: { password: this.password }})
        console.log(response)
      } catch (err) {
        console.log(err)
      }
    }
  }
</script>

<style></style>
