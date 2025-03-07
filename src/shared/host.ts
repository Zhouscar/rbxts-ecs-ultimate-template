import { Players, RunService } from "@rbxts/services";

export type Host = "server" | "unknown" | Player;
export const HOST: Host = RunService.IsServer() ? "server" : RunService.IsClient() ? Players.LocalPlayer : "unknown";
