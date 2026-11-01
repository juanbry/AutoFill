import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { scanHtml, scanSource } from "../helpers/net-scan";

const SRC = join(process.cwd(), "src");
const all = readdirSync(SRC, { recursive: true }) as string[];
const read = (file: string) => readFileSync(join(SRC, file), "utf8");

describe("privacidad: cero red en el código fuente", () => {
	it("ningún archivo de src/ usa APIs de red ni URLs absolutas", () => {
		const hits = all
			.filter((file) => /\.(ts|tsx|js|mjs)$/.test(file))
			.flatMap((file) =>
				scanSource(read(file)).map((hit) => `${file}: ${hit}`),
			);
		expect(hits).toEqual([]);
	});

	it("el HTML no carga recursos remotos", () => {
		const hits = all
			.filter((file) => file.endsWith(".html"))
			.flatMap((file) => scanHtml(read(file)).map((hit) => `${file}: ${hit}`));
		expect(hits).toEqual([]);
	});
});

describe("el propio escáner funciona", () => {
	it("detecta fetch y XMLHttpRequest", () => {
		expect(scanSource("await fetch('x')")).toContain("fetch()");
		expect(scanSource("new XMLHttpRequest()")).toContain("XMLHttpRequest");
	});

	it("ignora comentarios", () => {
		expect(scanSource("// fetch('x')\n/* new WebSocket() */")).toEqual([]);
	});

	it("detecta URLs absolutas salvo las permitidas", () => {
		expect(scanSource("const u = 'https://evil.example/track'")).toContain(
			"URL absoluta",
		);
		expect(
			scanSource("const u = 'https://github.com/juanbry/AutoFill'"),
		).toEqual([]);
	});

	it("detecta scripts remotos en HTML pero no enlaces", () => {
		expect(
			scanHtml('<script src="https://cdn.example/x.js"></script>'),
		).toHaveLength(1);
		expect(
			scanHtml('<a href="https://github.com/juanbry/AutoFill">repo</a>'),
		).toEqual([]);
	});
});
