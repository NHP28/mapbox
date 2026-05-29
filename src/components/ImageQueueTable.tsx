"use client";

import { useState } from "react";
import { type ImageQueueItem } from "@/services/imageQueue";

interface ImageQueueTableProps {
  queue: ImageQueueItem[];
}

export default function ImageQueueTable({ queue }: ImageQueueTableProps) {
  const [selectedItem, setSelectedItem] = useState<ImageQueueItem | null>(null);

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      <div className="flex-1 overflow-auto">
        {queue.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-xs text-slate-400">Hàng đợi trống</div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-medium bg-slate-50/50">
                <th className="py-2 px-3">ID</th>
                <th className="py-2 px-3">Hình ảnh</th>
                <th className="py-2 px-3">Tên tệp ảnh</th>
                <th className="py-2 px-3">Bronze Path</th>
                <th className="py-2 px-3">Trạng thái</th>
                <th className="py-2 px-3">Thời gian nạp</th>
                <th className="py-2 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {queue.map((item) => {
                // Chỉ lấy ảnh nếu có URL thực tế từ database
                const imageUrl = (item.bronze_path && (item.bronze_path.startsWith("http://") || item.bronze_path.startsWith("https://")))
                  ? item.bronze_path
                  : null;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-950">#{item.id}</td>
                    <td className="py-2 px-3">
                      <div className="h-10 w-14 overflow-hidden rounded border border-slate-200 bg-slate-50 shadow-sm relative flex items-center justify-center text-slate-300">
                        {imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={imageUrl}
                            alt={item.filename || "Preview"}
                            className="h-full w-full object-cover transition hover:scale-110 duration-200"
                          />
                        ) : (
                          <svg className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-800 font-medium truncate max-w-[180px]">{item.filename}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[10px] truncate max-w-[220px]">{item.bronze_path}</td>
                    <td className="py-2.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                        item.status === "done" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                        item.status === "processing" ? "bg-blue-50 text-blue-700 border-blue-200 animate-pulse" :
                        item.status === "failed" ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-slate-50 text-slate-600 border-slate-200"
                      }`}>
                        {item.status === "done" ? "Hoàn tất" :
                         item.status === "processing" ? "Đang xử lý" :
                         item.status === "failed" ? "Thất bại" : "Đang chờ"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {item.created_at ? new Date(item.created_at).toLocaleString("vi-VN", { hour12: false }) : "--"}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="bg-slate-900 hover:bg-sky-500 text-white rounded px-2.5 py-1 text-[10px] font-semibold transition duration-200 shadow-sm"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* POPUP DETAIL MODAL OVERLAY IN THE MIDDLE OF THE SCREEN */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative max-w-2xl w-full rounded-xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-sky-600 uppercase tracking-widest">Chi tiết tệp ảnh</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedItem.filename}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="rounded-full hover:bg-slate-100 p-1.5 text-slate-400 hover:text-slate-600 transition"
              >
                ✕
              </button>
            </div>

            {/* Full quality Photo preview or empty state */}
            <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center">
              {selectedItem.bronze_path && (selectedItem.bronze_path.startsWith("http://") || selectedItem.bronze_path.startsWith("https://")) ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={selectedItem.bronze_path}
                  alt={selectedItem.filename || "Preview"}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <svg className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs">Không có tệp ảnh xem trước</span>
                </div>
              )}
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">Mã hàng đợi (ID)</span>
                <span className="font-bold text-slate-900">#{selectedItem.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">Trạng thái xử lý</span>
                <div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                    selectedItem.status === "done" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    selectedItem.status === "failed" ? "bg-rose-50 text-rose-700 border-rose-200" :
                    "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {selectedItem.status === "done" ? "Hoàn tất" : selectedItem.status === "failed" ? "Thất bại" : "Đang chờ"}
                  </span>
                </div>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block mb-0.5 font-medium">Đường dẫn Bronze Path</span>
                <span className="font-semibold text-slate-800 break-all">{selectedItem.bronze_path}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">Thời gian nạp</span>
                <span className="font-semibold text-slate-800">
                  {selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleString("vi-VN") : "--"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">Thời gian xử lý</span>
                <span className="font-semibold text-slate-800">
                  {selectedItem.updated_at ? new Date(selectedItem.updated_at).toLocaleString("vi-VN") : "Chưa hoàn thành"}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedItem(null)}
                className="rounded-lg bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
