import successfactors from "../../mappings/successfactors.json";
import workday from "../../mappings/workday.json";
import type { FieldMapping, SiteMapping } from "../core/types";

const hostMatches = (host: string, pattern: string) =>
	new RegExp(
		`^${pattern.replace(/\./g, "\\.").replace(/\*/g, "[^.]+(\\.[^.]+)*")}$`,
	).test(host);

const genericFields: FieldMapping[] = [
	["firstName", "personal.firstName", "given-name"],
	["lastName", "personal.lastName", "family-name"],
	["email", "personal.email", "email"],
	["phone", "personal.phone.number", "tel-national"],
	["address1", "address.line1", "address-line1"],
	["city", "address.city", "address-level2"],
	["region", "address.region", "address-level1"],
	["postal", "address.postalCode", "postal-code"],
].map(([key, path, ac]) => ({
	key,
	path,
	kind: "text" as const,
	optional: true,
	selectors: [
		`input[autocomplete='${ac}']`,
		`input[name*='${key}' i]`,
		`input[id*='${key}' i]`,
	],
}));

const generic: SiteMapping = {
	id: "generic",
	match: ["*"],
	fields: genericFields,
};

const registry = [workday, successfactors] as unknown as SiteMapping[];

export function selectMapping(url: URL): SiteMapping {
	return (
		registry.find((m) => m.match.some((p) => hostMatches(url.hostname, p))) ??
		generic
	);
}
