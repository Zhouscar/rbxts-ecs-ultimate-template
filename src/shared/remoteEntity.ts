import { Entity, spawn } from "@rbxts/flamecs";
import { Relay } from "./relay";

const serverToClientRemoteEntityMap: Map<string, Entity> = new Map();
const clientToServerRemoteEntityMap: Map<string, Entity> = new Map();

export function getClientEntity(serverEntity: Entity) {
    let clientEntity = serverToClientRemoteEntityMap.get(
        tostring(serverEntity),
    );
    if (clientEntity === undefined) {
        clientEntity = spawn();
        serverToClientRemoteEntityMap.set(tostring(clientEntity), serverEntity);
        clientToServerRemoteEntityMap.set(tostring(serverEntity), clientEntity);
    }
    return clientEntity;
}

export function getServerEntity(clientEntity: Entity) {
    const serverEntity = clientToServerRemoteEntityMap.get(
        tostring(clientEntity),
    );
    assert(serverEntity);
    return serverEntity;
}

export function setUpRemoteEntityMiddleware<T extends { entity: Entity }>(
    relay: Relay<T>,
) {
    relay.addMiddleware("client", "incoming", (data) => ({
        ...data,
        entity: getClientEntity(data.entity),
    }));
    relay.addMiddleware("client", "outgoing", (data) => ({
        ...data,
        entity: getServerEntity(data.entity),
    }));
}
