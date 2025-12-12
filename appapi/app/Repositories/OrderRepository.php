<?php

namespace App\Repositories;

use App\Order;
use App\Repositories\Contracts\OrderRepositoryInterface;
use App\Repositories\Data\EloquentRepository;

class OrderRepository extends EloquentRepository implements OrderRepositoryInterface
{
    protected $order;

    public function getByProject($projectId)
    {
        return $this->data->where('project_id', $projectId)->get();
    }

    public function getByContract($contractId)
    {
        return $this->data->where('contract_id', $contractId)->get();
    }

    public function update($id, $data)
    {
        $order = $this->find($id);
        if ($order) {
            $order->update($data);
            return $order->fresh();
        }
        return null;
    }
}
