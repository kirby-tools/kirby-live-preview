import { describe, expect, it } from "vitest";
import { coalesce } from "../../../src/panel/utils/coalesce";

describe("coalesce", () => {
  it("runs the latest call made during a run once the run finishes", async () => {
    const calls: number[] = [];
    const run = coalesce(async (value: number) => {
      calls.push(value);
      await new Promise((resolve) => setTimeout(resolve));
    });

    const firstRun = run(1);
    run(2);
    run(3);
    await firstRun;

    expect(calls).toEqual([1, 3]);
  });
});
