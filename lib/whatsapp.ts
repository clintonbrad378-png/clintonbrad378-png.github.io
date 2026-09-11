import type { Product } from "./types";
import { DEFAULT_SETTINGS } from "./settings";

/** Número por defecto (cliente). El servidor usa `getSiteSettings()`. */
export function whatsappNumber() {
  if (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_WHATSAPP_NUMBER) {
    return process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  }
  return DEFAULT_SETTINGS.whatsappNumber;
}

export const WHATSAPP_DISPLAY = DEFAULT_SETTINGS.whatsappDisplay;
export const INSTAGRAM_HANDLE = DEFAULT_SETTINGS.instagram;

export function whatsappLinkForProduct(
  product: Product,
  variant?: string,
  number?: string
) {
  const price = product.sale_price ?? product.price;
  const msg =
    `Hola Rosas LS, quiero hacer un pedido:\n\n` +
    `• Producto: ${product.name}\n` +
    `• Precio: $${price} CUP` +
    (variant ? `\n• Color: ${variant}` : "") +
    `\n\n¿Me confirmas tiempo de elaboración y entrega? ¡Gracias!`;
  return `https://wa.me/${number ?? whatsappNumber()}?text=${encodeURIComponent(msg)}`;
}

export function whatsappLinkGeneral(
  msg = "Hola Rosas LS, quiero hacer un pedido del catálogo",
  number?: string
) {
  return `https://wa.me/${number ?? whatsappNumber()}?text=${encodeURIComponent(msg)}`;
}
