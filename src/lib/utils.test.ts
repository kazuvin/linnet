import { describe, expect, it } from "vitest";
import { capitalize, formatCurrency, generateId, truncate } from "./utils";

describe("capitalize", () => {
  it("capitalizes the first letter of a string", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  it("handles empty string", () => {
    expect(capitalize("")).toBe("");
  });

  it("handles already capitalized string", () => {
    expect(capitalize("Hello")).toBe("Hello");
  });

  it("handles single character", () => {
    expect(capitalize("a")).toBe("A");
  });
});

describe("formatCurrency", () => {
  it("formats a number as USD currency", () => {
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0.00");
  });

  it("formats negative numbers", () => {
    expect(formatCurrency(-100)).toBe("-$100.00");
  });

  it("rounds to two decimal places", () => {
    expect(formatCurrency(99.999)).toBe("$100.00");
  });
});

describe("truncate", () => {
  it("truncates long strings with ellipsis", () => {
    expect(truncate("Hello World", 8)).toBe("Hello...");
  });

  it("returns original string if shorter than maxLength", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
  });

  it("returns original string if equal to maxLength", () => {
    expect(truncate("Hello", 5)).toBe("Hello");
  });

  it("handles empty string", () => {
    expect(truncate("", 5)).toBe("");
  });
});

describe("generateId", () => {
  it("generates an ID of default length 8", () => {
    const id = generateId();
    expect(id).toHaveLength(8);
  });

  it("generates an ID of specified length", () => {
    const id = generateId(12);
    expect(id).toHaveLength(12);
  });

  it("generates only alphanumeric characters", () => {
    const id = generateId(100);
    expect(id).toMatch(/^[a-z0-9]+$/);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});
