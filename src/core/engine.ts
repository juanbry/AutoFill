import { findFirst, sleep, waitFor } from "./dom";
import { setChecked, setCombobox, setSelect, setText } from "./events";
import { resolveValue } from "./resolver";
import { getByPath } from "./resolver";
import type { Profile } from "./schema";
import type {
	FieldMapping,
	FieldResult,
	Report,
	RunOptions,
	SiteMapping,
} from "./types";

const BLOCKED_TYPES = new Set(["password", "file", "submit", "hidden"]);

async function fillField(
	f: FieldMapping,
	el: HTMLElement,
	value: string | boolean,
) {
	switch (f.kind) {
		case "text":
			return setText(el as HTMLInputElement, String(value));
		case "select":
			return setSelect(el as HTMLSelectElement, String(value));
		case "checkbox":
		case "radio":
			return setChecked(el as HTMLInputElement, Boolean(value));
		case "combobox":
			return setCombobox(el, String(value));
	}
}

async function processField(
	profile: Profile,
	f: FieldMapping,
	opts: Required<RunOptions>,
	results: FieldResult[],
) {
	try {
		if (f.sensitive && !opts.includeSensitive) {
			results.push({ key: f.key, status: "skipped", detail: "campo sensible" });
			return;
		}
		const value = resolveValue(profile, f.path, f.transform);
		if (value === undefined) {
			results.push({
				key: f.key,
				status: "skipped",
				detail: "sin dato en el perfil",
			});
			return;
		}
		const el =
			findFirst(f.selectors) ??
			(await waitFor(f.selectors, f.optional ? 300 : opts.timeoutMs));
		if (!el) {
			results.push({
				key: f.key,
				status: f.optional ? "skipped" : "missing",
			});
			return;
		}
		if (el instanceof HTMLInputElement && BLOCKED_TYPES.has(el.type)) {
			results.push({
				key: f.key,
				status: "skipped",
				detail: `tipo ${el.type} bloqueado`,
			});
			return;
		}
		if (!opts.dryRun) await fillField(f, el, value);
		results.push({ key: f.key, status: "filled" });
	} catch (e) {
		results.push({
			key: f.key,
			status: "error",
			detail: e instanceof Error ? e.message : String(e),
		});
	}
}

function expand(f: FieldMapping, i: number): FieldMapping {
	const substitute = (value: string) =>
		value.replaceAll("{i}", String(i)).replaceAll("{n}", String(i + 1));
	return {
		...f,
		key: `${f.key}[${i}]`,
		path: substitute(f.path),
		selectors: f.selectors.map(substitute),
	};
}

export async function runAutofill(
	profile: Profile,
	mapping: SiteMapping,
	opts: RunOptions = {},
): Promise<Report> {
	const options = {
		dryRun: false,
		includeSensitive: false,
		timeoutMs: 4000,
		...opts,
	};
	const results: FieldResult[] = [];

	if (mapping.waitFor) await waitFor([mapping.waitFor], options.timeoutMs);
	for (const field of mapping.fields) {
		await processField(profile, field, options, results);
	}

	for (const repeat of mapping.repeats ?? []) {
		const items = getByPath(profile, repeat.collection);
		if (!Array.isArray(items)) continue;
		for (let i = 0; i < items.length; i++) {
			const fields = repeat.fields.map((field) => expand(field, i));
			if (!fields[0]) continue;
			if (!findFirst(fields[0].selectors) && !options.dryRun) {
				findFirst([repeat.addButton])?.click();
				await waitFor(fields[0].selectors, options.timeoutMs);
				await sleep(200);
			}
			for (const field of fields) {
				await processField(profile, field, options, results);
			}
		}
	}
	return { adapter: mapping.id, dryRun: options.dryRun, results };
}
