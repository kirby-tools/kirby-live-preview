import { defineConfig, presetWind3 } from "unocss";

export default defineConfig({
  presets: [
    presetWind3({
      prefix: "klp-",
      preflight: false,
    }),
  ],
  content: {
    filesystem: ["src/panel/**/*.vue"],
  },
});
