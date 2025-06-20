FROM node:18-alpine

WORKDIR /usr/src/app

# Install dependencies for Prisma and wait-for-it
RUN apk add --no-cache openssl

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Add wait-for-it script
RUN wget -O /wait-for-it.sh https://github.com/vishnubob/wait-for-it/raw/master/wait-for-it.sh
RUN chmod +x /wait-for-it.sh

CMD ["sh", "-c", "/wait-for-it.sh db:5432 --timeout=30 -- npm start"]