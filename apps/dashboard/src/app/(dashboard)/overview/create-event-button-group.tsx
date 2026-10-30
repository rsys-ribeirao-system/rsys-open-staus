"use client";

import { ChevronDown, Add } from "@openstatus/icons";
import { Button } from "@openstatus/ui/components/ui/button";
import { ButtonGroup } from "@openstatus/ui/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@openstatus/ui/components/ui/dropdown-menu";
import { useState } from "react";

import { FormSheetMaintenanceCreate } from "@/components/forms/maintenance/sheet-create";
import { FormSheetStatusReportCreate } from "@/components/forms/status-report/sheet-create";

export function CreateEventButtonGroup() {
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);

  return (
    <div>
      <ButtonGroup>
        <FormSheetStatusReportCreate>
          <Button data-section="action" variant="outline" size="sm">
            <Add />
            Criar relatório de status
          </Button>
        </FormSheetStatusReportCreate>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              aria-label="Mais opções de criação"
              className="pl-2!"
            >
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setMaintenanceOpen(true)}>
              <Add className="text-muted-foreground" />
              Criar manutenção
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
      <FormSheetMaintenanceCreate
        open={maintenanceOpen}
        onOpenChange={setMaintenanceOpen}
      />
    </div>
  );
}
