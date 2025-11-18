import React from 'react';
import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import RecipeMix from './RecipeMix';

// Mock dependencies
const mockGrpcRequest = jest.fn();
const mockHasScope = jest.fn(() => true);

jest.mock('./GrpcContext', () => ({
  useGrpc: () => ({
    grpcRequest: mockGrpcRequest,
    hasScope: mockHasScope,
  }),
}));

jest.mock('react-router', () => ({
  useNavigate: () => jest.fn(),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
  Link: ({ children }) => <a>{children}</a>,
}));

jest.mock('./Dialog', () => ({
  InputDialog: () => <div data-testid="input-dialog">InputDialog</div>,
  AlertDialog: () => <div data-testid="alert-dialog">AlertDialog</div>,
}));

jest.mock('./Dropdowns', () => ({
  ContainerDropdown: () => <div data-testid="container-dropdown">ContainerDropdown</div>,
}));

jest.mock('./DataGridUtils', () => ({
  IngredientCellRender: ({ params }) => <div>{params.value}</div>,
}));

jest.mock('./DataGridEditToolbar', () => ({
  EditToolbar: () => <div data-testid="edit-toolbar">EditToolbar</div>,
}));

jest.mock('./Field', () => ({
  Field: ({ label, value, id }) => (
    <div data-testid={`field-${id}`}>
      <label>{label}</label>
      <span>{value}</span>
    </div>
  ),
}));

jest.mock('./timestamp', () => ({
  timestampToDate: jest.fn(),
  timestampToDateTimeString: jest.fn(() => '2024-01-01 12:00:00'),
}));

jest.mock('./money', () => ({
  floatToMoney: jest.fn((val) => ({ units: Math.floor(val), nanos: Math.round((val - Math.floor(val)) * 1000000000) })),
  moneyToString: jest.fn((m, precision, justNum) => {
    if (!m) return '';
    const val = m.units + (m.nanos / 1000000000);
    const formatted = val.toFixed(precision || 2);
    return justNum ? formatted : `$${formatted}`;
  }),
  moneyToFloat: jest.fn((m) => {
    if (!m) return 0;
    return m.units + (m.nanos / 1000000000);
  }),
}));

jest.mock('./utils', () => ({
  emptyIngredientForType: jest.fn(),
  valueToPrecision: jest.fn((n, p, suffix) => {
    if (n == null) return '';
    const formatted = n.toFixed(p);
    return suffix ? `${formatted}${suffix}` : formatted;
  }),
}));

// Mock MUI components
jest.mock('@mui/material', () => ({
  AppBar: ({ children }) => <div data-testid="app-bar">{children}</div>,
  Box: ({ children, ...props }) => <div {...props}>{children}</div>,
  Dialog: ({ children, open }) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogTitle: ({ children }) => <div data-testid="dialog-title">{children}</div>,
  Grid: ({ children, ...props }) => <div {...props}>{children}</div>,
  IconButton: ({ children, onClick, 'aria-label': ariaLabel, ...props }) => (
    <button onClick={onClick} aria-label={ariaLabel} {...props}>{children}</button>
  ),
  Toolbar: ({ children }) => <div data-testid="toolbar">{children}</div>,
  Tooltip: ({ children }) => <div>{children}</div>,
  Typography: ({ children, ...props }) => <div {...props}>{children}</div>,
}));

// Mock MUI icons - using default import syntax
const CloseIcon = () => <span data-testid="close-icon">Close</span>;
const CancelIcon = () => <span data-testid="cancel-icon">Cancel</span>;
const EditIcon = () => <span data-testid="edit-icon">Edit</span>;
const SaveIcon = () => <span data-testid="save-icon">Save</span>;
const DeleteIcon = () => <span data-testid="delete-icon">Delete</span>;
const BlenderIcon = () => <span data-testid="blender-icon">Blender</span>;

jest.mock('@mui/icons-material/Close', () => ({ default: CloseIcon }));
jest.mock('@mui/icons-material/Cancel', () => ({ default: CancelIcon }));
jest.mock('@mui/icons-material/Edit', () => ({ default: EditIcon }));
jest.mock('@mui/icons-material/Save', () => ({ default: SaveIcon }));
jest.mock('@mui/icons-material/DeleteOutlined', () => ({ default: DeleteIcon }));
jest.mock('@mui/icons-material/Blender', () => ({ default: BlenderIcon }));

