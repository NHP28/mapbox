import { type TrafficSign } from "@/services/trafficSigns";

export async function fetchTrafficSigns(): Promise<TrafficSign[]> {
  const response = await fetch("/api/traffic-signs");
  if (!response.ok) {
    const payload = await response.json();
    throw new Error(payload.error || "Không thể tải dữ liệu biển báo từ Postgres");
  }
  const payload = await response.json();
  return payload.signs || [];
}
