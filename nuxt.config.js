require('dotenv').config()
module.exports = {
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
    css: [
        {src: '@voerro/vue-tagsinput/dist/style.css', lang: 'css'}
    ],
    /*
     ** Plugins to load before mounting the App
     */
    plugins: [{src: '~/plugins/tag-input', mode: 'client'}, {src: '~/plugins/axios', mode: 'client'}],
    /*
     ** Nuxt.js dev-modules
     */
    buildModules: [],
    /*
     ** Nuxt.js modules
     */
    modules: [
        // Doc: https://bootstrap-vue.js.org/docs/
        "bootstrap-vue/nuxt",
        '@nuxtjs/axios',
        ['@nuxtjs/dotenv', { path: 'server/db' }]
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
    serverMiddleware: [
        // Will register redirect-ssl npm package
        // 'redirect-ssl',

        // Will register file from project api directory to handle /api/* requires
        // { path: '/cron/restart', handler: '~/server/index.js' },
        '~/server/index.js'
    ],
    env: {
        SECRET_KEY: process.env.SECRET_KEY
    }
};