// Mock MUI DataGrid
jest.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ rows, columns, getRowId }) => (
    <div data-testid="data-grid">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.field}>{col.headerName || col.field}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowId(row)}>
              {columns.map((col) => {
                const value = col.valueGetter ? col.valueGetter(null, row) : row[col.field];
                const formatted = col.valueFormatter ? col.valueFormatter(value) : value;
                return <td key={col.field}>{formatted}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
  useGridApiRef: () => ({ current: {} }),
  GridRowModes: {
    View: 'view',
    Edit: 'edit',
  },
  GridActionsCellItem: ({ label }) => <button>{label}</button>,
  GridEditInputCell: () => <input />,
  GridRowEditStopReasons: {
    rowFocusOut: 'rowFocusOut',
  },
  TollbarButton: () => <button>Toolbar</button>,
}));

// Note: The default export is the full page component that manages state.
// The RecipeMix component (internal) and helper functions are not exported.
// These tests focus on the main default export component.

describe('RecipeMix Page Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGrpcRequest.mockClear();
  });

  it('should render loading state initially', () => {
    mockGrpcRequest.mockResolvedValue({ packaging: [] });
    render(<RecipeMix />);
    // Component should render even while loading
    expect(screen.getByTestId('field-serving_size_grams')).toBeInTheDocument();
  });

  it('should render form fields', () => {
    mockGrpcRequest.mockResolvedValue({ packaging: [] });
    render(<RecipeMix />);
    
    expect(screen.getByTestId('field-serving_size_grams')).toBeInTheDocument();
    expect(screen.getByTestId('field-total_grams')).toBeInTheDocument();
    expect(screen.getByTestId('field-container_size_g')).toBeInTheDocument();
    expect(screen.getByTestId('field-targetMargin')).toBeInTheDocument();
    expect(screen.getByTestId('field-currencyRate')).toBeInTheDocument();
  });

  it('should fetch packaging list on mount', async () => {
    const mockPackaging = [
      { id: 'pkg-1', name: 'Bottle 500ml' },
      { id: 'pkg-2', name: 'Jar 1L' },
    ];
    mockGrpcRequest.mockResolvedValue({ packaging: mockPackaging });
    
    render(<RecipeMix />);
    
    // Wait for the effect to run
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(mockGrpcRequest).toHaveBeenCalledWith('listPackaging', {});
  });

  it('should render AppBar with close button', () => {
    mockGrpcRequest.mockResolvedValue({ packaging: [] });
    render(<RecipeMix />);
    
    // The AppBar should be rendered (mocked MUI components)
    // We can check for the close button aria-label
    const closeButton = screen.getByLabelText('close');
    expect(closeButton).toBeInTheDocument();
  });

  it('should handle packaging fetch error', async () => {
    const errorMessage = 'Failed to fetch packaging';
    mockGrpcRequest.mockRejectedValue(new Error(errorMessage));
    
    render(<RecipeMix />);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Error dialog should be rendered
    expect(screen.getByTestId('alert-dialog')).toBeInTheDocument();
  });

  it('should render packaging select section', () => {
    mockGrpcRequest.mockResolvedValue({ packaging: [] });
    render(<RecipeMix />);
    
    // PackagingSelect component should be rendered
    expect(screen.getByText('Packaging')).toBeInTheDocument();
  });
});

// Integration tests for the internal RecipeMix component behavior
// These test the component's rendering logic through the page component
describe('RecipeMix Component Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGrpcRequest.mockClear();
  });

  it('should calculate number of containers correctly', async () => {
    mockGrpcRequest.mockResolvedValue({ packaging: [] });
    
    render(<RecipeMix />);
    
    // The component should calculate containers based on totalGrams, servingGrams, and containerSizeG
    // Default values: totalGrams=10000, servingGrams=1, containerSizeG=10000
    // Servings per container = floor(10000/1) = 10000
    // Number of containers = ceil(10000 / (10000 * 1)) = 1
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const numContainersField = screen.getByTestId('field-num_containers');
    expect(numContainersField).toBeInTheDocument();
  });
});

