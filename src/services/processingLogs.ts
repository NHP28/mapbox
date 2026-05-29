import { sql } from "drizzle-orm";
import { db } from "@/db";

export type ProcessingLogItem = {
  id: number;
  image_queue_id: number | null;
  image_filename: string | null;
  image_abfs: string | null;
  status: string | null;
  error_message: string | null;
  detections_saved: number | null;
  started_at: string | null;
  finished_at: string | null;
  duration_seconds: number | null;
};

export async function getProcessingLogs(limit = 100) {
  return db.execute<ProcessingLogItem>(sql`
    SELECT
      id,
      image_queue_id,
      image_filename,
      image_abfs,
      status,
      error_message,
      detections_saved,
      started_at::text AS started_at,
      finished_at::text AS finished_at,
      duration_seconds
    FROM processing_log
    ORDER BY started_at DESC NULLS LAST, id DESC
    LIMIT ${limit}
  `);
}
