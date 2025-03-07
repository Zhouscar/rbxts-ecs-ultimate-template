import { Entity } from "@rbxts/jecs";
import { Document } from "@rbxts/lapis";
import { Players } from "@rbxts/services";
import { getIncomingActionWithEntityWrapper, getOutgoingActionWithEntityWrapper } from "shared/03_states/remoteEntity";
import { world } from "shared/05_ecs/world";
import { router } from "shared/router";
import { playerEntityMap } from "shared/03_states/playerEntity";
import { LocalPlr, PlayerSave, Plr } from "shared/02_components/plr";
import { FAKE_DOCUMENT } from "shared/01_constants/saves";
import { Counter } from "shared/02_components/counter";

interface InitPlayerParams {
	player: Player;
	playerSave: PlayerSave;
	playerDocument: Document<PlayerSave>;
	entity: Entity;
}

export const initPlayer = router<InitPlayerParams>({
	name: "InitPlayer",
	willSendFromClient: false,
	willSendFromServer: true,
	payloader: () => {
		const queue: InitPlayerParams[] = [];
		for (const [entity, { player, playerSave, playerDocument }] of world.query(Plr)) {
			queue.push({ entity, player, playerSave, playerDocument });
		}
		return queue;
	},
	connections: [
		{
			requirement: "none",
			callback: ({ entity, player, playerSave, playerDocument }) => {
				playerEntityMap.set(player, entity);
				world.set(entity, Plr, { player, playerSave, playerDocument });

				if (player === Players.LocalPlayer) {
					world.add(entity, LocalPlr);
				}

				// init other components
				world.set(entity, Counter, playerSave.counter);
				// \init other components

				print(`Init player ${entity}: ${player}`);
				print(playerSave);
			},
		},
	],
	incomingWrappers: [getIncomingActionWithEntityWrapper("entity")],
	outgoingWrappers: [
		getOutgoingActionWithEntityWrapper("entity"),
		{ side: "server", callback: (params) => ({ ...params, playerDocument: FAKE_DOCUMENT }) },
	],
});
