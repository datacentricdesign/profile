import "dotenv/config";

export const envConfig: any = {
  env: process.env.NODE_ENV,
  profileAdminEmail: process.env.PROFILE_ADMIN_EMAIL,
  profileAdminPass: process.env.PROFILE_ADMIN_PASSWORD,
  cryptoAlgo: process.env.CRYPTO_ALGO,
  cryptoKey: process.env.CRYPTO_KEY,
};
