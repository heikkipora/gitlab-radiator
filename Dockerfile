FROM node:8

RUN mkdir -p /opt/app/gitlab-radiator-src
COPY . /opt/app/gitlab-radiator-src

WORKDIR /opt/app/gitlab-radiator-src
RUN npm install &&\
    npm run eslint &&\
    ./build-npm &&\
    mv /opt/app/gitlab-radiator-src/build /opt/app/gitlab-radiator &&\
    mv /opt/app/gitlab-radiator-src/node_modules /opt/app/gitlab-radiator/node_modules &&\
    rm -Rf /opt/app/gitlab-radiator-src &&\
    chown -R node /opt/app

WORKDIR /opt/app/gitlab-radiator

USER node

EXPOSE 3000

ENTRYPOINT [ "/opt/app/gitlab-radiator/bin/gitlab-radiator" ]
