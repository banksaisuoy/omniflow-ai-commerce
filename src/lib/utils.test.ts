import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("should merge basic strings", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });

  it("should handle array of strings", () => {
    expect(cn(["class1", "class2"])).toBe("class1 class2");
  });

  it("should handle object syntax for conditional classes", () => {
    expect(
      cn({
        class1: true,
        class2: false,
        class3: true,
      })
    ).toBe("class1 class3");
  });

  it("should handle mixed inputs (strings, arrays, objects)", () => {
    expect(cn("class1", ["class2", "class3"], { class4: true, class5: false })).toBe(
      "class1 class2 class3 class4"
    );
  });

  it("should merge tailwind classes properly (resolving conflicts)", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
    expect(cn("px-4 py-2", "p-2")).toBe("p-2");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("should handle undefined, null, and false gracefully", () => {
    expect(cn("class1", undefined, null, false, "class2")).toBe("class1 class2");
  });
});
