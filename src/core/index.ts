// Barrel exports para la capa core (dominio)
export type { User } from "./entities/User";
export type { IUserRepository } from "./repositories/IUserRepository";
export { LoginUserUseCase } from "./usecases/auth/loginUser";
