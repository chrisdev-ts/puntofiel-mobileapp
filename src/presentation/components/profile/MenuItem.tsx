import { ChevronRight } from "lucide-react-native";
import { Pressable } from "react-native";

import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

type LucideIcon = React.ComponentType<{
	size?: number | string;
	color?: string;
	className?: string;
}>;

interface MenuItemProps {
	icon: LucideIcon;
	label: string;
	value?: string;
	onPress?: () => void;
	showDivider?: boolean;
}

/**
 * Componente de item de menú para la pantalla de perfil
 *
 * @param icon - Icono de Lucide a mostrar
 * @param label - Texto del item
 * @param value - Valor opcional a mostrar a la derecha (ej: puntos)
 * @param onPress - Función a ejecutar al presionar (opcional)
 * @param showDivider - Mostrar divider debajo del item
 */
export const MenuItem = ({
	icon: IconComponent,
	label,
	value,
	onPress,
	showDivider = true,
}: MenuItemProps) => (
	<>
		<Pressable
			onPress={onPress}
			disabled={!onPress}
			className="active:bg-background-100"
		>
			<HStack className="items-center justify-between py-4 px-6">
				<HStack className="flex-1 items-center gap-4">
					<Box className="w-6 h-6 items-center justify-center">
						<Icon as={IconComponent} size="lg" className="text-primary-800" />
					</Box>
					<Text className="flex-1 text-base text-typography-900">{label}</Text>
				</HStack>
				{value ? (
					<Text className="font-bold text-typography-900">{value}</Text>
				) : (
					onPress && (
						<Icon as={ChevronRight} size="sm" className="text-typography-400" />
					)
				)}
			</HStack>
		</Pressable>
		{showDivider && <Divider className="mx-0" />}
	</>
);
