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

// Route::get('/check-history','Absen\AbsenController@checkHistory')->name('absen.history');
// Route::get('/check-history-admin','Absen\AbsenController@checkHistoryAdmin')->name('absen.history.admin');
Route::post('absen/check-history-post','Absen\AbsenController@checkHistoryPost')->name('absen.history.post');
Route::post('absen/post-history-by-userid-checkpointdate','Absen\AbsenController@postHistoryByUserIdAndCheckpointDate')->name('absen.history.by.userid.checkpointdate.post');

Route::post('absen/checkin','Absen\AbsenController@checkin')->name('absen.checkin.post');
Route::post('absen/checkout','Absen\AbsenController@checkout')->name('absen.checkout.post');
