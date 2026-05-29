"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SettingsPage() {
  // Local state for settings with standard defaults
  const [yoloThreshold, setYoloThreshold] = useState("0.70");
  const [mapStyle, setMapStyle] = useState("streets");
  const [dbName, setDbName] = useState("supabase_traffic_db");
  const [gpuActive, setGpuActive] = useState(true);
  const [savedMessage, setSavedMessage] = useState("");

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const timer = setTimeout(() => {
        setYoloThreshold(localStorage.getItem("yolo_threshold") || "0.70");
        setMapStyle(localStorage.getItem("map_style") || "streets");
        setDbName(localStorage.getItem("db_name") || "supabase_traffic_db");
        setGpuActive(localStorage.getItem("gpu_active") !== "false");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSave = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("yolo_threshold", yoloThreshold);
      localStorage.setItem("map_style", mapStyle);
      localStorage.setItem("db_name", dbName);
      localStorage.setItem("gpu_active", String(gpuActive));
      
      setSavedMessage("Cấu hình đã được lưu thành công!");
      setTimeout(() => setSavedMessage(""), 3000);
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-700 antialiased">
      {/* Sidebar - Consistent styling */}
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
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Nhật ký xử lý
          </Link>
          <Link
            href="/settings"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-slate-100 text-slate-900 transition"
          >
            <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Cơ sở dữ liệu: Sẵn sàng</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden bg-slate-50">
        {/* Top Header Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Hệ thống</span>
            <span>/</span>
            <span className="font-medium text-slate-800">Cấu hình</span>
          </div>
        </header>

        {/* Inner Content Grid */}
        <div className="flex flex-1 overflow-hidden p-6 max-w-4xl">
          <div className="flex flex-1 flex-col rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden p-6 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Cấu hình hệ thống Traffic Sign</h3>
              <p className="text-xs text-slate-400 mt-1">Cấu hình các tham số phát hiện YOLOv8, cơ sở dữ liệu Supabase PostGIS và bản đồ Mapbox.</p>
            </div>

            {savedMessage && (
              <div className="rounded-md bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-medium">
                {savedMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: YOLO Parameters */}
              <div className="flex flex-col gap-4 rounded-lg border border-slate-100 p-4 bg-slate-50/50">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Tham số AI & YOLOv8</h4>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-600">Độ tin cậy tối thiểu (Confidence Threshold)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="1.0"
                    value={yoloThreshold}
                    onChange={(e) => setYoloThreshold(e.target.value)}
                    className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-500 transition"
                  />
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs font-medium text-slate-600">Sử dụng tăng tốc GPU (CUDA)</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gpuActive}
                      onChange={(e) => setGpuActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>
              </div>

              {/* Box 2: Map Config */}
              <div className="flex flex-col gap-4 rounded-lg border border-slate-100 p-4 bg-slate-50/50">
                <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Bản đồ Mapbox</h4>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-600">Giao diện bản đồ mặc định</label>
                  <select
                    value={mapStyle}
                    onChange={(e) => setMapStyle(e.target.value)}
                    className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-500 transition"
                  >
                    <option value="streets">Sơ đồ đường phố (Streets)</option>
                    <option value="satellite">Vệ tinh thực tế (Satellite)</option>
                    <option value="dark">Chế độ tối (Dark Mode)</option>
                    <option value="light">Chế độ sáng (Light Mode)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-600">Tên cơ sở dữ liệu Supabase</label>
                  <input
                    type="text"
                    value={dbName}
                    onChange={(e) => setDbName(e.target.value)}
                    className="rounded border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-sky-500 transition"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 border-t border-slate-100 pt-4">
              <button
                onClick={handleSave}
                className="rounded bg-sky-500 px-4 py-2 text-xs font-medium text-white hover:bg-sky-600 shadow transition"
              >
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
