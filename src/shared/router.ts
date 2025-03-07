import { Players, ReplicatedStorage, RunService } from "@rbxts/services";
import { HOST, Host } from "./host";
import { schedule } from "./scheduler";

export type Action<Params extends defined> = { sender: Host; params: Params; isRemote?: boolean };

export type ConnectRequirement = "same_host" | "local_player" | "server" | "client" | "none";

export type Connection<Params extends defined> = {
	requirement: ConnectRequirement;
	callback: (params: Params, isRemote: boolean) => void;
};

export type Wrapper<Params extends defined> = { side: "client" | "server"; callback: (params: Params) => Params };

export type Payloader<Params extends defined> = () => Params[];

type RouteAttributes<Params extends defined> = {
	name: string;
	willSendFromClient: boolean;
	willSendFromServer: boolean;
	payloader: Payloader<Params>;

	connections: ReadonlyArray<Connection<Params>>;
	incomingWrappers: ReadonlyArray<Wrapper<Params>>;
	outgoingWrappers: ReadonlyArray<Wrapper<Params>>;
};

function getRemoteEvent(name: string) {
	let remoteEvent: RemoteEvent;
	if (RunService.IsServer()) {
		remoteEvent = new Instance("RemoteEvent");
		remoteEvent.Name = name;
		remoteEvent.Parent = ReplicatedStorage;
	} else {
		remoteEvent = ReplicatedStorage.WaitForChild(name) as RemoteEvent;
	}
	return remoteEvent;
}

export function router<Params extends defined>(attributes: RouteAttributes<Params>) {
	const queue: Action<Params>[] = [];

	const willSendFromClient = attributes.willSendFromClient;
	const willSendFromServer = attributes.willSendFromServer;
	const payloader = attributes.payloader;

	const connections = attributes.connections;
	const incomingWrappers = attributes.incomingWrappers;
	const outgoingWrappers = attributes.outgoingWrappers;

	const name = "ROUTE-" + attributes.name;
	const remoteEvent = getRemoteEvent(name);

	function processIncomingQueue(incomingQueue: ReadonlyArray<Action<Params>>) {
		incomingQueue.forEach(({ sender, params }) => {
			let incomingParams = params;
			incomingWrappers.forEach(({ side, callback }) => {
				if (side === "client" && !RunService.IsClient()) return;
				if (side === "server" && !RunService.IsServer()) return;
				incomingParams = callback(incomingParams);
			});
			queue.push({ params: incomingParams, sender, isRemote: true });
		});
	}

	if (RunService.IsServer()) {
		remoteEvent.OnServerEvent.Connect((_, incomingQueue) => {
			processIncomingQueue(incomingQueue as ReadonlyArray<Action<Params>>);
		});
	}
	if (RunService.IsClient()) {
		remoteEvent.OnClientEvent.Connect((incomingQueue) => {
			processIncomingQueue(incomingQueue as ReadonlyArray<Action<Params>>);
		});
	}

	if (RunService.IsServer()) {
		Players.PlayerAdded.Connect((player) => {
			const payloadQueue: Action<Params>[] = payloader().map((params) => ({
				params,
				sender: "server",
			}));
			remoteEvent.FireClient(player, payloadQueue);
		});
	}

	schedule({
		priority: math.huge,
		callback: () => {
			if (queue.isEmpty()) return;

			connections.forEach(({ requirement, callback }) => {
				if (requirement === "server" && !RunService.IsServer()) return;
				if (requirement === "client" && !RunService.IsClient()) return;
				queue.forEach(({ sender, params, isRemote }) => {
					if (requirement === "same_host" && sender !== HOST) return;
					if (requirement === "local_player" && sender !== Players.LocalPlayer) return;

					callback(params, isRemote === true);
				});
			});

			const outgoingQueue: Action<Params>[] = [];
			queue.forEach(({ sender, params, isRemote }) => {
				if (isRemote) return;
				let outgoingParams = params;
				outgoingWrappers.forEach(({ callback, side }) => {
					if (side === "client" && !RunService.IsClient()) return;
					if (side === "server" && !RunService.IsServer()) return;
					outgoingParams = callback(outgoingParams);
				});
				outgoingQueue.push({ sender, params: outgoingParams });
			});

			if (willSendFromClient && RunService.IsClient() && !outgoingQueue.isEmpty()) {
				remoteEvent.FireServer(outgoingQueue);
			}
			if (willSendFromServer && RunService.IsServer() && !outgoingQueue.isEmpty()) {
				remoteEvent.FireAllClients(outgoingQueue);
			}

			queue.clear();
		},
	});

	function route(params: Params) {
		queue.push({ params, sender: HOST });
	}

	return route;
}
