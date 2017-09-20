/**
 * Map of maintaining schema version history so that transformation of the manifest
 * file can be performed correctly to maintain backward compatibility of older
 * schema version.
 *
 * Note: `latest` schema version should always be updated (and transformation
 * should be added in fastboot lib) everytime fastboot addon schema version is bumped.
 */
const FastBootSchemaVersions = {
  'latest': 3, // latest schema version supported by fastboot library
  'base': 1, // first schema version supported by fastboot library
  'manifestFileArrays': 2, // schema version when app and vendor in manifest supported an array of files
  'configExtension': 3 // schema version when FastBoot.config can read arbitrary indexed config
};

module.exports = FastBootSchemaVersions;
