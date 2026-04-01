<?php

namespace Database\Seeders;

use App\Services\WordImportService;
use Illuminate\Database\Seeder;

class WordSeeder extends Seeder
{
    public function __construct(private readonly WordImportService $wordImportService)
    {
    }

    public function run(): void
    {
        $this->wordImportService->importAll();
    }
}
