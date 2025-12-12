<?php

namespace App\Repositories;

use App\Vendor;
use App\Repositories\Contracts\VendorRepositoryInterface;
use App\Repositories\Data\EloquentRepository;

class VendorRepository extends EloquentRepository implements VendorRepositoryInterface
{
    protected $vendor;

    public function getVendorsByType($vendorTypeId)
    {
        return $this->data->where('vendortype_id', $vendorTypeId)->get();
    }

    public function getVendorsByActive()
    {
        return $this->data->where('is_active', 1)->get();
    }

    public function getVendorByCode($code)
    {
        return $this->data->where('vendor_code', $code)->first();
    }
}
