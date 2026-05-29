import { supabase } from "@/lib/supabase";

export type ImageQueueItem = {
  id: number;
  filename: string | null;
  bronze_path: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export async function getImageQueue(limit = 100) {
  const { data, error } = await supabase
    .from("image_queue")
    .select(`
      id,
      filename,
      bronze_path,
      status,
      created_at:uploaded_at,
      updated_at:processed_at
    `)
    .order("id", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }
  return data as unknown as ImageQueueItem[];
}

export async function addImageToQueue(filename: string, bronzePath: string) {
  const { data, error } = await supabase
    .from("image_queue")
    .upsert(
      {
        filename,
        bronze_path: bronzePath,
        status: "pending",
        uploaded_at: new Date().toISOString()
      },
      { onConflict: "filename" }
    )
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return [data];
}
