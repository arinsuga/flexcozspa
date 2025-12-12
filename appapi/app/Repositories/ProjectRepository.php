<?php

namespace App\Repositories;

use App\Project;
use App\Repositories\Contracts\ProjectRepositoryInterface;
use App\Repositories\Data\EloquentRepository;

class ProjectRepository extends EloquentRepository implements ProjectRepositoryInterface
{
    protected $project;

    public function getProjectsByActive()
    {
        return $this->data->where('is_active', 1)->get();
    }

    public function getProjectByCode($code)
    {
        return $this->data->where('project_number', $code)->first();
    }

    public function getByProject($projectId)
    {
        return $this->data->where('project_id', $projectId)->get();
    }

}
