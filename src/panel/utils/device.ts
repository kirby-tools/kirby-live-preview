import type { CSSProperties } from "vue";
import type { DevicePreset } from "../types";

export const DEVICE_VIEWPORT_WIDTHS: Record<DevicePreset, number> = {
  mobile: 390,
  tablet: 768,
  desktop: 1440,
};

/**
 * Lays out a device viewport centered in the container, scaled down to the
 * container width and stretched to keep the container height filled.
 */
export function getDeviceFrameStyles(
  deviceWidth: number,
  container: { width: number; height: number },
): CSSProperties {
  const scale = container.width / deviceWidth;

  return {
    width: `${deviceWidth}px`,
    height: scale < 1 ? `${container.height / scale}px` : "100%",
    transform: scale < 1 ? `scale(${scale})` : "none",
    transformOrigin: "top center",
    position: "absolute",
    top: 0,
    left: "50%",
    marginLeft: `${-deviceWidth / 2}px`,
  };
}
