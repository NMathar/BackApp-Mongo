# BackApp-Mongo

> Centralize and organize your MongoDB dumps easily

## Start with docker container

``` bash
$ docker run -d -p 3000:3000  --volume=/opt/mongo-backup:/usr/src/app/server/db --name mongodb-backup-app nmonst4/mongodb-backup-app
```

## Build Setup for local usage

``` bash
# install dependencies
$ npm run install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run generate:key
$ npm run build
$ npm run start
```

## Config

SECRET_KEY -> generates by: npm run generate:key
MAILER_URL -> https://nodemailer.com/smtp/
CRON_MAIL_ADDRESS


For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).
