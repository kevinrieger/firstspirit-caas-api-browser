import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useId, useState } from "react";
import {
	type SubmitHandler,
	useForm,
	useFormState,
	useWatch,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ConnectionStatusIcon from "@/components/ui/connection-status-icon";
import { Input } from "@/components/ui/input";
import { useCaaSConfigStore } from "@/stores/caas-config-store";
import type { ConnectionStatusType } from "@/types/connection-status";
import { type Inputs, schema } from "./schema";

function Step1() {
	const { setProjectSetupData: setProjectSettings } = useCaaSConfigStore();
	const { t } = useTranslation();
	const navigate = useNavigate();

	const projectNameId = useId();
	const caasApiKeyId = useId();
	const caasUrlId = useId();

	const [connectionStatus, setConnectionStatus] =
		useState<ConnectionStatusType>("untouched");

	const { register, handleSubmit, control } = useForm<Inputs>({
		resolver: zodResolver(schema),
		defaultValues: {
			projectName: "",
			caasApiKey: "",
			caasUrl: "",
		},
		mode: "onChange",
	});

	const onSubmit: SubmitHandler<Inputs> = (data) => {
		testConnection().then((isConnected) => {
			if (isConnected) {
				setProjectSettings({
					...data,
				});
			}
		});
	};

	const nextStep = () => {
		navigate({ to: "/setup/wizard", search: { step: 2 } });
	};

	const { errors } = useFormState({ control });
	const values = useWatch({ control });

	const testConnection = async () => {
		try {
			if (!values.caasUrl) {
				setConnectionStatus("disconnected");
				toast.error("CaaS URL is required");
				return false;
			}
			const url: URL = new URL(values.caasUrl);
			const searchParams = new URLSearchParams();

			searchParams.append("filter", `{"_id": ""}`);
			searchParams.append("np", "");
			searchParams.append("rep", "pj");

			url.search = searchParams.toString();

			const response = await fetch(url.toString(), {
				headers: {
					Authorization: `Bearer ${values.caasApiKey}`,
					"Content-Type": "application/json",
				},
			});

			const statusCode = response?.status;

			if (statusCode === 200) {
				setConnectionStatus("connected");
				toast.success(
					t("setup.wizardSetup.step1.form.connectionStatus.toast.status200"),
				);
				return true;
			} else if (statusCode === 401) {
				setConnectionStatus("disconnected");
				toast.error(
					t("setup.wizardSetup.step1.form.connectionStatus.toast.status401"),
				);
				return false;
			} else if (statusCode === 403) {
				setConnectionStatus("disconnected");
				toast.error(
					t("setup.wizardSetup.step1.form.connectionStatus.toast.status403"),
				);
				return false;
			} else if (statusCode === 404) {
				setConnectionStatus("disconnected");
				toast.error(
					t("setup.wizardSetup.step1.form.connectionStatus.toast.status404"),
				);
				return false;
			}
		} catch (e) {
			console.log("error", e);
			setConnectionStatus("disconnected");
			toast.error(
				t("setup.wizardSetup.step1.form.connectionStatus.toast.statusError"),
			);
			return false;
		}
	};

	return (
		<form
			className="flex flex-col gap-4 p-4 w-full"
			onSubmit={handleSubmit(onSubmit)}
		>
			<div>
				<label
					htmlFor={projectNameId}
					className="text-sm font-medium mb-1.5 inline-block"
				>
					{t("setup.wizardSetup.step1.form.projectName.label")}
				</label>
				<Input
					type="text"
					id={projectNameId}
					placeholder={t(
						"setup.wizardSetup.step1.form.projectName.placeholder",
					)}
					{...register("projectName")}
					disabled={connectionStatus === "connected"}
				/>
				{errors.projectName && (
					<p className="text-red-500 text-sm mt-1">
						{t(
							`setup.wizardSetup.step1.form.projectName.validation.${errors.projectName.message}`,
						)}
					</p>
				)}
			</div>
			<div>
				<label
					htmlFor={caasApiKeyId}
					className="text-sm font-medium mb-1.5 inline-block"
				>
					{t("setup.wizardSetup.step1.form.caasApiKey.label")}
				</label>
				<Input
					type="password"
					id={caasApiKeyId}
					placeholder={t("setup.wizardSetup.step1.form.caasApiKey.placeholder")}
					{...register("caasApiKey")}
					disabled={connectionStatus === "connected"}
				/>
				{errors.caasApiKey && (
					<p className="text-red-500 text-sm mt-1">
						{t(
							`setup.wizardSetup.step1.form.caasApiKey.validation.${errors.caasApiKey.message}`,
						)}
					</p>
				)}
			</div>

			<div>
				<label
					htmlFor={caasUrlId}
					className="text-sm font-medium mb-1.5 inline-block"
				>
					{t("setup.wizardSetup.step1.form.caasUrl.label")}
				</label>
				<Input
					type="text"
					id={caasUrlId}
					placeholder={t("setup.wizardSetup.step1.form.caasUrl.placeholder")}
					{...register("caasUrl")}
					disabled={connectionStatus === "connected"}
				/>
				{errors.caasUrl && (
					<p className="text-red-500 text-sm mt-1">
						{t(
							`setup.wizardSetup.step1.form.caasUrl.validation.${errors.caasUrl.message}`,
						)}
					</p>
				)}
			</div>

			{connectionStatus !== "connected" && (
				<Button type="submit">
					{t("setup.wizardSetup.step1.form.submitBtn")}
				</Button>
			)}
			<span className="inline-flex items-center gap-2 font-semibold text-sm">
				<ConnectionStatusIcon connectionStatus={connectionStatus} />
				{`${t("setup.wizardSetup.step1.form.connectionStatus.label")}: `}
				{t(`setup.wizardSetup.step1.form.connectionStatus.${connectionStatus}`)}
			</span>
			{connectionStatus === "connected" && (
				<Button onClick={nextStep.bind(null)}>
					{t("setup.wizardSetup.step1.form.nextStep")}
				</Button>
			)}
		</form>
	);
}

export default Step1;
