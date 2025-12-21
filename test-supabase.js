
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tuhbohymwogotzknyola.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1aGJvaHltd29nb3R6a255b2xhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMjA2ODAsImV4cCI6MjA4MTU5NjY4MH0.9W-P64MDmjik97UEcU_pFa_cLKyjspBf7AhyxP6vj4E';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log("Iniciando prueba de conexión a Supabase...");
    try {
        const { data, error } = await supabase.from('drivers').select('count', { count: 'exact', head: true });
        
        if (error) {
            console.error("❌ Error de conexión:", error.message);
            console.error("Detalles:", error);
        } else {
            console.log("✅ Conexión exitosa a Supabase.");
        }
    } catch (err) {
        console.error("❌ Excepción al conectar:", err);
    }
}

testConnection();
