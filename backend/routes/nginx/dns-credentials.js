import express from "express";
import internalDnsCredentials from "../../internal/dns-credentials.js";
import jwtdecode from "../../lib/express/jwt-decode.js";
import validator from "../../lib/validator/index.js";
import { debug, express as logger } from "../../logger.js";

const router = express.Router({
	caseSensitive: true,
	strict: true,
	mergeParams: true,
});

/**
 * /api/nginx/dns-credentials
 */
router
	.route("/")
	.options((_, res) => {
		res.sendStatus(204);
	})
	.all(jwtdecode())

	/**
	 * GET /api/nginx/dns-credentials
	 *
	 * Retrieve all DNS credentials
	 */
	.get(async (req, res, next) => {
		try {
			const rows = await internalDnsCredentials.getAll(res.locals.access);
			res.status(200).send(rows);
		} catch (err) {
			debug(logger, `${req.method.toUpperCase()} ${req.originalUrl}: ${err}`);
			next(err);
		}
	})

	/**
	 * POST /api/nginx/dns-credentials
	 *
	 * Create a new DNS credentials
	 */
	.post(async (req, res, next) => {
		try {
			const payload = await validator(
				{
					additionalProperties: false,
					properties: {
						provider_id: {
							type: "string",
							minLength: 1,
						},
						credentials: {
							type: "string",
							minLength: 1,
						},
						name: {
							type: "string",
							minLength: 1
						}
					},
					required: ["provider_id", "credentials", "name"],
				},
				{
					provider_id: req.body.provider_id,
					credentials: req.body.credentials,
					name: req.body.name
				},
			);
			const result = await internalDnsCredentials.create(res.locals.access, payload);
			res.status(201).send(result);
		} catch (err) {
			debug(logger, `${req.method.toUpperCase()} ${req.originalUrl}: ${err}`);
			next(err);
		}
	});

/**
 * Specific DNS credentials
 *
 * /api/nginx/dns-credentials/123
 */
router
	.route("/:credential_id")
	.options((_, res) => {
		res.sendStatus(204);
	})
	.all(jwtdecode())

	/**
	 * GET /api/nginx/dns-credentials/123
	 *
	 * Retrieve a specific DNS credentials
	 */
	.get(async (req, res, next) => {
		try {
			const data = await validator(
				{
					required: ["credential_id"],
					additionalProperties: false,
					properties: {
						credential_id: {
							$ref: "common#/properties/id",
						},
					},
				},
				{
					credential_id: req.params.credential_id,
				},
			);
			const row = await internalDnsCredentials.get(res.locals.access, {
				id: Number.parseInt(data.credential_id, 10),
			});
			res.status(200).send(row);
		} catch (err) {
			debug(logger, `${req.method.toUpperCase()} ${req.originalUrl}: ${err}`);
			next(err);
		}
	})

	/**
	 * PUT /api/nginx/dns-credentials/123
	 *
	 * Update an existing DNS credentials
	 */
	.put(async (req, res, next) => {
		try {
			const payload = await validator(
				{
					required: ["credential_id"],
					additionalProperties: false,
					properties: {
						credential_id: {
							$ref: "common#/properties/id",
						},
						provider_id: {
							type: "string",
							minLength: 1,
						},
						credentials: {
							type: "string",
							minLength: 1,
						},
						name: {
							type: "string",
							minLength: 1,
						},
					},
				},
				{
					credential_id: req.params.credential_id,
					provider_id: req.body.provider_id,
					credentials: req.body.credentials,
					name: req.body.name
				},
			);
			payload.id = Number.parseInt(payload.credential_id, 10);
			delete payload.credential_id;
			const result = await internalDnsCredentials.update(res.locals.access, payload);
			res.status(200).send(result);
		} catch (err) {
			debug(logger, `${req.method.toUpperCase()} ${req.originalUrl}: ${err}`);
			next(err);
		}
	})

	/**
	 * DELETE /api/nginx/dns-credentials/123
	 *
	 * Delete a DNS credentials
	 */
	.delete(async (req, res, next) => {
		try {
			const data = await validator(
				{
					required: ["credential_id"],
					additionalProperties: false,
					properties: {
						credential_id: {
							$ref: "common#/properties/id",
						},
					},
				},
				{
					credential_id: req.params.credential_id,
				},
			);
			await internalDnsCredentials.delete(res.locals.access, {
				id: Number.parseInt(data.credential_id, 10),
			});
			res.status(200).send(true);
		} catch (err) {
			debug(logger, `${req.method.toUpperCase()} ${req.originalUrl}: ${err}`);
			next(err);
		}
	});

export default router;
