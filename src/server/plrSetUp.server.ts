import { createCollection } from "@rbxts/lapis";
import { Players, RunService } from "@rbxts/services";
import { Counter } from "shared/02_components/counter";
import { defaultPlayerSave } from "shared/02_components/plr";
import { count } from "shared/04_routers/count";
import { initPlayer } from "shared/04_routers/initPlayer";
import { removePlayer } from "shared/04_routers/removePlayer";
import { world } from "shared/05_ecs/world";

const collection = createCollection("players", {
	defaultData: defaultPlayerSave,
});

Players.PlayerAdded.Connect((player) => {
	collection.load(tostring(player.UserId)).then((document) => {
		if (!player.IsDescendantOf(Players)) {
			document.close();
			return;
		}

		const entity = world.entity();

		initPlayer({ entity, player, playerSave: document.read(), playerDocument: document });

		if (!RunService.IsStudio()) return;
		task.spawn(() => {
			while (task.wait(1)) {
				if (!world.has(entity, Counter)) break;
				count({ entity, amount: 1 });
			}
		});
	});
});

Players.PlayerRemoving.Connect((player) => {
	removePlayer({ player });
});
