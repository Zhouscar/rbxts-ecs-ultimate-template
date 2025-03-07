import { Entity } from "@rbxts/jecs";
import { world } from "../05_ecs/world";
import { Wrapper } from "shared/router";

const serverToClientRemoteEntityMap: Map<string, Entity> = new Map();
const clientToServerRemoteEntityMap: Map<string, Entity> = new Map();

export function getClientEntity(serverEntity: Entity): Entity {
	let clientEntity = serverToClientRemoteEntityMap.get(tostring(serverEntity));
	if (clientEntity === undefined) {
		clientEntity = world.entity();
		serverToClientRemoteEntityMap.set(tostring(clientEntity), serverEntity);
		clientToServerRemoteEntityMap.set(tostring(serverEntity), clientEntity);
	}
	return clientEntity;
}

export function getServerEntity(clientEntity: Entity): Entity {
	const serverEntity = clientToServerRemoteEntityMap.get(tostring(clientEntity));
	assert(serverEntity);
	return serverEntity;
}

type KeyOfType<T, V> = Extract<keyof T, { [K in keyof T]: T[K] extends V ? K : never }[keyof T]>;

export function getIncomingActionWithEntityWrapper<Params extends defined>(
	key: KeyOfType<Params, Entity>,
): Wrapper<Params> {
	return {
		side: "client",
		callback: (params) => ({
			...params,
			entity: getClientEntity(params[key] as Entity),
		}),
	};
}

export function getOutgoingActionWithEntityWrapper<Params extends defined>(
	key: KeyOfType<Params, Entity>,
): Wrapper<Params> {
	return {
		side: "client",
		callback: (params) => ({
			...params,
			entity: getServerEntity(params[key] as Entity),
		}),
	};
}
