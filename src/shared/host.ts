import { Players, RunService } from "@rbxts/services";

export type Host = Player | "SERVER" | "UNKNOWN";

export const HOST: Host = RunService.IsClient()
    ? Players.LocalPlayer
    : RunService.IsServer()
      ? "SERVER"
      : "UNKNOWN";
