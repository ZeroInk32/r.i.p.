// ================= Supabase 配置 =================
const SUPABASE_URL = 'https://yrtkocalrqslwvaozfzf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jDZ6SWz7XUIgNuPE6YEKng_6H0p9D8G';

const API_URL = `${SUPABASE_URL}/rest/v1`;

// 通用 fetch 配置
const fetchConfig = (method, body = null) => ({
    method,
    headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: body ? JSON.stringify(body) : null
});

// ================= 获取当前老师标识 =================
function getTeacherId() {
    const container = document.querySelector('.memorial-container');
    if (container) {
        return container.getAttribute('data-teacher') || 'liuyin';
    }
    return 'liuyin';
}

// ================= 留言相关 API =================
async function loadComments() {
    const teacherId = getTeacherId();
    try {
        const response = await fetch(
            `${API_URL}/comments?select=*&teacher_id=eq.${teacherId}&order=created_at.desc`,
            fetchConfig('GET')
        );
        if (!response.ok) throw new Error('加载留言失败');
        const comments = await response.json();
        renderComments(comments);
    } catch (error) {
        console.error('加载留言出错:', error);
        document.getElementById('messageList').innerHTML = '<div class="empty-msg">加载失败，请刷新重试</div>';
    }
}

async function addComment(name, content) {
    const teacherId = getTeacherId();
    try {
        const response = await fetch(
            `${API_URL}/comments`,
            fetchConfig('POST', { name, content, teacher_id: teacherId })
        );
        if (!response.ok) throw new Error('发送留言失败');
        await loadComments();
        return true;
    } catch (error) {
        console.error('发送留言出错:', error);
        alert('发送失败，请稍后重试');
        return false;
    }
}

function renderComments(comments) {
    const teacherId = getTeacherId();
    const teacherName = teacherId === 'liuyin' ? '刘银老师' : '黎家玲老师';
    const nameIcon = teacherId === 'liuyin' ? '📖' : '📐';
    
    const container = document.getElementById('messageList');
    if (!comments || comments.length === 0) {
        container.innerHTML = '<div class="empty-msg">✨ 暂无留言，请写下您的追思 ✨</div>';
        return;
    }
    container.innerHTML = comments.map(comment => `
        <div class="single-message">
            <div>
                <span class="msg-name">${nameIcon} ${escapeHtml(comment.name)}</span>
                <span style="font-size:0.7rem; opacity:0.7;"> · 致${teacherName}</span>
            </div>
            <div class="msg-text">${escapeHtml(comment.content)}</div>
            <div class="msg-date">${formatDate(comment.created_at)}</div>
        </div>
    `).join('');
}

// ================= 追思记录 API =================
async function loadGifts() {
    const teacherId = getTeacherId();
    try {
        const response = await fetch(
            `${API_URL}/gifts?select=*&teacher_id=eq.${teacherId}&order=created_at.desc&limit=50`,
            fetchConfig('GET')
        );
        if (!response.ok) throw new Error('加载追思记录失败');
        const gifts = await response.json();
        renderGifts(gifts);
    } catch (error) {
        console.error('加载追思记录出错:', error);
        document.getElementById('unifiedLog').innerHTML = '<div class="empty-msg">加载失败，请刷新重试</div>';
    }
}

async function addGiftRecord(sender, actionType, giftName = null) {
    const teacherId = getTeacherId();
    try {
        const body = { sender, action_type: actionType, teacher_id: teacherId };
        if (giftName) body.gift_name = giftName;

        const response = await fetch(
            `${API_URL}/gifts`,
            fetchConfig('POST', body)
        );
        if (!response.ok) throw new Error('记录失败');
        await loadGifts();
        return true;
    } catch (error) {
        console.error('记录出错:', error);
        alert('操作失败，请稍后重试');
        return false;
    }
}

