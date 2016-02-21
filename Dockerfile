FROM node:5

ENV NEW_RELIC_NO_CONFIG_FILE=1 \
    NEW_RELIC_APP_NAME=logdrain \
    NEW_RELIC_LICENSE_KEY=**ChangeMe** \
    NEW_RELIC_LOG=stdout \
    HEAPDUMP=**ChangeMe**

EXPOSE 3000
CMD node /app

ADD . /app
RUN cd /app \
  && npm install grunt-cli -g \
  && npm install \
  && grunt \
  && grunt check \
  && npm prune --production \
  && rm -rf ~/.npm
