<?php

namespace App\Http\Controllers;

use App\Certificate;
use Illuminate\Http\Request;

class CertificateController extends Controller
{
    public function create(Request $request)
    {
        $certificate = Certificate::create($request->all());
        return response()->json($certificate->toArray());
    }
}
