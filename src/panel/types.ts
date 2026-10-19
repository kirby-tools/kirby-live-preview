import type { LicenseStatus } from "@kirby-tools/licensing";

export interface PluginContextResponse {
  licenseStatus: LicenseStatus;
}

export interface SectionResponse {
  label: string | null;
  pageId: string;
  updateStrategy: "interval" | "blur";
  updateInterval: number | false;
  interactable: boolean;
  aspectRatio: string | null;
  help: string | null;
}

export type DevicePreset = "mobile" | "tablet" | "desktop";
