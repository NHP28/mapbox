import Link from "next/link";
import { getProcessingLogs, type ProcessingLogItem } from "@/services/processingLogs";

export const revalidate = 0; // Disable cache to get real-time Postgres logs

export default async function ProcessingLogsPage() {
  let logs: ProcessingLogItem[] = [];
  let status = "Đồng bộ dữ liệu thành công";

  try {
    const data = await getProcessingLogs(100);
    logs = JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error("Lỗi khi tải nhật ký xử lý từ database:", error);
    status = "Không thể kết nối cơ sở dữ liệu";
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-700 antialiased">
      {/* Sidebar - Consistent styling with Home page */}
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
        {/* Brand */}
        <div className="flex h-14 items-center border-b border-slate-200 px-6">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-sky-500 flex items-center justify-center text-white font-bold text-sm">T</div>
            <span className="font-medium text-slate-900 tracking-tight text-sm">Traffic sign manager</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-4">
          <Link
            href="/"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Bản đồ biển báo
          </Link>
          <Link
            href="/image-queue"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Hàng đợi ảnh
          </Link>
          <Link
            href="/processing-logs"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-slate-100 text-slate-900 transition"
          >
            <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Nhật ký xử lý
          </Link>
          <button
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Cấu hình hệ thống
          </button>
        </nav>

        {/* Footer info */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{status}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden bg-slate-50">
        {/* Top Header Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Mục lục</span>
            <span>/</span>
            <span className="font-medium text-slate-800">Nhật ký xử lý</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Tổng số lượt chạy:</span>
              <span className="text-xs font-semibold text-slate-800">{logs.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Số biển báo tìm thấy:</span>
              <span className="text-xs font-semibold text-slate-800">
                {logs.reduce((acc, log) => acc + (log.detections_saved || 0), 0)}
              </span>
            </div>
          </div>
        </header>

        {/* Inner Content Grid */}
        <div className="flex flex-1 overflow-hidden p-4">
          <section className="flex flex-1 flex-col rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden h-full p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div>
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Nhật ký phát hiện biển báo</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Lịch sử chạy YOLOv8 inference, tính toán cosine similarity và độ lệch khoảng cách.</p>
              </div>
              <a
                href="/processing-logs"
                className="rounded border border-slate-200 px-2.5 py-1 text-[10px] font-medium hover:bg-slate-50 transition"
              >
                Làm mới
              </a>
            </div>

            <div className="flex-1 overflow-auto">
              {logs.length === 0 ? (
                <div className="flex h-32 items-center justify-center text-xs text-slate-400">Nhật ký trống</div>
              ) : (
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-medium bg-slate-50/50">
                      <th className="py-2 px-3">ID Run</th>
                      <th className="py-2 px-3">Tên tệp</th>
                      <th className="py-2 px-3">Số phát hiện</th>
                      <th className="py-2 px-3">Thời gian chạy</th>
                      <th className="py-2 px-3">Trạng thái</th>
                      <th className="py-2 px-3">Bắt đầu lúc</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-950">#{log.id}</td>
                        <td className="py-2.5 px-3 text-slate-800 font-medium truncate max-w-[160px]" title={log.image_filename ?? ""}>
                          {log.image_filename}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-700">
                          {log.detections_saved !== null ? `${log.detections_saved} biển báo` : "--"}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono text-[10px]">
                          {log.duration_seconds !== null ? `${log.duration_seconds.toFixed(2)}s` : "--"}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                            log.status === "success" || log.status === "done" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            log.status === "failed" || log.status === "error" ? "bg-red-50 text-red-700 border-red-200" :
                            "bg-blue-50 text-blue-700 border-blue-200 animate-pulse"
                          }`}>
                            {log.status === "success" || log.status === "done" ? "Hoàn tất" :
                             log.status === "failed" || log.status === "error" ? "Lỗi" : "Đang chạy"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {log.started_at ? new Date(log.started_at).toLocaleString("vi-VN", { hour12: false }) : "--"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
