<?php
// NyayaSetu Shared Hosting Landing Entry
header('Content-Type: application/json; charset=utf-8');
echo json_encode([
    'status' => 'operational',
    'product' => 'NyayaSetu - Indian Legal Social, Professional & Legal-Help Platform',
    'version' => '1.0.0',
    'api_docs' => '/api/health',
    'admin_panel' => '/admin/'
]);
