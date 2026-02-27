async function test() {
    try {
        const loginRes = await fetch('http://localhost:8080/api/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'homeowner_user',
                password: 'HomePassword123!'
            })
        });
        console.log(loginRes.status); const text = await loginRes.text(); console.log(text); const loginData = JSON.parse(text);
        const token = loginData.accessToken;

        console.log('Login successful');

        const devicesRes = await fetch('http://localhost:8080/api/devices', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const devicesData = await devicesRes.json();
        const devices = devicesData.devices;
        console.log('Got devices:', devices?.length);
        if (!devices || devices.length === 0) {
            console.log('No devices to toggle. creating one.');
            const createRes = await fetch('http://localhost:8080/api/devices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ name: 'Test Device', type: 'light', powerRating: 0.1, location: 'living room' })
            });
            const created = await createRes.json();
            console.log('Created device', created);
            devices.push(created);
        }
        const deviceId = devices[0].id;

        console.log(`Toggling device ${deviceId}...`);
        const toggleRes = await fetch(`http://localhost:8080/api/devices/${deviceId}/toggle`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` }
        });

        if (toggleRes.ok) {
            console.log('Toggle successful:', await toggleRes.json());
        } else {
            console.log('Toggle failed status:', toggleRes.status);
            console.log('Toggle failed error:', await toggleRes.text());
        }
    } catch (e) {
        console.error('Test failed:', e);
    }
}
test();
