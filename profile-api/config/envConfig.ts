import 'dotenv/config'

export const envConfig: any = {
    env: process.env.NODE_ENV,
    devUser: process.env.DEV_USER,
    devToken: process.env.DEV_TOKEN,
    cryptoAlgo: process.env.CRYPTO_ALGO,
    cryptoKey: process.env.CRYPTO_KEY
};