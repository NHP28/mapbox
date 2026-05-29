const supabaseUrl = "https://opavoctswledukleijpi.supabase.co";
const anonKey = "sb_publishable_4RA0g3T69Oml6wMXc0s4Gg_UdDOjLzB";

const sampleSigns = [
  {
    det_id: 1,
    coarse_label: "prohibitory",
    fine_label: "Biển báo giới hạn tốc độ 50km/h",
    confidence_yolo: 0.96,
    cosine_similarity: 0.89,
    latitude: 10.776889,
    longitude: 106.700981,
    source_image: "cam_speed_50_tphcm.jpg",
    preview_url: "https://images.unsplash.com/photo-1596720426673-e4c142e0487f?w=600&auto=format&fit=crop",
    inferred_at: new Date().toISOString()
  },
  {
    det_id: 2,
    coarse_label: "prohibitory",
    fine_label: "Biển cấm quay đầu xe",
    confidence_yolo: 0.88,
    cosine_similarity: 0.82,
    latitude: 10.780231,
    longitude: 106.698124,
    source_image: "cam_quay_dau_le_loi.jpg",
    preview_url: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=600&auto=format&fit=crop",
    inferred_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    det_id: 3,
    coarse_label: "mandatory",
    fine_label: "Biển báo hướng đi phải theo (Rẽ phải)",
    confidence_yolo: 0.92,
    cosine_similarity: 0.85,
    latitude: 10.772543,
    longitude: 106.704211,
    source_image: "huong_di_phai_theo.jpg",
    preview_url: "https://images.unsplash.com/photo-1556122071-e404be7457cd?w=600&auto=format&fit=crop",
    inferred_at: new Date(Date.now() - 12 * 60 * 1000).toISOString()
  },
  {
    det_id: 4,
    coarse_label: "prohibitory",
    fine_label: "Biển cấm dừng và đỗ xe",
    confidence_yolo: 0.79,
    cosine_similarity: 0.74,
    latitude: 10.768122,
    longitude: 106.692341,
    source_image: "cam_dung_do_tran_hung_dao.jpg",
    preview_url: "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=600&auto=format&fit=crop",
    inferred_at: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    det_id: 5,
    coarse_label: "warning",
    fine_label: "Biển báo đường giao nhau nguy hiểm",
    confidence_yolo: 0.94,
    cosine_similarity: 0.90,
    latitude: 10.784512,
    longitude: 106.711204,
    source_image: "giao_nhau_nguyen_huu_canh.jpg",
    preview_url: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=600&auto=format&fit=crop",
    inferred_at: new Date(Date.now() - 40 * 60 * 1000).toISOString()
  }
];

async function seed() {
  const headers = {
    "apikey": anonKey,
    "Authorization": `Bearer ${anonKey}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation"
  };

  try {
    console.log("Đang kết nối qua PostgREST REST API để dọn dẹp và seed dữ liệu...");

    // 1. Dọn dẹp dữ liệu cũ qua REST DELETE
    console.log("Đang làm sạch dữ liệu cũ...");
    await fetch(`${supabaseUrl}/rest/v1/processing_log?id=gt.0`, { method: "DELETE", headers });
    await fetch(`${supabaseUrl}/rest/v1/traffic_sign?id=gt.0`, { method: "DELETE", headers });
    await fetch(`${supabaseUrl}/rest/v1/image_queue?id=gt.0`, { method: "DELETE", headers });

    console.log("Bắt đầu chèn dữ liệu đồng bộ...");

    for (const sign of sampleSigns) {
      // A. Chèn vào image_queue
      const queueRes = await fetch(`${supabaseUrl}/rest/v1/image_queue`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          filename: sign.source_image,
          bronze_path: sign.preview_url, // Lưu trực tiếp link ảnh Unsplash vào database
          status: "done",
          uploaded_at: new Date(new Date(sign.inferred_at).getTime() - 2 * 60 * 1000).toISOString(),
          processed_at: sign.inferred_at
        })
      });

      if (!queueRes.ok) {
        throw new Error(`Lỗi chèn image_queue: ${await queueRes.text()}`);
      }

      const [queueItem] = await queueRes.json();
      console.log(`Đã thêm tệp ảnh: ${sign.source_image} (ID: ${queueItem.id})`);

      // B. Chèn vào traffic_sign
      const signRes = await fetch(`${supabaseUrl}/rest/v1/traffic_sign`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          image_queue_id: queueItem.id,
          det_id: sign.det_id,
          coarse_label: sign.coarse_label,
          fine_label: sign.fine_label,
          confidence_yolo: sign.confidence_yolo,
          cosine_similarity: sign.cosine_similarity,
          latitude: sign.latitude,
          longitude: sign.longitude,
          source_image: sign.source_image,
          source_image_abfs: sign.preview_url, // Lưu trực tiếp link ảnh vào source_image_abfs để JOIN
          inferred_at: sign.inferred_at
        })
      });

      if (!signRes.ok) {
        throw new Error(`Lỗi chèn traffic_sign: ${await signRes.text()}`);
      }

      // C. Chèn vào processing_log
      const logRes = await fetch(`${supabaseUrl}/rest/v1/processing_log`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          image_queue_id: queueItem.id,
          image_filename: sign.source_image,
          image_abfs: `/abfs/${sign.source_image}`,
          status: "success",
          detections_saved: 1,
          started_at: new Date(new Date(sign.inferred_at).getTime() - 3.42 * 1000).toISOString(),
          finished_at: sign.inferred_at,
          duration_seconds: 3.42
        })
      });

      if (!logRes.ok) {
        throw new Error(`Lỗi chèn processing_log: ${await logRes.text()}`);
      }
    }

    console.log("Seed dữ liệu hoàn tất thành công! 5 ảnh, 5 biển báo và 5 logs đã được đồng bộ hóa tuyệt đối!");
  } catch (error) {
    console.error("Lỗi khi chạy REST seed:", error);
  }
}

seed();
