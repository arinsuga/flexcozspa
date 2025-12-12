<?php

namespace App\Repositories\Contracts;

use App\Repositories\Data\DataRepositoryInterface;

interface ContractRepositoryInterface extends DataRepositoryInterface
{
    function getContractsByActive();
    function getContractByCode($code);
}
