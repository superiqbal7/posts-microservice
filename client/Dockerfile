FROM node:16-alpine

# Add the following lines
ENV CI=true

WORKDIR /app
COPY package.json ./
RUN npm install
COPY ./ ./

CMD ["npm", "start"]
