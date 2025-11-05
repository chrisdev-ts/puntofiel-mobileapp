import { usePathname, useRouter } from "expo-router";
import { GiftIcon, Home, MedalIcon, ScanLine, User } from "lucide-react-native";
import { Pressable } from "react-native";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/src/presentation/hooks/useAuth";

interface NavItemProps {
	IconComponent: React.ComponentType<{ size: number; color: string }>;
	label: string;
	route: string;
	isActive: boolean;
	onPress: () => void;
}

interface NavItem {
	IconComponent: React.ComponentType<{ size: number; color: string }>;
	label: string;
	route: string;
}

/**
 * Componente individual de navegación
 */
function NavItem({ IconComponent, label, isActive, onPress }: NavItemProps) {
	const activeColor = "#2F4858"; // primary-500
	const inactiveColor = "#9ca3af"; // gray-400

	return (
		<Pressable onPress={onPress} className="flex-1 items-center justify-center">
			<Box className="items-center justify-center space-y-1">
				<IconComponent
					size={24}
					color={isActive ? activeColor : inactiveColor}
				/>
				<Text
					size="xs"
					className={
						isActive ? "text-primary-500 font-semibold" : "text-typography-400"
					}
				>
					{label}
				</Text>
			</Box>
		</Pressable>
	);
}

/**
 * Barra de navegación inferior de la aplicación
 * Muestra diferentes tabs según el rol del usuario
 */
export function NavBar() {
	const router = useRouter();
	const pathname = usePathname();
	const { user, isLoading } = useAuth();

	// Definir items de navegación según el rol
	const getNavItems = (): NavItem[] => {
		// Si está cargando o no hay usuario, retornar tabs de owner por defecto
		if (isLoading || !user) {
			return [
				{
					IconComponent: Home,
					label: "Inicio",
					route: "/(owner)/(tabs)/home",
				},
				{
					IconComponent: GiftIcon,
					label: "Recompensas",
					route: "/(owner)/(tabs)/rewards",
				},
				{
					IconComponent: ScanLine,
					label: "Escanear",
					route: "/(owner)/(tabs)/scan-qr",
				},
				{
					IconComponent: MedalIcon,
					label: "Rifas",
					route: "/(owner)/(tabs)/raffles",
				},
				{
					IconComponent: User,
					label: "Perfil",
					route: "/(owner)/(tabs)/profile",
				},
			];
		}

		switch (user.role) {
			case "customer":
				return [
					{
						IconComponent: Home,
						label: "Inicio",
						route: "/(customer)/(tabs)/home",
					},
					{
						IconComponent: ScanLine,
						label: "Mi QR",
						route: "/(customer)/(tabs)/show-qr",
					},
					{
						IconComponent: User,
						label: "Perfil",
						route: "/(customer)/(tabs)/profile",
					},
				];

			case "owner":
				return [
					{
						IconComponent: Home,
						label: "Inicio",
						route: "/(owner)/(tabs)/home",
					},
					{
						IconComponent: GiftIcon,
						label: "Recompensas",
						route: "/(owner)/(tabs)/rewards",
					},
					{
						IconComponent: ScanLine,
						label: "Escanear",
						route: "/(owner)/(tabs)/scan-qr",
					},
					{
						IconComponent: MedalIcon,
						label: "Rifas",
						route: "/(owner)/(tabs)/raffles",
					},
					{
						IconComponent: User,
						label: "Perfil",
						route: "/(owner)/(tabs)/profile",
					},
				];

			case "employee":
				return [
					{
						IconComponent: ScanLine,
						label: "Escanear",
						route: "/(employee)/(tabs)/scan-qr",
					},
					{
						IconComponent: User,
						label: "Perfil",
						route: "/(employee)/(tabs)/profile",
					},
				];

			default:
				return [];
		}
	};

	const navItems = getNavItems();

	const handleNavigation = (route: string) => {
		router.push(route as never);
	};

	/**
	 * Determina si una ruta está activa
	 * Compara el pathname actual con la ruta del tab para determinar cuál está activo
	 */
	const isRouteActive = (route: string): boolean => {
		if (!pathname) return false;

		// Extraer el nombre del tab de la ruta (ej: "/(customer)/(tabs)/home" -> "home")
		const tabNameMatch = route.match(/\(tabs\)\/([^/]+)/);
		if (!tabNameMatch) return false;

		const tabName = tabNameMatch[1];

		// Casos especiales para detectar el tab activo:

		// 1. Si el pathname termina con el nombre del tab (ej: "/home", "/profile", "/show-qr")
		if (pathname === `/${tabName}`) return true;

		// 2. Si el pathname incluye el nombre del tab seguido de algo más
		if (pathname.startsWith(`/${tabName}/`)) return true;

		// 3. Para el tab "home", si estamos en rutas relacionadas
		if (tabName === "home") {
			// Para customer: /business/ es parte del flujo de "home"
			if (pathname.startsWith("/business")) return true;
			// Para owner: rutas que no sean de otros tabs específicos
			if (
				pathname.startsWith("/employees") ||
				pathname.startsWith("/promotions") ||
				pathname.startsWith("/loyalty")
			) {
				return true;
			}
		}

		return false;
	};

	// Siempre mostrar el navbar (aunque sea con tabs por defecto)
	if (navItems.length === 0) {
		return null;
	}

	return (
		<Box
			className="w-full bg-white border-t border-gray-300 flex-row items-center justify-around py-2"
			style={{
				position: "absolute" as const,
				bottom: 0,
				left: 0,
				width: "100%",
			}}
		>
			{navItems.map((item) => (
				<NavItem
					key={item.route}
					IconComponent={item.IconComponent}
					label={item.label}
					route={item.route}
					isActive={isRouteActive(item.route)}
					onPress={() => handleNavigation(item.route)}
				/>
			))}
		</Box>
	);
}
