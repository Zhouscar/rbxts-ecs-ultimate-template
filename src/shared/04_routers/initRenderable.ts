import { Entity } from "@rbxts/jecs";
import { world } from "shared/05_ecs/world";
import { router } from "shared/router";
import { despawn } from "./despawn";
import { getIncomingActionWithEntityWrapper, getOutgoingActionWithEntityWrapper } from "shared/03_states/remoteEntity";
import { Renderable, Streamable } from "shared/02_components/renderable";
import { SERVER_ENTITY_ATTRIBUTE_NAME } from "shared/01_constants/streaming";

interface InitRenderableParams {
	entity: Entity;
	model: Model;
}

export const initRenderable = router<InitRenderableParams>({
	name: "InitRenderable",
	willSendFromClient: false,
	willSendFromServer: true,
	payloader: () => {
		const queue: InitRenderableParams[] = [];
		for (const [entity, model] of world.query(Renderable)) {
			queue.push({ entity, model });
		}
		return queue;
	},
	connections: [
		{
			requirement: "server",
			callback: ({ entity, model }) => {
				assert(!world.has(entity, Renderable));
				world.set(entity, Renderable, model);
				model.SetAttribute(SERVER_ENTITY_ATTRIBUTE_NAME, entity);
				model.AddTag(SERVER_ENTITY_ATTRIBUTE_NAME);

				model.Destroying.Connect(() => {
					despawn({ entity });
				});

				print(`Server Renderable ${entity}`);
			},
		},
		{
			requirement: "client",
			callback: ({ entity }, isRemote) => {
				if (!isRemote) return;
				world.add(entity, Streamable);

				print(`Client Streamable ${entity}`);
			},
		},
	],
	incomingWrappers: [getIncomingActionWithEntityWrapper("entity")],
	outgoingWrappers: [getOutgoingActionWithEntityWrapper("entity")],
});
