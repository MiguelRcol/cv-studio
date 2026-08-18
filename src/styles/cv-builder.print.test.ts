import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const stylesheet = readFileSync(
  resolve(process.cwd(), "src/styles/cv-builder.css"),
  "utf8",
);

describe("print layout", () => {
  it("keeps screen breakpoints out of printed pages", () => {
    expect(stylesheet).not.toMatch(/@media\s*\(max-width:/);
    expect(stylesheet).toContain("@media screen and (max-width: 760px)");
  });

  it("prints the résumé with its desktop columns on the selected paper size", () => {
    const printRules = stylesheet.slice(stylesheet.indexOf("@media print"));

    expect(printRules).toContain("size: A4 portrait");
    expect(printRules).toContain("min-height: 100vh");
    expect(printRules).toMatch(
      /\.resume-body\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*31% 69%;/s,
    );
  });
});
