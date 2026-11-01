import { defineConfig } from "wxt";

const STRICT_CSP =
	"script-src 'self'; object-src 'self'; connect-src 'none'; base-uri 'none'; form-action 'none'";

export default defineConfig({
	srcDir: "src",
	vite: () => ({
		build: { modulePreload: false },
	}),
	manifest: ({ command, manifestVersion }) => ({
		name: "job-autofill",
		permissions: ["storage", "activeTab", "scripting"],
		...(command === "build"
			? {
					content_security_policy:
						manifestVersion === 3
							? { extension_pages: STRICT_CSP }
							: STRICT_CSP,
				}
			: {}),
	}),
});
