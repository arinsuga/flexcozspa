<?php

namespace App\Repositories\Contracts;

use App\Repositories\Data\DataRepositoryInterface;

interface UomRepositoryInterface extends DataRepositoryInterface
{
    function getUomsByActive();
    function getUomByCode($code);
}
