import { z } from "zod";

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

export const ProfileSchema = z.object({
	schemaVersion: z.literal(1),
	personal: z.object({
		firstName: z.string().min(1),
		lastName: z.string().min(1),
		email: z.string().email(),
		phone: z.object({ countryCode: z.string(), number: z.string() }),
	}),
	address: z.object({
		line1: z.string(),
		city: z.string(),
		region: z.string(),
		postalCode: z.string(),
		country: z.string(),
	}),
	links: z
		.object({
			linkedin: z.string().url().optional(),
			github: z.string().url().optional(),
			website: z.string().url().optional(),
		})
		.default({}),
	workAuthorization: z
		.object({
			authorized: z.boolean(),
			requiresSponsorship: z.boolean(),
		})
		.optional(),
	experience: z.array(Experience).default([]),
	education: z.array(Education).default([]),
	answers: z.record(z.string()).default({}),
});

export type Profile = z.infer<typeof ProfileSchema>;
