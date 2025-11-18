import { View } from "react-native";
import { Box } from "@/components/ui/box";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

/**
 * Props del componente ProgressBar
 */
export interface ProgressBarProps {
	/** Paso actual (1-based) */
	currentStep: number;
	/** Total de pasos */
	totalSteps: number;
	/** Mostrar etiquetas de texto (paso y porcentaje) */
	showLabels?: boolean;
	/** Mostrar mensaje de ayuda cuando no está completo */
	showHelperText?: boolean;
	/** Texto personalizado del mensaje de ayuda */
	helperText?: string;
	/** Altura de la barra en pixeles */
	height?: number;
}

/**
 * Componente reutilizable de barra de progreso para formularios multi-paso.
 *
 * @example
 * ```tsx
 * // Con etiquetas y mensaje de ayuda
 * <ProgressBar
 *   currentStep={2}
 *   totalSteps={3}
 *   showLabels={true}
 *   showHelperText={true}
 * />
 *
 * // Barra simple sin etiquetas
 * <ProgressBar
 *   currentStep={1}
 *   totalSteps={2}
 * />
 * ```
 */
export function ProgressBar({
	currentStep,
	totalSteps,
	showLabels = true,
	showHelperText = true,
	helperText = "Completa todos los campos para avanzar",
	height = 8,
}: ProgressBarProps) {
	// Calcular porcentaje de progreso
	const progressPercentage = Math.round((currentStep / totalSteps) * 100);
	const isComplete = progressPercentage >= 100;

	return (
		<VStack className="gap-2">
			{/* Etiquetas de paso y porcentaje */}
			{showLabels && (
				<HStack className="justify-between items-center">
					<Text className="text-sm text-gray-600">
						Paso {currentStep} de {totalSteps}
					</Text>
					<Text className="text-sm font-semibold text-gray-600">
						{progressPercentage}%
					</Text>
				</HStack>
			)}

			{/* Barra de progreso */}
			<Box
				className="bg-gray-200 rounded-full overflow-hidden"
				style={{ height }}
			>
				<View
					className="h-full bg-primary-500"
					style={{ width: `${progressPercentage}%` }}
				/>
			</Box>

			{/* Mensaje de ayuda */}
			{showHelperText && !isComplete && (
				<Text className="text-xs text-gray-500">{helperText}</Text>
			)}
		</VStack>
	);
}
