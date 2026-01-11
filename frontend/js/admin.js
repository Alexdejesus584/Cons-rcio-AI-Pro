const API_URL = '/api';
const TOKEN = localStorage.getItem('token');

// Redirecionar se não estiver logado
if (!TOKEN && !window.location.pathname.includes('login.html')) {
    window.location.href = '/login.html';
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login.html';
}

function showSection(sectionId) {
    const sections = ['dashboard', 'knowledge', 'materials', 'leads', 'settings'];
    sections.forEach(s => {
        const el = document.getElementById(`${s}-section`);
        if (el) el.style.display = 'none';
    });

    document.getElementById(`${sectionId}-section`).style.display = 'block';

    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    // Encontrar o link correto se não for disparado por evento
    if (event) event.currentTarget.classList.add('active');

    if (sectionId === 'knowledge') loadKnowledge();
    if (sectionId === 'materials') loadMaterials();
    if (sectionId === 'leads') loadLeads();
    if (sectionId === 'dashboard') loadStats();
}

function openKnowledgeModal() {
    document.getElementById('modal-container').style.display = 'flex';
    document.getElementById('knowledge-modal').style.display = 'block';
    document.getElementById('material-modal').style.display = 'none';
}

function openMaterialModal() {
    document.getElementById('modal-container').style.display = 'flex';
    document.getElementById('material-modal').style.display = 'block';
    document.getElementById('knowledge-modal').style.display = 'none';
}

function closeModals() {
    document.getElementById('modal-container').style.display = 'none';
}

// Submissão de Conhecimento
document.getElementById('knowledge-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
        titulo: document.getElementById('k-titulo').value,
        categoria: document.getElementById('k-categoria').value,
        conteudo_texto: document.getElementById('k-conteudo').value
    };

    const res = await fetch(`${API_URL}/knowledge`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        closeModals();
        loadKnowledge();
    } else {
        alert('Erro ao salvar conhecimento');
    }
});

// Submissão de Material
document.getElementById('material-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('titulo', document.getElementById('m-titulo').value);
    formData.append('descricao', document.getElementById('m-descricao').value);
    formData.append('tags', document.getElementById('m-tags').value);
    formData.append('arquivo', document.getElementById('m-arquivo').files[0]);

    const res = await fetch(`${API_URL}/materiais/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${TOKEN}` },
        body: formData
    });

    if (res.ok) {
        closeModals();
        loadMaterials();
    } else {
        alert('Erro no upload');
    }
});

async function loadKnowledge() {
    const res = await fetch(`${API_URL}/knowledge`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const data = await res.json();
    const list = document.getElementById('knowledge-list');
    list.innerHTML = data.map(k => `
        <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h4>${k.titulo}</h4>
                <button onclick="deleteKnowledge(${k.id})" style="background: none; border: none; color: var(--danger); cursor: pointer;">Excluir</button>
            </div>
            <p style="font-size: 0.875rem; color: var(--text-muted); margin: 0.5rem 0;">${k.categoria}</p>
            <p style="font-size: 0.875rem; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${k.conteudo_texto}</p>
        </div>
    `).join('');
}

async function deleteKnowledge(id) {
    if (!confirm('Tem certeza?')) return;
    await fetch(`${API_URL}/knowledge/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    loadKnowledge();
}

async function deleteMaterial(id) {
    // Rota e controller de delete precisam ser implementados no backend se desejar
    alert('Funcionalidade de exclusão de arquivo físico em desenvolvimento');
}

async function loadLeads() {
    const res = await fetch(`${API_URL}/leads`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const data = await res.json();
    const tbody = document.getElementById('leads-table-body');
    tbody.innerHTML = data.map(l => `
        <tr style="border-bottom: 1px solid var(--border);">
            <td style="padding: 1rem;">${l.nome || 'Sem nome'}</td>
            <td style="padding: 1rem;">${l.telefone}</td>
            <td style="padding: 1rem;">${l.tipo_consorcio || 'Não Identificado'} (Score: ${l.score_interesse || 0}%)</td>
            <td style="padding: 1rem;"><span class="badge badge-${l.status.toLowerCase()}">${l.status}</span></td>
        </tr>
    `).join('');
}

async function loadStats() {
    const resLeads = await fetch(`${API_URL}/leads/quentes`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const hotLeads = await resLeads.json();
    document.getElementById('hot-leads-count').innerText = hotLeads.length;

    const resK = await fetch(`${API_URL}/knowledge`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const kData = await resK.json();
    document.getElementById('knowledge-count').innerText = kData.length;
}

async function loadMaterials() {
    const res = await fetch(`${API_URL}/materiais`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    const data = await res.json();
    const list = document.getElementById('materials-list');
    if (!list) return;
    list.innerHTML = data.map(m => `
        <div class="card">
            <h4>${m.titulo}</h4>
            <p class="badge">${m.tipo}</p>
            <p style="font-size: 0.875rem; color: var(--text-muted);">${m.tags || ''}</p>
        </div>
    `).join('');
}

// Inicializar
window.onload = () => {
    // Corrigir display inicial do modal container para esconder
    document.getElementById('modal-container').style.display = 'none';
    loadStats();
};

// Submissão de Token de Serviço
document.getElementById('service-token-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('st-nome').value;
    const expiresIn = document.getElementById('st-expires').value;
    const checkboxes = document.querySelectorAll('input[name="scopes"]:checked');
    const scopes = Array.from(checkboxes).map(cb => cb.value);

    if (scopes.length === 0) {
        alert('Selecione pelo menos um escopo');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/auth/service-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({ nome, scopes, expiresIn })
        });

        if (res.ok) {
            const data = await res.json();
            document.getElementById('generated-token').textContent = data.token;
            document.getElementById('token-result').style.display = 'block';
            document.getElementById('st-nome').value = '';
        } else {
            const err = await res.json();
            alert(`Erro: ${err.error}`);
        }
    } catch (error) {
        console.error(error);
        alert('Erro ao gerar token de serviço');
    }
});

function copyToken() {
    const token = document.getElementById('generated-token').textContent;
    navigator.clipboard.writeText(token).then(() => {
        alert('Token copiado para a área de transferência!');
    });
}
