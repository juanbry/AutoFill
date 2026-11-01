import { sleep, waitFor } from "./dom";

const fire = (el: HTMLElement, type: string, init: EventInit = {}) =>
	el.dispatchEvent(new Event(type, { bubbles: true, composed: true, ...init }));

function nativeSet(
	el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
	value: string,
) {
	const proto = Object.getPrototypeOf(el);
	const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
	if (!setter) throw new Error("No se encontró el setter nativo de value");
	setter.call(el, value);
}

export function setText(
	el: HTMLInputElement | HTMLTextAreaElement,
	value: string,
) {
	el.focus();
	nativeSet(el, value);
	el.dispatchEvent(
		new InputEvent("input", {
			bubbles: true,
			composed: true,
			data: value,
			inputType: "insertText",
		}),
	);
	fire(el, "change");
	el.blur();
}

export function setSelect(el: HTMLSelectElement, value: string) {
	const norm = (s: string) => s.trim().toLowerCase();
	const opt = [...el.options].find(
		(o) => norm(o.value) === norm(value) || norm(o.text) === norm(value),
	);
	if (!opt) throw new Error(`Opción no encontrada: ${value}`);
	nativeSet(el, opt.value);
	fire(el, "input");
	fire(el, "change");
}

export function setChecked(el: HTMLInputElement, want: boolean) {
	if (el.checked !== want) el.click();
}

export async function setCombobox(
	el: HTMLElement,
	value: string,
	timeoutMs = 3000,
) {
	el.click();
	const input =
		el instanceof HTMLInputElement
			? el
			: el.querySelector<HTMLInputElement>("input");
	if (input) setText(input, value);
	const option = await waitFor(
		[
			'[role="option"]',
			'[role="listbox"] li',
			'[data-automation-id="promptOption"]',
		],
		timeoutMs,
	);
	if (!option) throw new Error(`Sin opciones para: ${value}`);
	const options = [
		...document.querySelectorAll<HTMLElement>(
			'[role="option"], [data-automation-id="promptOption"]',
		),
	];
	const match =
		options.find((o) =>
			o.textContent?.trim().toLowerCase().includes(value.toLowerCase()),
		) ?? options[0];
	match.click();
	await sleep(150);
}
