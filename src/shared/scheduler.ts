import { RunService } from "@rbxts/services";

type System = { priority: number; callback: () => void };

const systems: System[] = [];

export const DEFAULT_PRIORITY = 0;

export function schedule(system: System) {
	systems.push(system);
	systems.sort((a, b) => a.priority < b.priority);
}

RunService.Heartbeat.Connect(() => {
	systems.forEach(({ callback }) => {
		callback();
	});
});
