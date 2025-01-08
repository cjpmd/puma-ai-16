import { useState } from "react";
import { usePlayersStore } from "@/store/players";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const TeamSettings = () => {
  const updateGlobalMultiplier = usePlayersStore((state) => state.updateGlobalMultiplier);
  const globalMultiplier = usePlayersStore((state) => state.globalMultiplier);

  return (
    <div className="min-h-screen bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto space-y-8"
      >
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold">Team Settings</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ronaldo Player Handicap</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Global Multiplier:</span>
              <Input
                type="number"
                value={globalMultiplier}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (value >= 1 && value <= 2) {
                    updateGlobalMultiplier(value);
                  }
                }}
                className="w-20"
                step="0.1"
                min="1"
                max="2"
              />
              <span className="text-sm text-muted-foreground">
                (Applies to all Ronaldo players)
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TeamSettings;