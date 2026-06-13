// ========================================
// ESTRUTURA DE DADOS
// ========================================

let funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
let folhasPagamento = JSON.parse(localStorage.getItem('folhasPagamento')) || [];

// ========================================
// FUNÇÕES DE NAVEGAÇÃO
// ========================================

function mostrarSecao(secaoId) {
    // Ocultar todas as seções
    const secoes = document.querySelectorAll('.secao');
    secoes.forEach(secao => secao.classList.remove('ativa'));

    // Remover class active de todos os botões
    const botoes = document.querySelectorAll('.btn-menu');
    botoes.forEach(botao => botao.classList.remove('active'));

    // Mostrar seção selecionada
    document.getElementById(secaoId).classList.add('ativa');

    // Adicionar class active ao botão clicado
    event.target.classList.add('active');

    // Atualizar dados quando necessário
    if (secaoId === 'folha') {
        atualizarSelectFuncionarios();
    } else if (secaoId === 'relatorio') {
        gerarRelatorioGeral();
    }
}

// ========================================
// FUNÇÕES DE FUNCIONÁRIO
// ========================================

document.getElementById('formFuncionario')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const funcionario = {
        id: Date.now(),
        nome: document.getElementById('nome').value,
        cpf: document.getElementById('cpf').value,
        cargo: document.getElementById('cargo').value,
        salario: parseFloat(document.getElementById('salario').value),
        dataAdmissao: document.getElementById('dataAdmissao').value
    };

    funcionarios.push(funcionario);
    salvarEmLocalStorage();
    this.reset();
    exibirFuncionarios();
    
    alert('✅ Funcionário cadastrado com sucesso!');
});

function exibirFuncionarios() {
    const lista = document.getElementById('listaFuncionarios');
    
    if (funcionarios.length === 0) {
        lista.innerHTML = '<p class="mensagem-vazia">Nenhum funcionário cadastrado ainda.</p>';
        return;
    }

    lista.innerHTML = funcionarios.map(func => `
        <div class="card-funcionario">
            <h4>${func.nome}</h4>
            <p><span class="info-label">CPF:</span> ${func.cpf}</p>
            <p><span class="info-label">Cargo:</span> ${func.cargo}</p>
            <p><span class="info-label">Salário:</span> R$ ${func.salario.toFixed(2)}</p>
            <p><span class="info-label">Admissão:</span> ${new Date(func.dataAdmissao).toLocaleDateString('pt-BR')}</p>
            <button class="btn-deletar" onclick="deletarFuncionario(${func.id})">Deletar</button>
        </div>
    `).join('');
}

function deletarFuncionario(id) {
    if (confirm('Tem certeza que deseja deletar este funcionário?')) {
        funcionarios = funcionarios.filter(f => f.id !== id);
        salvarEmLocalStorage();
        exibirFuncionarios();
        alert('✅ Funcionário deletado com sucesso!');
    }
}

function atualizarSelectFuncionarios() {
    const select = document.getElementById('funcionarioSelect');
    select.innerHTML = '<option value="">-- Selecione --</option>';
    
    funcionarios.forEach(func => {
        const option = document.createElement('option');
        option.value = func.id;
        option.textContent = `${func.nome} - ${func.cargo}`;
        select.appendChild(option);
    });
}

// ========================================
// FUNÇÕES DE FOLHA DE PAGAMENTO
// ========================================

document.getElementById('formFolha')?.addEventListener('submit', function(e) {
    e.preventDefault();

    const funcionarioId = parseInt(document.getElementById('funcionarioSelect').value);
    const funcionario = funcionarios.find(f => f.id === funcionarioId);

    if (!funcionario) {
        alert('❌ Selecione um funcionário válido!');
        return;
    }

    const horasExtra = parseFloat(document.getElementById('horasExtra').value) || 0;
    const descontoAdicional = parseFloat(document.getElementById('desconto').value) || 0;
    const mes = document.getElementById('mes').value;

    const folha = calcularFolhaPagamento(funcionario, horasExtra, descontoAdicional, mes);
    
    folhasPagamento.push(folha);
    salvarEmLocalStorage();
    exibirResultadoFolha(folha);
    this.reset();
});

