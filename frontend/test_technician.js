async function test() {
    const username = 'test_tech';
    const email = username + '@example.com';

    try {
        console.log('Registering technician...');
        const regRes = await fetch('http://localhost:8080/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                email,
                password: 'TechPassword123!',
                firstName: 'Test',
                lastName: 'Tech',
                role: ['technician']
            })
        });
        console.log('Register status:', regRes.status, await regRes.text());

        // We can't login without verified email in the current auth flow, 
        // but tests might bypass or we can check the database.
        // Let me check if I can just login with the admin user and access technician routes to test
        console.log('\nLogging in as admin...');
        const adminLoginRes = await fetch('http://localhost:8080/api/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'technician_user',
                password: 'TechPassword123!'
            })
        });

        if (!adminLoginRes.ok) {
            console.log('Admin login failed', await adminLoginRes.text());
            return;
        }
        const adminData = await adminLoginRes.json();
        const adminToken = adminData.accessToken;

        console.log('Admin login successful');

        console.log('\nFetching installations (as admin)...');
        const instRes = await fetch('http://localhost:8080/api/technician/installations', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });

        console.log('Installations status:', instRes.status);
        if (instRes.ok) {
            console.log('Installations:', await instRes.json());
        } else {
            console.log('Installations error:', await instRes.text());
        }

        console.log('\nFetching metrics (as admin)...');
        const metricsRes = await fetch('http://localhost:8080/api/technician/metrics/me', {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('Metrics status:', metricsRes.status);
        if (metricsRes.ok) {
            console.log('Metrics:', await metricsRes.json());
        } else {
            console.log('Metrics error:', await metricsRes.text());
        }

    } catch (e) {
        console.error('Test failed:', e);
    }
}

test();
