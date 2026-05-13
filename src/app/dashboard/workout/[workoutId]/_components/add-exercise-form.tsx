"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { addExerciseToWorkoutAction } from "../actions";

type Props = {
  workoutId: number;
  userExercises: { id: number; name: string }[];
};

export function AddExerciseForm({ workoutId, userExercises }: Props) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selected, setSelected] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const exerciseName = selected || inputValue.trim();

  function handleSelect(name: string) {
    setSelected(name);
    setInputValue(name);
    setOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!exerciseName) return;
    startTransition(async () => {
      await addExerciseToWorkoutAction({ workoutId, exerciseName });
      setSelected("");
      setInputValue("");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-64 justify-between"
            disabled={isPending}
          >
            {exerciseName || "Search or add exercise..."}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Type exercise name..."
              value={inputValue}
              onValueChange={(val) => {
                setInputValue(val);
                setSelected("");
              }}
            />
            <CommandList>
              <CommandEmpty>No match — will create new.</CommandEmpty>
              <CommandGroup>
                {userExercises.map((ex) => (
                  <CommandItem
                    key={ex.id}
                    value={ex.name}
                    onSelect={() => handleSelect(ex.name)}
                  >
                    <Check
                      className={`mr-2 size-4 ${selected === ex.name ? "opacity-100" : "opacity-0"}`}
                    />
                    {ex.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Button type="submit" disabled={isPending || !exerciseName}>
        {isPending ? "Adding..." : "Add Exercise"}
      </Button>
    </form>
  );
}
