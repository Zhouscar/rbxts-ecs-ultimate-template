import { Players, RunService } from "@rbxts/services";
import { world } from "shared/05_ecs/world";
import { router } from "shared/router";
import { despawn } from "./despawn";
import { playerEntityMap } from "shared/03_states/playerEntity";
import { Plr } from "shared/02_components/plr";

interface RemovePlayerParams {
	player: Player;
}

export const removePlayer = router<RemovePlayerParams>({
	name: "RemovePlayer",
	willSendFromClient: false,
	willSendFromServer: true,
	payloader: () => [],
	connections: [
		{
			requirement: "none",
			callback: ({ player }) => {
				const entity = playerEntityMap.get(player);
				if (entity === undefined) return;

				if (RunService.IsServer()) {
					const plr = world.get(entity, Plr);
					if (plr !== undefined) {
						plr.playerDocument.close();
					}
				}

				despawn({ entity });
				playerEntityMap.delete(player);

				if (RunService.IsServer() || player === Players.LocalPlayer) {
					player.Kick();
				}

				print(`Remove player ${entity}: ${player}`);
			},
		},
	],
	incomingWrappers: [],
	outgoingWrappers: [],
});
