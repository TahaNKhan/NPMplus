import * as api from "./base";
import type { DnsCredential } from "./models";

export async function createDnsCredential(item: { provider_id: string; credentials: string }): Promise<DnsCredential> {
	return await api.put({
		url: "/nginx/dns-credentials",
		data: item,
	});
}
