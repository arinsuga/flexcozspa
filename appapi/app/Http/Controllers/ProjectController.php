<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Repositories\Contracts\ProjectRepositoryInterface;

class ProjectController extends Controller
{
    protected $repository;

    public function __construct(ProjectRepositoryInterface $repository)
    {
        $this->repository = $repository;
        $this->middleware('authjwt');
    }

    public function index()
    {
        $projects = $this->repository->getProjectsByActive();
        return response()->json(['data' => $projects], 200);
    }

    public function show($id)
    {
        $project = $this->repository->find($id);
        
        if (!$project) {
            return response()->json(['error' => 'Project not found'], 404);
        }

        return response()->json(['data' => $project], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_number' => 'required|unique:projects,project_number',
            'project_name' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $project = $this->repository->create($request->all());
        return response()->json(['data' => $project], 201);
    }

    public function update(Request $request, $id)
    {
        $project = $this->repository->find($id);
        
        if (!$project) {
            return response()->json(['error' => 'Project not found'], 404);
        }

        $validated = $request->validate([
            'project_number' => 'unique:projects,project_number,' . $id,
            'project_name' => 'string',
            'is_active' => 'boolean',
        ]);

        $updated = $this->repository->update($id, $request->all());
        return response()->json(['data' => $updated], 200);
    }

    public function destroy($id)
    {
        $project = $this->repository->find($id);
        
        if (!$project) {
            return response()->json(['error' => 'Project not found'], 404);
        }

        $this->repository->delete($id);
        return response()->json(['message' => 'Project deleted successfully'], 200);
    }
}
