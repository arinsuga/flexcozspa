<?php

namespace App\Repositories;

use App\Repositories\Data\EloquentRepository;
use App\Repositories\Contracts\OrdersheetRepositoryInterface;

class OrdersheetRepository extends EloquentRepository implements OrdersheetRepositoryInterface
{
    protected $ordersheet;

    public function getOrdersheetsByOrder($orderId)
    {
        return $this->data->where('order_id', $orderId)->get();
    }

    public function getOrdersheetsByProject($projectId)
    {
        return $this->data->where('project_id', $projectId)->get();
    }

    public function getOrdersheetsByContract($contractId)
    {
        return $this->data->where('contract_id', $contractId)->get();
    }

    public function getOrdersheetsByContractsheet($contractsheetId)
    {
        return $this->data->where('contractsheets_id', $contractsheetId)->get();
    }

    public function getOrdersheetsByVendor($vendorId)
    {
        return $this->data->where('vendor_id', $vendorId)->get();
    }

    public function getOrdersheetsBySheetgroup($sheetgroupId)
    {
        return $this->data->where('sheetgroup_id', $sheetgroupId)->get();
    }
}
