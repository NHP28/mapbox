/* eslint-disable @typescript-eslint/no-require-imports */
const postgres = require("postgres");
const fs = require("fs");
const path = require("path");

// Đọc config từ .env.local
const envPath = path.join(__dirname, ".env.local");
let connectionString = process.env.DATABASE_URL;

if (!connectionString && fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const match = envContent.match(/^DATABASE_URL=(.+)$/m);
  if (match) {
    connectionString = match[1].trim();
  }
}

if (!connectionString) {
  console.error("Lỗi: Không tìm thấy DATABASE_URL trong môi trường hoặc .env.local");
  process.exit(1);
}

console.log("Đang kết nối đến Database...");
const sql = postgres(connectionString, { max: 1 });

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
    inferred_at: new Date()
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
    inferred_at: new Date(Date.now() - 5 * 60 * 1000)
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
    inferred_at: new Date(Date.now() - 12 * 60 * 1000)
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
    inferred_at: new Date(Date.now() - 25 * 60 * 1000)
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
    inferred_at: new Date(Date.now() - 40 * 60 * 1000)
  }
];

async function seed() {
  try {
    console.log("Đang làm sạch và chèn dữ liệu mẫu đồng bộ...");

    // 1. Dọn dẹp dữ liệu cũ (optional nhưng an toàn)
    await sql`TRUNCATE TABLE processing_log CASCADE;`;
    await sql`TRUNCATE TABLE traffic_sign CASCADE;`;
    await sql`DELETE FROM image_queue;`;

    console.log("Đang chèn dữ liệu đồng bộ cho 5 biển báo mẫu...");
    for (const sign of sampleSigns) {
      // A. Chèn vào image_queue
      const [queueItem] = await sql`
        INSERT INTO image_queue (filename, bronze_path, status, uploaded_at, processed_at)
        VALUES (
          ${sign.source_image},
          ${`/bronze/${sign.source_image}`},
          'done',
          ${new Date(sign.inferred_at.getTime() - 2 * 60 * 1000)},
          ${sign.inferred_at}
        )
        RETURNING id;
      `;

      // B. Chèn vào traffic_sign
      await sql`
        INSERT INTO traffic_sign (
          image_queue_id,
          det_id,
          coarse_label,
          fine_label,
          confidence_yolo,
          cosine_similarity,
          latitude,
          longitude,
          source_image,
          inferred_at
        ) VALUES (
          ${queueItem.id},
          ${sign.det_id},
          ${sign.coarse_label},
          ${sign.fine_label},
          ${sign.confidence_yolo},
          ${sign.cosine_similarity},
          ${sign.latitude},
          ${sign.longitude},
          ${sign.source_image},
          ${sign.inferred_at}
        );
      `;

      // C. Chèn vào processing_log
      await sql`
        INSERT INTO processing_log (
          image_queue_id,
          image_filename,
          image_abfs,
          status,
          detections_saved,
          started_at,
          finished_at,
          duration_seconds
        ) VALUES (
          ${queueItem.id},
          ${sign.source_image},
          ${`/abfs/${sign.source_image}`},
          'success',
          1,
          ${new Date(sign.inferred_at.getTime() - 3.42 * 1000)},
          ${sign.inferred_at},
          3.42
        );
      `;
    }

    console.log("Chèn dữ liệu thành công! Đã đồng bộ 5 hàng đợi ảnh, 5 biển báo và 5 nhật ký xử lý.");
  } catch (error) {
    console.error("Lỗi khi chèn dữ liệu mẫu:", error);
  } finally {
    await sql.end();
  }
}

seed();
