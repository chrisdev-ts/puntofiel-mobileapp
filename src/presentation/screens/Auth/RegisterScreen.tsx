import { router } from "expo-router";
import { useState } from "react";
import { ScrollView } from "react-native";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import {
	Checkbox,
	CheckboxIcon,
	CheckboxIndicator,
	CheckboxLabel,
} from "@/components/ui/checkbox";
import {
	FormControl,
	FormControlLabelText,
} from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Link, LinkText } from "@/components/ui/link";
import { Text } from "@/components/ui/text";

export function RegisterScreen() {
	const [name, setName] = useState("");
	const [number, setNumber] = useState("");
	const [password, setPassword] = useState("");
	const [termsAccepted, setTermsAccepted] = useState(false);
	return (
		<ScrollView
			contentContainerStyle={{ flexGrow: 1 }}
			keyboardShouldPersistTaps="handled"
		>
			<Box className="flex-1 items-center justify-center bg-white px-8 gap-4 py-6">
				<Heading size="2xl">Crear cuenta</Heading>
				<Text className="text-center">
					Registrese para gestionar sus puntos y recompensas
				</Text>
				{/* Primer campo para nombre completo */}
				<FormControl className="w-full gap-2">
					<FormControlLabelText> Nombre completo</FormControlLabelText>
					<Input>
						<InputField
							placeholder="Nombre y apellido"
							onChangeText={setName}
							value={name}
						/>
					</Input>
				</FormControl>
				{/* Segundo campo para correo electrónico */}
				<FormControl className="w-full gap-2">
					<FormControlLabelText>Correo electrónico</FormControlLabelText>
					<Input>
						<InputField
							placeholder="correo@ejemplo.com"
							keyboardType="email-address"
							onChangeText={setNumber}
							value={number}
						/>
					</Input>
				</FormControl>
				{/* Segundo campo para teléfono */}
				<FormControl className="w-full gap-2">
					<FormControlLabelText>Teléfono</FormControlLabelText>
					<Input>
						<InputField
							placeholder="271-555-5555"
							keyboardType="phone-pad"
							onChangeText={setNumber}
							value={number}
						/>
					</Input>
				</FormControl>

				{/* Tercer campo para contraseña */}
				<FormControl className="w-full gap-2">
					<FormControlLabelText>Contraseña</FormControlLabelText>
					<Input>
						<InputField
							placeholder="Ingrese su contraseña"
							secureTextEntry
							onChangeText={setPassword}
							value={password}
						/>
					</Input>
				</FormControl>
				{/* Cuarto campo para confirmar contraseña */}
				<FormControl className="w-full gap-2">
					<FormControlLabelText>Confirmar contraseña</FormControlLabelText>
					<Input>
						<InputField
							placeholder="Confirme su contraseña"
							secureTextEntry
							onChangeText={setPassword}
							value={password}
						/>
					</Input>
				</FormControl>
				{/* Check box para términos y condiciones */}
				<FormControl className="w-full">
					<Checkbox
						value="terms"
						isChecked={termsAccepted}
						onChange={(isSelected) => setTermsAccepted(isSelected)}
						size="md"
					>
						<CheckboxIndicator>
							<CheckboxIcon />
						</CheckboxIndicator>
						<CheckboxLabel>Acepto los términos y condiciones</CheckboxLabel>
					</Checkbox>
				</FormControl>
				<FormControl className="w-full">
					<Button variant="solid" action="primary">
						<ButtonText>Crear cuenta</ButtonText>
					</Button>
				</FormControl>
				<FormControl>
					<HStack>
						<Text size="lg">¿Ya tiene una cuenta?&nbsp;</Text>
						<Link onPress={() => router.push("/login")}>
							<HStack>
								<LinkText size="lg">Inicie sesión</LinkText>
							</HStack>
						</Link>
					</HStack>
				</FormControl>
			</Box>
		</ScrollView>
	);
}
