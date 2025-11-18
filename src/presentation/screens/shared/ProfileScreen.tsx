import { router } from "expo-router";
import { useState } from "react";
import { Pressable } from "react-native"; 
// Importaciones de UI
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import {
    Modal,
    ModalBackdrop,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
} from "@/components/ui/modal";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { Icon } from "@/components/ui/icon"; 
import { useAuth } from "@/src/presentation/hooks/useAuth"; 
import type { User } from "@/src/core/entities/User";

// Íconos de Lucide
import { 
    ChevronRightIcon, BellIcon, ShieldCheckIcon, HelpCircleIcon, BookIcon, 
    LogOutIcon, BarChart3Icon, StoreIcon, UserIcon, PhoneCallIcon, SettingsIcon, 
    MessageCircleIcon, XIcon, UserCheckIcon 
} from "lucide-react-native";

// --- Definición de Tipos y Componente NavItem (Sin cambios) ---

interface NavItemProps {
    title: string;
    icon: React.ComponentType<any>; 
    onPress: () => void;
}

const NavItem = ({ title, icon: IconComponent, onPress }: NavItemProps) => (
    <Pressable
        onPress={onPress}
        className="flex-row justify-between items-center py-3"
    >
        <HStack space="sm" className="items-center">
            <Icon as={IconComponent} size="md" className="text-typography-500" />
            <Text className="text-typography-700 text-base">{title}</Text>
        </HStack>
        <Icon as={ChevronRightIcon} size="md" className="text-typography-400" />
    </Pressable>
);


interface EditProfileFormProps {
    userData: any;
    onCancel: () => void;
    onSave: () => void;
    // Acepta la forma del DTO que entrega useAuth; usamos 'any' para ser compatible con la firma real.
    updateProfileAsync: (data: any) => Promise<any>;
}

const EditProfileForm = ({ userData, onCancel, onSave, updateProfileAsync }: EditProfileFormProps) => {
    
    // Inicializar estados con los datos actuales
    const [firstName, setFirstName] = useState(userData.firstName);
    const [lastName, setLastName] = useState(userData.lastName);
    const [email, setEmail] = useState(userData.email);
    const [phone, setPhone] = useState(userData.phone);
    const [isSaving, setIsSaving] = useState(false); 
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        
        try {
            // Se construye el objeto de actualización
            const dataToUpdate: Partial<User> = {
                firstName: firstName,
                lastName: lastName,
                email: email, 
                phone: phone,
            };

           
            await updateProfileAsync(dataToUpdate);

            console.log("[EditProfileForm] Datos guardados exitosamente.");
            onSave(); // Cierra el modal/formulario SOLO después del guardado exitoso
            
        } catch (err) {
            console.error("[EditProfileForm] Error al actualizar el perfil:", err);
            // Mostrar un mensaje de error legible
            const errorMessage = (err as Error)?.message || "Ocurrió un error al guardar los cambios.";
            setError(errorMessage);
            setIsSaving(false);
        }
    };

    return (
        <VStack space="xl" className="w-full p-4 bg-background-50 rounded-lg shadow-md">
            <HStack className="justify-between items-center">
                <Heading size="lg" className="text-typography-900 font-bold">
                    Editar Perfil
                </Heading>
                <Button variant="link" size="sm" onPress={onCancel} disabled={isSaving}>
                    <Icon as={XIcon} size="md" />
                </Button>
            </HStack>
            
            {/* Mensaje de error si existe */}
            {error && (
                <Text className="text-error-500 text-sm font-semibold p-2 bg-error-50 rounded-md">
                    Error: {error}
                </Text>
            )}

            <VStack space="lg">
                {/* Campo: Nombre */}
                <VStack space="xs">
                    <Text className="text-typography-500 text-sm">Nombre</Text>
                    <Input className="w-full" isDisabled={isSaving}> 
                        <InputField 
                            placeholder="Nombre(s)" 
                            value={firstName} 
                            onChangeText={setFirstName}
                        />
                    </Input>
                </VStack>
                
                {/* Campo: Apellido */}
                <VStack space="xs">
                    <Text className="text-typography-500 text-sm">Apellido</Text>
                    <Input className="w-full" isDisabled={isSaving}>
                        <InputField 
                            placeholder="Apellido(s)" 
                            value={lastName} 
                            onChangeText={setLastName}
                        />
                    </Input>
                </VStack>

                {/* Campo: Correo Electrónico (Lo hacemos solo lectura) */}
                <VStack space="xs">
                    <Text className="text-typography-500 text-sm">
                        Correo Electrónico (Solo lectura)
                    </Text>
                    <Input className="w-full" isDisabled={true}> 
                        <InputField 
                            placeholder="correo@ejemplo.com" 
                            value={userData.email} // Usamos el valor del prop, ya que no se edita directamente
                            keyboardType="email-address"
                            autoCapitalize="none" 
                        />
                    </Input>
                    <Text size="xs" className="text-typography-400">
                        El email solo puede ser cambiado desde la configuración de seguridad.
                    </Text>
                </VStack>

                {/* Campo: Teléfono */}
                <VStack space="xs">
                    <Text className="text-typography-500 text-sm">Teléfono</Text>
                    <Input className="w-full" isDisabled={isSaving}>
                        <InputField 
                            placeholder="+00 000-000-0000" 
                            value={phone} 
                            onChangeText={setPhone} 
                            keyboardType="phone-pad"
                        />
                    </Input>
                </VStack>
                
            </VStack>

            <Button size="md" onPress={handleSave} disabled={isSaving}>
                <HStack space="xs" className="items-center">
                    <Icon as={UserCheckIcon} size="sm" />
                    <ButtonText>
                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </ButtonText>
                </HStack>
            </Button>
        </VStack>
    );
};


