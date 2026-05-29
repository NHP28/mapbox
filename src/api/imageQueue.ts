import { type ImageQueueItem } from "@/services/imageQueue";

export async function fetchImageQueue(): Promise<ImageQueueItem[]> {
  const response = await fetch("/api/image-queue");
  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.error || "Không thể tải dữ liệu hàng đợi ảnh");
  }
  const payload = await response.json();
  return payload.queue || [];
}
