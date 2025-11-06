import React from "react";
import { Pressable } from "react-native";
import { HStack } from "@/components/ui/hstack";
import { ArrowRightIcon, Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

/**
 * Props del componente EmployeeListItem
 */
interface EmployeeListItemProps {
	/** ID del empleado */
	id: string;
	/** Nombre completo del empleado */
	title: string;
	/** Subtítulo (ej: "Puntos otorgados") */
	subtitle: string;
	/** Función que se ejecuta al presionar el item */
	onPress: (id: string) => void;
}

/**
 * Componente de item de lista para empleados
 *
 * Diseño visual idéntico a ListItem de rewards, pero:
 * - Sin imagen de perfil
 * - Sin badge de puntos
 * - Con flecha de navegación
 */
export function EmployeeListItem({
	id,
	title,
	subtitle,
	onPress,
}: EmployeeListItemProps) {
	return (
		<Pressable
			onPress={() => onPress(id)}
			className="bg-background-0 border border-outline-200 rounded-lg p-4 mb-3 active:bg-background-50"
		>
			<HStack className="items-center justify-between">
				{/* Contenido del empleado */}
				<VStack space="xs" className="flex-1">
					{/* Nombre del empleado */}
					<Text className="text-typography-900 font-semibold text-base">
						{title}
					</Text>

					{/* Subtítulo (Puntos otorgados) */}
					<Text className="text-typography-500 text-sm">{subtitle}</Text>
				</VStack>

				{/* Flecha de navegación */}
				<Icon as={ArrowRightIcon} className="text-primary-500" size="xl" />
			</HStack>
		</Pressable>
	);
}
