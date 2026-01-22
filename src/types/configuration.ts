export type DatabaseSchema = {
	name: string;
	entityTypeNames: string[] | null;
};

export type Locales = string[];

export type ProjectSetupData = {
	projectName: string | null;
	caasApiKey: string | null;
	caasUrl: string | null;
};
