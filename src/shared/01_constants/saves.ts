import { Entity } from "@rbxts/jecs";
import { Document } from "@rbxts/lapis";
import { RunService } from "@rbxts/services";
import { PlayerSave, Plr } from "shared/02_components/plr";
import { world } from "shared/05_ecs/world";
import { Connection } from "shared/router";

export const FAKE_DOCUMENT = undefined as unknown as Document<PlayerSave>;

export function getPlayerSaveConnection<Params extends { entity: Entity }>(
	updater: (save: PlayerSave, params: Params) => PlayerSave,
): Connection<Params> {
	return {
		requirement: "none",
		callback: (params) => {
			const plr = world.get(params.entity, Plr);
			if (plr === undefined) return;

			const newSave = updater(plr.playerSave, params);
			plr.playerSave = newSave;

			if (RunService.IsServer()) {
				plr.playerDocument.write(newSave);
			}
		},
	};
}