function calcularFolhaPagamento(funcionario, horasExtra, descontoAdicional, mes) {
    // Valores base
    const salarioBase = funcionario.salario;
    const valorHoraExtra = (salarioBase / 220) * 1.5; // 50% acrescido
    const valorHorasExtras = valorHoraExtra * horasExtra;

    // Descontos obrigatórios
    const inss = salarioBase * 0.08; // 8%
    const ir = salarioBase * 0.075; // 7.5% (simplificado)

    // Cálculos finais
    const salarioBruto = salarioBase + valorHorasExtras;
    const totalDescontos = inss + ir + descontoAdicional;
    const salarioLiquido = salarioBruto - totalDescontos;

    return {
        id: Date.now(),
        funcionarioId: funcionario.id,
        funcionarioNome: funcionario.nome,
        cargo: funcionario.cargo,
        mes: mes,
        dataEmissao: new Date().toLocaleDateString('pt-BR'),
        salarioBase: salarioBase,
        horasExtra: horasExtra,
        valorHorasExtras: valorHorasExtras,
        salarioBruto: salarioBruto,
        inss: inss,
        ir: ir,
        descontoAdicional: descontoAdicional,
        totalDescontos: totalDescontos,
        salarioLiquido: salarioLiquido
    };
}

function exibirResultadoFolha(folha) {
    const resultado = document.getElementById('resultadoFolha');
    
    resultado.innerHTML = `
        <div class="resultado-item">
            <h4>Folha de Pagamento - ${folha.funcionarioNome}</h4>
            
            <div class="resultado-linha">
                <span class="resultado-label">Período:</span>
                <span class="resultado-valor">${folha.mes}</span>
            </div>
            
            <div class="resultado-linha">
                <span class="resultado-label">Cargo:</span>
                <span class="resultado-valor">${folha.cargo}</span>
            </div>

            <div style="border-top: 2px solid #667eea; margin: 15px 0; padding-top: 15px;">
                <div class="resultado-linha">
                    <span class="resultado-label">Salário Base:</span>
                    <span class="resultado-valor">R$ ${folha.salarioBase.toFixed(2)}</span>
                </div>

                ${folha.horasExtra > 0 ? `
                    <div class="resultado-linha">
                        <span class="resultado-label">Horas Extras (${folha.horasExtra}):</span>
                        <span class="resultado-valor">R$ ${folha.valorHorasExtras.toFixed(2)}</span>
                    </div>
                ` : ''}

                <div class="resultado-linha">
                    <span class="resultado-label"><strong>Salário Bruto:</strong></span>
                    <span class="resultado-valor"><strong>R$ ${folha.salarioBruto.toFixed(2)}</strong></span>
                </div>
            </div>

            <div style="border-top: 2px solid #e0e0e0; margin: 15px 0; padding-top: 15px;">
                <div class="resultado-linha">
                    <span class="resultado-label">INSS (8%):</span>
                    <span class="resultado-valor">- R$ ${folha.inss.toFixed(2)}</span>
                </div>

                <div class="resultado-linha">
                    <span class="resultado-label">IR (7.5%):</span>
                    <span class="resultado-valor">- R$ ${folha.ir.toFixed(2)}</span>
                </div>

                ${folha.descontoAdicional > 0 ? `
                    <div class="resultado-linha">
                        <span class="resultado-label">Desconto Adicional:</span>
                        <span class="resultado-valor">- R$ ${folha.descontoAdicional.toFixed(2)}</span>
                    </div>
                ` : ''}

                <div class="resultado-linha">
                    <span class="resultado-label"><strong>Total de Descontos:</strong></span>
                    <span class="resultado-valor"><strong>- R$ ${folha.totalDescontos.toFixed(2)}</strong></span>
                </div>
            </div>

            <div style="background: #f0f7ff; padding: 15px; border-radius: 5px; margin-top: 15px;">
                <div class="resultado-linha">
                    <span class="resultado-label"><strong>SALÁRIO LÍQUIDO:</strong></span>
                    <span class="valor-destaque">R$ ${folha.salarioLiquido.toFixed(2)}</span>
                </div>
            </div>

            <div style="text-align: center; color: #999; font-size: 0.9em; margin-top: 15px;">
                <p>Emitido em: ${folha.dataEmissao}</p>
            </div>
        </div>
    `;
}

