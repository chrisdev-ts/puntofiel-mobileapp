import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { EmployeeActionModal } from "@/src/presentation/components/employees/EmployeeActionModal";
import { EmployeeForm } from "@/src/presentation/components/employees/EmployeeForm";
import type { CreateEmployeeFormData } from "@/src/presentation/components/employees/EmployeeSchema";
import { AppLayout } from "@/src/presentation/components/layout/AppLayout";
import { useBusinessId } from "@/src/presentation/hooks/useBusinessId";
import { useEmployee } from "@/src/presentation/hooks/useEmployee";

/**
 * Pantalla para crear un nuevo empleado
 */
export default function CreateEmployeeScreen() {
    const router = useRouter();
    const { data: businessId } = useBusinessId();
    const { createEmployee, isCreatingEmployee } = useEmployee(businessId);

    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        variant: "success" | "error";
        employeeId?: number;
    }>({
        isOpen: false,
        variant: "success",
    });

    const handleFormSubmit = async (data: CreateEmployeeFormData) => {
        if (!businessId) {
            alert("No se pudo obtener el ID del negocio");
            return;
        }

        createEmployee(
            {
                firstName: data.firstName,
                lastName: data.lastName,
                secondLastName: data.secondLastName,
                email: data.email,
                password: data.password,
                businessId: businessId,
            },
            {
                onSuccess: (employee) => {
                    setModalState({
                        isOpen: true,
                        variant: "success",
                        employeeId: employee.id,
                    });
                },
                onError: (error) => {
                    console.error("Error al crear empleado:", error);
                    setModalState({
                        isOpen: true,
                        variant: "error",
                    });
                },
            },
        );
    };

    const handleModalClose = () => {
        setModalState((prev) => ({ ...prev, isOpen: false }));

        if (modalState.variant === "success" && modalState.employeeId) {
            router.push(`/(owner)/employees/${modalState.employeeId}`);
        }
    };

    return (
        <AppLayout
            showHeader={true}
            showNavBar={false}
            scrollable={true}
            headerVariant="back"
        >
            <VStack space="lg" className="w-full">
                <Heading size="xl" className="text-primary-500">
                    Crear cuenta de empleado
                </Heading>

                <Text className="text-typography-600">
                    Completa el formulario para crear una nueva cuenta de empleado. Las
                    credenciales se generarán automáticamente.
                </Text>

                <EmployeeForm
                    onSubmit={handleFormSubmit}
                    isLoading={isCreatingEmployee}
                    mode="create"
                />
            </VStack>

            <EmployeeActionModal
                isOpen={modalState.isOpen}
                onClose={handleModalClose}
                variant={modalState.variant}
                mode="create"
            />
        </AppLayout>
    );
}