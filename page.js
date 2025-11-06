const md = window.markdownit({});
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

function go_im()
{
    window.location.replace("/gogu/view-page.html?id=" + getArgs("id"));
}

function verify_article(id, pubkey, sign) {
    try {
        const crypt = new JSEncrypt({ default_key_size: 2048 });
        crypt.setPublicKey(pubkey);
        return crypt.verify("[page]" + id.toString(), sign, CryptoJS.SHA256);
    }
    catch (error) { return false; }
}

async function load_list() {
    if (localStorage.getItem("name") != null) {
        const supabase = getClient();
        const titlerEl = document.getElementById('titler');
        const containerEl = document.getElementById('container');
        if (getArgs('id') == null) {
            var { data: articles, error: errorm } = await supabase
                .from('pages')
                .select('id, name, title, info, sign')
                .order('id');
            const { data: users, error: erroru } = await supabase
                .from('users')
                .select('name, pubkey')
                .order('name');
            if (errorm || erroru) {
                containerEl.innerHTML = `<p>页面加载失败...你可以尝试刷新页面，有时候数据库状态不太好，毕竟是免费的啦...</p>`;
                return;
            }
            if (getArgs('all') != "1") articles = articles.slice(0, 20);
            titlerEl.innerHTML = "页面列表";
            let pageHTML = ``;
            pageHTML += `
                <div class="card" style="width: 40%; position: fixed; right: 0; bottom: 0;">
                    <div class="card" style="width: 100px; text-align: center;">
                        ${localStorage.getItem("name")}
                    </div>
                    <!--div style="text-align: right;">
                        <a href="/gogu/prikey.html">查看我的 priKey</a>
                        <br>
                        <a href="javascript:sign_out()" style="color: #ff0000">登出</a>
                    </div-->
                    <textarea id="article_title" rows="2" col="10" placeholder="标题"></textarea>
                    <textarea id="article_text" rows="10" style="width: 97%" placeholder="内容(HTML)"></textarea>
                    <button onclick="send_article()">发送</button>
                </div>
            `;
            pageHTML += `<div style="display: grid; place-items: center;">`;
            var userKey = new Map();
            users.forEach(user => {
                userKey.set(user.name, user.pubkey);
            });
            articles.forEach(article => {
                if (check_other_char(article.name) && verify_article(article.id, userKey.get(article.name), article.sign)) {
                    pageHTML += `
                    <div class="card" style="width: 70%;">
                        <div class="card" style="width: 100px; text-align: center;">${article.name}</div>
                        <a href="?id=${article.id}"><div class="card" style="width: 97%;"><h2>${article.title}</h2></div></a>
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
                    titlerEl.innerHTML = "404";
                    containerEl.innerHTML = `<p style="text-align: center;">页面不见了呐~</p>`;
                }
                else if (verify_article(article[0].id, users[0].pubkey, article[0].sign)) {
                    titlerEl.innerHTML = article[0].title;
                    containerEl.innerHTML = `
                        <div style="display: grid; place-items: center; height: ${document.documentElement.clientHeight * 0.6}px;">
                            <div style="width: 70%; height: 100%;">
                                <div class="card" style="width: 100px; text-align: center;">${article[0].name}</div>
                                <button onclick="go_im()">点击前往沉浸版（不建议，可能导致 priKey 被偷走）</button>
                                <iframe src="/gogu/view-page.html?id=${getArgs("id")}" sandbox="allow-scripts allow-same-origin" style="height: 100%; width: 100%; background-color: white;"></iframe>
                            </div>
                        </div>
                        <br>
                    `;
                } else {
                    titlerEl.innerHTML = "404";
                    containerEl.innerHTML = `<p style="text-align: center;">页面不见了呐~</p>`;
                }
            }
            catch (error) {
                titlerEl.innerHTML = "404";
                containerEl.innerHTML = `<p style="text-align: center;">页面不见了呐~</p>`;
            }
        }
    } else {
        window.location.replace("/gogu/signup.html");
    }
}

async function send_article() {
    try {
        const supabase = getClient();
        const articleId = -Date.now();
        const userName = localStorage.getItem('name');
        const articleTitle = document.getElementById('article_title').value;
        const articleInfo = document.getElementById('article_text').value;
        if (userName == null) alert('错误：未登录');
        else if (articleInfo == '') alert('错误：内容为空');
        else {
            const crypt = new JSEncrypt({ default_key_size: 2048 });
            const priKey = localStorage.getItem('priKey');
            crypt.setPrivateKey(priKey);
            const messageSign = crypt.sign("[page]" + articleId.toString(), CryptoJS.SHA256, "sha256");
            const { data, error } = await supabase
                .from('pages')
                .insert([
                    {
                        id: articleId,
                        name: userName,
                        title: articleTitle,
                        info: articleInfo,
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

write_path("页面", "/gogu/page.html");
if (getArgs('id') != null) write_path(getArgs('id'), `/gogu/page.html?id=${getArgs('id')})`);

load_list();