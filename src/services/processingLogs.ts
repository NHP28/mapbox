import { supabase } from "@/lib/supabase";

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
  const { data, error } = await supabase
    .from("processing_log")
    .select(`
      id,
      image_queue_id,
      image_filename,
      image_abfs,
      status,
      error_message,
      detections_saved,
      started_at,
      finished_at,
      duration_seconds
    `)
    .order("started_at", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }
  return data as unknown as ProcessingLogItem[];
}
