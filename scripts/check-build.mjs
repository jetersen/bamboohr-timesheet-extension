import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Script } from "node:vm";

const sourceManifest = JSON.parse(readFileSync("source/manifest.json", "utf8"));

for (const directory of ["distribution", "distribution-firefox"]) {
	const manifest = JSON.parse(readFileSync(`${directory}/manifest.json`, "utf8"));
	assert.deepStrictEqual(manifest, sourceManifest, `${directory}: manifest settings changed`);

	for (const icon of Object.values(manifest.icons)) {
		assert.ok(existsSync(resolve(directory, icon)), `${directory}: missing icon ${icon}`);
	}

	for (const entry of manifest.content_scripts) {
		for (const file of entry.js) {
			const code = readFileSync(resolve(directory, file), "utf8");
			// Content scripts must work as ordinary scripts, without a module loader.
			new Script(code, { filename: file });
			assert.ok(!code.includes("localhost:"), `${directory}: dev server URL in production code`);
		}
	}

	console.log(`${directory}: manifest, resources, and content script verified`);
}
