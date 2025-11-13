import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { AppLayout } from "@/src/presentation/components/layout";
import { router } from "expo-router";
import { ScrollView } from "react-native";

interface TermsScreenProps {
	type: "user" | "owner";
}

const UserTermsContent = () => (
	<VStack space="lg">
		<Heading size="xl" className="text-primary-500 text-center">
			Términos y condiciones de uso
		</Heading>

		<Heading size="lg" className="text-primary-500">
			¡Bienvenido a PuntoFiel!
		</Heading>

		<Text className="text-typography-700 leading-relaxed">
			Al usar nuestra aplicación, aceptas estos términos y condiciones. Si no
			estás de acuerdo, por favor, no utilices PuntoFiel.
		</Text>

		<Heading size="md" className="text-primary-500">
			1. Sobre la Aplicación
		</Heading>
		<Text className="text-typography-700 leading-relaxed">
			PuntoFiel es una plataforma de fidelización que te permite acumular puntos
			al comprar en comercios locales participantes. Estos puntos pueden ser
			canjeados por recompensas.
		</Text>

		<Heading size="md" className="text-primary-500">
			2. Tu Cuenta
		</Heading>
		<Text className="text-typography-700 leading-relaxed">
			Debes ser mayor de 18 años para crear una cuenta.{"\n"}
			Eres responsable de mantener la confidencialidad de tu contraseña.{"\n"}
			Solo puedes tener una cuenta.
		</Text>

		<Heading size="md" className="text-primary-500">
			3. Acumulación y Canje de Puntos
		</Heading>
		<Text className="text-typography-700 leading-relaxed">
			Los puntos se acumulan al escanear el código QR del comercio asociado.
			{"\n"}
			Cada comercio decide el valor de los puntos.{"\n"}
			Los puntos no tienen valor monetario y no pueden ser transferidos o
			vendidos.{"\n"}
			Las recompensas están sujetas a disponibilidad y pueden cambiar.
		</Text>

		<Heading size="md" className="text-primary-500">
			4. Privacidad de tus Datos
		</Heading>
		<Text className="text-typography-700 leading-relaxed">
			Recolectamos información para ofrecerte nuestros servicios (correo,
			nombre, etc.).{"\n"}
			No compartimos tus datos personales con terceros sin tu consentimiento.
			{"\n"}
			Puedes consultar nuestra Política de Privacidad para más detalles.
		</Text>

		<Heading size="md" className="text-primary-500">
			5. Uso Aceptable
		</Heading>
		<Text className="text-typography-700 leading-relaxed">
			No debes usar la aplicación para fines ilegales o fraudulentos.{"\n"}
			Cualquier intento de manipular la acumulación de puntos resultará en la
			suspensión o cancelación de tu cuenta.
		</Text>

		<Heading size="md" className="text-primary-500">
			6. Limitación de Responsabilidad
		</Heading>
		<Text className="text-typography-700 leading-relaxed">
			PuntoFiel no se hace responsable de la calidad de los productos o
			servicios ofrecidos por los comercios asociados.{"\n"}
			No garantizamos que la aplicación esté libre de errores o que funcione sin
			interrupciones.
		</Text>

		<Heading size="md" className="text-primary-500">
			7. Modificaciones a los Términos
		</Heading>
		<Text className="text-typography-700 leading-relaxed">
			Nos reservamos el derecho de actualizar estos términos en cualquier
			momento. Al continuar usando la app, aceptas las nuevas condiciones.
		</Text>

		<Heading size="md" className="text-primary-500">
			8. Contacto
		</Heading>
		<Text className="text-typography-700 leading-relaxed">
			Si tienes preguntas, contáctanos a través de la sección de Ayuda en la
			aplicación o envía un correo a{" "}
			<Text className="font-semibold text-primary-500">
				punto.fiel@email.com
			</Text>
			.
		</Text>
	</VStack>
);

