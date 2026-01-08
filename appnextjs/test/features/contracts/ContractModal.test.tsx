import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContractModal from '@/components/features/contracts/ContractModal';
import { useProjects } from '@/hooks/useProjects';

jest.mock('@/hooks/useProjects');

// Mock Modal since it might use Portals which require setup, or just valid DOM nesting
// But my Modal is likely simple. If it uses createPortal, JSDOM handles it usually.
// Let's assume standard render works.

describe('ContractModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useProjects as jest.Mock).mockReturnValue({
      data: { data: [{ id: 1, project_name: 'Test Project' }] },
      isLoading: false
    });
  });

  it('renders correctly when open', () => {
    render(
      <ContractModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    );
    expect(screen.getByText('New Contract')).toBeInTheDocument();
    expect(screen.getByLabelText(/Contract Number/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <ContractModal 
        isOpen={false} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    );
    expect(screen.queryByText('New Contract')).not.toBeInTheDocument();
  });

  it('submits form data', () => {
    render(
      <ContractModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    );

    fireEvent.change(screen.getByLabelText(/Contract Number/i), { target: { value: 'CTR-001' } });
    fireEvent.change(screen.getByLabelText(/Contract Name/i), { target: { value: 'Test Contract' } });
    
    // Find generic Submit button or the specific one. 
    // Usually "Create Contract" text in the button
    const submitBtn = screen.getByText('Create Contract');
    fireEvent.click(submitBtn);

    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      contract_number: 'CTR-001',
      contract_name: 'Test Contract'
    }));
  });

  it('calls onClose when Cancel is clicked', () => {
    render(
      <ContractModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onSubmit={mockOnSubmit} 
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
