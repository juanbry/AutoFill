import type { Profile } from "./schema";

const TRANSFORMS: Record<string, (v: unknown, p: Profile) => string> = {
	upper: (v) => String(v).toUpperCase(),
	phoneFull: (_v, p) =>
		`${p.personal.phone?.countryCode ?? ""}${p.personal.phone?.number ?? ""}`,
	yesNo: (v) => (v ? "Yes" : "No"),
	monthYear: (v) => {
		const [y, m] = String(v).split("-");
		return `${m}/${y}`;
	},
};

export function getByPath(obj: unknown, path: string): unknown {
	return path
		.replace(/\[(\d+)\]/g, ".$1")
		.split(".")
		.reduce<unknown>((acc, key) => {
			if (acc == null) return undefined;
			if (Array.isArray(acc) && !/^\d+$/.test(key))
				return acc.find((item) => item?.id === key);
			if (typeof acc !== "object") return undefined;
			return key in acc ? (acc as Record<string, unknown>)[key] : undefined;
		}, obj);
}

export function resolveValue(
	profile: Profile,
	path: string,
	transform?: string,
): string | boolean | undefined {
	const raw = getByPath(profile, path);
	if (raw === undefined || raw === null || raw === "") return undefined;
	if (transform) {
		const fn = TRANSFORMS[transform];
		if (!fn) throw new Error(`Transform desconocido: ${transform}`);
		return fn(raw, profile);
	}
	return typeof raw === "boolean" ? raw : String(raw);
}
