import { useState } from "react";
import { Fixture } from "@/types/fixture";

export const useCalendarState = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [isAddSessionOpen, setIsAddSessionOpen] = useState(false);
  const [isAddFixtureOpen, setIsAddFixtureOpen] = useState(false);
  const [isAddFriendlyOpen, setIsAddFriendlyOpen] = useState(false);
  const [isAddTournamentOpen, setIsAddTournamentOpen] = useState(false);
  const [isAddFestivalOpen, setIsAddFestivalOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [editingFixture, setEditingFixture] = useState<Fixture | null>(null);
  const [editingFestival, setEditingFestival] = useState(null);
  const [isEditObjectiveOpen, setIsEditObjectiveOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState(null);
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});
  const [isTeamSelectionOpen, setIsTeamSelectionOpen] = useState(false);

  return {
    date,
    setDate,
    isAddSessionOpen,
    setIsAddSessionOpen,
    isAddFixtureOpen,
    setIsAddFixtureOpen,
    isAddFriendlyOpen,
    setIsAddFriendlyOpen,
    isAddTournamentOpen,
    setIsAddTournamentOpen,
    isAddFestivalOpen,
    setIsAddFestivalOpen,
    isAddMenuOpen,
    setIsAddMenuOpen,
    editingFixture,
    setEditingFixture,
    editingFestival,
    setEditingFestival,
    isEditObjectiveOpen,
    setIsEditObjectiveOpen,
    editingObjective,
    setEditingObjective,
    fileUrls,
    setFileUrls,
    isTeamSelectionOpen,
    setIsTeamSelectionOpen,
  };
};