const OwnerTermsContent = () => (
	<VStack space="lg">
		<Heading size="xl" className="text-primary-500 text-center">
			Términos y condiciones para comercios asociados
		</Heading>

		<Heading size="lg" className="text-primary-500">
			¡Bienvenido a PuntoFiel para Negocios!
		</Heading>

		<Text className="text-typography-700 leading-relaxed">
			Al usar esta aplicación y registrar tu negocio, aceptas los siguientes
			términos que regulan la relación entre tu negocio y la plataforma
			PuntoFiel.
		</Text>

		<Heading size="md" className="text-primary-500">
			1. Aceptación de los Términos
		</Heading>
		<Text className="text-typography-700 leading-relaxed">
			El uso de la aplicación por parte de tu negocio constituye una aceptación
			plena de estos términos. Si no estás de acuerdo con ellos, no utilices la
			aplicación.
		</Text>

		<Heading size="md" className="text-primary-500">
			2. Uso de la Aplicación y del Sistema de Puntos
		</Heading>
		<Text className="text-typography-700 leading-relaxed">
			<Text className="font-semibold">Responsabilidad del QR:</Text> Eres
			responsable de proteger y asegurar el código QR único de tu negocio.
			PuntoFiel no se hace responsable del uso no autorizado del QR si la
			seguridad fue comprometida por el comercio.{"\n\n"}
			<Text className="font-semibold">Asignación de Puntos:</Text> Te
			comprometes a asignar los puntos de manera justa y precisa a los clientes,
			según los parámetros acordados al momento del registro.{"\n\n"}
			<Text className="font-semibold">Canje de Recompensas:</Text> Debes
			respetar y canjear las recompensas por las que los clientes han acumulado
			y canjeado sus puntos. La calidad del producto o servicio canjeado es tu
			responsabilidad.
		</Text>

		<Heading size="md" className="text-primary-500">
			3. Datos del Negocio
		</Heading>
		<Text className="text-typography-700 leading-relaxed">
			Al registrarte, garantizas que la información de tu negocio (nombre,
			dirección, logo, etc.) es verídica y está actualizada.{"\n"}
			Aceptas que PuntoFiel pueda mostrar esta información a los usuarios de la
			aplicación para fines de marketing y descubrimiento de negocios.
		</Text>

		<Heading size="md" className="text-primary-500">
			4. Privacidad y Datos del Cliente
		</Heading>
		<Text className="text-typography-700 leading-relaxed">
			Te comprometes a respetar la privacidad de los clientes. Los datos de los
			clientes a los que puedas tener acceso a través de la aplicación no deben
			ser utilizados para fines distintos a la gestión de su cuenta en
			PuntoFiel, a menos que el cliente haya dado su consentimiento expreso.
			{"\n"}
			Prohíbes la venta, transferencia o cualquier otro tipo de divulgación de
			los datos personales de los clientes.
		</Text>

		<Heading size="md" className="text-primary-500">
			5. Mantenimiento y Disponibilidad
		</Heading>
		<Text className="text-typography-700 leading-relaxed">
			Nos reservamos el derecho de suspender temporalmente el servicio para
			realizar mantenimiento o actualizaciones.{"\n"}
			PuntoFiel no garantiza que la plataforma esté libre de errores o que
			funcione sin interrupciones en todo momento.
		</Text>

		<Heading size="md" className="text-primary-500">
			6. Terminación del Servicio
		</Heading>
		<Text className="text-typography-700 leading-relaxed">
			Puedes dar de baja a tu negocio de la plataforma en cualquier momento.
			{"\n"}
			PuntoFiel se reserva el derecho de suspender o terminar tu cuenta si se
			detecta un uso fraudulento, un incumplimiento de estos términos o si el
			negocio recibe múltiples quejas graves.
		</Text>

		<Heading size="md" className="text-primary-500">
			7. Limitación de Responsabilidad
		</Heading>
		<Text className="text-typography-700 leading-relaxed">
			PuntoFiel es solo una plataforma tecnológica que facilita la fidelización.
			{"\n"}
			No somos responsables por disputas entre el comercio y el cliente, ni por
			la calidad de los productos o servicios ofrecidos por el negocio.{"\n"}
			No somos responsables por pérdidas financieras o de datos que puedan
			surgir del uso de la aplicación.
		</Text>

		<Heading size="md" className="text-primary-500">
			8. Modificaciones a los Términos
		</Heading>
		<Text className="text-typography-700 leading-relaxed">
			Nos reservamos el derecho de modificar estos términos en cualquier
			momento.{"\n"}
			Te notificaremos sobre los cambios, y el uso continuado de la aplicación
			después de la notificación constituirá una aceptación de los nuevos
			términos.
		</Text>

		<Heading size="md" className="text-primary-500">
			9. Contacto
		</Heading>
		<Text className="text-typography-700 leading-relaxed">
			Si tienes preguntas, contáctanos a través de la sección de Ayuda en la
			aplicación o envía un correo a{" "}
			<Text className="font-semibold text-primary-500">
				punto.fiel@email.com
			</Text>
			.
		</Text>
	</VStack>
);

export function TermsScreen({ type }: TermsScreenProps) {
	return (
		<AppLayout
			showHeader={true}
			showNavBar={false}
			headerTitle="Términos de uso"
			headerVariant="back"
			contentSpacing="md"
			centerContent={false}
		>
			<ScrollView showsVerticalScrollIndicator={false}>
				<VStack space="lg" className="pb-10">
					<Box className="items-center">
						<Image
							source={require("@/assets/logos/logo-horizontal-dark.png")}
							resizeMode="contain"
							alt="Logo de PuntoFiel"
							className="w-80 h-20"
						/>
					</Box>

					<Card className="bg-white rounded-2xl border border-gray-200">
						<VStack space="lg" className="p-6">
							{type === "user" ? <UserTermsContent /> : <OwnerTermsContent />}

							<Divider className="my-2" />

							<Text className="text-typography-400 text-sm text-center">
								Última actualización: 13 de octubre de 2025
							</Text>

							<Button
								action="primary"
								onPress={() => router.back()}
								size="lg"
								className="bg-primary-500"
							>
								<ButtonText className="text-white font-semibold">
									Volver al registro
								</ButtonText>
							</Button>
						</VStack>
					</Card>
				</VStack>
			</ScrollView>
		</AppLayout>
	);
}
