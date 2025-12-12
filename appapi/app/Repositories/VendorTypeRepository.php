<?php

namespace App\Repositories;

use App\VendorType;
use App\Repositories\Contracts\VendorTypeRepositoryInterface;
use App\Repositories\Data\EloquentRepository;

class VendorTypeRepository extends EloquentRepository implements VendorTypeRepositoryInterface
{
    protected $vendortype;

    public function getVendorTypesByActive()
    {
        return $this->data->where('is_active', 1)->orderBy('display_order')->get();
    }

    public function getVendorTypeByCode($code)
    {
        return $this->data->where('vendortype_code', $code)->first();
    }
}
