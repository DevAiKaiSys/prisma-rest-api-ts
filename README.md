# [REST API Example](https://github.com/prisma/prisma-examples/tree/latest/typescript/rest-express)

# [Express](https://expressjs.com/en/starter/installing.html)

```
npm init -y
npm install express
npm install cors
```

# [Prisma](https://www.prisma.io/docs/getting-started/quickstart)

```
npm install typescript ts-node @types/node @types/express @types/cors --save-dev
```

## Initialize

```
npx tsc --init
npm install prisma --save-dev
npx prisma init
```

## Using Prisma Migrate

```json
// package.json
"prisma": {
  "seed": "ts-node prisma/seed.ts"
},
```

```
npx prisma migrate dev --name init
```

### Auto Install Prisma Client

```
npm install @prisma/client
```

### Auto Seeding

```
npx prisma db seed
or
npx prisma migrate dev
```

# Start the REST API server

```json
// package.json
"scripts": {
    "dev": "ts-node src/index.ts"
  },
```

```
npm run dev
```

# Production

## Prisma Migrate

```
npx prisma migrate deploy
```

## Start the REST API server Plesk

```json
// package.json
"scripts": {
    "start": "NODE_ENV=production node dist/src/index.js",
    "build": "tsc"
  },
```

```
npm run build
```

click Restart App

# DateTime

## Timezone

[Moment Timezone](https://momentjs.com/timezone/)

```
npm install moment-timezone --save
```
