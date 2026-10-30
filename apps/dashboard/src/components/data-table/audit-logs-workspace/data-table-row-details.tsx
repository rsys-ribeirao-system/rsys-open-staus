"use client";

import type { RouterOutputs } from "@openstatus/api";

import {
  ChangesTable,
  buildAuditLogChangeRows,
} from "@/components/common/changes-table";
import { CopyRow } from "@/components/common/copy-row";

type AuditLog = RouterOutputs["auditLog"]["list"]["items"][number];

export function DataTableRowDetails({ row }: { row: AuditLog }) {
  const changes = buildAuditLogChangeRows(row);

  return (
    <div className="bg-muted/30 p-4">
      {changes.length ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="col-span-2 flex flex-col gap-2">
            <div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Alterações
            </div>
            <ChangesTable changes={changes} />
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Registro
            </div>
            <dl className="flex flex-col gap-1.5">
              <CopyRow label="Tipo de entidade" value={row.entityType} />
              <CopyRow label="ID da entidade" value={row.entityId} />
              <CopyRow label="Tipo de autor" value={row.actorType} />
              <CopyRow label="ID do autor" value={row.actorId} />
              {row.user?.name ? (
                <CopyRow label="Nome do usuário" value={row.user.name} />
              ) : null}
              {row.user?.email ? (
                <CopyRow label="E-mail do usuário" value={row.user.email} />
              ) : null}
            </dl>
          </div>
        </div>
      ) : null}
    </div>
  );
}
