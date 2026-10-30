import { describe, expect, it } from "vitest";
import { getDeviceFrameStyles } from "../../../src/panel/utils/device";

describe("getDeviceFrameStyles", () => {
  it("scales a device wider than the container down and stretches its height", () => {
    expect(
      getDeviceFrameStyles(1440, { width: 720, height: 600 }),
    ).toMatchObject({
      width: "1440px",
      height: "1200px",
      transform: "scale(0.5)",
      marginLeft: "-720px",
    });
  });

  it("keeps a device narrower than the container at its own width", () => {
    expect(
      getDeviceFrameStyles(390, { width: 720, height: 600 }),
    ).toMatchObject({
      width: "390px",
      height: "100%",
      transform: "none",
      marginLeft: "-195px",
    });
  });
});
