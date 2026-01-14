'use client';

import { useEffect, useState, useMemo } from 'react';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { vendorService, Vendor } from '@/services/vendorService';
import { vendorTypeService, VendorType } from '@/services/vendorTypeService';
import SelectInput from '@/components/common/SelectInput';
import Loading from '@/components/common/Loading';
import VendorModal from './VendorModal';
import { useVendorMutations } from '@/hooks/useVendors';

interface VendorSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (vendor: Vendor) => void;
}

export default function VendorSearchModal({
  isOpen,
  onClose,
  onSelect
}: VendorSearchModalProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorTypes, setVendorTypes] = useState<VendorType[]>([]);
  const [selectedType, setSelectedType] = useState<number | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { createVendor } = useVendorMutations();

  const fetchVendors = async () => {
    setIsLoading(true);
    try {
      const vendorsData = await vendorService.getAll();
      setVendors(Array.isArray(vendorsData) ? vendorsData : vendorsData.data || []);
    } catch (err) {
      console.error('Failed to load vendors', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [vendorsData, typesData] = await Promise.all([
          vendorService.getAll(),
          vendorTypeService.getAll()
        ]);
        
        setVendors(Array.isArray(vendorsData) ? vendorsData : vendorsData.data || []);
        setVendorTypes(Array.isArray(typesData) ? typesData : typesData.data || []);
      } catch (err) {
        console.error('Failed to load vendor data', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchInitialData();
    }
  }, [isOpen]);

  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const matchesType = selectedType === 'all' || v.vendortype_id === Number(selectedType);
      const matchesSearch = v.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           v.vendor_code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [vendors, selectedType, searchQuery]);

  const handleAddVendor = async (data: Partial<Vendor>) => {
    try {
      await createVendor.mutateAsync(data);
      setIsAddModalOpen(false);
      fetchVendors(); // Refresh the list
    } catch (err) {
      console.error('Failed to create vendor', err);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Select Vendor"
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 min-w-0">
              <Input
                placeholder="Search vendor name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-48">
              <SelectInput
                options={[
                  { value: 'all', label: 'All Types' },
                  ...vendorTypes.map(t => ({ value: t.id, label: t.vendortype_name }))
                ]}
                value={selectedType}
                onChange={(val) => setSelectedType(val as string | number)}
                placeholder="Filter by Type"
              />
            </div>
            <Button 
              variant="primary" 
              leftIcon="add"
              onClick={() => setIsAddModalOpen(true)}
              className="whitespace-nowrap"
            >
              Add Vendor
            </Button>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="h-[400px] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 flex justify-center">
                  <Loading />
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Code</th>
                      <th className="px-4 py-2 font-semibold">Name</th>
                      <th className="px-4 py-2 font-semibold">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredVendors.length > 0 ? (
                      filteredVendors.map((vendor) => (
                        <tr 
                          key={vendor.id}
                          className="hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                          onDoubleClick={() => onSelect(vendor)}
                        >
                          <td className="px-4 py-3">{vendor.vendor_code}</td>
                          <td className="px-4 py-3 font-medium">{vendor.vendor_name}</td>
                          <td className="px-4 py-3">{vendor.vendortype?.vendortype_name || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                          No vendors found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-2">
            <p className="text-xs text-gray-500 italic flex-1 self-center">
              Double-click a row to select vendor
            </p>
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      <VendorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddVendor}
        isLoading={createVendor.isPending}
      />
    </>
  );
}
