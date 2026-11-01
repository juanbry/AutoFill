const FORBIDDEN: Array<[string, RegExp]> = [
	["fetch()", /\bfetch\s*\(/],
	["XMLHttpRequest", /\bXMLHttpRequest\b/],
	["WebSocket", /\bWebSocket\b/],
	["EventSource", /\bEventSource\b/],
	["sendBeacon", /\bsendBeacon\b/],
	["import() remoto", /import\s*\(\s*["'`]https?:/],
	["URL absoluta", /https?:\/\//],
];

const ALLOWED_URLS = ["https://github.com/juanbry/AutoFill"];

const REMOTE_RESOURCE_IN_HTML =
	/<(script|link|img|iframe|source|video|audio)\b[^>]*\b(src|href)\s*=\s*["']https?:/i;

export function stripComments(src: string): string {
	return src
		.replace(/\/\*[\s\S]*?\*\//g, "")
		.replace(/(^|[^:])\/\/.*$/gm, "$1");
}

export function scanSource(src: string): string[] {
	let code = stripComments(src);
	for (const url of ALLOWED_URLS) code = code.split(url).join("");
	return FORBIDDEN.filter(([, expression]) => expression.test(code)).map(
		([name]) => name,
	);
}

export function scanHtml(html: string): string[] {
	return REMOTE_RESOURCE_IN_HTML.test(html) ? ["recurso remoto en HTML"] : [];
}
