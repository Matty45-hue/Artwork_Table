import { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Button } from 'primereact/button';
import { OverlayPanel } from 'primereact/overlaypanel';
import { InputText } from 'primereact/inputtext';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

// Define the structure for an artwork item
interface Artwork {
  id: number;
  title: string;
  place_of_origin: string | null;
  artist_display: string;
  inscriptions: string | null;
  date_start: number | null;
  date_end: number | null;
}

// Define the API response structure
interface ApiResponse {
  data: Artwork[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    total_pages: number;
    current_page: number;
  };
}

const App = () => {
  // State for storing the current page's artwork data
  const [data, setData] = useState<Artwork[]>([]);
  // Loading state for showing spinner during API calls
  const [loading, setLoading] = useState(false);
  // Current page number for pagination
  const [page, setPage] = useState(1);
  // Total number of records from API
  const [totalRecords, setTotalRecords] = useState(0);
  // Number of rows per page
  const rowsPerPage = 12;
  // Selected rows on the current page
  const [selectedRows, setSelectedRows] = useState<Artwork[]>([]);
  // Set of all selected artwork IDs across pages
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  // Input value for custom select count
  const [selectCount, setSelectCount] = useState('');
  // Reference to the overlay panel
  const overlayRef = useRef<OverlayPanel>(null);

  // Fetch data when page changes
  useEffect(() => {
    fetchData(page);
  }, [page]);

  // Update selected rows based on current data and selected IDs
  useEffect(() => {
    setSelectedRows(data.filter(row => selectedIds.has(row.id)));
  }, [data, selectedIds]);

  // Function to fetch artwork data from API
  const fetchData = async (pageNum: number) => {
    setLoading(true);
    try {
      const response = await fetch(`https://api.artic.edu/api/v1/artworks?page=${pageNum}`);
      const result: ApiResponse = await response.json();
      setData(result.data);
      setTotalRecords(result.pagination.total);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change from paginator
  const onPageChange = (event: any) => {
    setPage(event.page + 1);
  };

  // Handle selection changes in the table
  const onSelectionChange = (e: any) => {
    const newSelected = e.value;
    setSelectedRows(newSelected);
    const newIds = new Set(selectedIds);
    // Remove deselected items
    selectedRows.forEach(row => {
      if (!newSelected.find((r: Artwork) => r.id === row.id)) {
        newIds.delete(row.id);
      }
    });
    // Add newly selected items
    newSelected.forEach((row: Artwork) => {
      newIds.add(row.id);
    });
    setSelectedIds(newIds);
  };

  // Handle custom select button click
  const handleCustomSelect = () => {
    const count = parseInt(selectCount);
    if (!count || count <= 0 || count > data.length) {
      alert('Please enter a valid number <= ' + data.length);
      return;
    }
    // Select the first 'count' items from current page
    const toSelect = data.slice(0, count);
    const newIds = new Set(selectedIds);
    toSelect.forEach(row => newIds.add(row.id));
    setSelectedIds(newIds);
    overlayRef.current?.hide();
    setSelectCount('');
  };

  return (
    <div className="app-container">
      <h1>Artwork Table</h1>
      <p className="selected-count">Selected artworks: {selectedIds.size}</p>
      <div className="custom-select-section">
        <Button label="Custom Select" onClick={(e) => overlayRef.current?.toggle(e)} />
        <OverlayPanel ref={overlayRef} className="overlay-panel">
          <div>
            <InputText value={selectCount} onChange={(e) => setSelectCount(e.target.value)} placeholder="Number of rows" />
            <Button label="Select" onClick={handleCustomSelect} />
          </div>
        </OverlayPanel>
      </div>
      <div className="table-section">
        <DataTable
          value={data}
          loading={loading}
          selectionMode="multiple"
          selection={selectedRows}
          onSelectionChange={onSelectionChange}
          dataKey="id"
          paginator={false}
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
          <Column field="title" header="Title" />
          <Column field="place_of_origin" header="Place of Origin" />
          <Column field="artist_display" header="Artist" />
          <Column field="inscriptions" header="Inscriptions" />
          <Column field="date_start" header="Date Start" />
          <Column field="date_end" header="Date End" />
        </DataTable>
      </div>
      <div className="paginator-section">
        <Paginator
          first={(page - 1) * rowsPerPage}
          rows={rowsPerPage}
          totalRecords={totalRecords}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default App;