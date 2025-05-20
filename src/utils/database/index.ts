
// Export database utilities except the conflicting ones
export * from "./columnManagement";
export * from "./ensureDatabaseSetup";
export * from "./setupUserRolesTable";
export * from "./initializeDatabase";
export * from "./transferSystem";
export * from "./createTables";

// Explicitly re-export executeSql to avoid ambiguity
export { executeSql } from "./executeSql";

// Export functions from dataVerification but not columnExists (use the one from columnUtils)
export { verifyRelationships } from "./dataVerification";

// Export from columnUtils
export * from "./columnUtils";

// Explicit re-exports to resolve ambiguities
export { generateChildLinkingCode, linkParentToChild } from "./parentChildLinking";
export { generateLinkingCode } from "./createTables";
