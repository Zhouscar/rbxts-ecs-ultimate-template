import React, { StrictMode } from "@rbxts/react";
import { createPortal, createRoot } from "@rbxts/react-roblox";
import { Players } from "@rbxts/services";

const root = createRoot(new Instance("Folder"));
const target = Players.LocalPlayer.WaitForChild("PlayerGui");

function App() {
	return <></>;
}

root.render(
	createPortal(
		<StrictMode>
			<App />
		</StrictMode>,
		target,
	),
);
