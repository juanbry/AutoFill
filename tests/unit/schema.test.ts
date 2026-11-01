import { describe, expect, it } from "vitest";
import example from "../../profiles/example.profile.json";
import { getByPath } from "../../src/core/resolver";
import {
	ProfileSchema,
	isSensitivePath,
	migrateProfile,
	parseProfile,
} from "../../src/core/schema";
import v1 from "../fixtures/profile.v1.json";

describe("esquema v2", () => {
	it("el perfil de ejemplo es válido", () => {
		expect(() => ProfileSchema.parse(example)).not.toThrow();
	});

	it("migra un perfil v1 a v2 convirtiendo answers en campos personalizados", () => {
		const profile = parseProfile(v1);
		expect(profile.schemaVersion).toBe(2);
		expect(profile.custom).toHaveLength(1);
		expect(profile.custom[0]).toMatchObject({
			id: "noticePeriod",
			value: "1 mes",
			sensitive: false,
		});
	});

	it("no toca un perfil que ya es v2", () => {
		expect(migrateProfile(example)).toBe(example);
	});

	it("rechaza versiones desconocidas", () => {
		expect(() => parseProfile({ ...example, schemaVersion: 3 })).toThrow();
	});

	it("valida que el valor corresponda al tipo del campo personalizado", () => {
		const bad = {
			...example,
			custom: [{ id: "x", label: "X", type: "boolean", value: "sí" }],
		};
		expect(() => ProfileSchema.parse(bad)).toThrow(/tipo/);
	});

	it("rechaza ids repetidos y ids con punto", () => {
		const duplicate = {
			...example,
			custom: [
				{ id: "a", label: "A", value: "1" },
				{ id: "a", label: "A2", value: "2" },
			],
		};
		expect(() => ProfileSchema.parse(duplicate)).toThrow(/repetidos/);
		const dotted = {
			...example,
			custom: [{ id: "a.b", label: "A", value: "1" }],
		};
		expect(() => ProfileSchema.parse(dotted)).toThrow();
	});
});

describe("rutas y sensibilidad", () => {
	const profile = ProfileSchema.parse({
		...example,
		custom: [
			{
				id: "preaviso",
				label: "Preaviso",
				value: "1 mes",
				matchLabels: ["preaviso"],
			},
			{ id: "banco", label: "Dato privado", value: "x", sensitive: true },
		],
	});

	it("resuelve campos personalizados por id", () => {
		expect(getByPath(profile, "custom.preaviso.value")).toBe("1 mes");
	});

	it("marca como sensibles identidad, autorización, salario y personalizados marcados", () => {
		expect(isSensitivePath(profile, "identity.documentNumber")).toBe(true);
		expect(isSensitivePath(profile, "workAuthorization.authorized")).toBe(true);
		expect(isSensitivePath(profile, "preferences.salaryExpectation")).toBe(
			true,
		);
		expect(isSensitivePath(profile, "custom.banco.value")).toBe(true);
		expect(isSensitivePath(profile, "custom.preaviso.value")).toBe(false);
		expect(isSensitivePath(profile, "personal.email")).toBe(false);
	});
});
