import { selectMapping } from "../adapters";
import { runAutofill } from "../core/engine";
import type { RunOptions } from "../core/types";
import { loadProfile } from "../storage/profile-store";

type AutofillMessage = { type?: string; options?: RunOptions };

export default defineUnlistedScript({
	async main() {
		browser.runtime.onMessage.addListener(async (raw: unknown) => {
			if (typeof raw !== "object" || raw === null) return;
			const msg = raw as AutofillMessage;
			if (msg.type !== "AUTOFILL") return;
			const profile = await loadProfile();
			if (!profile) return { error: "No hay perfil importado" };
			return runAutofill(
				profile,
				selectMapping(new URL(location.href)),
				msg.options,
			);
		});
	},
});
