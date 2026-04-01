<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureLanguageHeader
{
    public function handle(Request $request, Closure $next): Response
    {
        $lang = strtolower(trim((string) $request->header('X-Language', '')));
        if (! in_array($lang, ['sq', 'en'], true)) {
            return response()->json([
                'message' => 'Missing or invalid X-Language header. Use sq or en.',
            ], 400);
        }

        $request->merge(['language' => $lang]);

        return $next($request);
    }
}
