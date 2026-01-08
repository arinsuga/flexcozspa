<?php

namespace App\Repositories;

use App\Contract;
use App\Repositories\Contracts\ContractRepositoryInterface;
use App\Repositories\Data\EloquentRepository;

class ContractRepository extends EloquentRepository implements ContractRepositoryInterface
{
    public function all()
    {
        return $this->data->with(['contractStatus', 'project'])->get();
    }

    public function find($parId)
    {
        return $this->data->with(['contractStatus', 'project'])->find($parId);
    }

    public function getContractByCode($code)
    {
        return $this->data->with(['contractStatus', 'project'])->where('contract_code', $code)->first();
    }
}
