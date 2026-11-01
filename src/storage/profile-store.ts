import { type Profile, parseProfile } from "../core/schema";

const KEY = "profile.v1";

export async function importProfile(json: string): Promise<Profile> {
	const profile = parseProfile(JSON.parse(json));
	await browser.storage.local.set({ [KEY]: profile });
	return profile;
}

export async function loadProfile(): Promise<Profile | null> {
	const { [KEY]: raw } = await browser.storage.local.get(KEY);
	return raw ? parseProfile(raw) : null;
}

export async function clearProfile() {
	await browser.storage.local.remove(KEY);
}

export async function encryptExport(
	profile: Profile,
	passphrase: string,
): Promise<string> {
	const enc = new TextEncoder();
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const base = await crypto.subtle.importKey(
		"raw",
		enc.encode(passphrase),
		"PBKDF2",
		false,
		["deriveKey"],
	);
	const key = await crypto.subtle.deriveKey(
		{ name: "PBKDF2", salt, iterations: 600_000, hash: "SHA-256" },
		base,
		{ name: "AES-GCM", length: 256 },
		false,
		["encrypt"],
	);
	const data = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		enc.encode(JSON.stringify(profile)),
	);
	const b64 = (u: Uint8Array) => btoa(String.fromCharCode(...u));
	return JSON.stringify({
		v: 1,
		salt: b64(salt),
		iv: b64(iv),
		data: b64(new Uint8Array(data)),
	});
}
