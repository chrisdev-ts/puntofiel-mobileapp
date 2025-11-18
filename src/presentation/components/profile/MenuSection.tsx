import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

interface MenuSectionProps {
	title: string;
	children: React.ReactNode;
}

/**
 * Sección de menú con título para agrupar items relacionados
 *
 * @param title - Título de la sección
 * @param children - Items del menú (MenuItem components)
 */
export const MenuSection = ({ title, children }: MenuSectionProps) => (
	<VStack className="gap-3">
		<Text className="text-sm font-bold text-typography-600">{title}</Text>
		<Box className="border border-outline-200 rounded-xl bg-background-0 overflow-hidden">
			{children}
		</Box>
	</VStack>
);
