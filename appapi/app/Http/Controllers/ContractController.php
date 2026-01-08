<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Repositories\Contracts\ContractRepositoryInterface;

class ContractController extends Controller
{
    protected $repository;

    public function __construct(ContractRepositoryInterface $repository)
    {
        $this->repository = $repository;
        $this->middleware('authjwt');
    }

    public function index()
    {
        $contracts = $this->repository->all();
        return response()->json(['data' => $contracts], 200);
    }

    public function show($id)
    {
        $contract = $this->repository->findWithSheets($id);
        
        if (!$contract) {
            return response()->json(['error' => 'Contract not found'], 404);
        }

        return response()->json(['data' => $contract], 200);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'contract_number' => 'required|unique:contracts,contract_number',
            'contract_name' => 'required|string',
            'project_id' => 'required|exists:projects,id',
            'contractstatus_id' => 'nullable|integer|exists:contractstatuses,id',
            'contract_sheets' => 'nullable|array',
        ]);

        return \DB::transaction(function () use ($request) {
            $contract = $this->repository->create($request->all());
            
            if ($request->has('contract_sheets')) {
                $this->syncSheets($contract, $request->get('contract_sheets'));
            }

            return response()->json(['data' => $contract->load('contractSheets')], 201);
        });
    }

    public function update(Request $request, $id)
    {
        $contract = $this->repository->find($id);
        
        if (!$contract) {
            return response()->json(['error' => 'Contract not found'], 404);
        }

        $validated = $request->validate([
            'contract_number' => 'unique:contracts,contract_number,' . $id,
            'contract_name' => 'string',
            'contractstatus_id' => 'nullable|integer|exists:contractstatuses,id',
            'contract_sheets' => 'nullable|array',
        ]);

        return \DB::transaction(function () use ($request, $id, $contract) {
            $this->repository->update($id, $request->all());
            
            if ($request->has('contract_sheets')) {
                $this->syncSheets($contract, $request->get('contract_sheets'));
            }

            return response()->json(['data' => $contract->load('contractSheets')], 200);
        });
    }

    /**
     * Sync contract sheets with calculations.
     */
    protected function syncSheets($contract, array $inputSheets)
    {
        $existingSheetIds = $contract->contractSheets()->pluck('id')->toArray();
        $inputSheetIds = array_filter(array_column($inputSheets, 'id'), 'is_numeric');
        
        // 1. Remove sheets not in input
        $idsToDelete = array_diff($existingSheetIds, $inputSheetIds);
        if (!empty($idsToDelete)) {
            $contract->contractSheets()->whereIn('id', $idsToDelete)->delete();
        }

        // 2. Separate headers and items for calculation
        $headers = [];
        $items = [];
        $tempIdMap = []; // Map frontend temp IDs to database IDs for new headers

        foreach ($inputSheets as $sheetData) {
            if (($sheetData['sheet_type'] ?? 0) == 0) {
                $headers[] = $sheetData;
            } else {
                $items[] = $sheetData;
            }
        }

        // 3. Process Headers first (to get IDs for items)
        foreach ($headers as &$headerData) {
            $headerId = $headerData['id'] ?? null;
            $isNewHeader = !is_numeric($headerId);
            
            // Calculate header totals from items
            $headerGrossAmt = 0;
            $headerNetAmt = 0;
            
            $headerTempId = $isNewHeader ? $headerId : null;

            foreach ($items as $item) {
                if ($item['sheetheader_id'] == ($headerTempId ?: $headerId)) {
                    $qty = $item['sheet_qty'] ?? 0;
                    $price = $item['sheet_price'] ?? 0;
                    $gross = $qty * $price;
                    $headerGrossAmt += $gross;
                    $headerNetAmt += $gross; // Assuming net = gross for now, matching plan
                }
            }

            $headerData['sheet_grossamt'] = $headerGrossAmt;
            $headerData['sheet_netamt'] = $headerNetAmt;
            $headerData['contract_id'] = $contract->id;
            $headerData['project_id'] = $contract->project_id;

            if ($isNewHeader) {
                unset($headerData['id']);
                $newHeader = $contract->contractSheets()->create($headerData);
                if ($headerTempId) {
                    $tempIdMap[$headerTempId] = $newHeader->id;
                }
            } else {
                $contract->contractSheets()->where('id', $headerId)->update(
                    collect($headerData)->except(['id'])->toArray()
                );
            }
        }

        // 4. Process Items
        foreach ($items as $itemData) {
            $itemId = $itemData['id'] ?? null;
            
            // Map header ID if it was a new header
            if (isset($tempIdMap[$itemData['sheetheader_id']])) {
                $itemData['sheetheader_id'] = $tempIdMap[$itemData['sheetheader_id']];
            }

            $qty = $itemData['sheet_qty'] ?? 0;
            $price = $itemData['sheet_price'] ?? 0;
            $itemData['sheet_grossamt'] = $qty * $price;
            $itemData['sheet_netamt'] = $qty * $price;
            $itemData['contract_id'] = $contract->id;
            $itemData['project_id'] = $contract->project_id;

            if (!is_numeric($itemId)) {
                unset($itemData['id']);
                $contract->contractSheets()->create($itemData);
            } else {
                $contract->contractSheets()->where('id', $itemId)->update(
                    collect($itemData)->except(['id'])->toArray()
                );
            }
        }
    }

    public function destroy($id)
    {
        $contract = $this->repository->find($id);
        
        if (!$contract) {
            return response()->json(['error' => 'Contract not found'], 404);
        }

        return \DB::transaction(function () use ($id, $contract) {
            $contract->contractSheets()->delete();
            $this->repository->delete($id);
            return response()->json(['message' => 'Contract and all sheets deleted successfully'], 200);
        });
    }
}
