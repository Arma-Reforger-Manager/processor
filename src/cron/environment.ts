import { env } from "node:process";
export const GLOBAL_VARS = () => {
    if (!env['NODE_ENV']) { console.error('!NODE_ENV'); process.exit(1); }
    /*
    // Development Variables
    */
    if (env['NODE_ENV'].toUpperCase() !== 'PRODUCTION') {
        return {
            NODE_ENV: env['NODE_ENV'],
            IS_DEVELOPMENT: true,

            MariaDB_Host: "127.0.0.1",
            MariaDB_Username: "app_user",
            MariaDB_Password: "password",
            MariaDB_Database: 'reforger_manager_processed',

            MongoDB_Username: "mongodb_root_raw",
            MongoDB_Password: "password",
            MongoDB_Host: "127.0.0.1",
        };
    }


    /*
    // Production Variables
    */
    // MariaDB
    if (!env['MariaDB_Host']) { console.error('!MariaDB_Host'); process.exit(1); }
    if (!env['MariaDB_Username']) { console.error('!MariaDB_Username'); process.exit(1); }
    if (!env['MariaDB_Password']) { console.error('!MariaDB_Password'); process.exit(1); }
    if (!env['MariaDB_Database']) { console.error('!MariaDB_Database'); process.exit(1); }

    // MongoDB
    if (!env['MongoDB_Username']) { console.error('!MongoDB_Username'); process.exit(1); }
    if (!env['MongoDB_Password']) { console.error('!MongoDB_Password'); process.exit(1); }
    if (!env['MongoDB_Host']) { console.error('!MongoDB_Host'); process.exit(1); }

    return {
        NODE_ENV: env['NODE_ENV'],
        IS_DEVELOPMENT: false,

        MariaDB_Host: env['MariaDB_Host'],
        MariaDB_Username: env['MariaDB_Username'],
        MariaDB_Password: env['MariaDB_Password'],
        MariaDB_Database:env['MariaDB_Database'],

        MongoDB_Username: env['MongoDB_Username'],
        MongoDB_Password: env['MongoDB_Password'],
        MongoDB_Host: env['MongoDB_Host'],
    };
}