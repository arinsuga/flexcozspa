<?php

namespace App\Repositories;

use App\Contract;
use App\Repositories\Contracts\ContractRepositoryInterface;
use App\Repositories\Data\EloquentRepository;

class ContractRepository extends EloquentRepository implements ContractRepositoryInterface
{
    protected $contract;


    public function getContractsByActive()
    {
        return $this->data->where('is_active', 1)->get();
    }

    public function getContractByCode($code)
    {
        return $this->data->where('contract_code', $code)->first();
    }
}
