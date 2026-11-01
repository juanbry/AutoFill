export type FieldKind = "text" | "select" | "checkbox" | "radio" | "combobox";

export interface FieldMapping {
	key: string;
	/** Ruta en el perfil: "personal.firstName", "experience[0].company" */
	path: string;
	/** Selectores CSS por orden de prioridad (el primero que exista gana) */
	selectors: string[];
	kind: FieldKind;
	transform?: string;
	optional?: boolean;
	sensitive?: boolean;
}

export interface SiteMapping {
	id: string;
	match: string[];
	waitFor?: string;
	fields: FieldMapping[];
	repeats?: RepeatMapping[];
}

export interface RepeatMapping {
	key: string;
	collection: string;
	addButton: string;
	fields: FieldMapping[];
}

export type FieldStatus = "filled" | "skipped" | "missing" | "error";

export interface FieldResult {
	key: string;
	status: FieldStatus;
	detail?: string;
}

export interface Report {
	adapter: string;
	dryRun: boolean;
	results: FieldResult[];
}

export interface RunOptions {
	dryRun?: boolean;
	includeSensitive?: boolean;
	timeoutMs?: number;
}
