import { router } from "expo-router";
import { useCallback } from "react";

/**
 * Hook que maneja las acciones de navegación del perfil
 * Centraliza toda la lógica de navegación según Clean Architecture
 */
export function useProfileNavigation() {
	// Navegación para Customers
	const navigateToHistory = useCallback(() => {
		console.log("[ProfileNavigation] Navegar a historial");
		// TODO: Implementar navegación cuando exista la pantalla
		// router.push("/(customer)/history");
	}, []);

	const navigateToLinkedBusinesses = useCallback(() => {
		console.log("[ProfileNavigation] Navegar a locales vinculados");
		// TODO: Implementar navegación cuando exista la pantalla
		// router.push("/(customer)/linked-businesses");
	}, []);

	// Navegación para Owners
	const navigateToViewBusiness = useCallback(() => {
		router.push("/(owner)/business");
	}, []);

	const navigateToEmployees = useCallback(() => {
		router.push("/(owner)/employees");
	}, []);

	const navigateToLinkedCustomers = useCallback(() => {
		console.log("[ProfileNavigation] Navegar a clientes vinculados");
		// TODO: Implementar navegación cuando exista la pantalla
		// router.push("/(owner)/customers");
	}, []);

	const navigateToPointsHistory = useCallback(() => {
		console.log("[ProfileNavigation] Navegar a historial de puntos");
		// TODO: Implementar navegación cuando exista la pantalla
		// router.push("/(owner)/points-history");
	}, []);

	const navigateToRewardsHistory = useCallback(() => {
		console.log("[ProfileNavigation] Navegar a historial de recompensas");
		// TODO: Implementar navegación cuando exista la pantalla
		// router.push("/(owner)/rewards-history");
	}, []);

	// Navegación común
	const navigateToNotifications = useCallback(() => {
		console.log("[ProfileNavigation] Navegar a notificaciones");
		// TODO: Implementar navegación cuando exista la pantalla
		// router.push("/notifications");
	}, []);

	const navigateToSecurity = useCallback(() => {
		console.log("[ProfileNavigation] Navegar a seguridad");
		// TODO: Implementar navegación cuando exista la pantalla
		// router.push("/security");
	}, []);

	const navigateToHelp = useCallback(() => {
		console.log("[ProfileNavigation] Navegar a ayuda");
		// TODO: Implementar navegación cuando exista la pantalla
		// router.push("/help");
	}, []);

	const navigateToTerms = useCallback(() => {
		console.log("[ProfileNavigation] Navegar a términos y condiciones");
		// TODO: Implementar navegación cuando exista la pantalla
		// router.push("/terms");
	}, []);

	const navigateToEditBusiness = useCallback(() => {
		router.push("/(owner)/business/edit");
	}, []);

	return {
		// Customer navigation
		navigateToHistory,
		navigateToLinkedBusinesses,
		// Owner navigation
		navigateToViewBusiness,
		navigateToEmployees,
		navigateToLinkedCustomers,
		navigateToPointsHistory,
		navigateToRewardsHistory,
		// Common navigation
		navigateToNotifications,
		navigateToSecurity,
		navigateToHelp,
		navigateToTerms,
		navigateToEditBusiness,
	};
}
