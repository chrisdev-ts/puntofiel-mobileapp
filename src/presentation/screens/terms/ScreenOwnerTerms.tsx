import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Image } from "@/components/ui/image";
import { Text } from "@/components/ui/text";
import { AppLayout } from "@/src/presentation/components/layout";
import { router } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";

export const ScreenOwnerTerms: React.FC = () => {
  return (
    <AppLayout>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

          <View className="items-center mb-6 mt-2">
                 <Image
                   source={require("@/assets/logos/logo-horizontal-dark.png")}
                   resizeMode="contain"
                   alt="Logo de PuntoFiel"
                   className="w-80 h-20"
                 />
               </View>
       
          <Card className="bg-white p-6 rounded-2xl shadow-md mt-2 w-full">
            <Text className="text-xl font-bold text-[#2F4858] mb-4 text-center">
              Términos y Condiciones para Comercios Asociados
            </Text>

            <Text className="text-base font-semibold text-[#2F4858] mb-2">
              ¡Bienvenido a PuntoFiel para Negocios!
            </Text>

            <Text className="text-sm text-gray-700 leading-relaxed mb-4">
              Al usar esta aplicación y registrar tu negocio, aceptas los siguientes
              términos que regulan la relación entre tu negocio y la plataforma PuntoFiel.
            </Text>

            <Text className="text-base font-semibold text-[#2F4858] mb-1">
              1. Aceptación de los Términos
            </Text>
            <Text className="text-sm text-gray-700 leading-relaxed mb-4">
              El uso de la aplicación por parte de tu negocio constituye una aceptación
              plena de estos términos. Si no estás de acuerdo con ellos, no utilices la
              aplicación.
            </Text>

            <Text className="text-base font-semibold text-[#2F4858] mb-1">
              2. Uso de la Aplicación y del Sistema de Puntos
            </Text>
            <Text className="text-sm text-gray-700 leading-relaxed mb-4">
              <Text className="font-semibold">Responsabilidad del QR:</Text> Eres
              responsable de proteger y asegurar el código QR único de tu negocio.
              PuntoFiel no se hace responsable del uso no autorizado del QR si la seguridad
              fue comprometida por el comercio.{"\n\n"}
              <Text className="font-semibold">Asignación de Puntos:</Text> Te comprometes a
              asignar los puntos de manera justa y precisa a los clientes, según los
              parámetros acordados al momento del registro.{"\n\n"}
              <Text className="font-semibold">Canje de Recompensas:</Text> Debes respetar y
              canjear las recompensas por las que los clientes han acumulado y canjeado sus
              puntos. La calidad del producto o servicio canjeado es tu responsabilidad.
            </Text>

            <Text className="text-base font-semibold text-[#2F4858] mb-1">
              3. Datos del Negocio
            </Text>
            <Text className="text-sm text-gray-700 leading-relaxed mb-4">
              Al registrarte, garantizas que la información de tu negocio (nombre,
              dirección, logo, etc.) es verídica y está actualizada.{"\n"}
              Aceptas que PuntoFiel pueda mostrar esta información a los usuarios de la
              aplicación para fines de marketing y descubrimiento de negocios.
            </Text>

            <Text className="text-base font-semibold text-[#2F4858] mb-1">
              4. Privacidad y Datos del Cliente
            </Text>
            <Text className="text-sm text-gray-700 leading-relaxed mb-4">
              Te comprometes a respetar la privacidad de los clientes. Los datos de los
              clientes a los que puedas tener acceso a través de la aplicación no deben ser
              utilizados para fines distintos a la gestión de su cuenta en PuntoFiel, a
              menos que el cliente haya dado su consentimiento expreso.{"\n"}
              Prohíbes la venta, transferencia o cualquier otro tipo de divulgación de los
              datos personales de los clientes.
            </Text>

            <Text className="text-base font-semibold text-[#2F4858] mb-1">
              5. Mantenimiento y Disponibilidad
            </Text>
            <Text className="text-sm text-gray-700 leading-relaxed mb-4">
              Nos reservamos el derecho de suspender temporalmente el servicio para
              realizar mantenimiento o actualizaciones.{"\n"}
              PuntoFiel no garantiza que la plataforma esté libre de errores o que funcione
              sin interrupciones en todo momento.
            </Text>

            <Text className="text-base font-semibold text-[#2F4858] mb-1">
              6. Terminación del Servicio
            </Text>
            <Text className="text-sm text-gray-700 leading-relaxed mb-4">
              Puedes dar de baja a tu negocio de la plataforma en cualquier momento.{"\n"}
              PuntoFiel se reserva el derecho de suspender o terminar tu cuenta si se
              detecta un uso fraudulento, un incumplimiento de estos términos o si el
              negocio recibe múltiples quejas graves.
            </Text>

            <Text className="text-base font-semibold text-[#2F4858] mb-1">
              7. Limitación de Responsabilidad
            </Text>
            <Text className="text-sm text-gray-700 leading-relaxed mb-4">
              PuntoFiel es solo una plataforma tecnológica que facilita la fidelización.{"\n"}
              No somos responsables por disputas entre el comercio y el cliente, ni por la
              calidad de los productos o servicios ofrecidos por el negocio.{"\n"}
              No somos responsables por pérdidas financieras o de datos que puedan surgir
              del uso de la aplicación.
            </Text>

            <Text className="text-base font-semibold text-[#2F4858] mb-1">
              8. Modificaciones a los Términos
            </Text>
            <Text className="text-sm text-gray-700 leading-relaxed mb-4">
              Nos reservamos el derecho de modificar estos términos en cualquier momento.{"\n"}
              Te notificaremos sobre los cambios, y el uso continuado de la aplicación
              después de la notificación constituirá una aceptación de los nuevos términos.
            </Text>

            <Text className="text-base font-semibold text-[#2F4858] mb-1">
              9. Contacto
            </Text>
            <Text className="text-sm text-gray-700 leading-relaxed mb-6">
              Si tienes preguntas, contáctanos a través de la sección de Ayuda en la
              aplicación o envía un correo a{" "}
              <Text className="font-semibold text-[#2F4858]">
                punto.fiel@email.com
              </Text>.{"\n"}
              Última actualización: 13 de octubre de 2025.
            </Text>

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
