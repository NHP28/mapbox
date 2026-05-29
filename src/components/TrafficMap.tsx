"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { type TrafficSign } from "@/services/trafficSigns";
import { fetchTrafficSigns } from "@/api/trafficSigns";

const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const mapStyles = [
  { id: "streets", name: "Đường phố", url: "mapbox://styles/mapbox/streets-v11" },
  { id: "satellite", name: "Vệ tinh", url: "mapbox://styles/mapbox/satellite-v9" },
  { id: "dark", name: "Chế độ tối", url: "mapbox://styles/mapbox/dark-v10" },
  { id: "light", name: "Chế độ sáng", url: "mapbox://styles/mapbox/light-v10" },
];

function getStyleIcon(id: string) {
  switch (id) {
    case "streets":
      return (
        <svg className="h-4 w-4 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      );
    case "satellite":
      return (
        <svg className="h-4 w-4 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
        </svg>
      );
    case "dark":
      return (
        <svg className="h-4 w-4 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    case "light":
    default:
      return (
        <svg className="h-4 w-4 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 0A9 9 0 115.636 5.636 9 9 0 0118.284 5.636z" />
        </svg>
      );
  }
}

function getImageUrl(imageUrl: string | null, filename: string | null = null): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  if (filename) {
    return `/api/images/${filename}`;
  }
  return null;
}

export default function TrafficMap() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [signs, setSigns] = useState<TrafficSign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<TrafficSign | null>(null);
  const [status, setStatus] = useState("Đang kết nối database...");
  const [currentStyle, setCurrentStyle] = useState("streets");
  const [showImageModal, setShowImageModal] = useState(false);

  const validSigns = useMemo(
    () => signs.filter((sign) => sign.latitude !== null && sign.longitude !== null),
    [signs],
  );

  const groupedSigns = useMemo(() => {
    const groups: { [key: string]: typeof signs } = {};
    validSigns.forEach((sign) => {
      const key = `${sign.latitude!.toFixed(5)}_${sign.longitude!.toFixed(5)}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(sign);
    });
    return Object.values(groups);
  }, [validSigns]);

  const siblingSigns = useMemo(() => {
    if (!selected) return [];
    return signs.filter((sign) => {
      if (sign.latitude === null || sign.longitude === null) return false;
      return (
        sign.latitude.toFixed(5) === selected.latitude?.toFixed(5) &&
        sign.longitude.toFixed(5) === selected.longitude?.toFixed(5)
      );
    });
  }, [selected, signs]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await fetchTrafficSigns();
        setSigns(data);
        setStatus("Đồng bộ dữ liệu thành công");
      } catch (err) {
        setStatus(err instanceof Error ? err.message : "Lỗi kết nối cơ sở dữ liệu");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current || !token) return;

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [106.700981, 10.776889],
      zoom: 11,
      pitch: 0,
      bearing: 0,
      antialias: true,
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("load", () => {
      map.resize();

      // Tự động Việt hóa toàn bộ nhãn (labels) trên bản đồ Mapbox
      try {
        const layers = map.getStyle().layers;
        if (layers) {
          layers.forEach((layer) => {
            const layout = layer.layout as mapboxgl.SymbolLayout | undefined;
            if (layout && layout["text-field"]) {
              map.setLayoutProperty(layer.id, "text-field", [
                "coalesce",
                ["get", "name_vi"],
                ["get", "name"]
              ]);
            }
          });
        }
      } catch (e) {
        console.warn("Không thể Việt hóa một số layer:", e);
      }
    });

    mapRef.current = map;

    // Kích hoạt resize sau một khoảng thời gian ngắn để đảm bảo layout DOM đã ổn định
    setTimeout(() => {
      map.resize();
    }, 300);

    // Theo dõi kích thước container để tự động fit
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });

    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current);
    }

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    groupedSigns.forEach((group) => {
      const primarySign = group[0];
      const element = document.createElement("button");
      element.id = `traffic-sign-marker-${primarySign.id}`;
      element.title = primarySign.fine_label ?? primarySign.coarse_label ?? "Traffic sign";
      element.style.position = "relative"; // Đảm bảo định vị tuyệt đối cho badge

      // Nếu có fine_label, hiển thị icon từ bộ sưu tập local, ngược lại dùng pin tròn mặc định
      if (primarySign.fine_label) {
        element.className = "map-pin-custom";
        const iconUrl = `/package_signs/${primarySign.fine_label}.svg`;
        element.style.backgroundImage = `url('${iconUrl}')`;
        element.style.width = "34px";
        element.style.height = "34px";
        element.style.backgroundSize = "contain";
        element.style.backgroundRepeat = "no-repeat";
        element.style.backgroundPosition = "center";
        element.style.border = "none";
        element.style.backgroundColor = "transparent";
        element.style.cursor = "pointer";
      } else {
        element.className = "map-pin";
      }

      // Thêm badge đếm số lượng nếu có từ 2 biển báo trở lên tại cùng một vị trí
      if (group.length > 1) {
        const badge = document.createElement("span");
        badge.innerText = `x${group.length}`;
        badge.style.position = "absolute";
        badge.style.top = "-6px";
        badge.style.right = "-6px";
        badge.style.background = "linear-gradient(135deg, #ef4444, #f97316)";
        badge.style.color = "white";
        badge.style.fontSize = "10px";
        badge.style.fontWeight = "bold";
        badge.style.borderRadius = "10px";
        badge.style.padding = "2px 6px";
        badge.style.border = "1.5px solid white";
        badge.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
        badge.style.pointerEvents = "none";
        badge.style.display = "flex";
        badge.style.alignItems = "center";
        badge.style.justifyContent = "center";
        element.appendChild(badge);
      }

      const anchor = primarySign.fine_label ? "center" : "bottom";
      const marker = new mapboxgl.Marker({ element, anchor })
        .setLngLat([primarySign.longitude!, primarySign.latitude!])
        .addTo(map);

      element.addEventListener("click", () => {
        setSelected(primarySign);
        map.flyTo({ center: [primarySign.longitude!, primarySign.latitude!], zoom: 15, duration: 800 });
      });

      markersRef.current.push(marker);
    });

    if (validSigns.length > 0) {
      // Đảm bảo bản đồ nhận diện đúng kích thước thực tế trước khi căn chỉnh toạ độ
      map.resize();
      const bounds = new mapboxgl.LngLatBounds();
      validSigns.forEach((sign) => bounds.extend([sign.longitude!, sign.latitude!]));
      map.fitBounds(bounds, { padding: 50, maxZoom: 14, duration: 1000 });
    }
  }, [groupedSigns, validSigns]);

  const selectSign = (sign: TrafficSign) => {
    setSelected(sign);
    if (mapRef.current && sign.longitude && sign.latitude) {
      mapRef.current.flyTo({ center: [sign.longitude, sign.latitude], zoom: 15, duration: 800 });
    }
  };

  const changeMapStyle = (styleUrl: string, styleId: string) => {
    setCurrentStyle(styleId);
    if (mapRef.current) {
      mapRef.current.setStyle(styleUrl);

      mapRef.current.once("style.load", () => {
        try {
          const layers = mapRef.current?.getStyle().layers;
          if (layers) {
            layers.forEach((layer) => {
              const layout = layer.layout as mapboxgl.SymbolLayout | undefined;
              if (layout && layout["text-field"]) {
                mapRef.current?.setLayoutProperty(layer.id, "text-field", [
                  "coalesce",
                  ["get", "name_vi"],
                  ["get", "name"]
                ]);
              }
            });
          }
        } catch (e) {
          console.warn("Không thể Việt hóa layer khi đổi style:", e);
        }
      });
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-700 antialiased">
      {/* Sidebar - Mapbox Console Style */}
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
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-slate-100 text-slate-900 transition"
          >
            <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
            <span className="font-medium text-slate-800">Bản đồ trực quan</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Tổng tọa độ:</span>
              <span className="text-xs font-semibold text-slate-800">{validSigns.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Độ chính xác &gt; 70%:</span>
              <span className="text-xs font-semibold text-slate-800">
                {signs.filter((s) => s.confidence_yolo && s.confidence_yolo > 0.7).length}
              </span>
            </div>
          </div>
        </header>

        {/* Inner Content Grid */}
        <div className="flex flex-1 overflow-hidden p-4">
          <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)] h-full">
            {/* List panel */}
            <section className="flex flex-col rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden h-full">
              <div className="border-b border-slate-100 px-4 py-3">
                <h3 className="text-xs font-medium text-slate-900">Danh sách phát hiện</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1" aria-busy={loading}>
                {validSigns.length === 0 ? (
                  <div className="flex h-32 flex-col items-center justify-center text-xs text-slate-400">
                    Chưa có dữ liệu tọa độ
                  </div>
                ) : (
                  validSigns.map((sign) => (
                    <button
                      id={`traffic-sign-row-${sign.id}`}
                      key={sign.id}
                      onClick={() => selectSign(sign)}
                      className={`flex w-full items-center justify-between rounded-md p-2.5 text-left text-xs transition ${
                        selected?.id === sign.id
                          ? "bg-sky-50 text-sky-950 font-medium"
                          : "hover:bg-slate-50 text-slate-600"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="block truncate font-medium text-slate-800">
                          {sign.fine_label || sign.coarse_label || "Chưa phân loại"}
                        </span>
                        <span className="block text-[10px] text-slate-400 truncate mt-0.5">
                          {sign.source_image || "Không có ảnh"}
                        </span>
                      </div>
                      <span className="shrink-0 font-medium text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded text-[10px]">
                        {formatPercent(sign.confidence_yolo)}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </section>

            {/* Map panel */}
            <section className="relative rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden h-[500px] lg:h-full w-full">
              {!token && (
                <div className="absolute left-4 right-4 top-4 z-10 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 shadow-sm">
                  Cần thiết lập <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> trong <code>.env.local</code> để hiển thị bản đồ.
                </div>
              )}
              <div id="traffic-map" ref={mapContainer} className="absolute inset-0 h-full w-full" />

              {/* Floating Map Style Switcher (Google Maps Style) */}
              <div className="absolute top-4 left-4 z-10 flex gap-1.5 rounded-lg bg-white/95 p-1.5 shadow-lg border border-slate-200/80 backdrop-blur-md">
                {mapStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => changeMapStyle(style.url, style.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                      currentStyle === style.id
                        ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {getStyleIcon(style.id)}
                    <span>{style.name}</span>
                  </button>
                ))}
              </div>

              {/* Floating Detailed info card (Google Maps style) */}
              {selected && (
                <article className="absolute bottom-4 left-4 z-10 w-80 rounded-lg border border-slate-200 bg-white p-4 shadow-lg flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-medium text-sky-600 uppercase tracking-wider">#{selected.id}</span>
                      <h4 className="text-sm font-semibold text-slate-900 mt-0.5 leading-snug">
                        {selected.fine_label || selected.coarse_label || "Biển báo giao thông"}
                      </h4>
                    </div>
                    <button
                      onClick={() => setSelected(null)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>

                  {siblingSigns.length > 1 && (
                    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-600">
                      <button
                        onClick={() => {
                          const currentIndex = siblingSigns.findIndex((s) => s.id === selected.id);
                          const prevIndex = (currentIndex - 1 + siblingSigns.length) % siblingSigns.length;
                          setSelected(siblingSigns[prevIndex]);
                        }}
                        className="hover:text-sky-600 font-bold px-2 py-0.5 transition active:scale-95"
                      >
                        ◀
                      </button>
                      <span className="font-semibold text-slate-800">
                        Cột biển báo ({siblingSigns.findIndex((s) => s.id === selected.id) + 1}/{siblingSigns.length})
                      </span>
                      <button
                        onClick={() => {
                          const currentIndex = siblingSigns.findIndex((s) => s.id === selected.id);
                          const nextIndex = (currentIndex + 1) % siblingSigns.length;
                          setSelected(siblingSigns[nextIndex]);
                        }}
                        className="hover:text-sky-600 font-bold px-2 py-0.5 transition active:scale-95"
                      >
                        ▶
                      </button>
                    </div>
                  )}

                  {/* Inline photo thumbnail with detailed trigger */}
                  <div className="relative w-full h-32 rounded-md overflow-hidden border border-slate-150 bg-slate-50 group flex items-center justify-center text-slate-400">
                    {getImageUrl(selected.source_image_abfs, selected.source_image) ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getImageUrl(selected.source_image_abfs, selected.source_image)!}
                          alt={selected.fine_label || "Traffic Sign"}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <button
                          onClick={() => setShowImageModal(true)}
                          className="absolute bottom-2 right-2 bg-slate-900/85 hover:bg-slate-900 text-white rounded px-2.5 py-1.5 text-[10px] font-medium transition shadow-md flex items-center gap-1"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Xem ảnh thực tế
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <svg className="h-5 w-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[10px] text-slate-400">Không có ảnh xem trước</span>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 break-all leading-relaxed">
                    <strong>Tệp nguồn:</strong> {selected.source_image || "Không có"}
                  </p>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">YOLO</span>
                      <span className="font-semibold text-slate-800">{formatPercent(selected.confidence_yolo)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-medium">Cosine Sim</span>
                      <span className="font-semibold text-slate-800">{formatPercent(selected.cosine_similarity)}</span>
                    </div>
                    {selected.latitude && selected.longitude && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase font-medium">Tọa độ GPS</span>
                        <span className="font-medium text-slate-800 text-[10px]">
                          {selected.latitude.toFixed(5)}, {selected.longitude.toFixed(5)}
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* FULL DETAILED IMAGE MODAL (YOLO Bounding Box overlay) */}
      {showImageModal && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="relative max-w-3xl w-full rounded-xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold text-sky-600 uppercase tracking-widest">Chi tiết nhận diện</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selected.fine_label || selected.coarse_label || "Biển báo phát hiện"}
                </h3>
              </div>
              <button
                onClick={() => setShowImageModal(false)}
                className="rounded-full hover:bg-slate-100 p-1.5 text-slate-400 hover:text-slate-600 transition"
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center">
              {getImageUrl(selected.source_image_abfs, selected.source_image) ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getImageUrl(selected.source_image_abfs, selected.source_image)!}
                    alt={selected.fine_label || "Source"}
                    className="max-h-full max-w-full object-contain"
                  />
                  {/* Bounding Box overlay */}
                  <div className="absolute border-2 border-red-500 bg-red-500/10 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg animate-pulse" style={{ top: "35%", left: "42%", width: "16%", height: "28%" }}>
                    {selected.coarse_label || "Sign"} ({formatPercent(selected.confidence_yolo)})
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <svg className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs">Không có tệp ảnh xem thực tế</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-3.5 rounded-lg text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">Tên tệp ảnh</span>
                <span className="font-semibold text-slate-800 break-all">{selected.source_image}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">Độ tin cậy YOLO</span>
                <span className="font-bold text-slate-800">{formatPercent(selected.confidence_yolo)}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">Cosine Similarity</span>
                <span className="font-bold text-slate-800">{formatPercent(selected.cosine_similarity)}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5 font-medium">Tọa độ GPS</span>
                <span className="font-bold text-slate-800">{selected.latitude?.toFixed(6)}, {selected.longitude?.toFixed(6)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowImageModal(false)}
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

function formatPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) return "--";
  return `${Math.round(value * 100)}%`;
}
