import { describe, expect, it } from "vitest";
import example from "../../profiles/example.profile.json";
import { getByPath, resolveValue } from "../../src/core/resolver";
import { ProfileSchema } from "../../src/core/schema";

const profile = ProfileSchema.parse(example);

describe("resolver", () => {
	it("resuelve rutas con índices", () => {
		expect(getByPath(profile, "experience[0].company")).toBe(
			"Analytical Engines S.A.C.",
		);
	});

	it("aplica transforms", () => {
		expect(resolveValue(profile, "personal.phone.number", "phoneFull")).toBe(
			"+51900000000",
		);
	});

	it("devuelve undefined si no hay dato", () => {
		expect(resolveValue(profile, "links.website")).toBeUndefined();
	});

	it("el perfil de ejemplo es válido", () => {
		expect(() => ProfileSchema.parse(example)).not.toThrow();
	});
});
