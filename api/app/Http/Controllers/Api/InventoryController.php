<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inventory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class InventoryController extends Controller
{
    /**
     * Display a listing of medical inventory items.
     */
    public function index(): JsonResponse
    {
        $items = Inventory::orderBy('id', 'asc')->get()->map(function ($item) {
            $computedRaw = Inventory::calculateStatus((int)$item->quantity);
            if ($item->status !== $computedRaw) {
                $item->status = $computedRaw;
                $item->saveQuietly();
            }

            $displayStatus = Inventory::formatStatus($computedRaw);

            return [
                'id'             => $item->id,
                'code'           => $item->code ?? $item->sku ?? ('MED-' . str_pad($item->id, 3, '0', STR_PAD_LEFT)),
                'item_name'      => $item->item_name,
                'category'       => $item->category,
                'quantity'       => (int) $item->quantity,
                'unit'           => $item->unit,
                'reorder_level'  => (int) ($item->min_stock_level ?? 20),
                'status'         => $displayStatus,
                'last_restocked' => $item->last_restocked ? $item->last_restocked->format('Y-m-d') : ($item->updated_at ? $item->updated_at->format('Y-m-d') : null),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data'   => $items,
        ], 200);
    }

    /**
     * Store a newly created inventory item in Supabase / MySQL database.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'item_name'       => ['required', 'string', 'max:255'],
            'category'        => ['required', 'string', 'max:100'],
            'quantity'        => ['required', 'integer', 'min:0'],
            'unit'            => ['required', 'string', 'max:50'],
            'code'            => ['nullable', 'string', 'max:50'],
            'sku'             => ['nullable', 'string', 'max:50'],
            'min_stock_level' => ['nullable', 'integer', 'min:0'],
            'expiration_date' => ['nullable', 'date'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Validation error.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $quantity = (int) $request->input('quantity');
        $rawStatus = Inventory::calculateStatus($quantity);

        $item = Inventory::create([
            'item_name'       => $request->input('item_name'),
            'category'        => $request->input('category'),
            'quantity'        => $quantity,
            'unit'            => $request->input('unit'),
            'code'            => $request->input('code') ?? $request->input('sku'),
            'sku'             => $request->input('sku') ?? $request->input('code'),
            'min_stock_level' => $request->input('min_stock_level', 20),
            'expiration_date' => $request->input('expiration_date'),
            'status'          => $rawStatus,
            'last_restocked'  => now()->toDateString(),
        ]);

        $responseData = [
            'id'             => $item->id,
            'code'           => $item->code ?? $item->sku ?? ('MED-' . str_pad($item->id, 3, '0', STR_PAD_LEFT)),
            'item_name'      => $item->item_name,
            'category'       => $item->category,
            'quantity'       => (int) $item->quantity,
            'unit'           => $item->unit,
            'reorder_level'  => (int) ($item->min_stock_level ?? 20),
            'status'         => Inventory::formatStatus($rawStatus),
            'last_restocked' => $item->last_restocked ? $item->last_restocked->format('Y-m-d') : now()->toDateString(),
        ];

        return response()->json([
            'status'  => 'success',
            'message' => 'Inventory item created successfully.',
            'data'    => $responseData,
        ], 201);
    }

    /**
     * Quick restock (+100 or custom amount) to update stock quantity in Supabase / MySQL.
     */
    public function quickRestock(Request $request, $id): JsonResponse
    {
        $item = Inventory::find($id);

        if (!$item) {
            return response()->json([
                'status'  => 'error',
                'message' => 'Inventory item not found.',
            ], 404);
        }

        $increment = (int) $request->input('amount', 100);
        $newQuantity = (int) $item->quantity + $increment;
        $rawStatus = Inventory::calculateStatus($newQuantity);

        $item->quantity = $newQuantity;
        $item->status = $rawStatus;
        $item->last_restocked = now()->toDateString();
        $item->save();

        $responseData = [
            'id'             => $item->id,
            'code'           => $item->code ?? $item->sku ?? ('MED-' . str_pad($item->id, 3, '0', STR_PAD_LEFT)),
            'item_name'      => $item->item_name,
            'category'       => $item->category,
            'quantity'       => (int) $item->quantity,
            'unit'           => $item->unit,
            'reorder_level'  => (int) ($item->min_stock_level ?? 20),
            'status'         => Inventory::formatStatus($rawStatus),
            'last_restocked' => $item->last_restocked ? $item->last_restocked->format('Y-m-d') : now()->toDateString(),
        ];

        return response()->json([
            'status'  => 'success',
            'message' => "Restocked item by +{$increment} units.",
            'data'    => $responseData,
        ], 200);
    }
}
