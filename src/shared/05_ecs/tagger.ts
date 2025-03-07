import { Entity } from "@rbxts/jecs";
import { CollectionService, RunService } from "@rbxts/services";
import { world } from "./world";
import { initRenderable } from "shared/04_routers/initRenderable";

export function tagger(tagName: string, initializer: (entity: Entity) => void) {
	if (!RunService.IsServer()) return;

	function setup(instance: Instance) {
		assert(instance.IsA("Model"));
		const entity = world.entity();
		initRenderable({ entity, model: instance });
		initializer(entity);
		print(`Tag "${tagName}": ${entity}`);
	}

	CollectionService.GetTagged(tagName).forEach(setup);
	CollectionService.GetInstanceAddedSignal(tagName).Connect(setup);
}
