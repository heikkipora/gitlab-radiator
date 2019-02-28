FROM node:8

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
COPY .gitlab-radiator.yml /root/.gitlab-radiator.yml

RUN npm install -g gitlab-radiator
RUN npm install -g socket.io

# Bundle app source
COPY . .

EXPOSE 3000
CMD [ "gitlab-radiator" ]
