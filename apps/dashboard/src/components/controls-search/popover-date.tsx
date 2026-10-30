import { Button } from "@openstatus/ui/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@openstatus/ui/components/ui/popover";
import { endOfDay, startOfDay, subDays, subHours } from "date-fns";
import { parseAsIsoDateTime, useQueryState } from "nuqs";
import { useEffect, useMemo, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";

import { DatePicker } from "@/components/date-picker";
import { formatDateRange } from "@/lib/formatter";

export function PopoverDate() {
  const [open, setOpen] = useState(false);
  const today = useRef(new Date());
  const [from, setFrom] = useQueryState(
    "from",
    parseAsIsoDateTime.withDefault(startOfDay(today.current)),
  );
  const [to, setTo] = useQueryState(
    "to",
    parseAsIsoDateTime.withDefault(endOfDay(today.current)),
  );
  const [range, setRange] = useState<DateRange>({ from, to });

  const presets = useMemo(
    () => [
      {
        id: "today",
        label: "Hoje",
        values: {
          from: startOfDay(today.current),
          to: endOfDay(today.current),
        },
        shortcut: "t",
      },
      {
        id: "yesterday",
        label: "Ontem",
        values: {
          from: startOfDay(subDays(today.current, 1)),
          to: endOfDay(subDays(today.current, 1)),
        },
        shortcut: "y",
      },
      {
        id: "lastHour",
        label: "Última hora",
        values: {
          from: subHours(today.current, 1),
          to: today.current,
        },
        shortcut: "h",
      },
      {
        id: "last6Hours",
        label: "Últimas 6 horas",
        values: {
          from: subHours(today.current, 5),
          to: today.current,
        },
        shortcut: "s",
      },
      {
        id: "last24Hours",
        label: "Últimas 24 horas",
        values: {
          from: subHours(today.current, 23),
          to: today.current,
        },
        shortcut: "d",
      },
      {
        id: "last7Days",
        label: "Últimos 7 dias",
        values: {
          from: subDays(today.current, 6),
          to: today.current,
        },
        shortcut: "w",
      },
      {
        id: "last14Days",
        label: "Últimos 14 dias",
        values: {
          from: subDays(today.current, 13),
          to: today.current,
        },
        shortcut: "b",
      },
    ],
    [today],
  );

  //   instead use `range` state
  const selected = presets.find((period) => {
    return (
      from.getTime() === period.values.from.getTime() &&
      to.getTime() === period.values.to.getTime()
    );
  });

  useEffect(() => {
    if (!open) {
      setFrom(range.from ?? null);
      setTo(range.to ?? null);
    }
  }, [open]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (!open) return;

      presets.map((preset) => {
        if (preset.shortcut === e.key) {
          setFrom(preset.values.from);
          setTo(preset.values.to);
          setRange({ from: preset.values.from, to: preset.values.to });
        }
      });
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [presets, open, setFrom, setTo]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          {selected?.label ?? formatDateRange(from, to)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" side="bottom" align="start">
        <DatePicker presets={presets} range={range} onSelect={setRange} />
      </PopoverContent>
    </Popover>
  );
}
