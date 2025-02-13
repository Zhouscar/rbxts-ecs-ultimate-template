import { Entity, get, has, set, spawn, Wrap } from "@rbxts/flamecs";
import { Relay } from "./relay";
import { setUpRemoteEntityMiddleware } from "./remoteEntity";

interface Counter extends Wrap<number> {}

const AddCounter = new Relay<{ entity: Entity; amount: number }>("AddCounter", {
    willSendToClient: true,
    willSendToServer: true,
});
setUpRemoteEntityMiddleware(AddCounter);

AddCounter.connect("none", ({ entity: e, amount }) => {
    if (!has<Counter>(e)) return;
    set<Counter>(e, get<Counter>(e)! + amount);
});

const counter = spawn<[Counter]>([1]);
AddCounter.relay({ entity: counter, amount: 1 });
