import { sql } from "drizzle-orm";
import { db } from "@/db";

export type TrafficSign = {
  id: number;
  fine_label: string | null;
  coarse_label: string | null;
  confidence_yolo: number | null;
  cosine_similarity: number | null;
  latitude: number | null;
  longitude: number | null;
  source_image: string | null;
  source_image_abfs: string | null;
  inferred_at: string | null;
};

export async function getTrafficSigns(limit = 500) {
  return db.execute<TrafficSign>(sql`
    SELECT
      id,
      fine_label,
      coarse_label,
      confidence_yolo,
      cosine_similarity,
      latitude,
      longitude,
      source_image,
      source_image_abfs,
      inferred_at::text AS inferred_at
    FROM traffic_sign
    WHERE latitude IS NOT NULL
      AND longitude IS NOT NULL
    ORDER BY inferred_at DESC NULLS LAST
    LIMIT ${limit}
  `);
}
