import Link from "next/link";
import { getImageQueue, type ImageQueueItem } from "@/services/imageQueue";
import ImageQueueTable from "@/components/ImageQueueTable";

export const revalidate = 0; // Disable cache to get real-time Postgres queue

export default async function ImageQueuePage() {
  let queue: ImageQueueItem[] = [];
  let status = "Đồng bộ dữ liệu thành công";

  try {
    const data = await getImageQueue(100);
    queue = JSON.parse(JSON.stringify(data));
  } catch (error) {
    console.error("Lỗi khi tải hàng đợi ảnh từ database:", error);
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
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-slate-100 text-slate-900 transition"
          >
            <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Hàng đợi ảnh
          </Link>
          <Link
            href="/processing-logs"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Nhật ký xử lý
          </Link>
          <Link
            href="/settings"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Cấu hình hệ thống
          </Link>
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
            <span className="font-medium text-slate-800">Hàng đợi ảnh</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Tổng số lượng:</span>
              <span className="text-xs font-semibold text-slate-800">{queue.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Đã hoàn thành:</span>
              <span className="text-xs font-semibold text-slate-800">
                {queue.filter((item) => item.status === "done").length}
              </span>
            </div>
          </div>
        </header>

        {/* Inner Content Grid - Full width table for dynamic route page */}
        <div className="flex flex-1 overflow-hidden p-4">
          <section className="flex flex-1 flex-col rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden h-full p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div>
                <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Hàng đợi xử lý ảnh</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Các tệp ảnh chờ YOLOv8 phát hiện biển báo và cập nhật tọa độ GPS.</p>
              </div>
              <a
                href="/image-queue"
                className="rounded border border-slate-200 px-2.5 py-1 text-[10px] font-medium hover:bg-slate-50 transition"
              >
                Làm mới
              </a>
            </div>

            <ImageQueueTable queue={queue} />
          </section>
        </div>
      </main>
    </div>
  );
}
