<?php

namespace App\Repositories;

use App\Repositories\Data\EloquentRepository;
use App\Repositories\Contracts\ContractSheetRepositoryInterface;

class ContractSheetRepository extends EloquentRepository implements ContractSheetRepositoryInterface
{
    protected $contractsheet;

    public function getContractSheetsByContract($contractId)
    {
        return $this->data->where('contract_id', $contractId)->get();
    }
}
