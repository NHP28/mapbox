import { type ProcessingLogItem } from "@/services/processingLogs";

export async function fetchProcessingLogs(): Promise<ProcessingLogItem[]> {
  const response = await fetch("/api/processing-logs");
  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.error || "Không thể tải dữ liệu nhật ký xử lý");
  }
  const payload = await response.json();
  return payload.logs || [];
}
