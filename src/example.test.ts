import { describe, expect, it } from "vitest";

describe("test harness", () => {
  it("ejecuta vitest correctamente", () => {
    expect(true).toBe(true);
  });

  it("evalúa expresiones de TypeScript", () => {
    const numbers = [1, 2, 3];
    const sum = numbers.reduce((acc, n) => acc + n, 0);
    expect(sum).toBe(6);
  });
});
