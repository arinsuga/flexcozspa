<?php

namespace App\Repositories;

use App\SheetGroup;
use App\Repositories\Contracts\SheetGroupRepositoryInterface;
use App\Repositories\Data\EloquentRepository;

class SheetGroupRepository extends EloquentRepository implements SheetGroupRepositoryInterface
{
    protected $sheetgroup;

    public function getSheetGroupsByType($type)
    {
        return $this->data->where('sheetgroup_type', $type)->orderBy('sheetgroup_seqno')->get();
    }

    public function getSheetGroupsByActive()
    {
        return $this->data->where('is_active', 1)->orderBy('sheetgroup_seqno')->get();
    }

    public function getSheetGroupByCode($code)
    {
        return $this->data->where('sheetgroup_code', $code)->first();
    }
}
