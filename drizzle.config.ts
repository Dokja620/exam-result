import type { Config } from 'drizzle-kit';

const config: Config = {
	dialect: 'sqlite',
	driver: 'd1-http',
	dbCredentials: {
		accountId: env.CF_ACCOUNT_ID,
		databaseId: env.CF_DB_ID,
		token: env.CF_ACCESS_TOKEN
	},
	tablesFilter: ['!_cf_KV']
};

export default config satisfies Config;
