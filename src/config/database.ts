import mysql, { type Pool } from "mysql2/promise";
import { databaseConfig } from "./database.config.js";

export const pool: Pool = mysql.createPool(databaseConfig);

export const testConnection = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    console.log("Kết nối MySQL Database thành công!");
    connection.release();
  } catch (error) {
    console.error("Lỗi kết nối MySQL:", error);
    process.exit(1);
  }
};
