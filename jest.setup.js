// Jest setup file
// Configuración global para las pruebas

// Importar matchers de @testing-library/react-native solo si está disponible
// Esto permite que los tests de core funcionen sin RNTL
try {
	require("@testing-library/react-native/extend-expect");
} catch {
	// RNTL no disponible, probablemente tests de core sin UI
}

// Configurar timeout global para tests (10 segundos para tests de UI)
jest.setTimeout(10000);

// Mock de Expo Router
jest.mock("expo-router", () => ({
	useRouter: jest.fn(() => ({
		push: jest.fn(),
		replace: jest.fn(),
		back: jest.fn(),
	})),
	useLocalSearchParams: jest.fn(() => ({})),
	useSegments: jest.fn(() => []),
	usePathname: jest.fn(() => "/"),
}));

// Mock de React Native Reanimated
jest.mock("react-native-reanimated", () => {
	const Reanimated = require("react-native-reanimated/mock");
	Reanimated.default.call = () => {};
	return Reanimated;
});

// Mock de @react-native-async-storage/async-storage
jest.mock("@react-native-async-storage/async-storage", () =>
	require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

// Suprimir console.log durante tests (opcional - comentar si necesitas ver logs)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };
