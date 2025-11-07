import type { Employee } from "@/src/core/entities/Employee";
import type { IEmployeeRepository } from "@/src/core/repositories/IEmployeeRepository";
import { supabase } from "@/src/infrastructure/services/supabase";

/**
 * Tipo para la respuesta de Supabase con la relación de perfiles
 */
interface EmployeeQueryResult {
	id: number;
	business_id: string;
	profile_id: string;
	is_active: boolean;
	created_at: string;
	profiles: {
		first_name: string;
		last_name: string | null;
		second_last_name: string | null;
	};
}

/**
 * Implementación de IEmployeeRepository usando Supabase
 */
export class SupabaseEmployeeRepository implements IEmployeeRepository {
	async getEmployeesByBusiness(businessId: string): Promise<Employee[]> {
		const { data, error } = await supabase
			.from("employees")
			.select(
				`
        id,
        business_id,
        profile_id,
        is_active,
        created_at,
        profiles!inner(first_name, last_name, second_last_name)
      `,
			)
			.eq("business_id", businessId)
			.eq("is_active", true)
			.order("created_at", { ascending: false });

		if (error) {
			console.error(" Error obteniendo empleados:", error);
			throw new Error(`Error al obtener empleados: ${error.message}`);
		}

		const employees = data as unknown as EmployeeQueryResult[];

		return (
			employees?.map((emp) => ({
				id: emp.id,
				businessId: emp.business_id,
				profileId: emp.profile_id,
				isActive: emp.is_active,
				createdAt: emp.created_at,
				profile: {
					firstName: emp.profiles.first_name,
					lastName: emp.profiles.last_name,
					secondLastName: emp.profiles.second_last_name,
					email: "",
				},
			})) || []
		);
	}

	async getEmployeeById(employeeId: number): Promise<Employee | null> {
		console.log(" [getEmployeeById] Obteniendo empleado:", employeeId);

		const { data, error } = await supabase
			.from("employees")
			.select(
				`
        id,
        business_id,
        profile_id,
        is_active,
        created_at,
        profiles!inner(first_name, last_name, second_last_name)
      `,
			)
			.eq("id", employeeId)
			.eq("is_active", true)
			.single();

		if (error) {
			if (error.code === "PGRST116") {
				console.warn("[getEmployeeById] Empleado no encontrado:", employeeId);
				return null;
			}
			console.error("[getEmployeeById] Error:", error);
			throw new Error(`Error al obtener empleado: ${error.message}`);
		}

		const emp = data as unknown as EmployeeQueryResult;

		console.log("[getEmployeeById] Empleado base obtenido:", {
			id: emp.id,
			profileId: emp.profile_id,
		});

		// Obtener email desde auth.users usando la función RPC
		console.log("[getEmployeeById] Llamando a get_user_email...");
		const { data: emailData, error: emailError } = await supabase.rpc(
			"get_user_email",
			{
				user_id: emp.profile_id,
			},
		);

		console.log("[getEmployeeById] Resultado get_user_email:", {
			emailData,
			emailError,
		});

		if (emailError) {
			console.error("[getEmployeeById] Error obteniendo email:", emailError);
		}

		console.log("[getEmployeeById] Empleado completo:", {
			id: emp.id,
			email: emailData || "(sin email)",
		});

		return {
			id: emp.id,
			businessId: emp.business_id,
			profileId: emp.profile_id,
			isActive: emp.is_active,
			createdAt: emp.created_at,
			profile: {
				firstName: emp.profiles.first_name,
				lastName: emp.profiles.last_name,
				secondLastName: emp.profiles.second_last_name,
				email: emailData || "",
			},
		};
	}

