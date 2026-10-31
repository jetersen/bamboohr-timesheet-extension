import { crx, type ManifestV3Export } from "@crxjs/vite-plugin";
import { defineConfig } from "vite-plus";
import manifest from "./source/manifest.json";

export default defineConfig(({ mode }) => ({
	root: "source",
	plugins:
		mode === "test"
			? []
			: [
					crx({
						manifest: manifest as ManifestV3Export,
						browser: mode === "firefox" ? "firefox" : "chrome",
						contentScripts: { standaloneFiles: ["content.js"] },
						// Reinjection can fill and save live timesheets. Reload manually.
						liveReload: false,
					}),
				],
	build: {
		outDir: mode === "firefox" ? "../distribution-firefox" : "../distribution",
		emptyOutDir: true,
		target: ["chrome121", "firefox142"],
	},
	test: {
		root: import.meta.dirname,
		include: ["test/**/*.test.js"],
	},
	fmt: {
		ignorePatterns: [
			"distribution/**",
			"distribution-firefox/**",
			".parcel-cache/**",
			"package-lock.json",
		],
	},
	lint: {
		ignorePatterns: ["distribution/**", "distribution-firefox/**", ".parcel-cache/**"],
		env: { browser: true, node: true },
		jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
		rules: {
			"no-undef": "error",
			"vite-plus/prefer-vite-plus-imports": "error",
		},
	},
}));
