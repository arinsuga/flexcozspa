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

    public function getSummaryByContractExcludingOrder($contractId, $excludeOrderId)
    {
        return \DB::table('contractsheets as cs')
            ->select([
                'cs.project_id',
                'p.project_number',
                'p.project_name',
                'cs.contract_id',
                'c.contract_number',
                'cs.id as contractsheet_id',
                'cs.sheetgroup_type',
                'cs.sheetgroup_id',
                'sg.sheetgroup_code',
                'cs.sheet_code',
                'cs.sheet_name',
                'cs.uom_id',
                'cs.uom_code',
                'cs.sheet_netamt as contract_amount',
                \DB::raw('SUM(IFNULL(os.sheet_netamt, 0)) as order_amount'),
                \DB::raw('cs.sheet_netamt - SUM(IFNULL(os.sheet_netamt, 0)) as available_amount')
            ])
            ->join('projects as p', 'cs.project_id', '=', 'p.id')
            ->join('contracts as c', 'cs.contract_id', '=', 'c.id')
            ->leftJoin('sheetgroups as sg', 'cs.sheetgroup_id', '=', 'sg.id')
            ->leftJoin('ordersheets as os', function($join) use ($excludeOrderId) {
                $join->on('os.contractsheets_id', '=', 'cs.id')
                     ->where('os.sheet_type', '=', 1)
                     ->where('os.order_id', '!=', $excludeOrderId);
            })
            ->where('cs.contract_id', $contractId)
            ->where('cs.sheet_type', 1)
            ->groupBy([
                'cs.project_id', 'p.project_number', 'p.project_name',
                'cs.contract_id', 'c.contract_number', 'cs.id',
                'cs.sheetgroup_type', 'cs.sheetgroup_id', 'sg.sheetgroup_code',
                'cs.sheet_code', 'cs.sheet_name', 'cs.uom_id', 'cs.uom_code',
                'cs.sheet_netamt'
            ])
            ->get();
    }
}
