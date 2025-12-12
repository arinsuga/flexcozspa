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
}
