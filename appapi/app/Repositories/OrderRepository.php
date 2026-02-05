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

    public function create($data)
    {
        $order = $this->data->create($data);
        
        if (isset($data['order_items']) && is_array($data['order_items'])) {
            foreach ($data['order_items'] as $item) {
                // Ensure link to parent order
                $item['order_id'] = $order->id;
                $item['order_number'] = $order->order_number;
                $item['order_dt'] = $order->order_dt;
                $item['project_id'] = $order->project_id;
                $item['contract_id'] = $order->contract_id;
                
                $order->ordersheets()->create($item);
            }
        }

        return $order->fresh(['status', 'project', 'contract', 'ordersheets']);
    }

    public function update($id, $data)
    {
        return \DB::transaction(function () use ($id, $data) {
            $order = $this->find($id);
            if ($order) {
                $order->update($data);
                
                if (isset($data['order_items']) && is_array($data['order_items'])) {
                    // Pre-load existing items to avoid N queries in the loop
                    $inputItems = $data['order_items'];
                    $inputIds = collect($inputItems)->pluck('id')->filter()->toArray();
                    $existingItems = $order->ordersheets()->whereIn('id', $inputIds)->get()->keyBy('id');

                    $itemIdsToKeep = [];
                    foreach ($inputItems as $item) {
                        // Sync header fields
                        $item['order_id'] = $order->id;
                        $item['order_number'] = $order->order_number;
                        $item['order_dt'] = $order->order_dt;
                        $item['project_id'] = $order->project_id;
                        $item['contract_id'] = $order->contract_id;

                        if (isset($item['id']) && isset($existingItems[$item['id']])) {
                            // Update existing item
                            $existingItems[$item['id']]->update($item);
                            $itemIdsToKeep[] = $item['id'];
                        } else {
                            // Create new item
                            $newItem = $order->ordersheets()->create($item);
                            $itemIdsToKeep[] = $newItem->id;
                        }
                    }

                    // Delete items that are no longer present in the request
                    $order->ordersheets()->whereNotIn('id', $itemIdsToKeep)->delete();
                }
                return $order->fresh(['status', 'project', 'contract', 'ordersheets']);
            }
            return null;
        });
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
