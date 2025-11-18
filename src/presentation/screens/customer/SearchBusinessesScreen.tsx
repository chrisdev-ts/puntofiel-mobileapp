import { useRouter } from "expo-router";
import {
	AlertCircleIcon,
	FilterIcon,
	HeartIcon,
	MapPinIcon,
	SearchIcon,
	StoreIcon,
	TrendingUpIcon,
} from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView } from "react-native";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import type { BusinessCategory } from "@/src/core/entities/Business";
import {
	FeedbackScreen,
	ListContainer,
	ListItem,
} from "@/src/presentation/components/common";
import { SearchBusinessesSkeleton } from "@/src/presentation/components/common/skeletons";
import { BusinessSection } from "@/src/presentation/components/customer/BusinessSection";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import {
	useAllBusinesses,
	useFavoriteBusinesses,
	useNearbyBusinesses,
	usePopularBusinesses,
} from "@/src/presentation/hooks/useBusinesses";

// Categorías de negocios
const BUSINESS_CATEGORIES: { id: BusinessCategory; label: string }[] = [
	{ id: "food", label: "Comida" },
	{ id: "cafe", label: "Cafetería" },
	{ id: "restaurant", label: "Restaurante" },
	{ id: "retail", label: "Retail" },
	{ id: "services", label: "Servicios" },
	{ id: "entertainment", label: "Entretenimiento" },
	{ id: "health", label: "Salud" },
];

// Mapeo de categorías a etiquetas en español
const CATEGORY_LABELS: Record<BusinessCategory, string> = {
	food: "Comida",
	cafe: "Cafetería",
	restaurant: "Restaurante",
	retail: "Retail",
	services: "Servicios",
	entertainment: "Entretenimiento",
	health: "Salud",
	other: "Otros",
};

type ViewAllSection = "favorites" | "popular" | "nearby" | "all" | null;