function renderGifts(gifts) {
    const container = document.getElementById('unifiedLog');
    if (!gifts || gifts.length === 0) {
        container.innerHTML = '<p><span class="log-time">🍃 静默</span> 待您留下追思印记</p>';
        return;
    }
    let html = '';
    gifts.forEach(gift => {
        let line = '';
        if (gift.action_type === 'flower') {
            line = `🌸 献花 · ${escapeHtml(gift.sender)} 敬献鲜花`;
        } else if (gift.action_type === 'candle') {
            line = `🕯️ 点烛 · ${escapeHtml(gift.sender)} 点亮心烛`;
        } else if (gift.action_type === 'gift') {
            line = `🎁 赠礼 · ${escapeHtml(gift.sender)} 敬赠「${escapeHtml(gift.gift_name || '心意')}」`;
        } else {
            line = `✨ ${escapeHtml(gift.sender)} 寄托思念`;
        }
        html += `<p><span class="log-time">${formatDate(gift.created_at)}</span> ${line}</p>`;
    });
    container.innerHTML = html;
}

// ================= 辅助函数 =================
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function (m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function formatDate(dateStr) {
    if (!dateStr) return '刚刚';
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function createFloatingPetals(count) {
    const teacherId = getTeacherId();
    const types = teacherId === 'liuyin' 
        ? ['🌸', '🌼', '🌺', '🍂', '🍃', '🌸', '🌿', '📖', '🍃']
        : ['🌸', '🌼', '🌺', '🍂', '🍃', '🌸', '🌿', '📐', 'π'];
    
    for (let i = 0; i < count; i++) {
        const petal = document.createElement('div');
        petal.className = 'flower-petal';
        petal.innerHTML = types[Math.floor(Math.random() * types.length)];
        petal.style.left = Math.random() * 100 + '%';
        petal.style.fontSize = (1 + Math.random() * 1.3) + 'rem';
        petal.style.opacity = 0.7 + Math.random() * 0.3;
        const duration = 3 + Math.random() * 5;
        petal.style.animation = `fall ${duration}s linear forwards`;
        document.body.appendChild(petal);
        setTimeout(() => petal.remove(), duration * 1000);
    }
}

function createFloatingSparkles(count) {
    for (let i = 0; i < count; i++) {
        const spark = document.createElement('div');
        spark.className = 'flower-petal';
        spark.innerHTML = '✨';
        spark.style.left = Math.random() * 100 + '%';
        spark.style.fontSize = '1.1rem';
        spark.style.opacity = 0.9;
        spark.style.animation = `fall ${2 + Math.random() * 3}s linear forwards`;
        document.body.appendChild(spark);
        setTimeout(() => spark.remove(), 3000);
    }
}

// 蜡烛视觉效果
let activeCandles = 0;

function updateCandleVisuals() {
    const candleContainer = document.getElementById('candleDisplay');
    if (!candleContainer) return;
    if (activeCandles >= 6) {
        const tip = document.createElement('div');
        tip.innerText = '烛光满堂，思念深厚。';
        tip.style.cssText = 'font-size:0.7rem;color:#b87c4f;padding:4px;animation:fadeIn 0.3s ease;';
        candleContainer.appendChild(tip);
        setTimeout(() => tip.remove(), 1500);
        return;
    }
    activeCandles++;
    const candleDiv = document.createElement('div');
    candleDiv.className = 'candle';
    const flame = document.createElement('div');
    flame.className = 'flame';
    candleDiv.appendChild(flame);
    candleContainer.appendChild(candleDiv);
    while (candleContainer.children.length > 6) {
        candleContainer.removeChild(candleContainer.firstChild);
        activeCandles--;
    }
}

function initDefaultCandles() {
    const candleContainer = document.getElementById('candleDisplay');
    if (candleContainer && candleContainer.children.length === 0) {
        for (let i = 0; i < 2; i++) {
            const candleDiv = document.createElement('div');
            candleDiv.className = 'candle';
            const flame = document.createElement('div');
            flame.className = 'flame';
            candleDiv.appendChild(flame);
            candleContainer.appendChild(candleDiv);
            activeCandles++;
        }
    }
}

function showToast(message, emoji = '', isError = false) {
    const toast = document.createElement('div');
    toast.innerText = `${emoji} ${message}`;
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: ${isError ? '#8b5a2ee6' : '#2f241be6'};
        backdrop-filter: blur(8px);
        color: #fef3e0;
        padding: 10px 24px;
        border-radius: 48px;
        z-index: 10000;
        font-size: 0.85rem;
        font-family: 'Noto Serif SC', serif;
        letter-spacing: 1px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        white-space: nowrap;
        opacity: 0;
        transition: all 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

// 检查姓名是否有效
function isValidName(name) {
    return name && name.trim() !== '';
}

// ================= 事件绑定与初始化 =================
document.addEventListener('DOMContentLoaded', () => {
    const teacherId = getTeacherId();
    const storageKey = `memorial_name`;  // 统一 key，跨老师共享

    // 从 localStorage 读取保存的姓名（如果有）
    const savedName = localStorage.getItem(storageKey) || '';

    const senderInput = document.getElementById('unifiedSenderName');
    const giftItemInput = document.getElementById('giftItemName');
    const guestNameInput = document.getElementById('guestName');

    // 设置初始值（如果保存过姓名则显示，否则为空）
    senderInput.value = savedName;
    guestNameInput.value = savedName;

    // 同步两个名称输入框
    const syncName = (source, target) => {
        const newName = source.value;
        target.value = newName;
        if (isValidName(newName)) {
            localStorage.setItem(storageKey, newName.trim());
        } else {
            localStorage.removeItem(storageKey);
        }
    };

    senderInput.addEventListener('input', () => syncName(senderInput, guestNameInput));
    guestNameInput.addEventListener('input', () => syncName(guestNameInput, senderInput));

    // 加载数据
    loadComments();
    loadGifts();
    initDefaultCandles();

    // 献花
    document.getElementById('flowerBtn').addEventListener('click', async () => {
        let sender = senderInput.value.trim();
        if (!isValidName(sender)) {
            showToast('请先填写您的姓名', '🙏', true);
            senderInput.focus();
            return;
        }
        
        const btn = document.getElementById('flowerBtn');
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => { btn.style.transform = ''; }, 150);
        
        const success = await addGiftRecord(sender, 'flower');
        if (success) {
            createFloatingPetals(22);
            showToast(`${sender} 献上一束鲜花`, '🌸');
        }
    });

    // 点烛
    document.getElementById('candleBtn').addEventListener('click', async () => {
        let sender = senderInput.value.trim();
        if (!isValidName(sender)) {
            showToast('请先填写您的姓名', '🙏', true);
            senderInput.focus();
            return;
        }
        
        const btn = document.getElementById('candleBtn');
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => { btn.style.transform = ''; }, 150);
        
        const success = await addGiftRecord(sender, 'candle');
        if (success) {
            createFloatingSparkles(18);
            updateCandleVisuals();
            showToast(`${sender} 点亮追思烛光`, '🕯️');
        }
    });

    // 赠礼
    document.getElementById('sendGiftBtn').addEventListener('click', async () => {
        let sender = senderInput.value.trim();
        if (!isValidName(sender)) {
            showToast('请先填写您的姓名', '🙏', true);
            senderInput.focus();
            return;
        }
        let giftVal = giftItemInput.value.trim() || '心意';
        if (giftVal === '') giftVal = '心意';
        
        const btn = document.getElementById('sendGiftBtn');
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => { btn.style.transform = ''; }, 150);
        
        const success = await addGiftRecord(sender, 'gift', giftVal);
        if (success) {
            createFloatingPetals(12);
            showToast(`${sender} 敬赠「${giftVal}」`, '🎁');
        }
    });

    // 留言
    document.getElementById('sendMsgBtn').addEventListener('click', async () => {
        const name = guestNameInput.value.trim();
        if (!isValidName(name)) {
            showToast('请先填写您的姓名', '🙏', true);
            guestNameInput.focus();
            return;
        }
        const content = document.getElementById('guestMsg').value.trim();
        if (!content) {
            showToast('请写下寄语内容', '📝', true);
            return;
        }
        
        const btn = document.getElementById('sendMsgBtn');
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => { btn.style.transform = ''; }, 150);
        
        const success = await addComment(name, content);
        if (success) {
            document.getElementById('guestMsg').value = '';
            createFloatingPetals(10);
            const emoji = teacherId === 'liuyin' ? '📖' : '📐';
            showToast(`${name} 留下思念寄语`, emoji);
        }
    });
});