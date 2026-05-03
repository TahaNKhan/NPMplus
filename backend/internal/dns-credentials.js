import errs from "../lib/error.js";
import utils from "../lib/utils.js";
import dnsCredentialsModel from "../models/dns_credentials.js";

const omissions = () => {
	return ["npmplus_is_deleted", "npmplus_owner_user_id"];
};

const internalDnsCredentials = {
	/**
	 * @param   {Access}  access
	 * @param   {Object}  data
	 * @returns {Promise}
	 */
	create: (access, data) => {
		return access.can("settings:create", data).then(() => {
			data.npmplus_owner_user_id = access.token.getUserId(1);
			return dnsCredentialsModel.query().insertAndFetch(data).then(utils.omitRow(omissions()));
		});
	},

	/**
	 * @param  {Access}  access
	 * @param  {Object}  data
	 * @param  {Number}  data.id
	 * @return {Promise}
	 */
	get: (access, data) => {
		const thisData = data || {};
		return access
			.can("settings:get", thisData.id)
			.then((access_data) => {
				const query = dnsCredentialsModel.query().where("npmplus_is_deleted", 0).andWhere("id", thisData.id);

				if (access_data.permission_visibility !== "all") {
					query.andWhere("npmplus_owner_user_id", access.token.getUserId(1));
				}

				return query.first().then(utils.omitRow(omissions()));
			})
			.then((row) => {
				if (!row || !row.id) {
					throw new errs.ItemNotFoundError(thisData.id);
				}
				return row;
			});
	},

	/**
	 * @param  {Access}  access
	 * @param  {Object}  data
	 * @param  {Number}  data.id
	 * @return {Promise}
	 */
	update: (access, data) => {
		return access
			.can("settings:update", data.id)
			.then(() => {
				return internalDnsCredentials.get(access, { id: data.id });
			})
			.then((row) => {
				if (row.id !== data.id) {
					throw new errs.InternalValidationError(
						`DNS Credentials could not be updated, IDs do not match: ${row.id} !== ${data.id}`,
					);
				}

				return dnsCredentialsModel.query().where({ id: data.id }).patch(data).then(utils.omitRow(omissions()));
			})
			.then(() => {
				return internalDnsCredentials.get(access, { id: data.id });
			});
	},

	/**
	 * @param {Access}  access
	 * @param {Object}  data
	 * @param {Number}  data.id
	 * @returns {Promise}
	 */
	delete: (access, data) => {
		return access
			.can("settings:delete", data.id)
			.then(() => {
				return internalDnsCredentials.get(access, { id: data.id });
			})
			.then((row) => {
				if (!row || !row.id) {
					throw new errs.ItemNotFoundError(data.id);
				}

				return dnsCredentialsModel
					.query()
					.where("id", row.id)
					.patch({
						npmplus_is_deleted: 1,
					})
					.then(() => {
						return true;
					});
			});
	},

	/**
	 * All DNS Credentials
	 *
	 * @param   {Access}  access
	 * @returns {Promise}
	 */
	getAll: (access) => {
		return access.can("settings:list").then((access_data) => {
			const query = dnsCredentialsModel.query().where("npmplus_is_deleted", 0).orderBy("npmplus_provider_id", "ASC");

			if (access_data.permission_visibility !== "all") {
				query.andWhere("npmplus_owner_user_id", access.token.getUserId(1));
			}

			return query.then(utils.omitRows(omissions()));
		});
	},
};

export default internalDnsCredentials;
