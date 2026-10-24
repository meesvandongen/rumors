import { defineConfig } from "vite-plus";

export default defineConfig({
	// Mirrors the existing code style (tabs, double quotes, semicolons).
	fmt: {
		useTabs: true,
		printWidth: 80,
		ignorePatterns: ["rumors.json", "rumors.xml", "sample.txt"],
	},
	lint: {
		jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
		rules: { "vite-plus/prefer-vite-plus-imports": "error" },
		options: { typeAware: true, typeCheck: true },
	},
});
