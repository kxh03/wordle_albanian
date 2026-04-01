<?php

namespace App\Console\Commands;

use App\Services\WordImportService;
use Illuminate\Console\Command;
use Throwable;

class DictionaryImportCommand extends Command
{
    protected $signature = 'dictionary:import';
    protected $description = 'Import sq/en dictionaries from JSON files into words table';

    public function __construct(private readonly WordImportService $wordImportService)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        try {
            $result = $this->wordImportService->importAll();
            foreach ($result as $language => $count) {
                $this->info("Imported {$count} words for {$language}");
            }

            return self::SUCCESS;
        } catch (Throwable $e) {
            $this->error($e->getMessage());

            return self::FAILURE;
        }
    }
}
