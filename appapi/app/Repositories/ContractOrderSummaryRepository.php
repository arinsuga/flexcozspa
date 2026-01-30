<?php

namespace App\Repositories;

use App\Repositories\Contracts\ContractOrderSummaryRepositoryInterface;
use App\ContractOrderSummary;

class ContractOrderSummaryRepository implements ContractOrderSummaryRepositoryInterface
{
    protected $model;

    public function __construct(ContractOrderSummary $model)
    {
        $this->model = $model;
    }

    public function getSummaryByContract($contractId)
    {
        return $this->model->where('contract_id', $contractId)->get();
    }

    public function getSummaryByContractAndSheet($contractId, $sheetId)
    {
        return $this->model->where('contract_id', $contractId)
                          ->where('contractsheet_id', $sheetId)
                          ->first();
    }

    public function getSummaryByProjectAndContract($projectId, $contractId)
    {
        return $this->model->where('project_id', $projectId)
                          ->where('contract_id', $contractId)
                          ->get();
    }
}
