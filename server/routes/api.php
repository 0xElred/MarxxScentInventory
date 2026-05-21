<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::controller(AuthController::class)->prefix('/auth')->group(function () {
    Route::post('/login', 'login');
});

Route::middleware('auth:sanctum')->group(function () {
    Route::controller(AuthController::class)->prefix('/auth')->group(function () {
        Route::get('/me', 'me');
        Route::post('/logout', 'logout');
    });

    Route::controller(DashboardController::class)->prefix('/dashboard')->group(function () {
        Route::get('/stats', 'stats');
        Route::get('/activity-logs', 'activityLogs');
    });

    Route::controller(ProductController::class)->prefix('/product')->group(function () {
        Route::get('/loadProducts', 'loadProducts');
        Route::post('/storeProduct', 'storeProduct');
        Route::put('/updateProduct/{product}', 'updateProduct');
        Route::put('/destroyProduct/{product}', 'destroyProduct');
    });

    Route::controller(RoleController::class)->prefix('/role')->group(function () {
        Route::get('/loadRoles', 'loadRoles');
        Route::get('/getRole/{role}', 'getRole');
        Route::post('/storeRole', 'storeRole');
        Route::put('/updateRole/{role}', 'updateRole');
        Route::put('/destroyRole/{role}', 'destroyRole');
    });

    Route::prefix('/user')->group(function () {
        Route::get('/loadUsers', [UserController::class, 'loadUsers']);
        Route::post('/storeUser', [UserController::class, 'storeUser']);
        Route::put('/updateUser/{user}', [UserController::class, 'updateUser']);
        Route::put('/destroyUser/{user}', [UserController::class, 'destroyUser']);
    });

    Route::controller(OrderController::class)->prefix('/order')->group(function () {
        Route::get('/loadOrders', 'loadOrders');
        Route::get('/loadProductsForOrder', 'loadProductsForOrder');
        Route::post('/storeOrder', 'storeOrder');
        Route::put('/updateOrder/{order}', 'updateOrder');
        Route::put('/updateOrderStatus/{order}', 'updateOrderStatus');
        Route::put('/destroyOrder/{order}', 'destroyOrder');
    });
});
