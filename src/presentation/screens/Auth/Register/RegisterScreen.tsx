import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Checkbox, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from "@/components/ui/checkbox";
import { FormControl, FormControlLabelText } from "@/components/ui/form-control";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Link, LinkText } from "@/components/ui/link";
import { Text } from "@/components/ui/text";
import { router } from "expo-router";
import { useState } from "react";
//import { useRegister } from "@/src/presentation/hooks/useRegister";

export function RegisterScreen() {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  //const { registerUser, isLoading, error } = useRegister();
  return (
    <Box className="flex-1 items-center bg-white px-8">
          {/*<Image
                size="2xl"
                source={require("../../../../../assets/images/LogoPuntoFiel.png")} // Fixed the image source syntax
                style={{
                        width: "100%",
                        maxWidth: 320,
                        aspectRatio: 320/208,
                    }}
                resizeMode="contain"
            />*/}
        <Heading className="m-4" size="2xl">Crear cuenta</Heading>
        <Text className=" text-center mb-4">Registrese para gestionar sus puntos y recompensas</Text>
        {/* Primer campo para nombre completo */}
        <FormControl className="mb-4 w-full">
           <FormControlLabelText> Nombre completo</FormControlLabelText>
           <Input>
           <InputField
           placeholder="Nombre y Apellido"
           onChangeText={setName}
           value={name}
           />
           </Input>
        </FormControl>
        {/* Segundo campo para teléfono */}
        <FormControl className="mb-4 w-full">
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
        <FormControl className="mb-4 w-full">
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
        {/**Cuarto campo para confirmar contraseña */}
        <FormControl className="mb-4 w-full">
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
        {/**Check box para términos y condiciones */}
        <FormControl className="mb-4 w-full">
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
        <FormControl className="mb-4 w-full">
            <Button variant="solid" action="primary">
          <ButtonText>Crear cuenta</ButtonText>
        </Button>
        </FormControl>
        <FormControl>
            <HStack>
      <Text size="lg">¿Ya tiene una cuenta?&nbsp;</Text>
      <Link onPress={() => router.navigate('/')}>
        <HStack>
          <LinkText size="lg">Inicie sesión</LinkText>
        </HStack>
      </Link>
    </HStack>
        </FormControl>
    </Box>
  );
}