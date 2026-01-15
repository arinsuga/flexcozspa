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
        return $this->data->with(['status', 'project', 'contract', 'ordersheets'])
            ->where('project_id', $projectId)->get();
    }

    public function getByContract($contractId)
    {
        return $this->data->with(['status', 'project', 'contract', 'ordersheets'])
            ->where('contract_id', $contractId)->get();
    }

    public function find($id)
    {
        return $this->data->with(['status', 'project', 'contract', 'ordersheets'])->find($id);
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
    public function getAllPaginated($params)
    {
        $query = $this->data->newQuery()->with(['status', 'project', 'contract', 'ordersheets']);

        // Search Logic
        if (!empty($params['search_query'])) {
            $search = '%' . $params['search_query'] . '%';
            $column = !empty($params['search_column']) ? $params['search_column'] : '';

            $allowedColumns = ['order_number', 'order_description'];
            
            if (in_array($column, $allowedColumns)) {
                 $query->where($column, 'like', $search);
            } elseif ($column == 'project_number') {
                $query->whereHas('project', function($q) use ($search) {
                    $q->where('project_number', 'like', $search);
                });
            } elseif ($column == 'project_name') {
                $query->whereHas('project', function($q) use ($search) {
                    $q->where('project_name', 'like', $search);
                });
            } elseif ($column == 'contract_number') {
                $query->whereHas('contract', function($q) use ($search) {
                    $q->where('contract_number', 'like', $search);
                });
            } elseif ($column == 'contract_name') {
                $query->whereHas('contract', function($q) use ($search) {
                    $q->where('contract_name', 'like', $search);
                });
            } else {
                 $query->where(function($q) use ($search) {
                     $q->where('order_description', 'like', $search)
                       ->orWhere('order_number', 'like', $search)
                       ->orWhereHas('project', function($q) use ($search) {
                           $q->where('project_number', 'like', $search)
                             ->orWhere('project_name', 'like', $search);
                       })
                       ->orWhereHas('contract', function($q) use ($search) {
                           $q->where('contract_number', 'like', $search)
                             ->orWhere('contract_name', 'like', $search);
                       });
                 });
            }
        }

        // Sort Logic
        $sortBy = !empty($params['sort_by']) ? $params['sort_by'] : 'id';
        $sortOrder = !empty($params['sort_order']) ? $params['sort_order'] : 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Pagination Logic
        $perPage = !empty($params['per_page']) ? $params['per_page'] : 10;
        return $query->paginate($perPage);
    }
}
