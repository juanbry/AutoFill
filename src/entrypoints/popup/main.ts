import type { Report } from "../../core/types";
import { importProfile } from "../../storage/profile-store";

const render = (report: Report | { error: string }) => {
	const output = document.querySelector("#report");
	if (output)
		output.textContent =
			"error" in report
				? report.error
				: report.results.map((r) => `${r.key}: ${r.status}`).join("\n");
};

const isAutofillResponse = (
	value: unknown,
): value is Report | { error: string } =>
	typeof value === "object" &&
	value !== null &&
	("error" in value || "results" in value);

document.querySelector("#fill")?.addEventListener("click", async () => {
	const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
	if (!tab.id) return;
	await browser.scripting.executeScript({
		target: { tabId: tab.id, allFrames: true },
		files: ["/content-scripts/content.js"],
	});
	const dryRun = (document.querySelector("#dry") as HTMLInputElement).checked;
	const response = await browser.tabs.sendMessage(tab.id, {
		type: "AUTOFILL",
		options: { dryRun },
	});
	render(
		isAutofillResponse(response)
			? response
			: { error: "Respuesta inválida del formulario" },
	);
});

document
	.querySelector("#profile")
	?.addEventListener("change", async (event) => {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		await importProfile(await file.text());
	});
