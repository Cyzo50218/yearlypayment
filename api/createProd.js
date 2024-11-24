
var fetch = require('node-fetch');

fetch('https://api-m.sandbox.paypal.com/v1/catalogs/products', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer access_token6V7rbVwmlM1gFZKW_8QtzWXqpcwQ6T5vhEGYNJDAAdn3paCgRpdeMdVYmWzgbKSsECednupJ3Zx5Xd-g',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'PayPal-Request-Id': 'PRODUCT-18062019-001',
        'Prefer': 'return=representation'
    },
    body: JSON.stringify({ "name": "Video Streaming Service", "description": "Video streaming service", "type": "SERVICE", "category": "SOFTWARE", "image_url": "https://example.com/streaming.jpg", "home_url": "https://example.com/home" })
});
