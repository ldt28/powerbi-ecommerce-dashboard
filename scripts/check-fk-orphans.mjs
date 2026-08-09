#!/usr/bin/env node
/**
 * Run this BEFORE applying drizzle/0010_add_foreign_keys_and_indexes.sql
 * against a real database.
 *
 * That migration adds ~44 foreign key constraints. MySQL will refuse to add
 * any constraint where existing rows point at an id that no longer exists in
 * the parent table (an "orphan"). This script finds those orphans up front,
 * table by table, so you know exactly what to clean up before running the
 * migration --- instead of the migration failing partway through with a
 * generic error and leaving you unsure which of the 44 constraints broke it.
 *
 * It reads the constraint list straight out of the migration SQL file
 * itself, so it can never drift out of sync with what the migration
 * actually adds.
 *
 * Usage:
 *   DATABASE_URL="mysql://user:pass@host:3306/dbname" node scripts/check-fk-orphans.mjs
 *
 * Exit code is 0 if every relationship is clean, 1 if any orphans were found.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import mysql from "mysql2/promise";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATION_FILE = path.join(__dirname, "..", "drizzle", "0010_add_foreign_keys_and_indexes.sql");

function parseForeignKeys(sql) {
  // Matches: ALTER TABLE `x` ADD CONSTRAINT `...` FOREIGN KEY (`col`) REFERENCES `y`(`id`) ...
  const pattern = /ALTER TABLE `(\w+)` ADD CONSTRAINT `[^`]+` FOREIGN KEY \(`(\w+)`\) REFERENCES `(\w+)`\(`(\w+)`\)/g;
  const fks = [];
  let match;
  while ((match = pattern.exec(sql)) !== null) {
    const [, table, column, refTable, refColumn] = match;
    fks.push({ table, column, refTable, refColumn });
  }
  return fks;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. Point it at the database you're about to migrate.");
    process.exit(1);
  }

  const sql = readFileSync(MIGRATION_FILE, "utf8");
  const foreignKeys = parseForeignKeys(sql);

  if (foreignKeys.length === 0) {
    console.error(`Found 0 foreign key statements in ${MIGRATION_FILE}. Nothing to check --- is the path right?`);
    process.exit(1);
  }

  console.log(`Checking ${foreignKeys.length} foreign key relationships for orphaned rows...\n`);

  const connection = await mysql.createConnection(databaseUrl);
  let totalOrphans = 0;
  const problems = [];

  try {
    for (const fk of foreignKeys) {
      const query = `
        SELECT COUNT(*) AS orphanCount
        FROM \`${fk.table}\` t
        LEFT JOIN \`${fk.refTable}\` r ON t.\`${fk.column}\` = r.\`${fk.refColumn}\`
        WHERE t.\`${fk.column}\` IS NOT NULL AND r.\`${fk.refColumn}\` IS NULL
      `;
      const [rows] = await connection.query(query);
      const orphanCount = rows[0].orphanCount;

      const label = `${fk.table}.${fk.column} -> ${fk.refTable}.${fk.refColumn}`;
      if (orphanCount > 0) {
        console.log(`  ORPHANS FOUND  ${label}: ${orphanCount} row(s)`);
        totalOrphans += orphanCount;
        problems.push({ ...fk, orphanCount });
      } else {
        console.log(`  clean          ${label}`);
      }
    }
  } finally {
    await connection.end();
  }

  console.log("");
  if (problems.length === 0) {
    console.log("All relationships are clean. Safe to apply the migration.");
    process.exit(0);
  }

  console.log(`${problems.length} relationship(s) have orphaned rows (${totalOrphans} rows total).`);
  console.log("The migration will fail on these until you either:");
  console.log("  - delete the orphaned rows, or");
  console.log("  - fix them to point at a valid id, or");
  console.log("  - null out the column first (only possible if it's nullable in the schema)\n");
  console.log("Example query to inspect one, replace the table/column names:");
  const example = problems[0];
  console.log(
    `  SELECT * FROM \`${example.table}\` t LEFT JOIN \`${example.refTable}\` r ON t.\`${example.column}\` = r.\`${example.refColumn}\` WHERE t.\`${example.column}\` IS NOT NULL AND r.\`${example.refColumn}\` IS NULL;`
  );
  process.exit(1);
}

main().catch((error) => {
  console.error("Failed to check for orphaned rows:", error.message);
  process.exit(1);
});
