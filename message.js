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

function verify_message(id, pubkey, info, sign) {
    try {
        const crypt = new JSEncrypt({ default_key_size: 2048 });
        crypt.setPublicKey(pubkey);
        return crypt.verify("[" + id.toString() + "]" + info, sign, CryptoJS.SHA256);
    }
    catch (error) { return false; }
}

async function load_list() {
    if (localStorage.getItem("name") != null) {
        const supabase = getClient();
        const titlerEl = document.getElementById('titler');
        const containerEl = document.getElementById('container');
        var { data: messages, error: errorm } = await supabase
            .from('messages')
            .select('id, name, info, sign')
            .order('id');
        const { data: users, error: erroru } = await supabase
            .from('users')
            .select('name, pubkey')
            .order('name');
        if (errorm || erroru) {
            containerEl.innerHTML = `<p>消息加载失败...你可以尝试刷新页面，有时候数据库状态不太好，毕竟是免费的啦...</p>`;
            return;
        }
        if (getArgs('all') != "1") messages = messages.slice(0, 20);
        titlerEl.innerHTML = "聊天室";
        let pageHTML = ``;
        pageHTML += `
            <div class="card" style="width: 40%; position: fixed; right: 0; bottom: 5px;">
                <div class="card_name">
                    <p>${localStorage.getItem("name")}</p>
                </div>
                <!--div style="text-align: right;">
                    <a href="/gogu/prikey.html">查看我的 priKey</a>
                    <br>
                    <a href="javascript:sign_out()" style="color: #ff0000">登出</a>
                </div-->
                <textarea id="message_text" rows="10" style="width: 100%" placeholder="发布一条友好的发言吧"></textarea>
                <div style="width: 100%; text-align: right;"><button onclick="send_message()">发送</button></div>
            </div>
        `;
        pageHTML += `<div style="display: grid; place-items: center;">`;
        var userKey = new Map();
        users.forEach(user => {
            userKey.set(user.name, user.pubkey);
        });
        messages.forEach(message => {
            if (check_other_char(message.name) && verify_message(message.id, userKey.get(message.name), message.info, message.sign)) {
                const info = md.render(message.info);
                pageHTML += `
                    <div class="card" style="width: 70%;">
                        <div class="card_name"><p>${message.name}</p></div>
                        <p>${info}</p>
                    </div>
                    <p></p>
                `;
            }
        });
        pageHTML += `</div>`;
        if (getArgs('all') != "1") pageHTML += `<div style="text-align: center;"><a href="?all=1">查看更多<\a></div>`
        else pageHTML += `<div style="text-align: center;"><a href="?all=0">查看更少<\a></div>`
        containerEl.innerHTML = pageHTML;
    } else {
        window.location.replace("/gogu/signup.html");
    }
}

async function send_message() {
    try {
        const supabase = getClient();
        const messageId = -Date.now();
        const userName = localStorage.getItem('name');
        const messageInfo = document.getElementById('message_text').value;
        if (userName == null) alert('错误：未登录');
        else if (messageInfo == '') alert('错误：消息为空');
        else {
            const crypt = new JSEncrypt({ default_key_size: 2048 });
            const priKey = localStorage.getItem('priKey');
            crypt.setPrivateKey(priKey);
            const messageSign = crypt.sign("[" + messageId.toString() + "]" + messageInfo, CryptoJS.SHA256, "sha256");
            const { data, error } = await supabase
                .from('messages')
                .insert([
                    {
                        id: messageId,
                        name: userName,
                        info: messageInfo,
                        sign: messageSign
                    }
                ]);
            if (error) {
                alert('错误：' + error.message);
            } else {
                alert('发送成功')
            }
        }
        load_list();
    } catch (error) {
        alert('错误：' + error.message);
    }
}

write_path("消息", "/gogu/message.html");

load_list();