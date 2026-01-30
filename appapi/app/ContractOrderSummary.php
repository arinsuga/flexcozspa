<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ContractOrderSummary extends Model
{
    protected $table = 'view_contract_order_summary';
    
    // Read-only model
    public $timestamps = false;
    protected $guarded = ['*'];

    protected $appends = ['balance'];

    /**
     * Handle the typo 'contract_amout' from the view script.
     */
    public function getContractAmountAttribute()
    {
        return $this->attributes['contract_amout'] ?? 0;
    }

    /**
     * Calculate balance: contract_amount - order_amount.
     */
    public function getBalanceAttribute()
    {
        return $this->contract_amount - ($this->attributes['order_amount'] ?? 0);
    }

    /**
     * Contract that this summary belongs to.
     */
    public function contract()
    {
        return $this->belongsTo('App\Contract', 'contract_id');
    }
}
