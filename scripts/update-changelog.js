#!/usr/bin/env node
/* eslint-disable no-undef */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHANGELOG_PATH = path.join(__dirname, "..", "CHANGELOG.md");
const PACKAGE_PATH = path.join(__dirname, "..", "package.json");

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getVersionFromPackage() {
  const packageJson = JSON.parse(fs.readFileSync(PACKAGE_PATH, "utf-8"));
  return packageJson.version;
}

function updateChangelog() {
  console.log("📝 Updating CHANGELOG.md...");

  const version = getVersionFromPackage();
  const date = getCurrentDate();

  console.log(`   Version: ${version}`);
  console.log(`   Date: ${date}`);

  if (!fs.existsSync(CHANGELOG_PATH)) {
    console.error("❌ CHANGELOG.md not found!");
    process.exit(1);
  }

  let changelog = fs.readFileSync(CHANGELOG_PATH, "utf-8");

  // Check if this version already exists
  if (changelog.includes(`## [${version}]`)) {
    console.log("⚠️  Version already exists in CHANGELOG.md");
    console.log("   Please manually update the changelog entry.");
    return;
  }

  // Find the position after the header section
  const headerEndRegex = /---\n\n/;
  const match = changelog.match(headerEndRegex);

  if (!match) {
    console.error("❌ Could not find changelog header section");
    process.exit(1);
  }

  const insertPosition = match.index + match[0].length;

  // Create new version entry
  const newEntry = `## [${version}] - ${date}

### 🚀 Features
-

### ✨ Improvements
-

### 🐛 Bug Fixes
-

### 📚 Documentation
-

### 🔧 Technical Changes
-

---

`;

  // Insert the new entry
  const updatedChangelog =
    changelog.slice(0, insertPosition) +
    newEntry +
    changelog.slice(insertPosition);

  fs.writeFileSync(CHANGELOG_PATH, updatedChangelog, "utf-8");

  console.log("✅ CHANGELOG.md updated successfully!");
  console.log("");
  console.log("📋 Next steps:");
  console.log("   1. Edit CHANGELOG.md to add your changes");
  console.log("   2. Commit the changes: git add CHANGELOG.md package.json");
  console.log("   3. Commit message already created by npm version");
}

try {
  updateChangelog();
} catch (error) {
  console.error("❌ Error updating changelog:", error.message);
  process.exit(1);
}
