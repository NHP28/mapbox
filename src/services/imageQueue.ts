import { sql } from "drizzle-orm";
import { db } from "@/db";

export type ImageQueueItem = {
  id: number;
  filename: string | null;
  bronze_path: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export async function getImageQueue(limit = 100) {
  return db.execute<ImageQueueItem>(sql`
    SELECT
      id,
      filename,
      bronze_path,
      status,
      uploaded_at::text AS created_at,
      processed_at::text AS updated_at
    FROM image_queue
    ORDER BY id DESC
    LIMIT ${limit}
  `);
}

export async function addImageToQueue(filename: string, bronzePath: string) {
  return db.execute(sql`
    INSERT INTO image_queue (filename, bronze_path, status, uploaded_at)
    VALUES (${filename}, ${bronzePath}, 'pending', NOW())
    ON CONFLICT (filename) DO UPDATE SET
      status = 'pending',
      uploaded_at = NOW()
    RETURNING id
  `);
}
