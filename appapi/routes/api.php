<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Route::middleware('auth:api')->get('/user', function (Request $request) {
//     return $request->user();
// });

// Route::group(['middleware' => 'api'], function ($router) {
    
//     Route::post('auth/register', 'AuthController@register')->name('auth.register');
//     Route::post('auth/login', 'AuthController@login')->name('auth.login');
//     Route::post('auth/logout', 'AuthController@logout')->name('auth.logout');
//     Route::post('auth/refresh', 'AuthController@refresh')->name('auth.refresh');
//     Route::delete('auth/blacklist', 'AuthController@blacklist')->name('auth.blacklist');
//     Route::get('auth/me', 'AuthController@me')->name('auth.me');
//     Route::get('auth/status', 'AuthController@status')->name('auth.status');


//     //Absen
//     // Route::resource('absen', 'Absen\AbsenController');
//     Route::get('absen/check-by-email/{email}','Absen\AbsenController@check')->name('absen.check.by.email');

//     // Route::get('/check-history','Absen\AbsenController@checkHistory')->name('absen.history');
//     // Route::get('/check-history-admin','Absen\AbsenController@checkHistoryAdmin')->name('absen.history.admin');
//     Route::post('absen/check-history-post','Absen\AbsenController@checkHistoryPost')->name('absen.history.post');
//     Route::post('absen/post-history-by-userid-checkpointdate','Absen\AbsenController@postHistoryByUserIdAndCheckpointDate')->name('absen.history.by.userid.checkpointdate.post');

//     Route::post('absen/checkin','Absen\AbsenController@checkin')->name('absen.checkin.post');
//     Route::post('absen/checkout','Absen\AbsenController@checkout')->name('absen.checkout.post');

// });

// Authentication
Route::post('auth/register', 'AuthController@register')->name('auth.register');
Route::post('auth/login', 'AuthController@login')->name('auth.login');
Route::post('auth/logout', 'AuthController@logout')->name('auth.logout');
Route::post('auth/refresh', 'AuthController@refresh')->name('auth.refresh');
Route::delete('auth/blacklist', 'AuthController@blacklist')->name('auth.blacklist');
Route::get('auth/me', 'AuthController@me')->name('auth.me');
Route::get('auth/status', 'AuthController@status')->name('auth.status');


// Absen
// Route::resource('absen', 'Absen\AbsenController');
Route::get('absen/check-by-email/{email}','Absen\AbsenController@check')->name('absen.check.by.email');
Route::post('absen/check-history-post','Absen\AbsenController@checkHistoryPost')->name('absen.history.post');
Route::post('absen/post-history-by-userid-checkpointdate','Absen\AbsenController@postHistoryByUserIdAndCheckpointDate')->name('absen.history.by.userid.checkpointdate.post');
Route::post('absen/checkin','Absen\AbsenController@checkin')->name('absen.checkin.post');
Route::post('absen/checkout','Absen\AbsenController@checkout')->name('absen.checkout.post');

// Route::get('/check-history','Absen\AbsenController@checkHistory')->name('absen.history');
// Route::get('/check-history-admin','Absen\AbsenController@checkHistoryAdmin')->name('absen.history.admin');


// Projects API
Route::apiResource('projects', 'ProjectController');

// Contracts API
Route::apiResource('contracts', 'ContractController');

// Orders API
Route::apiResource('orders', 'OrderController');
Route::get('orders/project/{projectId}', 'OrderController@getByProject')->name('orders.by.project');
Route::get('orders/contract/{contractId}', 'OrderController@getByContract')->name('orders.by.contract');

// Order Statuses API
Route::apiResource('orderstatuses', 'OrderStatusController')->only(['index', 'show']);

// Contract Statuses API
Route::apiResource('contractstatuses', 'ContractStatusController')->only(['index', 'show']);

// Project Statuses API
Route::apiResource('projectstatuses', 'ProjectStatusController')->only(['index', 'show']);

// Contract Sheets API
Route::apiResource('contractsheets', 'ContractSheetController');
Route::get('contractsheets/summary/project/{projectId}/contract/{contractId}', 'ContractSheetController@getOrderSummaryByProjectAndContract')->name('contractsheets.summary.by.project.and.contract');
Route::get('contractsheets/summary/{contractId}/exclude-order/{orderId}', 'ContractSheetController@getOrderSummaryByContractExcludingOrder')->name('contractsheets.summary.exclude-order');
Route::get('contractsheets/summary/{contractId}', 'ContractSheetController@getOrderSummaryByContract')->name('contractsheets.summary.by.contract');
Route::get('contractsheets/summary/{contractId}/{contractsheetId}', 'ContractSheetController@getOrderSummaryByContractAndSheet')->name('contractsheets.summary.by.contract.and.sheet');
Route::get('contracts/{contractId}/sheets', 'ContractSheetController@getByContract')->name('contractsheets.by.contract');

// Ordersheets API
Route::apiResource('ordersheets', 'OrdersheetController');
Route::get('ordersheets/order/{orderId}', 'OrdersheetController@getByOrder')->name('ordersheets.by.order');
Route::get('ordersheets/order/{orderId}/optimized', 'OrdersheetController@getByOrderOptimized')->name('ordersheets.by.order.optimized');
Route::get('ordersheets/project/{projectId}', 'OrdersheetController@getByProject')->name('ordersheets.by.project');
Route::get('ordersheets/contract/{contractId}', 'OrdersheetController@getByContract')->name('ordersheets.by.contract');

// Sheet Groups API
Route::apiResource('sheetgroups', 'SheetGroupController');
Route::get('sheetgroups/type/{type}', 'SheetGroupController@getByType')->name('sheetgroups.by.type');

// Vendors API
Route::apiResource('vendors', 'VendorController');
Route::get('vendortypes/{vendorTypeId}/vendors', 'VendorController@getByType')->name('vendors.by.type');

// Vendor Types API
Route::apiResource('vendortypes', 'VendorTypeController');

// UOM Normalizations API
Route::apiResource('uom-normalizations', 'UomNormalizationController');

// Reference Types API
Route::apiResource('refftypes', 'RefftypeController');

// Reports API
Route::get('reports/order-recap', 'ReportController@orderRecap');
