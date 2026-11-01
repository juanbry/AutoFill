import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { expect, test } from "@playwright/test";
import { buildSync } from "esbuild";

const require = createRequire(import.meta.url);
const engineJs = buildSync({
	entryPoints: ["src/core/engine.ts"],
	bundle: true,
	format: "iife",
	globalName: "JobAutofill",
	write: false,
}).outputFiles[0].text;

test("rellena inputs controlados de React", async ({ page }) => {
	await page.setContent('<div id="root"></div><pre id="state"></pre>');
	await page.addScriptTag({
		path: join(dirname(require.resolve("react")), "umd/react.development.js"),
	});
	await page.addScriptTag({
		path: join(
			dirname(require.resolve("react-dom")),
			"umd/react-dom.development.js",
		),
	});
	await page.evaluate(`
		const { useState, createElement: h } = React;
		function App() {
			const [f, setF] = useState({ firstName: "", email: "" });
			const on = (k) => (e) => setF({ ...f, [k]: e.target.value });
			return h("form", null,
				h("input", { id: "fn", value: f.firstName, onChange: on("firstName") }),
				h("input", { id: "em", value: f.email, onChange: on("email") }),
				h("pre", { id: "state" }, JSON.stringify(f)));
		}
		ReactDOM.createRoot(document.getElementById("root")).render(h(App));
	`);
	await page.addScriptTag({ content: engineJs });

	const report = await page.evaluate(async () => {
		const profile = {
			personal: { firstName: "Ada", email: "ada@example.com" },
		};
		const mapping = {
			id: "test",
			match: ["*"],
			fields: [
				{
					key: "fn",
					path: "personal.firstName",
					kind: "text",
					selectors: ["#fn"],
				},
				{ key: "em", path: "personal.email", kind: "text", selectors: ["#em"] },
			],
		};
		return (
			window as unknown as {
				JobAutofill: {
					runAutofill: (
						profile: unknown,
						mapping: unknown,
					) => Promise<{ results: Array<{ status: string }> }>;
				};
			}
		).JobAutofill.runAutofill(profile, mapping);
	});

	expect(
		report.results.every(
			(result: { status: string }) => result.status === "filled",
		),
	).toBe(true);
	await expect(page.locator("#root pre#state")).toContainText(
		'"firstName":"Ada"',
	);
	await expect(page.locator("#root pre#state")).toContainText(
		'"email":"ada@example.com"',
	);
});
