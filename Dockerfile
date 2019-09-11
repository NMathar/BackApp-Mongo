FROM node:stretch

# create destination directory
RUN mkdir -p /usr/src/nuxt-app
WORKDIR /usr/src/nuxt-app

# update and install dependency
RUN apt-get update
RUN apt-get install -y mongo-tools

# copy the app, note .dockerignore
COPY . /usr/src/nuxt-app/
RUN npm install --no-audit

# build necessary, even if no static files are needed,
# since it builds the server as well
# Create fake SECRET_KEY for build
RUN npm run generate:key
RUN npm run build
# Remove fake key
RUN rm server/db/.env

# expose 3000 on container
EXPOSE 3000

# Use Volume
VOLUME server/db

# set app serving to permissive / assigned
ENV NUXT_HOST=0.0.0.0
# set app port
ENV NUXT_PORT=3000

#ENV BASE_URL='localhost:5000'

# start the app
CMD [ "npm", "start" ]
