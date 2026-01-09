<?php

namespace App\Repositories;

use App\Uom;
use App\Repositories\Contracts\UomRepositoryInterface;
use App\Repositories\Data\EloquentRepository;

class UomRepository extends EloquentRepository implements UomRepositoryInterface
{
    protected $uom;

    public function getUomsByActive()
    {
        return $this->data->where('is_active', 1)->orderBy('display_order')->get();
    }

    public function getUomByCode($code)
    {
        return $this->data->where('uom_code', $code)->first();
    }
    public function getAllPaginated($params)
    {
        $query = $this->data->query();

        // Search Logic
        if (!empty($params['search_query'])) {
            $search = '%' . $params['search_query'] . '%';
            $column = !empty($params['search_column']) ? $params['search_column'] : '';

            $allowedColumns = ['uom_code', 'uom_name'];
            
            if (in_array($column, $allowedColumns)) {
                 $query->where($column, 'like', $search);
            } else {
                 $query->where(function($q) use ($search) {
                     $q->where('uom_name', 'like', $search)
                       ->orWhere('uom_code', 'like', $search);
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
