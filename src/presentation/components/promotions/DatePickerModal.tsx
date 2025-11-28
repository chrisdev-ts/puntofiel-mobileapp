import type React from "react";
import { useState } from "react";
import { Dimensions, ScrollView, View } from "react-native";

import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import {
	Modal,
	ModalBackdrop,
	ModalContent,
	ModalHeader,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";

interface DatePickerModalProps {
	isVisible: boolean;
	onClose: () => void;
	onSelectDate: (date: Date) => void;
	initialDate?: Date;
}

const getDaysInMonth = (date: Date): number => {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

const getMonthName = (monthIndex: number): string => {
	const months = [
		"Enero",
		"Febrero",
		"Marzo",
		"Abril",
		"Mayo",
		"Junio",
		"Julio",
		"Agosto",
		"Septiembre",
		"Octubre",
		"Noviembre",
		"Diciembre",
	];
	return months[monthIndex];
};

// Convertir domingo=0 a lunes=0 para mejor visualización en móvil
const getDayOfWeek = (date: Date): number => {
	const day = date.getDay();
	return day === 0 ? 6 : day - 1;
};

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
	isVisible,
	onClose,
	onSelectDate,
	initialDate = new Date(),
}) => {
	const [currentDate, setCurrentDate] = useState(initialDate);
	const [selectedDay, setSelectedDay] = useState(initialDate.getDate());

	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();
	const daysInMonth = getDaysInMonth(currentDate);
	const firstDayOfMonth = getDayOfWeek(new Date(year, month, 1));

	const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
	const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

	const handlePrevMonth = () => {
		setCurrentDate(new Date(year, month - 1, 1));
	};

	const handleNextMonth = () => {
		setCurrentDate(new Date(year, month + 1, 1));
	};

	const handleSelectDay = (day: number) => {
		setSelectedDay(day);
	};

	const handleConfirm = () => {
		const selectedDate = new Date(year, month, selectedDay);
		onSelectDate(selectedDate);
		onClose();
	};

	if (!isVisible) return null;

	// Calcular tamaño dinámico basado en el ancho de pantalla
	const screenWidth = Dimensions.get("window").width;
	const daySize = Math.floor((screenWidth - 80) / 7);

	return (
		<Modal isOpen={isVisible} onClose={onClose} size="full">
			<ModalBackdrop />
			<ModalContent className="bg-white rounded-lg h-full m-0 flex flex-col">
				<ModalHeader className="border-b border-gray-200 p-4">
					<Heading size="lg" className="text-gray-800">
						Selecciona una fecha
					</Heading>
				</ModalHeader>

				<ScrollView className="p-4 flex-1">
					{/* Controles mes y año */}
					<View className="flex-row items-center justify-between mb-8 gap-2">
						<Button onPress={handlePrevMonth} className="p-3" variant="outline">
							<ButtonText>◄</ButtonText>
						</Button>
						<Heading size="md" className="text-gray-800 flex-1 text-center">
							{getMonthName(month)} {year}
						</Heading>
						<Button onPress={handleNextMonth} className="p-3" variant="outline">
							<ButtonText>►</ButtonText>
						</Button>
					</View>

					{/* Encabezados de días de la semana */}
					<View className="flex-row justify-between mb-4 gap-1">
						{["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
							<View
								key={day}
								style={{ width: daySize }}
								className="h-12 items-center justify-center"
							>
								<Text className="text-gray-600 text-sm font-bold">{day}</Text>
							</View>
						))}
					</View>

					{/* Cuadrícula de calendario */}
					<View className="flex-row flex-wrap justify-between gap-1">
						{/* Espacios vacíos al inicio */}
						{emptyDays.map((_) => (
							<View
								key={`empty-day-placeholder`}
								style={{ width: daySize }}
								className="h-14 mb-1"
							/>
						))}

						{/* Días del mes */}
						{days.map((day) => (
							<Button
								key={day}
								onPress={() => handleSelectDay(day)}
								style={{ width: daySize }}
								className={`h-14 rounded-lg items-center justify-center mb-1 ${
									selectedDay === day ? "bg-blue-500" : "bg-gray-100"
								}`}
							>
								<ButtonText
									className={`text-base font-bold ${
										selectedDay === day ? "text-white" : "text-gray-800"
									}`}
								>
									{day}
								</ButtonText>
							</Button>
						))}
					</View>

					{/* Información de fecha seleccionada */}
					<View className="bg-blue-50 rounded-lg p-4 mt-8 mb-6">
						<Text className="text-sm text-gray-600 mb-1">
							Fecha seleccionada:
						</Text>
						<Text className="text-lg font-bold text-blue-600">
							{new Date(year, month, selectedDay).toLocaleDateString("es-ES", {
								weekday: "long",
								year: "numeric",
								month: "long",
								day: "numeric",
							})}
						</Text>
					</View>

					{/* Botones de acción */}
					<View className="flex-row gap-3">
						<Button onPress={onClose} className="flex-1" variant="outline">
							<ButtonText>Cancelar</ButtonText>
						</Button>
						<Button
							onPress={handleConfirm}
							className="flex-1"
							variant="solid"
							action="primary"
						>
							<ButtonText>Confirmar</ButtonText>
						</Button>
					</View>
				</ScrollView>
			</ModalContent>
		</Modal>
	);
};
