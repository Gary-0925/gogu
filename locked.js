function unlock(prikey, info) {
    try {
        const crypt = new JSEncrypt({default_key_size: 2048});
        crypt.setPrivateKey(prikey);
        return crypt.decrypt(info);
    } catch (error) {
        return null;
    }
} // 解密
function verify(id, pubkey, sign) {
    try {
        const crypt = new JSEncrypt({default_key_size: 2048});
        crypt.setPublicKey(pubkey);
        return crypt.verify("[locked]" + id, sign, CryptoJS.SHA256);
    } catch (error) {
        return false;
    }
} // 验证

async function load() {
    // 预先获取页面结构并建立连接 {
    const supabase = getClient();
    const titlerEl = document.getElementById('titler');
    const containerEl = document.getElementById('container');
    // }
    if (getArgs("id") != null) {
        try {
            const {data: changes, error: errorm} = await supabase
                .from('locked-change')
                .select('id, pid, info, sign');
            const {data: pubkeys, error: erroru} = await supabase
                .from('locked-pubkey')
                .select('id, pubkey')
                .eq('id', getArgs('id'));
            if (errorm || erroru) {
                titlerEl.innerHTML = "404";
                containerEl.innerHTML = `<p style="text-align: center;">内容不见了呐~</p>`;
            } else {
                var info = `密匙错误或该页面还没有被编辑过`, prikey = null;
                if (localStorage.getItem('locked-id') == getArgs('id') && localStorage.getItem('locked-prikey') != null)
                    prikey = prompt('请输入查看密匙', localStorage.getItem('locked-prikey'));
                else prikey = prompt('请输入查看密匙');
                changes.forEach(change => {
                    if (change.pid == getArgs('id')) {
                        if (verify(getArgs('id'), pubkeys[0], change.sign)) {
                            info = unlock(prikey, change.info);
                        }
                    }
                });
            }
        else
            if (check_other_char(article[0].name) && verify(article[0].id, users[0].pubkey, article[0].sign)) {
                titlerEl.innerHTML = article[0].title;
                containerEl.innerHTML = `
                        <div style="display: grid; place-items: center;">
                            <div class="card" style="width: 70%;">
                                <div class="card_name">${getArgs('id')}</div>
                                ${md.render(article[0].info)}
                            </div>
                        </div>
                    `;
            } else {
                titlerEl.innerHTML = "404";
                containerEl.innerHTML = `<p style="text-align: center;">内容不见了呐~</p>`;
            }
        } catch (error) {
            titlerEl.innerHTML = "404";
            containerEl.innerHTML = `<p style="text-align: center;">内容不见了呐~</p>`;
        }
    } else {

        // 读取数据库 {
        var {data: messages, error: errorm} = await supabase
            .from('messages')
            .select('id, name, info, sign')
            .order('id');
        const {data: users, error: erroru} = await supabase
            .from('users')
            .select('name, pubkey')
            .order('name');
        if (errorm || erroru) {
            containerEl.innerHTML = `<p style="text-align: center">消息加载失败...你可以尝试刷新页面，有时候数据库状态不太好，毕竟是免费的啦...</p>`;
            return;
        } // 错误：数据读取失败
        // }

        if (getArgs('all') != "1") messages = messages.slice(0, 20); // 保留最近消息

        // 设置标题及载入内容 {
        titlerEl.innerHTML = "聊天室";
        let pageHTML = ``;
        // }

        pageHTML += `
            <div class="card" style="width: 40%; position: fixed; right: 0; bottom: 5px;">
                <div class="card_name">
                    <p>${localStorage.getItem("name")}</p>
                </div>
                <textarea id="info_text" rows="10" style="width: 100%" placeholder="发布一条友好的发言吧"></textarea>
                <div style="width: 100%; text-align: right;"><button onclick="send()">发送</button></div>
            </div>
        `; // 加入发送框

        // 载入用户 {
        var userKey = new Map();
        users.forEach(user => {
            userKey.set(user.name, user.pubkey);
        });
        // }

        // 载入列表 {
        pageHTML += `<div style="display: grid; place-items: center;">`;
        messages.forEach(message => {
            if (check_other_char(message.name) && verify(message.id, userKey.get(message.name), message.info, message.sign)) {
                const info = md.render(message.info);
                pageHTML += `
                <div class="card" style="width: 70%;">
                    <div class="card_name"><p>${message.name}</p></div>
                    <p>${info}</p>
                </div>
                <p></p>
            `;
            }
        }); // 载入消息
        pageHTML += `</div>`;

        if (getArgs('all') != "1") pageHTML += `<div style="text-align: center;"><a href="?all=1">查看更多<\a></div>`
        else pageHTML += `<div style="text-align: center;"><a href="?all=0">查看更少<\a></div>`
        // }

        containerEl.innerHTML = pageHTML; // 填充页面
    }
} // 加载

async function send() {
    try {
        const supabase = getClient(); // 连接数据库

        // 获取基本信息 {
        const id = -Date.now(); // 时间
        const name = localStorage.getItem('name'); // 用户
        const info = document.getElementById('info_text').value; // 内容
        // }

        if (info == '') {
            alert('错误：消息为空');
            return;
        } // 错误：消息空

        // 签名 {
        const crypt = new JSEncrypt({default_key_size: 2048});
        const priKey = localStorage.getItem('priKey');
        crypt.setPrivateKey(priKey);
        const sign = crypt.sign("[" + id.toString() + "]" + info, CryptoJS.SHA256, "sha256");
        // }

        // 发送 {
        const {data, error} = await supabase
            .from('messages')
            .insert([
                {
                    id: id,
                    name: name,
                    info: info,
                    sign: sign
                }
            ]);
        if (error) {
            alert('错误：' + error.message);
        } else {
            alert('发送成功')
        } // 错误：发送失败
        // }

        load(); // 重新载入消息
    } catch (error) {
        alert('错误：' + error.message);
    } // 错误：未知
} // 发送

write_path("加密页面", "/locked.html"); // 写入导航栏
load(); // 初始加载