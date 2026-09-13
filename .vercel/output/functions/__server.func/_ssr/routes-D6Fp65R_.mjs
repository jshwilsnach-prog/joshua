import { i as __toESM } from "../_runtime.mjs";
import { I as require_jsx_runtime, L as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D6Fp65R_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Index() {
	const [Game, setGame] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		import("./GameRoot-DCirfrRA.mjs").then((m) => setGame(() => m.GameRoot));
	}, []);
	if (!Game) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fixed inset-0 bg-bg" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Game, {});
}
//#endregion
export { Index as component };
