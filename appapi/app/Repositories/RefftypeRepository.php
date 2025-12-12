<?php

namespace App\Repositories;

use App\Refftype;
use App\Repositories\Contracts\RefftypeRepositoryInterface;
use App\Repositories\Data\EloquentRepository;

class RefftypeRepository extends EloquentRepository implements RefftypeRepositoryInterface
{
    protected $refftype;


    public function getRefftypesByActive()
    {
        return $this->data->where('is_active', 1)->orderBy('display_order')->get();
    }

    public function getRefftypeByCode($code)
    {
        return $this->data->where('refftype_code', $code)->first();
    }
}
