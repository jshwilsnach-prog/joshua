import { createRoot } from "react-dom/client";
import { GameRoot } from "../src/game/GameRoot";
import "../src/styles.css";

createRoot(document.getElementById("root")!).render(<GameRoot />);
