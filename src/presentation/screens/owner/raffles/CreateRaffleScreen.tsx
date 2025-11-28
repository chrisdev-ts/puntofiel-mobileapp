import RaffleForm from "@/src/presentation/components/raffles/RaffleForm";

export default function CreateRaffleScreen() {
	// mode="create" le dice al formulario que inicie vacío y use la mutación de crear
	return <RaffleForm mode="create" />;
}
