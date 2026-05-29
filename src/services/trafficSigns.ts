import { supabase } from "@/lib/supabase";

export type TrafficSign = {
  id: number;
  fine_label: string | null;
  coarse_label: string | null;
  confidence_yolo: number | null;
  cosine_similarity: number | null;
  bbox_x1: number | null;
  bbox_y1: number | null;
  bbox_x2: number | null;
  bbox_y2: number | null;
  latitude: number | null;
  longitude: number | null;
  source_image: string | null;
  source_image_abfs: string | null;
  inferred_at: string | null;
};

export async function getTrafficSigns(limit = 500) {
  const { data, error } = await supabase
    .from("traffic_sign")
    .select(`
      id,
      fine_label,
      coarse_label,
      confidence_yolo,
      cosine_similarity,
      bbox_x1,
      bbox_y1,
      bbox_x2,
      bbox_y2,
      latitude,
      longitude,
      source_image,
      source_image_abfs,
      inferred_at
    `)
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("inferred_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }
  return data as TrafficSign[];
}