// ========================================
// FUNÇÕES DE RELATÓRIO
// ========================================

function gerarRelatorioGeral() {
    const relatorio = document.getElementById('relatorioCompleto');

    if (folhasPagamento.length === 0) {
        relatorio.innerHTML = '<p class="mensagem-vazia">Nenhuma folha de pagamento gerada ainda.</p>';
        return;
    }

    let html = '';

    // Agrupar por funcionário
    const folhasPorFuncionario = {};
    folhasPagamento.forEach(folha => {
        if (!folhasPorFuncionario[folha.funcionarioNome]) {
            folhasPorFuncionario[folha.funcionarioNome] = [];
        }
        folhasPorFuncionario[folha.funcionarioNome].push(folha);
    });

    // Gerar relatório
    for (const [nome, folhas] of Object.entries(folhasPorFuncionario)) {
        let totalBruto = 0;
        let totalDescontos = 0;
        let totalLiquido = 0;

        folhas.forEach(folha => {
            totalBruto += folha.salarioBruto;
            totalDescontos += folha.totalDescontos;
            totalLiquido += folha.salarioLiquido;
        });

        html += `
            <div class="relatorio-item">
                <h4>${nome}</h4>
                <div class="relatorio-linha">
                    <span class="relatorio-label">Folhas Processadas:</span>
                    <span class="relatorio-valor">${folhas.length}</span>
                </div>
                <div class="relatorio-linha">
                    <span class="relatorio-label">Total Bruto:</span>
                    <span class="relatorio-valor">R$ ${totalBruto.toFixed(2)}</span>
                </div>
                <div class="relatorio-linha">
                    <span class="relatorio-label">Total de Descontos:</span>
                    <span class="relatorio-valor">R$ ${totalDescontos.toFixed(2)}</span>
                </div>
                <div class="relatorio-linha">
                    <span class="relatorio-label"><strong>Total Líquido:</strong></span>
                    <span class="valor-destaque">R$ ${totalLiquido.toFixed(2)}</span>
                </div>
            </div>
        `;
    }

    // Totais gerais
    const totalGeral = folhasPagamento.reduce((sum, folha) => sum + folha.salarioBruto, 0);
    const totalDescontosGeral = folhasPagamento.reduce((sum, folha) => sum + folha.totalDescontos, 0);
    const totalLiquidoGeral = folhasPagamento.reduce((sum, folha) => sum + folha.salarioLiquido, 0);

    html += `
        <div class="relatorio-item" style="background: #fff3cd; border-color: #ffc107;">
            <h4>RESUMO GERAL</h4>
            <div class="relatorio-linha">
                <span class="relatorio-label">Total de Folhas:</span>
                <span class="relatorio-valor">${folhasPagamento.length}</span>
            </div>
            <div class="relatorio-linha">
                <span class="relatorio-label">Total Bruto Geral:</span>
                <span class="relatorio-valor">R$ ${totalGeral.toFixed(2)}</span>
            </div>
            <div class="relatorio-linha">
                <span class="relatorio-label">Total de Descontos:</span>
                <span class="relatorio-valor">R$ ${totalDescontosGeral.toFixed(2)}</span>
            </div>
            <div class="relatorio-linha">
                <span class="relatorio-label"><strong>Total Líquido Geral:</strong></span>
                <span class="valor-destaque">R$ ${totalLiquidoGeral.toFixed(2)}</span>
            </div>
        </div>
    `;

    relatorio.innerHTML = html;
}

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================

function salvarEmLocalStorage() {
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
    localStorage.setItem('folhasPagamento', JSON.stringify(folhasPagamento));
}

// Inicializar ao carregar a página
window.addEventListener('DOMContentLoaded', function() {
    exibirFuncionarios();
});
