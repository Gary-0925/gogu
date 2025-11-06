let supabaseClient = null;
function getClient() {
    if (!supabaseClient) {
        const supabaseUrl = 'https://xagbayhoblnpfropmrdi.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhZ2JheWhvYmxucGZyb3BtcmRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4MTY4NzYsImV4cCI6MjA3NjM5Mjg3Nn0.jDRu8MZdEyc0jJDuYXXJ3_LzBM_rwqmjGyvegqVCqO0';
        supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);
    }
    return supabaseClient;
}
function getArgs(key) {
    const args = {};
    for (const [k, v] of new URLSearchParams(window.location.search).entries()) {
        args[k] = v;
    }
    return key ? args[key] : args;
}

function check_other_char(str) {
    var s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_"
    var ok = 1;
    for (var j = 0; j < str.length; j++)
        ok &= s.includes(str[j]);
    return ok;
}

function verify_article(id, pubkey, sign) {
    try {
        const crypt = new JSEncrypt({ default_key_size: 2048 });
        crypt.setPublicKey(pubkey);
        return crypt.verify("[page]" + id.toString(), sign, CryptoJS.SHA256);
    }
    catch (error) { return false; }
}

async function load() {
    if (localStorage.getItem("name") != null) {
        const supabase = getClient();
        try {
            const { data: article, error: errorm } = await supabase
                .from('pages')
                .select('id, name, title, info, sign')
                .eq('id', getArgs('id'));
            const { data: users, error: erroru } = await supabase
                .from('users')
                .select('name, pubkey')
                .eq('name', article[0].name);
            if (errorm || erroru) {
                document.write("404");
            }
            else if (verify_article(article[0].id, users[0].pubkey, article[0].sign)) {
                document.write(article[0].info);
            } else {
                document.write("404");
            }
        }
        catch (error) {
            document.write("404");
        }
    }
}

load();