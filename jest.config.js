/** @type {import('jest').Config} */
module.exports = {
	// Usar configuración manual sin preset para evitar conflictos
	testEnvironment: "node",
	roots: ["<rootDir>/src"],
	testMatch: [
		// Tests de core (lógica de negocio)
		"**/core/**/*.test.ts",
		"**/infrastructure/**/*.test.ts",
		// Tests de presentación (pantallas y componentes)
		"**/presentation/**/*.test.tsx",
		"**/presentation/**/*.test.ts",
	],
	transform: {
		"^.+\\.(ts|tsx)$": [
			"babel-jest",
			{
				presets: ["babel-preset-expo"],
			},
		],
	},
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/$1",
		// Mock de assets
		"\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/__mocks__/fileMock.js",
	},
	moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
	collectCoverageFrom: [
		"src/core/**/*.ts",
		"src/presentation/screens/**/*.tsx",
		"src/presentation/hooks/**/*.ts",
		"!src/core/**/*.d.ts",
		"!src/core/entities/**",
		"!src/core/index.ts",
		"!**/*.test.ts",
		"!**/*.test.tsx",
	],
	coverageDirectory: "coverage",
	coverageReporters: ["text", "lcov", "html"],
	setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
	clearMocks: true,
	resetMocks: true,
	restoreMocks: true,
};
