import { Entity } from "@rbxts/jecs";
import { CollectionService } from "@rbxts/services";
import { world } from "shared/05_ecs/world";
import { getClientEntity } from "shared/03_states/remoteEntity";
import { SERVER_ENTITY_ATTRIBUTE_NAME, STREAMABLE_TAG_NAME } from "shared/01_constants/streaming";
import { Renderable } from "shared/02_components/renderable";

const set = (instance: Instance) => {
	const entity = getClientEntity(instance.GetAttribute(SERVER_ENTITY_ATTRIBUTE_NAME) as Entity);
	world.set(entity, Renderable, instance as Model);
	print(`Stream in ${entity}`);
};
const remove = (instance: Instance) => {
	const entity = getClientEntity(instance.GetAttribute(SERVER_ENTITY_ATTRIBUTE_NAME) as Entity);
	world.remove(entity, Renderable);
	print(`Stream out ${entity}`);
};

CollectionService.GetTagged(STREAMABLE_TAG_NAME).forEach(set);
CollectionService.GetInstanceAddedSignal(STREAMABLE_TAG_NAME).Connect(set);
CollectionService.GetInstanceRemovedSignal(STREAMABLE_TAG_NAME).Connect(remove);
