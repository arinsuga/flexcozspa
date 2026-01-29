<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Repositories\Contracts\ContractSheetRepositoryInterface;

class ContractSheetController extends Controller
{
    protected $repository;

    public function __construct(ContractSheetRepositoryInterface $repository)
    {
        $this->repository = $repository;
        $this->middleware('authjwt');
    }

    public function index()
    {
        $contractsheets = $this->repository->all();
        return response()->json(['data' => $contractsheets], 200);
    }

    public function show($id)
    {
        $contractsheet = $this->repository->find($id);
        
        if (!$contractsheet) {
            return response()->json(['error' => 'Contract sheet not found'], 404);
        }

        return response()->json(['data' => $contractsheet], 200);
    }

    public function getByContract($contractId)
    {
        $contractsheets = $this->repository->getContractSheetsByContract($contractId);
        return response()->json(['data' => $contractsheets], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            '*.project_id' => 'required|integer|exists:projects,id',
            '*.contract_id' => 'required|integer|exists:contracts,id',
            '*.sheet_dt' => 'nullable|date',
            '*.sheet_type' => 'integer',
            '*.sheetgroup_type' => 'required|integer|in:0,1',
            '*.sheetgroup_id' => 'required|integer',
            '*.sheetheader_id' => 'nullable|integer',
            '*.sheet_code' => 'nullable|string|max:255',
            '*.sheet_name' => 'nullable|string|max:255',
            '*.sheet_description' => 'nullable|string|max:255',
            '*.sheet_notes' => 'nullable|string|max:255',
            '*.sheet_qty' => 'nullable|numeric',
            '*.sheet_price' => 'nullable|numeric',
            '*.sheet_grossamt' => 'nullable|numeric',
            '*.sheet_discountrate' => 'nullable|numeric',
            '*.sheet_discountvalue' => 'nullable|numeric',
            '*.sheet_taxrate' => 'nullable|numeric',
            '*.sheet_taxvalue' => 'nullable|numeric',
            '*.sheet_netamt' => 'nullable|numeric',
            '*.sheet_grossamt2' => 'nullable|numeric',
            '*.sheet_netamt2' => 'nullable|numeric',
            '*.sheet_realamt' => 'nullable|numeric',
            '*.uom_id' => 'required|integer|exists:uoms,id',
            '*.uom_code' => 'required|string|max:255',
            '*.sheetgroup_seqno' => 'nullable|integer',
            '*.sheet_seqno' => 'nullable|integer',
        ]);

        // $contractsheet = $this->repository->create($request->all());
        $contractsheet = $this->repository->bulkCreate($request->all());
        return response()->json(['data' => $contractsheet], 201);
    }

    public function update(Request $request, $id)
    {
        $contractsheet = $this->repository->find($id);
        
        if (!$contractsheet) {
            return response()->json(['error' => 'Contract sheet not found'], 404);
        }

        $validated = $request->validate([
            'contract_id' => 'exists:contracts,id',
            'sheetgroup_type' => 'integer|in:0,1',
        ]);

        $updated = $this->repository->update($id, $request->all());
        return response()->json(['data' => $updated], 200);
    }

    public function destroy($id)
    {
        $contractsheet = $this->repository->find($id);
        
        if (!$contractsheet) {
            return response()->json(['error' => 'Contract sheet not found'], 404);
        }

        $this->repository->delete($id);
        return response()->json(['message' => 'Contract sheet deleted successfully'], 200);
    }
}
