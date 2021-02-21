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

Route::post('login', 'API\UserController@login');
Route::post('register', 'API\UserController@register');

Route::group(['middleware' => 'auth:api'], function(){
    Route::post('details', 'API\UserController@details');
    Route::post('get_accounting_date', 'API\AccountingController@getAccountingDate');
    Route::post('set_accounting_date', 'API\AccountingController@setAccountingDate');
    Route::post('get_users', 'API\UserController@getUsers');
    Route::post('save_user', 'API\UserController@saveUser');
    Route::post('delete_user', 'API\UserController@deleteUser');
    Route::post('set_user_island', 'API\UserController@setUserIsland');
    Route::post('fire_user', 'API\UserController@fireUser');
    Route::post('restore_user', 'API\UserController@restoreUser');
    Route::post('update_user_date', 'API\UserController@updateDate');

    // GROUPS
    Route::post('get_groups', 'GroupController@all');
    Route::post('create_group', 'GroupController@create');
    Route::post('update_group', 'GroupController@update');
    Route::post('delete_group', 'GroupController@delete');

    // ACCESSES
    Route::post('create_access_request', 'AccessController@create');
    Route::post('check_access_status', 'AccessController@getAccessStatus');
    Route::post('get_accesses', 'AccessController@getAllAccesses');
    Route::post('set_access_status', 'AccessController@setStatus');
    Route::post('delete_access', 'AccessController@delete');
    Route::post('update_access_island', 'AccessController@updateAccessIsland');

    // ISLANDS
    Route::post('get_islands', 'IslandController@getAll');
    Route::post('create_island', 'IslandController@create');
    Route::post('delete_island', 'IslandController@delete');
    Route::post('start_balance', 'IslandController@getStartBalance');
    Route::post('update_chief_id', 'IslandController@updateChiefId');
    Route::post('update_island_vpbx', 'IslandController@updateVpbxExtension');
    Route::post('update_user_islands', 'IslandController@updateUserIslands');
    Route::post('update_island_users', 'IslandController@updateIslandUsers');
    Route::post('update_island', 'IslandController@update');
    Route::post('update_island_chiefs', 'IslandController@updateChiefs');
    Route::post('island_first_cabinet', 'IslandController@firstCabinet');
    Route::post('island_cabinets_reduced', 'IslandController@cabinetsReduced');
    Route::post('set_island_option', 'IslandController@setOption');


    // CUSTOMERS
    Route::post('get_customers', 'CustomerController@index');
    Route::post('create_customer', 'CustomerController@create');
    Route::post('update_customer', 'CustomerController@update');
    Route::post('delete_phone', 'CustomerController@deletePhone');
    Route::post('add_phone', 'CustomerController@addPhone');
    Route::post('search_customer_by_text', 'CustomerController@searchByText');
    Route::post('delete_customer', 'CustomerController@delete');
    Route::post('extend_customer', 'CustomerController@extend');


    // WORKDAYS
    Route::post('get_workdays', 'WorkDayController@index');
    Route::post('start_day', 'API\UserController@startDay');
    Route::post('finish_day', 'API\UserController@finishDay');
    Route::post('resume_day', 'API\UserController@resumeDay');
    Route::post('start_dinner', 'API\UserController@startDinner');
    Route::post('finish_dinner', 'API\UserController@finishDinner');
    Route::post('start_time_break', 'WorkDayController@startTimeBreak');
    Route::post('finish_time_break', 'WorkDayController@finishTimeBreak');
    Route::post('update_workday', 'WorkDayController@update');
    Route::post('add_workday', 'WorkDayController@addWorkDay');


    // DEALS
    Route::post('get_deals', 'DealController@index');
    Route::post('add_deal', 'DealController@create');
    Route::post('update_deal', 'DealController@update');
    Route::post('update_deal_with_stock', 'DealController@updateWithStock');
    Route::post('delete_deal', 'DealController@delete');
    Route::post('update_deal_customer', 'DealController@updateCustomerId');
    Route::post('update_deal_price', 'DealController@updatePrice');
    Route::post('update_deal_service_id', 'DealController@updateDealServiceId');



    // EXPENSES
    Route::post('get_expenses', 'ExpenseController@index');
    Route::post('add_expense', 'ExpenseController@create');
    Route::post('delete_expense', 'ExpenseController@delete');

    // HANDOVERS
    Route::post('get_handover', 'HandOverController@index');
    Route::post('add_handover', 'HandOverController@create');
    Route::post('update_handover', 'HandOverController@update');

    // RESERVES
    Route::post('get_reserves', 'ReserveController@index');

    // STOCK ACTIONS
    Route::post('get_stock_actions', 'StockActionController@index');
    Route::post('add_stock_action', 'StockActionController@create');
    Route::post('get_stock_options', 'StockActionController@getStockOptions');
    Route::post('update_product', 'StockController@updateProduct');
    Route::post('add_product', 'StockController@addProduct');
    Route::post('delete_product', 'StockController@deleteProduct');

    // SALARY
    Route::post('get_month_data', 'SalaryController@monthData');
    Route::post('update_user_rate', 'SalaryController@updateUserRate');
    Route::post('add_user_prize', 'SalaryController@addUserPrize');
    Route::post('delete_user_prize', 'SalaryController@deleteUserPrize');
    Route::post('add_user_forfeit', 'SalaryController@addUserForfeit');
    Route::post('delete_user_forfeit', 'SalaryController@deleteUserForfeit');
    Route::post('add_user_sick', 'SalaryController@addUserSick');
    Route::post('add_user_prepay', 'SalaryController@addUserPrepay');
    Route::post('delete_user_sick', 'SalaryController@deleteUserSick');
    Route::post('add_user_vacation', 'SalaryController@addUserVacation');
    Route::post('delete_user_vacation', 'SalaryController@deleteUserVacation');
    Route::post('delete_user_prepay', 'SalaryController@deleteUserPrepay');
    Route::post('update_user_rates', 'API\UserController@updateRates');

    // LOADER
    Route::post('load_daily_page', 'LoaderController@loadDailyPage');
    Route::post('prior_prepare', 'LoaderController@priorPrepare');
    Route::post('load_stock_page', 'LoaderController@loadStockPage');

    // DOCUMENT PACK
    Route::post('upload_image', 'DocumentPackController@updateImage');
    Route::post('delete_image', 'DocumentPackController@deleteImage');
    Route::post('add_custom_doc', 'DocumentPackController@addCustomDoc');
    Route::post('delete_custom_doc', 'DocumentPackController@deleteCustomDoc');
    Route::post('upload_custom_image', 'DocumentPackController@updateCustomDocImage');
    Route::post('delete_custom_image', 'DocumentPackController@deleteCustomDocImage');

    // LEADS
    Route::post('get_leads', 'LeadController@index');
    Route::post('delete_lead', 'LeadController@delete');
    Route::post('update_lead_status', 'LeadController@updateStatus');
    Route::post('update_lead_comment', 'LeadController@updateComment');
    Route::post('add_lead_comment', 'LeadController@addComment');
    Route::post('delete_lead_comment', 'LeadController@deleteComment');
    Route::post('add_lead', 'LeadController@addLead');
    Route::post('add_lead_postpone', 'LeadController@addPostpone');
    Route::post('delete_lead_postpone', 'LeadController@deletePostpone');
    Route::post('add_lead_call', 'LeadController@addCall');

    //SETTINGS
    Route::post('get_setting', 'LoaderController@loadSetting');
    Route::post('update_setting', 'SettingsController@updateSetting');

    //CATALOGS
    Route::post('get_catalogs', 'CatalogController@getCatalogs');
    Route::post('create_service', 'CatalogController@createService');
    Route::post('update_service', 'CatalogController@updateService');
    Route::post('delete_service', 'CatalogController@deleteService');
    Route::post('create_subscription', 'CatalogController@createSubscription');
    Route::post('delete_subscription', 'CatalogController@deleteSubscription');
    Route::post('update_subscription', 'CatalogController@updateSubscription');
    Route::post('create_notify_template', 'CatalogController@createNotifyTemplate');
    Route::post('update_notify_template', 'CatalogController@updateNotifyTemplate');
    Route::post('delete_notify_template', 'CatalogController@deleteNotifyTemplate');
    Route::post('set_service_highlight', 'CatalogController@setServiceHighlight');
    Route::post('add_site', 'CatalogController@addSite');
    Route::post('update_site', 'CatalogController@updateSite');
    Route::post('delete_site', 'CatalogController@deleteSite');



    //APPOINTMENTS
    Route::post('get_appointments', 'AppointmentController@index');
    Route::post('create_appointment', 'AppointmentController@create');
    Route::post('update_appointment', 'AppointmentController@update');
    Route::post('delete_appointment', 'AppointmentController@delete');
    Route::post('move_appointment', 'AppointmentController@move');
    Route::post('appointment_change_status', 'AppointmentController@change_status');
    Route::post('add_appointment_comment', 'AppointmentController@addComment');
    Route::post('delete_appointment_comment', 'AppointmentController@deleteComment');

    //SUBSCRIBES
    Route::post('get_subscribes', 'SubscribeController@index');
    Route::post('add_subscribe_comment', 'SubscribeController@addComment');
    Route::post('delete_subscribe_comment', 'SubscribeController@deleteComment');

    //SMS REPORTS
    Route::post('create_sms_report', 'SmsReportController@create');
    Route::post('get_sms_reports', 'SmsReportController@index');


});
