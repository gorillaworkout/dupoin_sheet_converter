FROM node:22-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps

COPY . .

# Generate Prisma client
RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
