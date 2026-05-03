// Objection Docs:
// http://vincit.github.io/objection.js/

import { Model } from "objection";
import db from "../db.js";

Model.knex(db());

class DnsCredentials extends Model {
	$beforeInsert() {
		const now = new Date();
		this.npmplus_created_on = now;
		this.npmplus_modified_on = now;
	}

	$beforeUpdate() {
		this.npmplus_modified_on = new Date();
	}

	static get name() {
		return "DnsCredentials";
	}

	static get tableName() {
		return "npmplus_dns_credentials";
	}
}

export default DnsCredentials;
