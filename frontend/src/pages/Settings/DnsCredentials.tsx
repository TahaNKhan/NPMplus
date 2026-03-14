import { IconTrash } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import CodeEditor from "@uiw/react-textarea-code-editor";
import { useDnsCredentials, useDnsProviders } from "src/hooks";
import { T } from "src/locale";
import { createDnsCredential, deleteDnsCredential } from "src/api/backend";
import { Button, LoadingPage } from "src/components";
import { showObjectSuccess } from "src/notifications";

export default function DnsCredentials() {
	const queryClient = useQueryClient();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedProvider, setSelectedProvider] = useState<string>("");
	const [credentials, setCredentials] = useState("");
	const [name, setName] = useState("");

	const { data: dnsProviders, isLoading: providersLoading } = useDnsProviders();
	const { data: savedCredentials, isLoading: credentialsLoading } = useDnsCredentials();

	if (providersLoading || credentialsLoading) {
		return <LoadingPage />;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedProvider || !credentials || !name) return;

		setIsSubmitting(true);
		try {
			await createDnsCredential({
				provider_id: selectedProvider,
				credentials,
				name
			});
			queryClient.invalidateQueries({ queryKey: ["dns-credentials"] });
			showObjectSuccess("dns-credentials", "saved");
			setSelectedProvider("");
			setCredentials("");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async (id: number) => {
		if (!confirm("Are you sure you want to delete this credential?")) return;
		await deleteDnsCredential(id);
		queryClient.invalidateQueries({ queryKey: ["dns-credentials"] });
		showObjectSuccess("dns-credentials", "deleted");
	};

	const providerOptions = dnsProviders?.map((p) => ({
		value: p.id,
		label: p.name,
	})) || [];

	return (
		<div className="card-body">
			<h3 className="card-title">
				<T id="settings.dns-credentials.title" />
			</h3>
			<p className="text-muted">
				<T id="settings.dns-credentials.description" />
			</p>

			<form onSubmit={handleSubmit}>
				<div className="row">
					<div className="col-md-6">
						<div className="mb-3">
							<label className="form-label" htmlFor="settings-dns-credentials-provider">
								<T id="settings.dns-credentials.provider" />
							</label>
							<select
								className="form-select"
								value={selectedProvider}
								onChange={(e) => setSelectedProvider(e.target.value)}
								required
							>
								<option value="">
									<T id="settings.dns-credentials.select-provider" />
								</option>
								{providerOptions.map((opt) => (
									<option key={opt.value} value={opt.value}>
										{opt.label}
									</option>
								))}
							</select>
						</div>
					</div>
				</div>

				<div className="col-md-6">
					<div className="mb-3">
						<label className="form-label" htmlFor="settings-dns-credentials-name">
							<T id="settings.dns-credentials.name" />
						</label>
						<input
							className="form-select"
							placeholder="Enter a name"
							onChange={(e) => setName(e.target.value)}
							required
						>
						</input>
					</div>
				</div>

				<div className="mb-3">
					<label className="form-label" htmlFor="settings-dns-credentials-credentials">
						<T id="settings.dns-credentials.credentials" />
					</label>
					<CodeEditor
						language="bash"
						padding={15}
						data-color-mode="dark"
						minHeight={130}
						indentWidth={2}
						style={{
							fontFamily:
								"ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace",
							borderRadius: "0.3rem",
						}}
						value={credentials}
						onChange={(e) => setCredentials(e.target.value)}
					/>
					<small className="text-muted">
						<T id="settings.dns-credentials.credentials-note" />
					</small>
				</div>

				<Button type="submit" actionType="primary" disabled={isSubmitting || !selectedProvider || !credentials}>
					<T id="object.add" tData={{ object: "dns-credentials" }} />
				</Button>
			</form>

			<hr className="my-4" />

			<h4>
				<T id="settings.dns-credentials.saved" />
			</h4>

			{savedCredentials && savedCredentials.length > 0 ? (
				<div className="table-responsive">
					<table className="table table-vcenter">
						<thead>
							<tr>
								
								<th>
									<T id="settings.dns-credentials.name" />
								</th>
								<th>
									<T id="settings.dns-credentials.provider" />
								</th>
								<th>
									<T id="column.actions" />
								</th>
							</tr>
						</thead>
						<tbody>
							{savedCredentials.map((cred) => {
								const provider = dnsProviders?.find((p) => p.id === cred.provider_id);
								return (
									<tr key={cred.id}>
										<td>{cred.name}</td>
										<td>{provider?.name || cred.provider_id}</td>
										<td>
											<Button
												variant="action"
												size="sm"
												onClick={() => handleDelete(cred.id)}
											>
												<IconTrash size={16} />
											</Button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			) : (
				<p className="text-muted">
					<T id="settings.dns-credentials.none" />
				</p>
			)}
		</div>
	);
}
