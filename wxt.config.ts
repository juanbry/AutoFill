import { defineConfig } from "wxt";

export default defineConfig({
	srcDir: "src",
	manifest: {
		name: "job-autofill",
		permissions: ["storage", "activeTab", "scripting"],
	},
});