export default function SearchBusinessesScreen() {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] =
		useState<BusinessCategory | null>(null);
	const [viewAllSection, setViewAllSection] = useState<ViewAllSection>(null);

	// Queries para las diferentes secciones
	const { data: allBusinesses, isLoading: loadingAll } = useAllBusinesses({
		searchQuery: searchQuery || undefined,
		category: selectedCategory || undefined,
		limit: 10,
	});

	const { data: favoriteBusinesses, isLoading: loadingFavorites } =
		useFavoriteBusinesses();

	const { data: popularBusinesses, isLoading: loadingPopular } =
		usePopularBusinesses(10);

	const { data: nearbyBusinesses, isLoading: loadingNearby } =
		useNearbyBusinesses(10);

	const isSearching = searchQuery.length > 0 || selectedCategory !== null;
	const hasSearchResults = allBusinesses && allBusinesses.length > 0;

	const handleBusinessPress = (businessId: string) => {
		router.push(`/(customer)/business/${businessId}` as never);
	};

	const handleCategoryPress = (categoryId: BusinessCategory) => {
		setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
	};

	const handleClearFilters = () => {
		setSearchQuery("");
		setSelectedCategory(null);
	};

	const handleViewAll = (section: ViewAllSection) => {
		setViewAllSection(section);
	};

	const handleBackFromViewAll = () => {
		setViewAllSection(null);
	};

	const getCategoryLabel = (category: BusinessCategory): string => {
		return CATEGORY_LABELS[category];
	};

	// Si estamos en modo "Ver todos", mostrar vista de grid completo
	if (viewAllSection) {
		let sectionTitle = "";
		let sectionData: typeof allBusinesses = [];
		let isLoading = false;

		switch (viewAllSection) {
			case "favorites":
				sectionTitle = "Mis favoritos";
				sectionData = favoriteBusinesses;
				isLoading = loadingFavorites;
				break;
			case "popular":
				sectionTitle = "Más populares";
				sectionData = popularBusinesses;
				isLoading = loadingPopular;
				break;
			case "nearby":
				sectionTitle = "Cerca de mí";
				sectionData = nearbyBusinesses;
				isLoading = loadingNearby;
				break;
			case "all":
				sectionTitle = "Todos los negocios";
				sectionData = allBusinesses;
				isLoading = loadingAll;
				break;
		}

		return (
			<AppLayout
				showHeader={true}
				headerVariant="back"
				showNavBar={false}
				scrollable={true}
				onBackPress={handleBackFromViewAll}
			>
				<VStack space="lg">
					<Heading size="xl" className="text-primary-500">
						{sectionTitle}
					</Heading>

					{isLoading ? (
						<FeedbackScreen
							variant="loading"
							title="Cargando negocios..."
							description="Espera un momento"
						/>
					) : !sectionData || sectionData.length === 0 ? (
						<FeedbackScreen
							variant="empty"
							icon={StoreIcon}
							title="No hay negocios"
							description="No se encontraron negocios en esta sección"
						/>
					) : (
						<ListContainer variant="grid">
							{sectionData.map((business) => (
								<ListItem
									key={business.id}
									variant="vertical"
									id={business.id}
									imageUrl={business.logoUrl}
									imageAlt={business.name}
									title={business.name}
									badge={
										<VStack space="xs">
											<Text size="xs" className="text-typography-500">
												{getCategoryLabel(business.category)}
											</Text>
											{business.locationAddress && (
												<Text
													size="xs"
													className="text-typography-400"
													numberOfLines={1}
												>
													{business.locationAddress}
												</Text>
											)}
										</VStack>
									}
									onPress={handleBusinessPress}
								/>
							))}
						</ListContainer>
					)}
				</VStack>
			</AppLayout>
		);
	}

	return (
		<AppLayout
			showHeader={true}
			headerVariant="back"
			showNavBar={false}
			scrollable={true}
		>
			<VStack space="lg">
				{/* Título */}
				<Heading className="text-primary-500">Negocios con PuntoFiel</Heading>
				{/* Barra de búsqueda */}
				<HStack space="sm" className="items-center">
					<Input variant="outline" size="md" className="flex-1">
						<InputSlot className="pl-3">
							<InputIcon as={SearchIcon} />
						</InputSlot>
						<InputField
							placeholder="Buscar negocio"
							value={searchQuery}
							onChangeText={setSearchQuery}
						/>
					</Input>
					<Button variant="outline" size="md" className="px-3">
						<Icon as={FilterIcon} className="text-primary-500" size="lg" />
					</Button>
				</HStack>
				{/* Chips de categorías */}
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					className="-mx-3"
					contentContainerClassName="px-3 gap-2"
				>
					{BUSINESS_CATEGORIES.map((category) => (
						<Pressable
							key={category.id}
							onPress={() => handleCategoryPress(category.id)}
						>
							<Box
								className={`px-4 py-2 rounded-full ${
									selectedCategory === category.id
										? "bg-primary-500"
										: "bg-background-200"
								}`}
							>
								<Text
									size="sm"
									className={
										selectedCategory === category.id
											? "text-white font-medium"
											: "text-typography-600"
									}
								>
									{category.label}
								</Text>
							</Box>
						</Pressable>
					))}
				</ScrollView>
				{/* Resultados de búsqueda */}
				{isSearching && (
					<VStack space="md">
						<HStack className="items-center justify-between">
							<Heading className="text-typography-900">Resultados</Heading>
							{(searchQuery || selectedCategory) && (
								<Button variant="link" size="sm" onPress={handleClearFilters}>
									<ButtonText>Limpiar filtros</ButtonText>
								</Button>
							)}
						</HStack>

						{loadingAll ? (
							<SearchBusinessesSkeleton />
						) : !hasSearchResults ? (
							<FeedbackScreen
								variant="empty"
								icon={AlertCircleIcon}
								title="No se encontraron negocios"
								description="Intenta con otros términos de búsqueda"
							/>
						) : (
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								className="-mx-3"
								contentContainerClassName="px-3 gap-3"
							>
								{allBusinesses?.map((business) => (
									<Box key={business.id} className="w-48">
										<ListItem
											variant="vertical"
											id={business.id}
											imageUrl={business.logoUrl}
											imageAlt={business.name}
											title={business.name}
											badge={
												<VStack space="xs">
													<Text size="xs" className="text-typography-500">
														{getCategoryLabel(business.category)}
													</Text>
													{business.locationAddress && (
														<Text
															size="xs"
															className="text-typography-400"
															numberOfLines={1}
														>
															{business.locationAddress}
														</Text>
													)}
												</VStack>
											}
											onPress={handleBusinessPress}
										/>
									</Box>
								))}
							</ScrollView>
						)}
					</VStack>
				)}
				{/* Secciones cuando NO hay búsqueda activa */}
				{!isSearching && (
					<>
						{/* Sección: Mis Favoritos */}
						{favoriteBusinesses && favoriteBusinesses.length > 0 && (
							<BusinessSection
								title="Mis favoritos"
								icon={HeartIcon}
								businesses={favoriteBusinesses}
								isLoading={loadingFavorites}
								onViewAll={() => handleViewAll("favorites")}
								onBusinessPress={handleBusinessPress}
								getCategoryLabel={getCategoryLabel}
							/>
						)}

						{/* Sección: Más Populares */}
						<BusinessSection
							title="Más populares"
							icon={TrendingUpIcon}
							businesses={popularBusinesses || []}
							isLoading={loadingPopular}
							emptyMessage="No hay negocios populares aún"
							onViewAll={() => handleViewAll("popular")}
							onBusinessPress={handleBusinessPress}
							getCategoryLabel={getCategoryLabel}
						/>

						{/* Sección: Cerca de mí */}
						<BusinessSection
							title="Cerca de mí"
							icon={MapPinIcon}
							businesses={nearbyBusinesses || []}
							isLoading={loadingNearby}
							emptyMessage="Activa tu ubicación para ver negocios cerca de ti"
							onViewAll={() => handleViewAll("nearby")}
							onBusinessPress={handleBusinessPress}
							getCategoryLabel={getCategoryLabel}
						/>

						{/* Sección: Todos los negocios */}
						{allBusinesses && allBusinesses.length > 0 ? (
							<BusinessSection
								title="Todos los negocios"
								icon={StoreIcon}
								businesses={allBusinesses}
								isLoading={loadingAll}
								onViewAll={() => handleViewAll("all")}
								onBusinessPress={handleBusinessPress}
								getCategoryLabel={getCategoryLabel}
							/>
						) : (
							<VStack space="md">
								<HStack className="items-center">
									<Icon as={StoreIcon} className="text-primary-500" size="md" />
									<Heading className="text-typography-900 ml-2">
										Todos los negocios
									</Heading>
								</HStack>
								<FeedbackScreen
									variant="empty"
									icon={StoreIcon}
									title="No hay negocios registrados"
									description="Vuelve pronto para descubrir nuevos negocios"
								/>
							</VStack>
						)}
					</>
				)}
			</VStack>
		</AppLayout>
	);
}
