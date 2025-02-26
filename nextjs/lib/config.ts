import dotenv from "dotenv";

dotenv.config();

export const DATABASE_URL = process.env.DATABASE_URL;
export const DGO_HOST = process.env.DGO_HOST;
export const DGO_USER = process.env.DGO_USER;
export const DGO_DATABASE2 = process.env.DGO_DATABASE2;
export const DGO_PASSWORD = process.env.DGO_PASSWORD;
export const DGO_DATABASE = process.env.DGO_DATABASE;
export const DGO_PORT = process.env.DGO_PORT;
export const DGO_SSL = process.env.DATABASE_SSL;
export const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
export const API = process.env.NEXT_PUBLIC_API_IMAGE_GEN
