// @vitest-environment happy-dom
import { expect, it } from "vitest";
import { setSelect, setText } from "../../src/core/events";

it("setText notifica al framework mediante eventos", () => {
	const input = document.createElement("input");
	document.body.append(input);
	let state = "";
	input.addEventListener("input", () => {
		state = input.value;
	});

	input.value = "directo";
	expect(state).toBe("");

	setText(input, "Ada");
	expect(state).toBe("Ada");
});

it("setSelect elige por texto de opción sin distinguir mayúsculas", () => {
	const select = document.createElement("select");
	select.innerHTML =
		'<option value="es">Spain</option><option value="fr">France</option>';
	setSelect(select, "france");
	expect(select.value).toBe("fr");
});
