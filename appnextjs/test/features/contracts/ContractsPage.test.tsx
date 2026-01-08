import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContractsPage from '@/app/(dashboard)/contracts/page';
import { useContracts, useContractMutations } from '@/hooks/useContracts';
import { useProjects } from '@/hooks/useProjects';

// Mock the hooks
jest.mock('@/hooks/useContracts');
jest.mock('@/hooks/useProjects');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

describe('ContractsPage', () => {
  const mockContracts = [
    {
      id: 1,
      contract_number: 'CTR-001',
      contract_name: 'Contract A',
      project_id: 1,
      contract_amount: '1000',
      contract_startdt: '2023-01-01',
      contract_enddt: '2023-12-31',
      contract_description: 'Test Contract A',
      contract_pic: 'PIC A',
      contractstatus_id: 0
    },
    {
      id: 2,
      contract_number: 'CTR-002',
      contract_name: 'Contract B',
      project_id: 1,
      contract_amount: '2000',
      contract_startdt: '2023-02-01',
      contract_enddt: '2023-10-31',
      contract_description: 'Test Contract B',
      contract_pic: 'PIC B',
      contractstatus_id: 1
    }
  ];

  const mockCreateContract = jest.fn();
  const mockUpdateContract = jest.fn();
  const mockDeleteContract = jest.fn();

  beforeEach(() => {
    (useContracts as jest.Mock).mockReturnValue({
      data: mockContracts,
      isLoading: false,
      error: null
    });

    (useProjects as jest.Mock).mockReturnValue({
      data: { data: [{ id: 1, project_number: 'PRJ-001', project_name: 'Project One' }] },
      isLoading: false
    });

    (useContractMutations as jest.Mock).mockReturnValue({
      createContract: { mutateAsync: mockCreateContract, isPending: false },
      updateContract: { mutateAsync: mockUpdateContract, isPending: false },
      deleteContract: { mutateAsync: mockDeleteContract, isPending: false }
    });
  });

  it('renders list of contracts', () => {
    render(<ContractsPage />);
    expect(screen.getAllByText('PRJ-001')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Project One')[0]).toBeInTheDocument();
    expect(screen.getByText('CTR-001')).toBeInTheDocument();
    expect(screen.getByText('Contract A')).toBeInTheDocument();
    expect(screen.getByText('CTR-002')).toBeInTheDocument();
  });

  it('opens create modal when New Contract button is clicked', () => {
    render(<ContractsPage />);
    fireEvent.click(screen.getByText('New Contract'));
    expect(screen.getByRole('heading', { name: 'New Contract' })).toBeInTheDocument(); // Modal Title
  });

  it('opens edit modal with data when Edit is clicked', () => {
    render(<ContractsPage />);
    const editButtons = screen.getAllByTitle('Edit');
    fireEvent.click(editButtons[0]); // Edit CTR-001
    
    expect(screen.getByDisplayValue('CTR-001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Contract A')).toBeInTheDocument();
  });

  it('opens delete confirmation when Delete is clicked', () => {
    render(<ContractsPage />);
    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]); // Delete CTR-001
    
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
  });

  it('calls delete mutation when confirmed', async () => {
    render(<ContractsPage />);
    const deleteButtons = screen.getAllByTitle('Delete');
    fireEvent.click(deleteButtons[0]);
    
    const confirmBtn = screen.getByText('Confirm');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
        expect(mockDeleteContract).toHaveBeenCalledWith(1);
    });
  });
});
