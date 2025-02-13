import { ReplicatedStorage } from "@rbxts/services";

ReplicatedStorage.WaitForChild("shared")
    .GetDescendants()
    .filter((instance): instance is ModuleScript =>
        instance.IsA("ModuleScript"),
    )
    .forEach((module) => {
        const [ok, errMsg] = pcall(require, module);
        if (!ok) {
            warn(errMsg);
        }
    });