	async createEmployee(employeeData: {
		firstName: string;
		lastName: string;
		secondLastName?: string;
		email: string;
		password: string;
		businessId: string;
	}): Promise<Employee> {
		console.log("[createEmployee] Creando empleado:", {
			...employeeData,
			password: "***",
		});

		// 1. Crear usuario en auth.users
		const { data: authData, error: authError } = await supabase.auth.signUp({
			email: employeeData.email,
			password: employeeData.password,
			options: {
				emailRedirectTo: undefined,
			},
		});

		if (authError || !authData.user) {
			console.error("[createEmployee] Error en Auth:", authError);
			throw new Error(
				`Error al crear cuenta: ${authError?.message || "Usuario no creado"}`,
			);
		}

		console.log("[createEmployee] Usuario creado en Auth:", authData.user.id);

		try {
			// 2. Crear perfil en public.profiles
			const { error: profileError } = await supabase.from("profiles").insert({
				id: authData.user.id,
				first_name: employeeData.firstName,
				last_name: employeeData.lastName,
				second_last_name: employeeData.secondLastName || null,
				role: "employee",
			});

			if (profileError) {
				console.error("[createEmployee] Error creando perfil:", profileError);
				throw new Error(`Error al crear perfil: ${profileError.message}`);
			}

			console.log("[createEmployee] Perfil creado");

			// 3. Crear registro en public.employees
			const { data: employeeRecord, error: employeeError } = await supabase
				.from("employees")
				.insert({
					business_id: employeeData.businessId,
					profile_id: authData.user.id,
					is_active: true,
				})
				.select(
					`
            id,
            business_id,
            profile_id,
            is_active,
            created_at,
            profiles!inner(first_name, last_name, second_last_name)
            `,
				)
				.single();

			if (employeeError || !employeeRecord) {
				console.error(
					"[createEmployee] Error asociando empleado:",
					employeeError,
				);
				throw new Error(
					`Error al asociar empleado: ${employeeError?.message || "Sin datos"}`,
				);
			}

			console.log("[createEmployee] Empleado asociado:", employeeRecord.id);

			const typedRecord = employeeRecord as unknown as EmployeeQueryResult;

			return {
				id: typedRecord.id,
				businessId: typedRecord.business_id,
				profileId: typedRecord.profile_id,
				isActive: typedRecord.is_active,
				createdAt: typedRecord.created_at,
				profile: {
					firstName: typedRecord.profiles.first_name,
					lastName: typedRecord.profiles.last_name,
					secondLastName: typedRecord.profiles.second_last_name,
					email: employeeData.email,
				},
			};
		} catch (rollbackError) {
			console.error("[createEmployee] Rollback iniciado:", rollbackError);
			await supabase.from("profiles").delete().eq("id", authData.user.id);
			await supabase.auth.admin.deleteUser(authData.user.id);
			throw rollbackError;
		}
	}

	async deleteEmployee(employeeId: number): Promise<void> {
		console.log("[deleteEmployee] Desactivando empleado:", employeeId);

		const { error } = await supabase
			.from("employees")
			.update({ is_active: false })
			.eq("id", employeeId);

		if (error) {
			console.error("[deleteEmployee] Error:", error);
			throw new Error(`Error al desactivar empleado: ${error.message}`);
		}

		console.log("[deleteEmployee] Empleado desactivado");
	}

