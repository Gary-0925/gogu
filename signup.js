const md = window.markdownit();
md.use(window.texmath.use(window.katex), {
    engine: window.katex,
    delimiters: 'dollars',
    katexOptions: { macros: { "\\RR": "\\mathbb{R}" } }
});

function check_other_char(str)
{
    var s = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_"
    var ok = 1;
    for (var j = 0; j < str.length; j++)
        ok &= s.includes(str[j]);
    return ok;
}

async function sign_up() {
    const userName = document.getElementById("name_text").value;
    if (userName == "") alert("错误：用户名为空");
    else if (!check_other_char(userName)) alert("错误：用户名只能包含字母、数字、下划线");
    else
    {
        const supabase = getClient();
        const crypt = new JSEncrypt({ default_key_size: 2048 });
        const priKey = crypt.getPrivateKey();
        const pubKey = crypt.getPublicKey();
        const { data, error } = await supabase
            .from('users')
            .insert([
                {
                    name: userName,
                    pubkey: pubKey
                }
            ]);
        if (error) {
            alert('错误：' + error.message);
        } else {
            localStorage.setItem("name", userName);
            localStorage.setItem("priKey", priKey);
            alert('注册成功');
            window.location.reload();
        }
    }
}

async function load() {
    if (localStorage.getItem("name") != null) {
        window.location.replace("/gogu/message.html");
    } else {
        document.getElementById("titler").innerHTML = "注册";
        document.getElementById("container").innerHTML = `
            <div style="text-align: center;">
                <p>请注意，账号注册后，如果登出，忘记 priKey 无法找回账号，或许可以找管理员把 priKey 要回来</p>
                <textarea id="name_text" rows="2" cols="20" placeholder="昵称" spellcheck=false></textarea>
                <p style="text-align: right;">或者<a href="/gogu/signin.html">登录</a></p>
                <button onclick="sign_up()">注册</button>
            </div>
        `;
        //console.log("Private Key: ", privateKey);
        //console.log("Public Key: ", publicKey);
    }
}

load();