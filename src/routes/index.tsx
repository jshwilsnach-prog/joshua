import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";

export const Route = createFileRoute("/")({
  component: Index,
  ssr: false,
});

function Index() {
  const [Game, setGame] = useState<ComponentType | null>(null);
  useEffect(() => {
    void import("../game/GameRoot").then((m) => setGame(() => m.GameRoot));
  }, []);
  if (!Game) {
    return <div className="fixed inset-0 bg-bg" />;
  }
  return <Game />;
}
