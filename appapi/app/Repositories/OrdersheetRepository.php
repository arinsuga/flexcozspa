<?php

namespace App\Repositories;

use App\Repositories\Data\EloquentRepository;
use App\Repositories\Contracts\OrdersheetRepositoryInterface;

class OrdersheetRepository extends EloquentRepository implements OrdersheetRepositoryInterface
{
    protected $ordersheet;

    public function find($id)
    {
        return $this->data->with(['project', 'contract', 'contractsheet', 'order', 'sheetgroup', 'vendortype', 'vendor', 'uom'])->find($id);
    }

    public function getOrdersheetsByOrder($orderId)
    {
        return $this->data->with(['project', 'contract', 'contractsheet', 'order', 'sheetgroup', 'vendortype', 'vendor', 'uom'])
            ->where('order_id', $orderId)->get();
    }

    public function getOrdersheetsByProject($projectId)
    {
        return $this->data->with(['project', 'contract', 'contractsheet', 'order', 'sheetgroup', 'vendortype', 'vendor', 'uom'])
            ->where('project_id', $projectId)->get();
    }

    public function getOrdersheetsByContract($contractId)
    {
        return $this->data->with(['project', 'contract', 'contractsheet', 'order', 'sheetgroup', 'vendortype', 'vendor', 'uom'])
            ->where('contract_id', $contractId)->get();
    }

    public function getOrdersheetsByContractsheet($contractsheetId)
    {
        return $this->data->with(['project', 'contract', 'contractsheet', 'order', 'sheetgroup', 'vendortype', 'vendor', 'uom'])
            ->where('contractsheets_id', $contractsheetId)->get();
    }

    public function getOrdersheetsByVendor($vendorId)
    {
        return $this->data->with(['project', 'contract', 'contractsheet', 'order', 'sheetgroup', 'vendortype', 'vendor', 'uom'])
            ->where('vendor_id', $vendorId)->get();
    }

    public function getOrdersheetsBySheetgroup($sheetgroupId)
    {
        return $this->data->with(['project', 'contract', 'contractsheet', 'order', 'sheetgroup', 'vendortype', 'vendor', 'uom'])
            ->where('sheetgroup_id', $sheetgroupId)->get();
    }
}
