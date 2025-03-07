import { Entity } from "@rbxts/jecs";
import { world } from "shared/05_ecs/world";
import { getIncomingActionWithEntityWrapper, getOutgoingActionWithEntityWrapper } from "shared/03_states/remoteEntity";
import { router } from "shared/router";
import { Renderable, Streamable } from "shared/02_components/renderable";

interface DespawnParams {
	entity: Entity;
}

export const despawn = router<DespawnParams>({
	name: "Despawn",
	willSendFromClient: false,
	willSendFromServer: true,
	payloader: () => [],
	connections: [
		{
			requirement: "none",
			callback: ({ entity }, isRemote) => {
				if (!isRemote && world.has(entity, Streamable)) return;

				const model = world.get(entity, Renderable);
				if (model !== undefined) {
					model.Destroy();
				}
				world.delete(entity);
				print(`Despawn ${entity}`);
			},
		},
	],
	incomingWrappers: [getIncomingActionWithEntityWrapper("entity")],
	outgoingWrappers: [getOutgoingActionWithEntityWrapper("entity")],
});
