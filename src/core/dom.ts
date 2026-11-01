/** Búsqueda que atraviesa Shadow DOM abiertos (muchos portales los usan). */
export function queryDeep(
	selector: string,
	root: ParentNode = document,
): HTMLElement | null {
	const direct = root.querySelector<HTMLElement>(selector);
	if (direct) return direct;
	for (const el of root.querySelectorAll<HTMLElement>("*")) {
		if (el.shadowRoot) {
			const hit = queryDeep(selector, el.shadowRoot);
			if (hit) return hit;
		}
	}
	return null;
}

export function findFirst(selectors: string[]): HTMLElement | null {
	for (const s of selectors) {
		const el = queryDeep(s);
		if (el) return el;
	}
	return null;
}

/** Espera a que aparezca un elemento (SPA con render diferido). */
export function waitFor(
	selectors: string[],
	timeoutMs = 5000,
): Promise<HTMLElement | null> {
	const now = findFirst(selectors);
	if (now) return Promise.resolve(now);
	return new Promise((resolve) => {
		const obs = new MutationObserver(() => {
			const el = findFirst(selectors);
			if (el) {
				obs.disconnect();
				clearTimeout(t);
				resolve(el);
			}
		});
		obs.observe(document.documentElement, { childList: true, subtree: true });
		const t = setTimeout(() => {
			obs.disconnect();
			resolve(null);
		}, timeoutMs);
	});
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
