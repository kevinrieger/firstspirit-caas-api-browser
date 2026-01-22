import type { DatabaseSchema, ProjectSetupData } from "../types/configuration";

export const SaveConfigToJson = ({
	projectSettings,
	databaseSchemas,
	locales,
}: {
	projectSettings: ProjectSetupData;
	databaseSchemas: DatabaseSchema[] | null;
	locales: string[] | null;
}): boolean => {
	const json = JSON.stringify(
		{ projectSettings, databaseSchemas, locales },
		null,
		2,
	);
	const date = new Date();
	const formattedDate = date
		.toISOString()
		.replace(/:/g, "-")
		.replace(/\..+/, "");

	const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(json)}`;
	const downloadAnchorNode = document.createElement("a");
	downloadAnchorNode.setAttribute("href", dataStr);
	downloadAnchorNode.setAttribute(
		"download",
		"export_" + projectSettings.projectName + "_" + formattedDate + ".json",
	);
	document.body.appendChild(downloadAnchorNode); // required for firefox
	downloadAnchorNode.click();
	downloadAnchorNode.remove();

	return true;
};
