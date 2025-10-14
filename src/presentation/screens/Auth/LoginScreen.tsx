// Pantalla de Login (View en el patrón MVVM).
// Contiene la lógica básica del ViewModel integrada en el mismo archivo.
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form-control";
import { Image } from "@/components/ui/image";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useState } from "react";
import { ScrollView, TouchableOpacity } from "react-native";

export const LoginScreen = () => {
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    console.log("Iniciando el proceso de login");
    if (!telefono || !password) {
      alert("Por favor, ingrese todos los campos");
    } else {
      alert(`Iniciando sesión con Teléfono: ${telefono} y Contraseña: ${password}`);
    }
  };

  const handleGoogleLogin = () => {
    alert("Inicio de sesión con Google");
  };

  const handleFacebookLogin = () => {
    alert("Inicio de sesión con Facebook");
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <Box className="flex-1 justify-center items-center bg-white px-6">

        {/* LOGO */}
        <Box className="items-center mb-6">
          <Image
            source={require("/assets/images/punto_fiel.png")}
            style={{ width: 140, height: 140, marginBottom: 10, borderRadius: 20 }}
            resizeMode="contain"
          />
          <Text className="text-3xl font-bold text-slate-800 mt-2">PuntoFiel</Text>
        </Box>

        {/* FORMULARIO */}
        <Box className="bg-white rounded-2xl shadow-md w-full p-6">
          <Text className="text-center text-2xl font-bold mb-2">
            Iniciar sesión
          </Text>
          <Text className="text-center text-gray-500 mb-6">
            Acceda a su billetera de puntos
          </Text>

          <FormControl className="mb-4">
            <Text className="mb-2 font-semibold">Número de teléfono</Text>
            <Input>
              <InputField
                placeholder="Ingrese su número de teléfono"
                keyboardType="phone-pad"
                onChangeText={setTelefono}
                value={telefono}
                placeholderTextColor="$gray400"
              />
            </Input>
          </FormControl>

          <FormControl className="mb-6">
            <Text className="mb-2 font-semibold">Contraseña</Text>
            <Input>
              <InputField
                placeholder="Ingrese su contraseña"
                secureTextEntry
                onChangeText={setPassword}
                value={password}
              />
            </Input>
          </FormControl>

          <Button action="primary" onPress={handleLogin} className="mb-4">
            <ButtonText>Iniciar sesión</ButtonText>
          </Button>


          <Button
            action="secondary"
            className="mb-3 flex-row items-center justify-center"
            onPress={handleGoogleLogin}
          >
            <ButtonText>Ingresar con Google</ButtonText>
          </Button>

          <Button
            action="secondary"
            className="flex-row items-center justify-center"
            onPress={handleFacebookLogin}
          >
            <ButtonText>Ingresar con Facebook</ButtonText>
          </Button>

          <Box className="mt-6 flex-row justify-center">
            <Text className="text-gray-600">¿No tiene cuenta? </Text>
            <TouchableOpacity onPress={() => alert("Registro")}>
              <Text className="text-blue-600 font-semibold">Regístrese gratis!</Text>
            </TouchableOpacity>
          </Box>
        </Box>
      </Box>
    </ScrollView>
  );
};
