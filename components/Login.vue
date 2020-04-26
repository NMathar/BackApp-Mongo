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
  import {Component, Getter, Vue} from 'nuxt-property-decorator'
  import {BIcon, BIconLockFill} from 'bootstrap-vue'
  const Cookie = process.client ? require("js-cookie") : undefined

  @Component({components: {BIcon, BIconLockFill}})
  export default class extends Vue {
    password: string = ""
    startRoute: string = "/dashboard"
    @Getter isAuthenticated!: boolean

    async userLogin() {
      try {
        // @ts-ignore
        const data = await this.$axios.$post("/api/auth/login", {
          password: this.password
        })
        this.$store.commit("setToken", data.token) // mutating to store for client rendering
        Cookie.set("token", data.token, {
          expires: parseInt(process.env.COOKIE_EXPIRE || "7")
        }) // saving token in cookie for server rendering
        // show success message
        // this.$bvToast.toast('Du hast dich erfolgreich angemeldet.', {
        //     title: 'Login Erfolgreich',
        //     autoHideDelay: 1000,
        //     solid: true,
        //     variant: 'success',
        // });
        // timeout for animation
        // setTimeout(() => {
        await this.$router.push(this.startRoute)
      } catch (err) {
        console.log(err)
        this.$bvToast.toast('Wrong password.', {
            title: 'Login Failed',
            autoHideDelay: 1000,
            solid: true,
            variant: 'danger',
        });
      }
    }
    mounted() {
      if (this.isAuthenticated) {
        this.$router.push(this.startRoute)
      }
    }

  }
</script>

<style></style>
