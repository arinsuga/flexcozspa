<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Repositories\Contracts\UomRepositoryInterface;

class UomController extends Controller
{
    protected $repository;

    public function __construct(UomRepositoryInterface $repository)
    {
        $this->repository = $repository;
        $this->middleware('authjwt');
    }

    public function index()
    {
        $uoms = $this->repository->getUomsByActive();
        return response()->json(['data' => $uoms], 200);
    }

    public function show($id)
    {
        $uom = $this->repository->find($id);
        
        if (!$uom) {
            return response()->json(['error' => 'Unit of measure not found'], 404);
        }

        return response()->json(['data' => $uom], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'uom_code' => 'required|unique:uoms,uom_code',
            'uom_name' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $uom = $this->repository->create($validated);
        return response()->json(['data' => $uom], 201);
    }

    public function update(Request $request, $id)
    {
        $uom = $this->repository->find($id);
        
        if (!$uom) {
            return response()->json(['error' => 'Unit of measure not found'], 404);
        }

        $validated = $request->validate([
            'uom_code' => 'unique:uoms,uom_code,' . $id,
            'uom_name' => 'string',
            'is_active' => 'boolean',
        ]);

        $updated = $this->repository->update($id, $validated);
        return response()->json(['data' => $updated], 200);
    }

    public function destroy($id)
    {
        $uom = $this->repository->find($id);
        
        if (!$uom) {
            return response()->json(['error' => 'Unit of measure not found'], 404);
        }

        $this->repository->delete($id);
        return response()->json(['message' => 'Unit of measure deleted successfully'], 200);
    }
}
