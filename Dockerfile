FROM mcr.microsoft.com/playwright:latest

ENV DOCKER_PLAYWRIGHT=1

WORKDIR /test

COPY package.json .
RUN yarn install --frozen-lockfile

COPY . .

CMD ["yarn", "test"]