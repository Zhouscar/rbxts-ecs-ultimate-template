import { start } from "@rbxts/flamecs";
import { ReplicatedStorage, RunService } from "@rbxts/services";
import { HOST, Host } from "./host";

const loops: (() => void)[] = [];
start({}, () => {
    loops.forEach((loop) => {
        loop();
    });
});

interface RelayOptions {
    willSendToServer: boolean;
    willSendToClient: boolean;
}

type ConnectRequirement =
    | "same_host"
    | "local_player"
    | "server"
    | "client"
    | "none";

type MiddlewareSide = "client" | "server";
type MiddlewareDirection = "incoming" | "outgoing";

export class Relay<T extends defined> {
    private queue: { host: Host; data: T }[] = [];
    private connections: {
        requirement: ConnectRequirement;
        fn: (data: T) => void;
    }[] = [];
    private incomingMiddlewares: ((data: T) => T)[] = [];
    private outgoingMiddlewares: ((data: T) => T)[] = [];

    private remoteEvent: RemoteEvent;
    private options: RelayOptions;

    constructor(relayName: string, options: RelayOptions) {
        this.options = options;

        if (RunService.IsServer()) {
            this.remoteEvent = new Instance("RemoteEvent");
            this.remoteEvent.Name = relayName;
            this.remoteEvent.Parent = ReplicatedStorage;

            this.remoteEvent.OnServerEvent.Connect((_, _item) => {
                const item = _item as { host: Host; data: T };
                this.remoteRelay(item);
            });
        } else {
            this.remoteEvent = ReplicatedStorage.WaitForChild(
                relayName,
            ) as RemoteEvent;

            this.remoteEvent.OnClientEvent.Connect((_item) => {
                const item = _item as { host: Host; data: T };
                this.remoteRelay(item);
            });
        }

        loops.push(() => {
            this.connections.forEach(({ fn, requirement }) => {
                this.queue.forEach(({ host, data }) => {
                    if (
                        requirement === "local_player" &&
                        (host !== HOST || !RunService.IsClient())
                    )
                        return;
                    if (requirement === "local_player" && host !== HOST) return;
                    fn(data);
                });
            });
            this.queue.clear();
        });
    }

    private remoteRelay(item: { host: Host; data: T }) {
        let newData = item.data;
        this.incomingMiddlewares.forEach((middleware) => {
            newData = middleware(newData);
        });
        this.queue.push({ data: newData, host: HOST });
    }

    public relay(data: T) {
        const item = { host: HOST, data: data };
        this.queue.push(item);

        if (this.options.willSendToClient && RunService.IsServer()) {
            let newData = item.data;
            this.outgoingMiddlewares.forEach((middleware) => {
                newData = middleware(newData);
            });
            this.remoteEvent.FireAllClients({ data: newData, host: HOST });
        }
        if (this.options.willSendToServer && RunService.IsClient()) {
            let newData = item.data;
            this.outgoingMiddlewares.forEach((middleware) => {
                newData = middleware(newData);
            });
            this.remoteEvent.FireServer({ data: newData, host: HOST });
        }
    }

    public connect(requirement: ConnectRequirement, fn: (data: T) => void) {
        if (requirement === "client" && !RunService.IsClient()) return;
        if (requirement === "server" && !RunService.IsServer()) return;

        this.connections.push({ requirement, fn });
    }

    public addMiddleware(
        side: MiddlewareSide,
        direction: MiddlewareDirection,
        middleware: (data: T) => T,
    ) {
        if (side === "client" && !RunService.IsClient()) return;
        if (side === "server" && !RunService.IsServer()) return;

        if (direction === "incoming") {
            this.incomingMiddlewares.push(middleware);
        } else {
            this.outgoingMiddlewares.push(middleware);
        }
    }
}