// --- Componente Principal ProfileScreen ---

export default function ProfileScreen() {
    // 1. Accedemos al hook y desestructuramos la nueva función asíncrona
    const { user, logout, updateProfileAsync } = useAuth();
    
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isEditing, setIsEditing] = useState(false); 

    // Los datos del usuario ahora están actualizados gracias al onSuccess en useAuth
    const userData = {
        firstName: user?.firstName ?? "Nombre de usuario",
        lastName: user?.lastName ?? "",
        email: user?.email ?? "correo.usuario@email.com",
        phone: user?.phone ?? "+00 000-000-0000",
        role: user?.role ?? "user", 
        currentBalance: 550, // Saldo actual (mock)
    };

    const handleLogoutConfirm = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            setShowLogoutModal(false);
        } catch (error) {
            console.error("[ProfileScreen] Error al cerrar sesión:", error);
            setIsLoggingOut(false);
        }
    };

    if (!user) {
        return (
            <AppLayout headerVariant="default">
                <Text className="text-center text-typography-500">
                    No hay usuario autenticado
                </Text>
            </AppLayout>
        );
    }

    return (
        <AppLayout headerVariant="default" contentSpacing="lg">
            
            {/* Lógica de Alternancia: Mostrar formulario si isEditing es true */}
            {isEditing ? (
                <EditProfileForm 
                    userData={userData}
                    onCancel={() => setIsEditing(false)}
                    onSave={() => setIsEditing(false)}
                    // 2. Pasamos la nueva función asíncrona directamente
                    updateProfileAsync={updateProfileAsync} 
                />
            ) : (
                <VStack space="lg" className="items-center py-6">
                    
                    {/* Información básica del usuario */}
                    <VStack space="xs" className="items-center">
                        <Heading size="lg" className="text-typography-900 font-bold">
                            {userData.firstName} {userData.lastName}
                        </Heading>
                        <Text className="text-typography-500 text-sm">
                            {userData.email}
                        </Text>
                        {/* Número de Teléfono */}
                        <HStack space="xs" className="items-center">
                            <Icon as={PhoneCallIcon} size="xs" className="text-typography-500" />
                            <Text className="text-typography-500 text-sm">
                                {userData.phone}
                            </Text>
                        </HStack>
                        {/* Estatus/Rol "Administración" */}
                        <Text className="text-primary-600 text-xs font-semibold mt-1">
                            Administración
                        </Text>
                    </VStack>

                    {/* Saldo actual */}
                    <VStack space="xs" className="items-center bg-primary-100 p-3 rounded-md min-w-[150px]">
                        <Text className="text-primary-700 text-xs font-semibold">Saldo actual</Text>
                        <Heading size="md" className="text-primary-900 font-extrabold">{userData.currentBalance} puntos</Heading>
                    </VStack>

                    {/* Botón de Editar Perfil */}
                    <Button
                        size="md"
                        variant="link"
                        onPress={() => setIsEditing(true)}
                        className="w-full"
                    >
                        <HStack space="xs" className="items-center">
                            <Icon as={UserIcon} size="sm" />
                            <ButtonText>Editar perfil</ButtonText>
                        </HStack>
                    </Button>
                </VStack>
            )}
            
            <VStack className="border-t border-gray-200 w-full my-4" />

            {!isEditing && (
                <VStack space="md" className="w-full px-4">
                    
                    <Heading size="sm" className="text-typography-500 mt-2">Movimientos</Heading>
                    <NavItem 
                        title="Historial de movimientos" 
                        icon={BarChart3Icon} 
                        onPress={() => console.log("Navegar a Historial de movimientos")} 
                    />

                    {userData.role === "owner" && (
                        <NavItem 
                            title="Administrar locales vinculados" 
                            icon={StoreIcon} 
                            onPress={() => router.push("/(owner)/linked-locations" as any)} 
                        />
                    )}
                    
                    <Heading size="sm" className="text-typography-500 mt-4">Configuración</Heading>
                    <NavItem 
                        title="Preferencias" 
                        icon={SettingsIcon} 
                        onPress={() => console.log("Navegar a Preferencias")} 
                    />

                    <NavItem 
                        title="Notificaciones" 
                        icon={BellIcon} 
                        onPress={() => console.log("Navegar a Notificaciones")} 
                    />

                    <NavItem 
                        title="Seguridad" 
                        icon={ShieldCheckIcon} 
                        onPress={() => console.log("Navegar a Seguridad")} 
                    />

                    <Heading size="sm" className="text-typography-500 mt-4">Soporte</Heading>
                    <NavItem 
                        title="Soporte" 
                        icon={MessageCircleIcon} 
                        onPress={() => console.log("Navegar a Soporte")} 
                    />
                    
                    <NavItem 
                        title="Ayuda" 
                        icon={HelpCircleIcon} 
                        onPress={() => console.log("Navegar a Ayuda")} 
                    />

                    <NavItem 
                        title="Términos y Condiciones" 
                        icon={BookIcon} 
                        onPress={() => console.log("Navegar a Términos y Condiciones")} 
                    />

                    {/* Botón de Cerrar Sesión */}
                    <Button
                        size="lg"
                        action="negative"
                        variant="link" 
                        onPress={() => setShowLogoutModal(true)}
                        className="w-full mt-6 mb-10" 
                    >
                        <HStack space="sm" className="items-center justify-center">
                            <Icon as={LogOutIcon} size="md" className="text-error-500" />
                            <ButtonText>Cerrar sesión</ButtonText>
                        </HStack>
                    </Button>
                </VStack>
            )}

            {/* Modal de confirmación (Sin cambios) */}
            <Modal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                size="md"
            >
                <ModalBackdrop />
                <ModalContent>
                    <ModalHeader>
                        <Heading size="lg">Cerrar sesión</Heading>
                        <ModalCloseButton />
                    </ModalHeader>
                    <ModalBody>
                        <Text>¿Estás seguro de que deseas cerrar sesión?</Text>
                    </ModalBody>
                    <ModalFooter>
                        <HStack space="md" className="w-full">
                            <Button
                                variant="outline"
                                action="secondary"
                                className="flex-1"
                                onPress={() => setShowLogoutModal(false)}
                                disabled={isLoggingOut}
                            >
                                <ButtonText>Cancelar</ButtonText>
                            </Button>
                            <Button
                                action="negative"
                                className="flex-1"
                                onPress={handleLogoutConfirm}
                                disabled={isLoggingOut}
                            >
                                <ButtonText>
                                    {isLoggingOut ? "Cerrando..." : "Cerrar sesión"}
                                </ButtonText>
                            </Button>
                        </HStack>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </AppLayout>
    );
}