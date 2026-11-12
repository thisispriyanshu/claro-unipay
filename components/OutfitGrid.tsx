"use client";

import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import type { ClientOutfitItem } from "@/lib/outfit";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function OutfitGrid({ items }: { items: ClientOutfitItem[] }) {
  return (
    <div className="ag-theme-quartz h-[220px] w-full overflow-hidden rounded-xl border border-line">
      <AgGridReact<ClientOutfitItem>
        theme="legacy"
        rowData={items}
        columnDefs={[
          { field: "slot", headerName: "Piece", flex: 1, minWidth: 88 },
          { field: "title", headerName: "Item", flex: 2, minWidth: 150 },
          { field: "merchant", headerName: "Store", flex: 1, minWidth: 110 },
          {
            field: "price",
            headerName: "Price",
            width: 92,
            valueFormatter: ({ value }) => `$${Number(value).toFixed(2)}`,
          },
        ]}
        defaultColDef={{ sortable: true, resizable: true }}
        headerHeight={36}
        rowHeight={42}
        domLayout="normal"
        suppressCellFocus
      />
    </div>
  );
}
