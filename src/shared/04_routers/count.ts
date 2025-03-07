import { Entity } from "@rbxts/jecs";
import { getPlayerSaveConnection } from "shared/01_constants/saves";
import { Counter } from "shared/02_components/counter";
import { getIncomingActionWithEntityWrapper, getOutgoingActionWithEntityWrapper } from "shared/03_states/remoteEntity";
import { world } from "shared/05_ecs/world";
import { router } from "shared/router";

interface CountParams {
	entity: Entity;
	amount: number;
}

export const count = router<CountParams>({
	name: "Count",
	willSendFromClient: false,
	willSendFromServer: true,
	payloader: () => [],
	connections: [
		getPlayerSaveConnection((save, { amount }) => ({ ...save, counter: save.counter + amount })),
		{
			requirement: "none",
			callback: ({ entity, amount }) => {
				world.set(entity, Counter, (world.get(entity, Counter) ?? 0) + amount);
				print(`Counter ${entity}: ${world.get(entity, Counter)}`);
			},
		},
	],
	incomingWrappers: [getIncomingActionWithEntityWrapper("entity")],
	outgoingWrappers: [getOutgoingActionWithEntityWrapper("entity")],
});
