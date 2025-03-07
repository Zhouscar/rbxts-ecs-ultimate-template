import { Document } from "@rbxts/lapis";
import { world } from "shared/05_ecs/world";

export type PlayerSave = Readonly<{
	counter: number;
}>;

export const defaultPlayerSave: PlayerSave = {
	counter: 0,
};

export const Plr = world.component<{ player: Player; playerSave: PlayerSave; playerDocument: Document<PlayerSave> }>();
export const LocalPlr = world.component<undefined>();
