const md = window.markdownit();
md.use(window.texmath.use(window.katex), {
    engine: window.katex,
    delimiters: 'dollars',
    katexOptions: { macros: { "\\RR": "\\mathbb{R}" } }
});

async function sign_in() {
    const userName = document.getElementById("name_text").value;
    const priKey = document.getElementById("prikey_text").value;
    if (userName == "") alert("错误：用户名为空");
    else {
        try {
            const supabase = getClient();
            const crypt = new JSEncrypt({ default_key_size: 2048 });
            crypt.setPrivateKey(priKey);
            const { data: users, error: error } = await supabase
                .from('users')
                .select('name, pubkey')
                .eq('name', userName)
            if (error || users.length == 0) {
                alert('错误：账号不存在');
                return;
            }
            const pubKey = crypt.getPublicKey();
            if (users[0].pubkey != pubKey) {
                alert('错误：priKey 错误');
                return;
            }
            alert('登录成功');
            localStorage.setItem("name", userName);
            localStorage.setItem("priKey", priKey);
            window.location.reload();
        }
        catch (error) {
            alert('错误：priKey 错误');
        }
    }
}

async function load() {
    if (localStorage.getItem("name") != null) {
        window.location.replace("/gogu/message.html");
    } else {
        document.getElementById("titler").innerHTML = "登录";
        document.getElementById("container").innerHTML = `
            <div style="text-align: center;">
                <p>忘记 priKey 无法找回账号，或许可以找管理员把 priKey 要回来</p>
                <textarea id="name_text" rows="2" cols="20" placeholder="昵称" spellcheck=false></textarea>
                <textarea id="prikey_text" rows="20" placeholder="priKey\n请不要删除前后的英文部分" spellcheck=false style="text-align: center; width: 100%"></textarea>
                <p style="text-align: right;">或者<a href="/gogu/signup.html">注册</a></p>
                <button onclick="sign_in()">登录</button>
            </div>
        `;
        //console.log("Private Key: ", privateKey);
        //console.log("Public Key: ", publicKey);
    }
}

load();