	async updateEmployee(
		employeeId: number,
		employeeData: {
			firstName: string;
			lastName: string;
			secondLastName?: string;
			email: string;
			password?: string;
		},
	): Promise<Employee> {
		console.log("[updateEmployee] INICIO - ID:", employeeId);
		console.log("[updateEmployee] Datos:", {
			...employeeData,
			password: employeeData.password ? "***" : "(sin cambio)",
		});

		try {
			console.log("[updateEmployee] PASO 1: Obteniendo empleado actual...");
			const employee = await this.getEmployeeById(employeeId);

			if (!employee) {
				throw new Error("Empleado no encontrado");
			}
			console.log(
				"[updateEmployee] PASO 1: Empleado obtenido - profileId:",
				employee.profileId,
			);

			// PASO 2: Actualizar perfil
			console.log("[updateEmployee] PASO 2: Actualizando perfil...");
			const { error: profileError } = await supabase
				.from("profiles")
				.update({
					first_name: employeeData.firstName,
					last_name: employeeData.lastName,
					second_last_name: employeeData.secondLastName || null,
				})
				.eq("id", employee.profileId);

			if (profileError) {
				console.error("[updateEmployee] PASO 2: Error:", profileError);
				throw new Error(`Error al actualizar perfil: ${profileError.message}`);
			}
			console.log("[updateEmployee] PASO 2: Perfil actualizado");

			// PASO 3: Actualizar email (si cambió)
			if (employeeData.email !== employee.profile.email) {
				console.log("[updateEmployee] PASO 3: Actualizando email...");
				console.log("[updateEmployee] Email anterior:", employee.profile.email);
				console.log("[updateEmployee] Email nuevo:", employeeData.email);

				const { data: emailResult, error: emailError } = await supabase.rpc(
					"update_employee_email",
					{
						target_user_id: employee.profileId,
						new_email: employeeData.email,
					},
				);

				console.log("[updateEmployee] PASO 3: Resultado RPC:", {
					emailResult,
					emailError,
				});

				if (emailError) {
					console.error("[updateEmployee] PASO 3: Error RPC:", emailError);
					throw new Error(`Error al actualizar email: ${emailError.message}`);
				}

				if (emailResult && !emailResult.success) {
					console.error(
						"[updateEmployee] PASO 3: Error en resultado:",
						emailResult.error,
					);
					throw new Error(
						emailResult.error || "Error desconocido al actualizar email",
					);
				}

				console.log("[updateEmployee] PASO 3: Email actualizado exitosamente");
			} else {
				console.log("[updateEmployee] PASO 3: Email sin cambios, saltando...");
			}

			// PASO 4: Actualizar contraseña (si se proporcionó)
			if (employeeData.password && employeeData.password.length > 0) {
				console.log("[updateEmployee] PASO 4: Actualizando contraseña...");
				console.log(
					"[updateEmployee] PASO 4: Longitud contraseña:",
					employeeData.password.length,
				);
				console.log(
					"[updateEmployee] PASO 4: Target user_id:",
					employee.profileId,
				);

				// Usar RPC para actualizar contraseña del EMPLEADO
				const { data: passwordResult, error: passwordError } =
					await supabase.rpc("update_employee_password", {
						target_user_id: employee.profileId,
						new_password: employeeData.password,
					});

				console.log("[updateEmployee] PASO 4: Resultado RPC:", {
					passwordResult,
					passwordError,
				});

				if (passwordError) {
					console.error("[updateEmployee] PASO 4: Error RPC:", passwordError);
					throw new Error(
						`Error al actualizar contraseña: ${passwordError.message}`,
					);
				}

				if (passwordResult && !passwordResult.success) {
					console.error(
						"[updateEmployee] PASO 4: Error en resultado:",
						passwordResult.error,
					);
					throw new Error(
						passwordResult.error ||
							"Error desconocido al actualizar contraseña",
					);
				}

				console.log(
					"[updateEmployee] PASO 4: Contraseña actualizada exitosamente",
				);
			} else {
				console.log(
					"[updateEmployee] PASO 4: Sin nueva contraseña, saltando...",
				);
			}

			// PASO 5: Obtener empleado actualizado
			console.log(
				"[updateEmployee] PASO 5: Obteniendo empleado actualizado...",
			);
			const updatedEmployee = await this.getEmployeeById(employeeId);

			if (!updatedEmployee) {
				throw new Error("Error al obtener empleado actualizado");
			}

			console.log("[updateEmployee] PASO 5: Empleado actualizado obtenido");
			console.log("[updateEmployee] FINALIZADO EXITOSAMENTE");

			return updatedEmployee;
		} catch (error) {
			console.error("[updateEmployee] ERROR FATAL:", error);
			console.error(
				"[updateEmployee] Stack trace:",
				error instanceof Error ? error.stack : "N/A",
			);
			throw error;
		}
	}
}
