#!/usr/bin/env node
/* eslint-disable no-undef */

import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

// Database configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: "postgres", // Connect to default database first
};

const TARGET_DB = process.env.DB_NAME || "drama_llm";
const SCHEMA_PATH = path.join(__dirname, "..", "database", "schema.sql");

async function checkDatabaseExists(client, dbName) {
  try {
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName],
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking database existence:", error.message);
    return false;
  }
}

async function createDatabase(client, dbName) {
  try {
    console.log(`📦 Creating database "${dbName}"...`);
    await client.query(`CREATE DATABASE ${dbName}`);
    console.log(`✅ Database "${dbName}" created successfully!`);
    return true;
  } catch (error) {
    if (error.code === "42P04") {
      console.log(
        `⚠️  Database "${dbName}" already exists. Skipping creation.`,
      );
      return true;
    }
    console.error(`❌ Error creating database:`, error.message);
    return false;
  }
}

async function applySchema(dbName) {
  const client = new Client({
    ...DB_CONFIG,
    database: dbName,
  });

  try {
    await client.connect();
    console.log(`📄 Reading schema from ${SCHEMA_PATH}...`);

    if (!fs.existsSync(SCHEMA_PATH)) {
      console.error(`❌ Schema file not found at ${SCHEMA_PATH}`);
      return false;
    }

    const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
    console.log("🔧 Applying schema...");

    await client.query(schema);
    console.log("✅ Schema applied successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error applying schema:", error.message);
    return false;
  } finally {
    await client.end();
  }
}

async function verifyTables(dbName) {
  const client = new Client({
    ...DB_CONFIG,
    database: dbName,
  });

  try {
    await client.connect();
    console.log("🔍 Verifying tables...");

    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    const tables = result.rows.map((row) => row.table_name);

    if (tables.length === 0) {
      console.log("⚠️  No tables found in database");
      return false;
    }

    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach((table) => console.log(`   - ${table}`));
    return true;
  } catch (error) {
    console.error("❌ Error verifying tables:", error.message);
    return false;
  } finally {
    await client.end();
  }
}

async function initializeDatabase() {
  console.log("🚀 Drama LLM Database Initialization");
  console.log("=====================================");
  console.log("");
  console.log("Configuration:");
  console.log(`  Host: ${DB_CONFIG.host}`);
  console.log(`  Port: ${DB_CONFIG.port}`);
  console.log(`  User: ${DB_CONFIG.user}`);
  console.log(`  Database: ${TARGET_DB}`);
  console.log("");

  const client = new Client(DB_CONFIG);

  try {
    console.log("🔌 Connecting to PostgreSQL...");
    await client.connect();
    console.log("✅ Connected successfully!");
    console.log("");

    // Check if database exists
    console.log(`🔍 Checking if database "${TARGET_DB}" exists...`);
    const exists = await checkDatabaseExists(client, TARGET_DB);

    if (exists) {
      console.log(
        `✅ Database "${TARGET_DB}" already exists. Skipping creation.`,
      );
      console.log("");

      // Verify tables
      const hasSchema = await verifyTables(TARGET_DB);

      if (!hasSchema) {
        console.log(
          "📄 Database exists but schema is missing. Applying schema...",
        );
        await applySchema(TARGET_DB);
      } else {
        console.log("✅ Database and schema are ready!");
      }
    } else {
      // Create database
      const created = await createDatabase(client, TARGET_DB);

      if (!created) {
        console.error("❌ Failed to create database");
        process.exit(1);
      }

      console.log("");

      // Apply schema
      const schemaApplied = await applySchema(TARGET_DB);

      if (!schemaApplied) {
        console.error("❌ Failed to apply schema");
        process.exit(1);
      }

      console.log("");
      await verifyTables(TARGET_DB);
    }

    console.log("");
    console.log("🎉 Database initialization complete!");
    console.log("");
    console.log("Default admin user:");
    console.log("  Email: admin@drama-llm.local");
    console.log("  Password: admin123");
    console.log("");
    console.log("⚠️  Please change the admin password after first login!");
  } catch (error) {
    console.error("");
    console.error("❌ Database initialization failed!");
    console.error("");
    console.error("Error:", error.message);
    console.error("");
    console.error("Troubleshooting:");
    console.error("  1. Make sure PostgreSQL is running");
    console.error("  2. Check your database credentials");
    console.error(
      "  3. Verify the database user has CREATE DATABASE permission",
    );
    console.error(
      "  4. Set environment variables if using non-default values:",
    );
    console.error("     DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME");
    console.error("");
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run initialization
initializeDatabase();
