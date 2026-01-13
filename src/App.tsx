import { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputText } from 'primereact/inputtext';

import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

type ArtItem = {
  id: number;
  title: string;
  place_of_origin: string | null;
  artist_display: string;
  inscriptions: string | null;
  date_start: number | null;
  date_end: number | null;
};

type ApiResult = {
  data: ArtItem[];
  pagination: {
    total: number;
  };
};

const PAGE_SIZE = 12;

export default function App() {
  const [rows, setRows] = useState<ArtItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordCount, setRecordCount] = useState(0);

  const [markedIds, setMarkedIds] = useState<Set<number>>(new Set());
  const [bulkCount, setBulkCount] = useState('');

  const panelRef = useRef<OverlayPanel>(null);

  useEffect(() => {
    loadPage(currentPage);
  }, [currentPage]);

  const loadPage = async (pageNo: number) => {
    setBusy(true);
    try {
      const res = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${pageNo}`
      );
      const json: ApiResult = await res.json();
      setRows(json.data);
      setRecordCount(json.pagination.total);
    } finally {
      setBusy(false);
    }
  };

  const activeSelection = rows.filter(r => markedIds.has(r.id));

  const handleSelection = (e: any) => {
    const updated = new Set(markedIds);
    const selected: ArtItem[] = e.value || [];

    rows.forEach(r => {
      if (updated.has(r.id) && !selected.find(s => s.id === r.id)) {
        updated.delete(r.id);
      }
    });

    selected.forEach(r => updated.add(r.id));
    setMarkedIds(updated);
  };

  const applyBulkSelect = () => {
    const n = Number(bulkCount);
    if (!n || n < 1 || n > rows.length) {
      alert(`Value must be between 1 and ${rows.length}`);
      return;
    }

    const updated = new Set(markedIds);
    rows.slice(0, n).forEach(r => updated.add(r.id));

    setMarkedIds(updated);
    setBulkCount('');
    panelRef.current?.hide();
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>Artwork Listing</h3>
      <div style={{ marginBottom: 10 }}>
        Selected: <strong>{markedIds.size}</strong>
      </div>

      <Button
        label="Custom Select"
        icon="pi pi-list"
        onClick={(e) => panelRef.current?.toggle(e)}
        style={{ marginBottom: 12 }}
      />

      <OverlayPanel ref={panelRef}>
        <InputText
          value={bulkCount}
          onChange={(e) => setBulkCount(e.target.value)}
          placeholder="Rows to select"
        />
        <Button
          label="Apply"
          onClick={applyBulkSelect}
          style={{ marginLeft: 8 }}
        />
      </OverlayPanel>

      <DataTable
        value={rows}
        loading={busy}
        dataKey="id"
        selectionMode="multiple"
        selection={activeSelection}
        onSelectionChange={handleSelection}
      >
        <Column selectionMode="multiple" style={{ width: 50 }} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Notes" />
        <Column field="date_start" header="From" />
        <Column field="date_end" header="To" />
      </DataTable>

      <Paginator
        first={(currentPage - 1) * PAGE_SIZE}
        rows={PAGE_SIZE}
        totalRecords={recordCount}
        onPageChange={(e) => setCurrentPage(e.page + 1)}
      />
    </div>
  );
}
