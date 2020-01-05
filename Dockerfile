FROM node:lts-alpine

RUN mkdir -p /home/node/api/node_modules && chown -R node:node /home/node/api

WORKDIR /home/node/api

COPY package.json yarn.* ./

RUN yarn

COPY --chown=node:node . .

USER node

EXPOSE 3333

CMD ["yarn", "dev"]
