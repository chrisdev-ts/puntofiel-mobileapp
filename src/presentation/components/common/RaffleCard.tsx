import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { Icon } from "@/components/ui/icon";
import { Image } from "@/components/ui/image";
import { ArrowRightIcon, CalendarClockIcon, CheckSquare, ClockIcon, Gift, Trophy, XSquare } from "lucide-react-native";
import React from "react";
import { Pressable } from "react-native";

// --- Componente Auxiliar para el Icono de Estado ---
const RaffleStatusBadge = ({ status, isActive }: { status: 'won' | 'participating' | 'not_participating', isActive: boolean }) => {
    let IconComponent = XSquare;
    let bgColor = "bg-gray-500";
    let iconColor = "text-white";

    switch (status) {
        case 'won':
            IconComponent = Trophy;
            bgColor = "bg-yellow-500";
            break;
        case 'participating':
            IconComponent = CheckSquare;
            bgColor = isActive ? "bg-green-500" : "bg-gray-500";
            break;
        case 'not_participating':
            IconComponent = XSquare;
            bgColor = isActive ? "bg-red-500" : "bg-gray-500";
            break;
    }

    return (
        <Box className={`${bgColor} p-2 rounded-lg shadow-sm`}>
            <Icon as={IconComponent} size="md" className={iconColor} />
        </Box>
    );
};

interface RaffleCardProps {
    id: string;
    imageUrl?: string;
    imageAlt: string;
    title: string;
    onPress: (id: string) => void;
    // Props nuevas para control total desde el padre
    badgeText: string;
    badgeVariant: 'active' | 'inactive'; // active = azul, inactive = gris
    status: 'won' | 'participating' | 'not_participating';
}

export const RaffleCard: React.FC<RaffleCardProps> = ({
    id,
    imageUrl,
    imageAlt,
    title,
    onPress,
    badgeText,
    badgeVariant,
    status
}) => {

    const isBlue = badgeVariant === 'active';

    return (
        <Pressable onPress={() => onPress(id)}>
            <Box className="bg-white rounded-xl overflow-hidden mb-4 border border-gray-300 shadow-sm">

                {/* Área de la Imagen */}
                <Box className="relative w-full aspect-[16/9] bg-gray-100">
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} alt={imageAlt} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <Box className="w-full h-full justify-center items-center bg-gray-200">
                            <Icon as={Gift} size="xl" className="text-gray-400" />
                        </Box>
                    )}

                    {/* Icono de Estado */}
                    <Box className="absolute bottom-3 right-3 z-10">
                        <RaffleStatusBadge status={status} isActive={isBlue} />
                    </Box>
                </Box>

                {/* Contenido Inferior */}
                <Box className="p-4 flex-row justify-between items-center">
                    <Box className="flex-1 mr-4">
                        <Heading size="md" className="text-[#2F4858] mb-2 font-bold" numberOfLines={1}>{title}</Heading>

                        {/* Badge de tiempo Controlado */}
                        <Badge
                            action="muted"
                            variant="solid"
                            className={`rounded-full self-start px-3 py-1 ${isBlue ? 'bg-[#2F4858]' : 'bg-gray-600'}`}
                        >
                            <Box className="flex-row items-center gap-1">
                                <Icon as={isBlue ? ClockIcon : CalendarClockIcon} size="xs" className="text-white" />
                                <BadgeText className="text-white text-xs font-bold ml-1">
                                    {badgeText}
                                </BadgeText>
                            </Box>
                        </Badge>
                    </Box>

                    {/* Flecha */}
                    <Icon as={ArrowRightIcon} size="md" className="text-[#2F4858]" />
                </Box>
            </Box>
        </Pressable>
    );
};