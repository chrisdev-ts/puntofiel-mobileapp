import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { AppLayout } from "@/src/presentation/components/layout";
import { router } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";

const ScreenUserTerms: React.FC = () => {
  return (
    <AppLayout
      showHeader={true}
      showNavBar={false}
      headerTitle="Términos de Uso"
      headerVariant="back"
      backgroundColor="bg-[#f9fafb]"
      contentSpacing="md"
      centerContent={false}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="items-center mb-6 mt-2">
          <Image
            source={require("@/assets/logos/logo-horizontal-dark.png")}
            resizeMode="contain"
            alt="Logo de PuntoFiel"
            className="w-80 h-20"
          />
        </View>

        {/* Contenido principal */}
        <Card className="bg-white p-6 rounded-2xl shadow-md mt-2 w-full">
          <Text className="text-xl font-bold text-[#2F4858] mb-4 text-center">
            Términos y Condiciones de Uso
          </Text>

          <Text className="text-lg font-semibold text-[#2F4858] mb-2">
            ¡Bienvenido a PuntoFiel!
          </Text>

          <Text className="text-gray-700 leading-relaxed mb-3">
            Al usar nuestra aplicación, aceptas estos términos y condiciones. Si
            no estás de acuerdo, por favor, no utilices PuntoFiel.
          </Text>

          <Text className="text-base font-bold text-[#2F4858] mb-1">
            1. Sobre la Aplicación
          </Text>
          <Text className="text-gray-700 leading-relaxed mb-3">
            PuntoFiel es una plataforma de fidelización que te permite acumular
            puntos al comprar en comercios locales participantes. Estos puntos
            pueden ser canjeados por recompensas.
          </Text>

          <Text className="text-base font-bold text-[#2F4858] mb-1">
            2. Tu Cuenta
          </Text>
          <Text className="text-gray-700 leading-relaxed mb-3">
            Debes ser mayor de 18 años para crear una cuenta.{"\n"}
            Eres responsable de mantener la confidencialidad de tu contraseña.{"\n"}
            Solo puedes tener una cuenta.
          </Text>

          <Text className="text-base font-bold text-[#2F4858] mb-1">
            3. Acumulación y Canje de Puntos
          </Text>
          <Text className="text-gray-700 leading-relaxed mb-3">
            Los puntos se acumulan al escanear el código QR del comercio asociado.{"\n"}
            Cada comercio decide el valor de los puntos.{"\n"}
            Los puntos no tienen valor monetario y no pueden ser transferidos o vendidos.{"\n"}
            Las recompensas están sujetas a disponibilidad y pueden cambiar.
          </Text>

          <Text className="text-base font-bold text-[#2F4858] mb-1">
            4. Privacidad de tus Datos
          </Text>
          <Text className="text-gray-700 leading-relaxed mb-3">
            Recolectamos información para ofrecerte nuestros servicios (correo, nombre, etc.).{"\n"}
            No compartimos tus datos personales con terceros sin tu consentimiento.{"\n"}
            Puedes consultar nuestra Política de Privacidad para más detalles.
          </Text>

          <Text className="text-base font-bold text-[#2F4858] mb-1">
            5. Uso Aceptable
          </Text>
          <Text className="text-gray-700 leading-relaxed mb-3">
            No debes usar la aplicación para fines ilegales o fraudulentos.{"\n"}
            Cualquier intento de manipular la acumulación de puntos resultará en
            la suspensión o cancelación de tu cuenta.
          </Text>

          <Text className="text-base font-bold text-[#2F4858] mb-1">
            6. Limitación de Responsabilidad
          </Text>
          <Text className="text-gray-700 leading-relaxed mb-3">
            PuntoFiel no se hace responsable de la calidad de los productos o servicios ofrecidos por los comercios asociados.{"\n"}
            No garantizamos que la aplicación esté libre de errores o que funcione sin interrupciones.
          </Text>

          <Text className="text-base font-bold text-[#2F4858] mb-1">
            7. Modificaciones a los Términos
          </Text>
          <Text className="text-gray-700 leading-relaxed mb-3">
            Nos reservamos el derecho de actualizar estos términos en cualquier momento. Al continuar usando la app, aceptas las nuevas condiciones.
          </Text>

          <Text className="text-base font-bold text-[#2F4858] mb-1">
            8. Contacto
          </Text>
          <Text className="text-gray-700 leading-relaxed mb-6">
            Si tienes preguntas, contáctanos a través de la sección de Ayuda en la aplicación o envía un correo a{" "}
            <Text className="font-semibold text-[#2F4858]">punto.fiel@email.com</Text>.{"\n"}
            Última actualización: 13 de octubre de 2025.
          </Text>

          {/* Botón */}
          <Button
            action="primary"
            variant="outline"
            onPress={() => router.push("/(public)/register")}
            size="lg"
            className="mt-2 w-full bg-[#2F4858]"
          >
            <ButtonText className="text-white font-semibold text-base">
              Aceptar
            </ButtonText>
          </Button>
        </Card>
      </ScrollView>
    </AppLayout>
  );
};

export default ScreenUserTerms;
