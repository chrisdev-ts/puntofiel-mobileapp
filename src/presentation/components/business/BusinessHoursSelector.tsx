import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Icon } from "@/components/ui/icon";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import DateTimePicker from "@react-native-community/datetimepicker";
import { XCircle } from "lucide-react-native";
import { useState } from "react";
import { Platform } from "react-native";

type DayOfWeek =
	| "Lunes"
	| "Martes"
	| "Miércoles"
	| "Jueves"
	| "Viernes"
	| "Sábado"
	| "Domingo";

interface TimeSlot {
	from: Date;
	to: Date;
	isOpen: boolean;
}

interface BusinessHoursState {
	[key: string]: TimeSlot;
}

interface BusinessHoursSelectorProps {
	onChange: (formattedHours: string) => void;
	initialValue?: string;
}

const DAYS: DayOfWeek[] = [
	"Lunes",
	"Martes",
	"Miércoles",
	"Jueves",
	"Viernes",
	"Sábado",
	"Domingo",
];

export function BusinessHoursSelector({
	onChange,
}: BusinessHoursSelectorProps) {
	const [hours, setHours] = useState<BusinessHoursState>(() => {
		const initial: BusinessHoursState = {};
		const defaultFrom = new Date();
		defaultFrom.setHours(9, 0, 0, 0); // 9:00 AM
		const defaultTo = new Date();
		defaultTo.setHours(18, 0, 0, 0); // 6:00 PM

		for (const day of DAYS) {
			initial[day] = {
				from: new Date(defaultFrom),
				to: new Date(defaultTo),
				isOpen: day !== "Domingo", // Cerrado los domingos por defecto
			};
		}
		return initial;
	});

	const [showPicker, setShowPicker] = useState<{
		day: DayOfWeek | null;
		type: "from" | "to" | null;
	}>({ day: null, type: null });

	// Formatear horarios para el backend
	const formatHours = (hoursState: BusinessHoursState): string => {
		const ranges: string[] = [];
		let currentRange: { days: DayOfWeek[]; from: string; to: string } | null =
			null;

		for (const day of DAYS) {
			const slot = hoursState[day];
			if (!slot.isOpen) continue;

			const fromTime = formatTime(slot.from);
			const toTime = formatTime(slot.to);

			if (
				currentRange &&
				currentRange.from === fromTime &&
				currentRange.to === toTime
			) {
				// Agregar día al rango actual
				currentRange.days.push(day);
			} else {
				// Guardar rango anterior si existe
				if (currentRange) {
					ranges.push(formatRange(currentRange));
				}
				// Iniciar nuevo rango
				currentRange = { days: [day], from: fromTime, to: toTime };
			}
		}

		// Agregar último rango
		if (currentRange) {
			ranges.push(formatRange(currentRange));
		}

		return ranges.join("\n");
	};

	const formatTime = (date: Date): string => {
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const ampm = hours >= 12 ? "PM" : "AM";
		const displayHours = hours % 12 || 12;
		const displayMinutes = minutes.toString().padStart(2, "0");
		return `${displayHours}:${displayMinutes} ${ampm}`;
	};

	const formatRange = (range: {
		days: DayOfWeek[];
		from: string;
		to: string;
	}): string => {
		const { days, from, to } = range;
		if (days.length === 1) {
			return `${days[0]}: ${from} - ${to}`;
		}
		if (days.length === 7) {
			return `Todos los días: ${from} - ${to}`;
		}
		// Detectar rangos consecutivos (ej: Lunes a Viernes)
		const firstDay = days[0];
		const lastDay = days[days.length - 1];
		const firstIndex = DAYS.indexOf(firstDay);
		const lastIndex = DAYS.indexOf(lastDay);

		if (lastIndex - firstIndex === days.length - 1) {
			return `${firstDay} a ${lastDay}: ${from} - ${to}`;
		}

		// Si no son consecutivos, listar todos
		return `${days.join(", ")}: ${from} - ${to}`;
	};

	const handleTimeChange = (
		day: DayOfWeek,
		type: "from" | "to",
		date: Date,
	) => {
		const newHours = {
			...hours,
			[day]: {
				...hours[day],
				[type]: date,
			},
		};
		setHours(newHours);
		onChange(formatHours(newHours));
		setShowPicker({ day: null, type: null });
	};

	const handleToggle = (day: DayOfWeek, isOpen: boolean) => {
		const newHours = {
			...hours,
			[day]: {
				...hours[day],
				isOpen,
			},
		};
		setHours(newHours);
		onChange(formatHours(newHours));
	};

	const copyToAll = (day: DayOfWeek) => {
		const template = hours[day];
		const newHours: BusinessHoursState = {};

		for (const d of DAYS) {
			newHours[d] = {
				from: new Date(template.from),
				to: new Date(template.to),
				isOpen: template.isOpen,
			};
		}

		setHours(newHours);
		onChange(formatHours(newHours));
	};

	return (
		<VStack className="gap-3">
			{DAYS.map((day) => {
				const slot = hours[day];
				const isOpen = slot.isOpen;

				return (
					<Box
						key={day}
						className={`p-4 rounded-lg border-2 ${
							isOpen
								? "border-primary-100 bg-blue-50"
								: "border-gray-300 bg-gray-100"
						}`}
					>
						<VStack className="gap-3">
							{/* Header: Día + Switch */}
							<HStack className="justify-between items-center">
								<Text className="font-semibold text-base text-gray-900">
									{day}
								</Text>
								<Switch
									value={isOpen}
									onValueChange={(value) => handleToggle(day, value)}
									trackColor={{ false: "#d4d4d4", true: "#2F4858" }}
									thumbColor={isOpen ? "#FFFFFF" : "#f4f3f4"}
								/>
							</HStack>

							{/* Time Pickers (solo si está abierto) */}
							{isOpen && (
								<>
									<HStack className="gap-2 items-center">
										<Text className="text-sm text-gray-600 w-10">De:</Text>
										<Button
											variant="outline"
											action="primary"
											className="flex-1 border-primary-500"
											onPress={() => setShowPicker({ day, type: "from" })}
										>
											<ButtonText>{formatTime(slot.from)}</ButtonText>
										</Button>

										<Text className="text-sm text-gray-600 w-10">A:</Text>
										<Button
											variant="outline"
											action="primary"
											className="flex-1 border-primary-500"
											onPress={() => setShowPicker({ day, type: "to" })}
										>
											<ButtonText>{formatTime(slot.to)}</ButtonText>
										</Button>
									</HStack>

									{/* Botón Copiar a todos */}
									<Button
										variant="link"
										action="primary"
										size="sm"
										onPress={() => copyToAll(day)}
										className="self-start h-4"
									>
										<ButtonText className="text-xs">
											Copiar a todos los días
										</ButtonText>
									</Button>
								</>
							)}
							{/* Estado visual */}
							{!isOpen && (
								<HStack className="items-center gap-2">
									<Icon as={XCircle} size="sm" className="text-gray-500" />
									<Text className="text-gray-600 font-semibold">Cerrado</Text>
								</HStack>
							)}
						</VStack>
					</Box>
				);
			})}

			{/* DateTimePicker Modal (iOS/Android) */}
			{showPicker.day && showPicker.type && (
				<DateTimePicker
					value={hours[showPicker.day][showPicker.type]}
					mode="time"
					is24Hour={false}
					display={Platform.OS === "ios" ? "spinner" : "default"}
					accentColor="#2F4858"
					onChange={(event, selectedDate) => {
						if (
							event.type === "set" &&
							selectedDate &&
							showPicker.day &&
							showPicker.type
						) {
							handleTimeChange(showPicker.day, showPicker.type, selectedDate);
						} else {
							setShowPicker({ day: null, type: null });
						}
					}}
				/>
			)}
		</VStack>
	);
}
