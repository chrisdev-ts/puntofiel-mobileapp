import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FormControl } from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { zodResolver } from "@hookform/resolvers/zod";
import type React from "react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { DatePickerModal } from "./DatePickerModal";
import { type PromotionFormData, promotionFormSchema } from "./PromotionSchema";

interface PromotionFormStep1Props {
	onNext: (data: Partial<PromotionFormData>) => void;
	onBack: () => void;
	initialData?: Partial<PromotionFormData>;
}

export const PromotionFormStep1: React.FC<PromotionFormStep1Props> = ({
	onNext,
	onBack,
	initialData,
}) => {
	const [isStartDatePickerVisible, setStartDatePickerVisible] = useState(false);
	const [isEndDatePickerVisible, setEndDatePickerVisible] = useState(false);

	const {
		control,
		handleSubmit,
		formState: { errors },
		watch,
		setValue,
		reset,
	} = useForm<PromotionFormData>({
		resolver: zodResolver(promotionFormSchema),
		defaultValues: initialData || {
			title: "",
			content: "",
			startDate: new Date(),
			endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
		},
	});

	// ✅ Cuando initialData cambia, actualizar el formulario
	useEffect(() => {
		if (initialData && (initialData.title || initialData.content)) {
			console.log(
				"[PromotionFormStep1] 🔄 Reseteando formulario con datos:",
				initialData,
			);
			reset(initialData);
		}
	}, [initialData, reset]);

	const startDate = watch("startDate");
	const endDate = watch("endDate");

	const onSubmit = (data: PromotionFormData) => {
		onNext(data);
	};

	return (
		<ScrollView
			className="flex-1 bg-white"
			showsVerticalScrollIndicator={false}
		>
			<VStack>
				<Card className="rounded-lg bg-white border border-gray-200">
					<VStack className="gap-4">
						<Heading className="text-2xl font-bold">Crear promoción</Heading>
						<Text className="text-gray-600">
							Ingresa la información de la promoción para darla de alta en tu
							negocio.
						</Text>

						{/* Nombre de la promoción */}
						<FormControl isInvalid={!!errors.title}>
							<View className="mb-2">
								<Text className="font-semibold">Nombre de la promoción</Text>
							</View>
							<Controller
								control={control}
								name="title"
								render={({ field: { onChange, value } }) => (
									<TextInput
										className="border border-gray-300 rounded-lg p-3"
										placeholder="ej. 2x1 en Pizzas"
										value={value || ""}
										onChangeText={onChange}
									/>
								)}
							/>
							{errors.title && (
								<View className="bg-red-50 p-2 rounded mt-1">
									<Text className="text-red-600 text-sm">
										{errors.title.message}
									</Text>
								</View>
							)}
						</FormControl>

						{/* Detalles */}
						<FormControl isInvalid={!!errors.content}>
							<View className="mb-2">
								<Text className="font-semibold">Detalles</Text>
							</View>
							<Controller
								control={control}
								name="content"
								render={({ field: { onChange, value } }) => (
									<TextInput
										className="border border-gray-300 rounded-lg p-3"
										placeholder="Describe tu promoción..."
										value={value || ""}
										onChangeText={onChange}
										multiline
										numberOfLines={4}
									/>
								)}
							/>
							{errors.content && (
								<View className="bg-red-50 p-2 rounded mt-1">
									<Text className="text-red-600 text-sm">
										{errors.content.message}
									</Text>
								</View>
							)}
						</FormControl>

						{/* Fecha de inicio */}
						<FormControl isInvalid={!!errors.startDate}>
							<View className="mb-2">
								<Text className="font-semibold">Fecha de inicio</Text>
							</View>
							<Controller
								control={control}
								name="startDate"
								render={({ field: { value } }) => (
									<Pressable onPress={() => setStartDatePickerVisible(true)}>
										<View className="border border-gray-300 rounded-lg p-3">
											<Text className="text-gray-700">
												{value
													? new Date(value).toLocaleDateString("es-ES")
													: "Selecciona fecha"}
											</Text>
										</View>
									</Pressable>
								)}
							/>
							{errors.startDate && (
								<View className="bg-red-50 p-2 rounded mt-1">
									<Text className="text-red-600 text-sm">
										{errors.startDate.message}
									</Text>
								</View>
							)}
						</FormControl>

						{/* Fecha de finalización */}
						<FormControl isInvalid={!!errors.endDate}>
							<View className="mb-2">
								<Text className="font-semibold">Fecha de finalización</Text>
							</View>
							<Controller
								control={control}
								name="endDate"
								render={({ field: { value } }) => (
									<Pressable onPress={() => setEndDatePickerVisible(true)}>
										<View className="border border-gray-300 rounded-lg p-3">
											<Text className="text-gray-700">
												{value
													? new Date(value).toLocaleDateString("es-ES")
													: "Selecciona fecha"}
											</Text>
										</View>
									</Pressable>
								)}
							/>
							{errors.endDate && (
								<View className="bg-red-50 p-2 rounded mt-1">
									<Text className="text-red-600 text-sm">
										{errors.endDate.message}
									</Text>
								</View>
							)}
						</FormControl>

						{/* Botones de acción */}
						<HStack className="gap-3 mt-6">
							<Button onPress={onBack} className="flex-1" variant="outline">
								<ButtonText>Atrás</ButtonText>
							</Button>
							<Button
								onPress={handleSubmit(onSubmit)}
								className="flex-1"
								variant="solid"
								action="primary"
							>
								<ButtonText>Continuar</ButtonText>
							</Button>
						</HStack>
					</VStack>
				</Card>
			</VStack>

			<DatePickerModal
				isVisible={isStartDatePickerVisible}
				onClose={() => setStartDatePickerVisible(false)}
				onSelectDate={(date: Date) => setValue("startDate", date)}
				initialDate={startDate instanceof Date ? startDate : new Date()}
			/>

			<DatePickerModal
				isVisible={isEndDatePickerVisible}
				onClose={() => setEndDatePickerVisible(false)}
				onSelectDate={(date: Date) => setValue("endDate", date)}
				initialDate={endDate instanceof Date ? endDate : new Date()}
			/>
		</ScrollView>
	);
};
