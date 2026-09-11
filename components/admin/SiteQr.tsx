"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { SITE_URL } from "@/lib/settings";

const SHOP_NAME = "Rosas LS · Ramos y Arreglos";

/**
 * Mini-sección QR de la web para el panel admin:
 * mostrar, descargar (PNG para imprenta / SVG vectorial),
 * copiar, compartir y tarjeta imprimible para clientes.
 */
export function SiteQr() {
  const qrBoxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  function download(href: string, filename: string) {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    download(canvas.toDataURL("image/png"), "qr-rosas-ls.png");
  }

  function downloadSvg() {
    const svg = qrBoxRef.current?.querySelector("svg");
    if (!svg) return;
    const blob = new Blob(
      [new XMLSerializer().serializeToString(svg)],
      { type: "image/svg+xml" }
    );
    const url = URL.createObjectURL(blob);
    download(url, "qr-rosas-ls.svg");
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(SITE_URL);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = SITE_URL;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function share() {
    const data = { title: SHOP_NAME, text: "Mira nuestro catálogo", url: SITE_URL };
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share(data);
        return;
      } catch {
        /* cancelado: cae a copiar */
      }
    }
    await copyLink();
  }

  /** Tarjeta lista para imprimir (o guardar en PDF) con logo + QR. */
  function printCard() {
    const svg = qrBoxRef.current?.querySelector("svg");
    const svgHtml = svg ? new XMLSerializer().serializeToString(svg) : "";
    const win = window.open("", "_blank", "width=600,height=700");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
<title>${SHOP_NAME} · QR</title>
<style>
  body{font-family:Georgia,serif;background:#fff;color:#111;display:flex;justify-content:center;padding:24px}
  .card{border:3px solid #C9A86A;border-radius:20px;padding:32px;text-align:center;max-width:420px}
  img.logo{width:120px;height:120px;object-fit:cover;border-radius:50%;border:2px solid #C9A86A}
  h1{font-size:28px;margin:12px 0 4px;letter-spacing:2px}
  p.sub{font-size:13px;letter-spacing:4px;color:#8C6F3A;margin:0 0 16px;text-transform:uppercase}
  .qr svg{width:260px;height:260px}
  p.url{font-family:monospace;font-size:13px;word-break:break-all;color:#333}
  p.hint{font-size:14px;color:#555}
  @media print{body{padding:0}}
</style></head><body><div class="card">
<img class="logo" src="${SITE_URL}/logo/logo.jpeg" alt="Rosas LS">
<h1>ROSAS LS</h1><p class="sub">Ramos y Arreglos</p>
<div class="qr">${svgHtml}</div>
<p class="hint">Escanea con tu cámara para ver el catálogo</p>
<p class="url">${SITE_URL}</p>
</div><script>window.onload=()=>window.print()</script></body></html>`);
    win.document.close();
  }

  return (
    <section className="mt-6 rounded-2xl border border-gold-500/25 bg-noir-900 p-6">
      <h2 className="font-display text-2xl">QR de tu web</h2>
      <p className="mt-1 text-sm text-cream-100/50">
        Los clientes lo escanean y llegan directo al catálogo. Descarga el PNG
        para la imprenta o imprime tarjetas desde aquí.
      </p>
      <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row sm:items-start">
        <div className="rounded-2xl bg-white p-3">
          <div ref={qrBoxRef}>
            <QRCodeSVG
              value={SITE_URL}
              size={200}
              level="M"
              bgColor="#ffffff"
              fgColor="#000000"
              marginSize={2}
            />
          </div>
          {/* Lienzo oculto en alta resolución para el PNG de imprenta */}
          <div className="hidden" aria-hidden="true">
            <QRCodeCanvas
              ref={canvasRef}
              value={SITE_URL}
              size={1024}
              level="M"
              bgColor="#ffffff"
              fgColor="#000000"
              marginSize={2}
            />
          </div>
        </div>
        <div className="w-full flex-1">
          <p className="break-all rounded-xl border border-white/10 bg-noir-950 px-4 py-2.5 font-mono text-xs text-gold-300">
            {SITE_URL}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={downloadPng}
              className="rounded-full bg-gold-500 px-4 py-2.5 text-sm font-semibold text-noir-950 hover:bg-gold-400"
            >
              PNG · imprenta
            </button>
            <button
              type="button"
              onClick={downloadSvg}
              className="rounded-full border border-gold-500/50 px-4 py-2.5 text-sm font-semibold text-gold-300 hover:bg-gold-500/10"
            >
              SVG · vector
            </button>
            <button
              type="button"
              onClick={copyLink}
              className="rounded-full border border-white/15 px-4 py-2.5 text-sm text-cream-100/80"
            >
              {copied ? "¡Copiado!" : "Copiar enlace"}
            </button>
            <button
              type="button"
              onClick={share}
              className="rounded-full border border-white/15 px-4 py-2.5 text-sm text-cream-100/80"
            >
              Compartir
            </button>
          </div>
          <button
            type="button"
            onClick={printCard}
            className="mt-2 w-full rounded-full border border-gold-500/50 px-4 py-2.5 text-sm font-semibold text-gold-300 hover:bg-gold-500/10"
          >
            🖨️ Imprimir tarjeta con QR
          </button>
        </div>
      </div>
    </section>
  );
}
