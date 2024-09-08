import { rgb } from "pdf-lib";


// Convert hex color string to RGB format
export const hexToRgb = (hex: string) => {
    let r: number = 0,
        g: number = 0,
        b: number = 0;
    // 3 digits
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    }
    // 6 digits
    else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }
    return rgb(r / 255, g / 255, b / 255);
};

function hexTo(hex: string) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r / 255, g / 255, b / 255];
}

export function simulateBlurColor(hex: string, factor: number) {
    const [r, g, b] = hexTo(hex);
    const R = r * factor;
    const B = g * factor;
    const C = b * factor;
    return rgb(R, B, C)
}