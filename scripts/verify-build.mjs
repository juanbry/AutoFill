import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2] ?? ".output/chrome-mv3";
const ALLOWED_PERMISSIONS = new Set(["storage", "activeTab", "scripting"]);
const FORBIDDEN_IN_BUNDLE = [
	/\bfetch\s*\(/,
	/\bXMLHttpRequest\b/,
	/\bWebSocket\b/,
	/\bsendBeacon\b/,
];
const errors = [];

const manifest = JSON.parse(readFileSync(join(OUT, "manifest.json"), "utf8"));

for (const permission of manifest.permissions ?? []) {
	if (!ALLOWED_PERMISSIONS.has(permission)) {
		errors.push(`Permiso no permitido: ${permission}`);
	}
}
if ((manifest.host_permissions ?? []).length) {
	errors.push(
		`host_permissions presentes: ${JSON.stringify(manifest.host_permissions)}`,
	);
}
if ((manifest.content_scripts ?? []).length) {
	errors.push(
		"content_scripts estáticos en el manifest (debe inyectarse a demanda)",
	);
}
const csp =
	manifest.content_security_policy?.extension_pages ??
	manifest.content_security_policy;
if (!String(csp ?? "").includes("connect-src 'none'")) {
	errors.push("Falta connect-src 'none' en la CSP");
}

const walk = (directory) =>
	readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
		entry.isDirectory()
			? walk(join(directory, entry.name))
			: [join(directory, entry.name)],
	);

for (const file of walk(OUT).filter((file) => file.endsWith(".js"))) {
	const code = readFileSync(file, "utf8");
	for (const expression of FORBIDDEN_IN_BUNDLE) {
		if (expression.test(code))
			errors.push(`${file}: coincide con ${expression}`);
	}
}

if (errors.length) {
	console.error(
		`❌ Verificación del build fallida:\n - ${errors.join("\n - ")}`,
	);
	process.exit(1);
}
console.log("✅ Build verificado: permisos mínimos, sin red, CSP estricta.");
