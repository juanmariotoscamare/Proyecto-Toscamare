<?php
// backend/api/config.php

// Configuración de correo para PHPMailer (SMTP IONOS)

return [
    'smtp' => [
        'host' => 'smtp.ionos.es',
        'port' => 587,
        'encryption' => 'tls',
    ],
    'pedidos' => [
        'email_destino' => 'tu_email_pedidos@ejemplo.com',
        'password' => 'tu_password_aqui',
    ],
    'contacto' => [
        'email_destino' => 'tu_email_contacto@ejemplo.com',
        'password' => 'tu_password_aqui',
    ]
];
