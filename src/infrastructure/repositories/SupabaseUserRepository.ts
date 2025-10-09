// Implementación concreta del IUserRepository utilizando Supabase.
// Esta capa conoce y depende del 'core'.

import type { User } from "@/src/core/entities/User";
import type { IUserRepository } from "@/src/core/repositories/IUserRepository";
import { supabase } from "@/src/infrastructure/services/supabase";

export class SupabaseUserRepository implements IUserRepository {
	private supabaseClient = supabase;

	async findById(id: string): Promise<User | null> {
		try {
			const { data, error } = await this.supabaseClient
				.from("users")
				.select("*")
				.eq("id", id)
				.single();

			if (error) {
				console.error("Error fetching user by ID:", error);
				return null;
			}

			return data
				? {
						id: data.id,
						fullName: data.full_name || data.fullName,
						email: data.email,
					}
				: null;
		} catch (error) {
			console.error("Error in findById:", error);
			return null;
		}
	}

	async findByEmail(email: string): Promise<User | null> {
		try {
			const { data, error } = await this.supabaseClient
				.from("users")
				.select("*")
				.eq("email", email)
				.single();

			if (error) {
				console.error("Error fetching user by email:", error);
				return null;
			}

			return data
				? {
						id: data.id,
						fullName: data.full_name || data.fullName,
						email: data.email,
					}
				: null;
		} catch (error) {
			console.error("Error in findByEmail:", error);
			return null;
		}
	}

	async create(user: Omit<User, "id">): Promise<User> {
		try {
			const { data, error } = await this.supabaseClient
				.from("users")
				.insert({
					full_name: user.fullName,
					email: user.email,
				})
				.select()
				.single();

			if (error) {
				console.error("Error creating user:", error);
				throw new Error(`Failed to create user: ${error.message}`);
			}

			return {
				id: data.id,
				fullName: data.full_name || data.fullName,
				email: data.email,
			};
		} catch (error) {
			console.error("Error in create:", error);
			throw error;
		}
	}
}
