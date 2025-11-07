import { create } from "zustand";

interface TemporaryPassword {
	employeeId: number;
	password: string;
	createdAt: number; // timestamp
}

interface TemporaryPasswordStore {
	passwords: Map<number, TemporaryPassword>;
	addPassword: (employeeId: number, password: string) => void;
	getPassword: (employeeId: number) => string | null;
	clearPassword: (employeeId: number) => void;
	clearExpired: () => void;
}

const PASSWORD_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 horas

export const useTemporaryPasswordStore = create<TemporaryPasswordStore>(
	(set, get) => ({
		passwords: new Map(),

		addPassword: (employeeId: number, password: string) => {
			set((state) => {
				const newPasswords = new Map(state.passwords);
				newPasswords.set(employeeId, {
					employeeId,
					password,
					createdAt: Date.now(),
				});
				return { passwords: newPasswords };
			});
		},

		getPassword: (employeeId: number) => {
			const { passwords } = get();
			const entry = passwords.get(employeeId);

			if (!entry) return null;

			// Verificar si expiró
			const now = Date.now();
			if (now - entry.createdAt > PASSWORD_EXPIRY_MS) {
				get().clearPassword(employeeId);
				return null;
			}

			return entry.password;
		},

		clearPassword: (employeeId: number) => {
			set((state) => {
				const newPasswords = new Map(state.passwords);
				newPasswords.delete(employeeId);
				return { passwords: newPasswords };
			});
		},

		clearExpired: () => {
			const now = Date.now();
			set((state) => {
				const newPasswords = new Map(state.passwords);

				for (const [id, entry] of newPasswords.entries()) {
					if (now - entry.createdAt > PASSWORD_EXPIRY_MS) {
						newPasswords.delete(id);
					}
				}

				return { passwords: newPasswords };
			});
		},
	}),
);
