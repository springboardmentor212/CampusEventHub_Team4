const axios = require('axios');

async function testLogin() {
    try {
        console.log('Testing login for admin@campuseventhub.com...');
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'admin@campuseventhub.com',
            password: 'password123'
        }, {
            // Axios doesn't need much config for simple POST
        });
        console.log('Login Success!');
        console.log('Response status:', res.status);
        console.log('User data:', JSON.stringify(res.data.data.user, null, 2));
    } catch (err) {
        console.error('Login Failed!');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('Error:', err.message);
        }
    }
}

testLogin();
