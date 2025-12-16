import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContractsPage from '@/app/(dashboard)/contracts/page';
import { useContracts, useContractMutations } from '@/hooks/useContracts';

// Mock the hooks
jest.mock('@/hooks/useContracts');

describe('ContractsPage', () => {
  const mockContracts = [
    {
      id: 1,
      contract_number: 'CTR-001',
      name: 'Contract A',
      amount: 1000,
      start_date: '2023-01-01',
      end_date: '2023-12-31',
      description: 'Test Contract A'
    },
    {
      id: 2,
      contract_number: 'CTR-002',
      name: 'Contract B',
      amount: 2000,
      start_date: '2023-02-01',
      end_date: '2023-10-31',
      description: 'Test Contract B'
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

    (useContractMutations as jest.Mock).mockReturnValue({
      createContract: { mutateAsync: mockCreateContract, isPending: false },
      updateContract: { mutateAsync: mockUpdateContract, isPending: false },
      deleteContract: { mutateAsync: mockDeleteContract, isPending: false }
    });
  });

  it('renders list of contracts', () => {
    render(<ContractsPage />);
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
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]); // Edit CTR-001
    
    expect(screen.getByDisplayValue('CTR-001')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Contract A')).toBeInTheDocument();
  });

  it('opens delete confirmation when Delete is clicked', () => {
    render(<ContractsPage />);
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]); // Delete CTR-001
    
    expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
  });

  it('calls delete mutation when confirmed', async () => {
    render(<ContractsPage />);
    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    const confirmBtn = screen.getByText('Confirm');
    fireEvent.click(confirmBtn);

    await waitFor(() => {
        expect(mockDeleteContract).toHaveBeenCalledWith(1);
    });
  });
});
