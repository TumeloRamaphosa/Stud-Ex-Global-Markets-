import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "..", ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), "..", ".env.example"), override: false });
