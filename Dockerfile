FROM node:8

WORKDIR /usr/src/app

ADD ./ ./

RUN npm install babel-register babel-preset-env --save-dev
RUN ./build-npm
 
RUN useradd -ms /bin/bash radiator
RUN chown -R radiator /usr/src/app 
USER radiator
WORKDIR /home/radiator
EXPOSE 3000
CMD [ "/usr/src/app/build/bin/gitlab-radiator" ]
