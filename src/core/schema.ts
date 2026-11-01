import { z } from "zod";

/* ---------- Campos personalizados ---------- */

export const FieldType = z.enum([
	"text",
	"longtext",
	"number",
	"date",
	"boolean",
	"choice",
	"url",
	"email",
	"phone",
]);

const CustomField = z
	.object({
		id: z
			.string()
			.regex(/^[a-z0-9_-]+$/i, "Solo letras, números, guion y guion bajo"),
		label: z.string().min(1),
		type: FieldType.default("text"),
		value: z.union([z.string(), z.number(), z.boolean()]),
		matchLabels: z.array(z.string()).default([]),
		sensitive: z.boolean().default(false),
	})
	.superRefine((field, ctx) => {
		const valid =
			field.type === "boolean"
				? typeof field.value === "boolean"
				: field.type === "number"
					? typeof field.value === "number"
					: typeof field.value === "string";
		if (!valid) {
			ctx.addIssue({
				code: "custom",
				path: ["value"],
				message: `El valor no corresponde al tipo "${field.type}"`,
			});
		}
	});

/* ---------- Bloques repetibles ---------- */

const Experience = z.object({
	company: z.string(),
	title: z.string(),
	location: z.string().optional(),
	startDate: z.string(),
	endDate: z.string().optional(),
	current: z.boolean().default(false),
	description: z.string().optional(),
});

const Education = z.object({
	school: z.string(),
	degree: z.string(),
	field: z.string().optional(),
	startDate: z.string(),
	endDate: z.string().optional(),
});

const Language = z.object({ name: z.string(), level: z.string().optional() });

/* ---------- Perfil v2 ---------- */

export const ProfileSchema = z.object({
	schemaVersion: z.literal(2),
	personal: z.object({
		firstName: z.string().min(1),
		lastName: z.string().min(1),
		email: z.string().email(),
		phone: z.object({ countryCode: z.string(), number: z.string() }).optional(),
	}),
	address: z
		.object({
			line1: z.string().optional(),
			city: z.string().optional(),
			region: z.string().optional(),
			postalCode: z.string().optional(),
			country: z.string().optional(),
		})
		.default({}),
	identity: z
		.object({
			documentType: z.string().optional(),
			documentNumber: z.string().optional(),
			birthDate: z.string().optional(),
			nationality: z.string().optional(),
		})
		.default({}),
	links: z
		.object({
			linkedin: z.string().url().optional(),
			github: z.string().url().optional(),
			website: z.string().url().optional(),
		})
		.default({}),
	workAuthorization: z
		.object({ authorized: z.boolean(), requiresSponsorship: z.boolean() })
		.optional(),
	preferences: z
		.object({
			salaryExpectation: z.string().optional(),
			noticePeriod: z.string().optional(),
		})
		.default({}),
	experience: z.array(Experience).default([]),
	education: z.array(Education).default([]),
	languages: z.array(Language).default([]),
	skills: z.array(z.string()).default([]),
	custom: z
		.array(CustomField)
		.default([])
		.refine(
			(fields) =>
				new Set(fields.map((field) => field.id)).size === fields.length,
			"Hay ids de campos personalizados repetidos",
		),
});

export type Profile = z.infer<typeof ProfileSchema>;
export type CustomFieldT = z.infer<typeof CustomField>;

/* ---------- Sensibilidad ---------- */

const SENSITIVE_PREFIXES = [
	"identity.",
	"workAuthorization.",
	"preferences.salaryExpectation",
];

export function isSensitivePath(profile: Profile, path: string): boolean {
	if (SENSITIVE_PREFIXES.some((prefix) => path.startsWith(prefix))) return true;
	const match = /^custom\.([^.]+)\./.exec(path);
	return match
		? profile.custom.find((field) => field.id === match[1])?.sensitive === true
		: false;
}

/* ---------- Migración ---------- */

export function migrateProfile(raw: unknown): unknown {
	if (typeof raw !== "object" || raw === null) return raw;
	const profile = raw as Record<string, unknown>;
	if (profile.schemaVersion !== 1) return profile;
	const { answers = {}, ...rest } = profile;
	const custom = Object.entries(answers as Record<string, unknown>).map(
		([id, value]) => ({
			id,
			label: id,
			type: "text",
			value: String(value),
			matchLabels: [],
			sensitive: false,
		}),
	);
	return { ...rest, schemaVersion: 2, custom };
}

export function parseProfile(raw: unknown): Profile {
	return ProfileSchema.parse(migrateProfile(raw));
}
