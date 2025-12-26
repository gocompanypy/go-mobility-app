import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const env = {};
        envFile.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) env[key.trim()] = value.trim();
        });
        return env;
    } catch (e) {
        return {};
    }
}

const env = loadEnv();
const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

const main = async () => {
    const randomSuffix = Math.floor(Math.random() * 100000);
    console.log(`🔍 DEBUG START - Suffix: ${randomSuffix}`);

    // TEST 1: Passenger (Control Group)
    console.log("\n--- TEST 1: PASSENGER ---");
    const passEmail = `debug_pass_${randomSuffix}@goapp.com`;
    const { data: passData, error: passError } = await supabase.auth.signUp({
        email: passEmail,
        password: "password123",
        options: {
            data: {
                role: 'passenger',
                phone: `0981${randomSuffix}`,
                full_name: 'Debug Passenger'
            }
        }
    });

    if (passError) {
        console.error("❌ Passenger Auth Failed:", passError.message);
    } else {
        console.log("✅ Passenger Auth OK. ID:", passData.user?.id);
        await new Promise(r => setTimeout(r, 2000));
        const { error: dbError } = await supabase.from('passengers').select('*').eq('id', passData.user?.id).single();
        if (dbError) console.error("❌ Passenger DB Check Failed:", dbError.message);
        else console.log("✅ Passenger DB Check OK");
    }

    // TEST 2: DRIVER
    console.log("\n--- TEST 2: DRIVER ---");
    const driverEmail = `debug_driver_${randomSuffix}@goapp.com`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: driverEmail,
        password: "password123",
        options: {
            data: {
                role: 'driver',
                phone: `0999${randomSuffix}`,
                first_name: 'Debug',
                last_name: 'Driver',
                vehicle_type: 'moto',
                vehicle_plate: 'TEST-999',
                license_number: '12345',
                license_expiry: '2025-01-01'
            }
        }
    });

    if (authError) {
        console.error("❌ Driver Auth Error:", authError.message);
        return;
    }

    console.log("✅ Driver Auth User Created. ID:", authData.user?.id);
    console.log("⏳ Waiting 3 seconds for Trigger...");
    await new Promise(r => setTimeout(r, 3000));

    const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('id', authData.user?.id)
        .single();

    if (driverError) {
        console.error("❌ Driver Table Error:", driverError.message);
    } else {
        console.log("✅ Driver Profile Found! Phone:", driverData.phone);
    }
};

main();
