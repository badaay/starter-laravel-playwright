<?php

echo "🔧 Fixing /etc/sudoers and /etc/sudo.conf ownership...\n";

$commands = [
    'chown root:root /etc/sudoers',
    'chmod 440 /etc/sudoers',
    'chown root:root /etc/sudo.conf',
];

foreach ($commands as $cmd) {
    echo "Running: $cmd\n";
    exec($cmd . ' 2>&1', $output, $return);
    foreach ($output as $line) {
        echo "  $line\n";
    }
    if ($return !== 0) {
        echo "❌ Failed to run: $cmd\n";
        exit(1);
    }
    $output = [];
}

echo "✅ All done. Try running sudo again.\n";
