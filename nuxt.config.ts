import {Configuration} from '@nuxt/types'

const config: Configuration = {
  mode: "universal",
  /*
   ** Headers of the page
   */
  head: {
    title: process.env.npm_package_name || "",
    meta: [
      {charset: "utf-8"},
      {name: "viewport", content: "width=device-width, initial-scale=1"},
      {
        hid: "description",
        name: "description",
        content: process.env.npm_package_description || ""
      }
    ],
    link: [{rel: "icon", type: "image/x-icon", href: "/favicon.ico"}]
  },
  /*
   ** Customize the progress-bar color
   */
  loading: {color: "#fff"},
  /*
   ** Global CSS
   */
  css: [],
  /*
   ** Plugins to load before mounting the App
   */
  // plugins: [{src: '~/plugins/axios', mode: 'client'}],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ['@nuxt/typescript-build'],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://bootstrap-vue.js.org/docs/
    "bootstrap-vue/nuxt",
    '@nuxtjs/axios',
    '@nuxtjs/dotenv'
  ],
  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
    }
  },
  env: {
    SECRET_KEY: process.env.SECRET_KEY || ""
  }
}
export default config
