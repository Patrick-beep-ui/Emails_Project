<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Builder;

class QueryBuilderService
{
    public function build(Builder $query, array $filters)
    {
        // ejemplo: aplicar filtros dinámicos
        foreach ($filters as $field => $value) {
            if (!empty($value)) {
                $query->where($field, $value);
            }
        }

        return $query;
    }

    public function groupKeywords(array $keywords, int $batchSize = 10): array {
        $queries = [];
        $queryParts = [];
        $counter = 0;

        foreach ($keywords as $keyword) {
            $queryParts[] = "\"{$keyword}\"";
            $counter++;

            if ($counter === $batchSize) {
                $queries[] = ['query' => '(' . implode(' OR ', $queryParts) . ')'];
                $queryParts = [];
                $counter = 0;
            }
        }

        // Handle leftover keywords
        if ($counter > 0) {
            $queries[] = ['query' => '(' . implode(' OR ', $queryParts) . ')'];
        }

        return $queries;
    }
}
