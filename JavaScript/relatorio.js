// ==========================================
// AJBorges - Script do Relatório de Viagem
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Elementos do Formulário
    const form = document.getElementById('form-relatorio');
    const inputMotorista = document.getElementById('motorista');
    const inputPlacas = document.getElementById('placas');
    const inputDataSaida = document.getElementById('data-saida');
    const inputDataChegada = document.getElementById('data-chegada');
    const inputKmSaida = document.getElementById('km-saida');
    const inputKmChegada = document.getElementById('km-chegada');
    const inputKmTotal = document.getElementById('km-total');
    const inputDestinoInicial = document.getElementById('destino-inicial');
    const inputDestinoFinal = document.getElementById('destino-final');
    const inputAdiantamento = document.getElementById('valor-adiantamento');

    // Sub-bloco de Fretes
    const inputFreteOrigem = document.getElementById('frete-origem');
    const inputRetorno1 = document.getElementById('retorno-1');
    const inputRetorno2 = document.getElementById('retorno-2');
    const inputRetorno3 = document.getElementById('retorno-3');
    const inputTotalFrete = document.getElementById('total-frete');
    const inputVrComissao = document.getElementById('vr-comissao');

    // Seletor de Tipo de Relatório
    const btnOpcaoPadrao = document.getElementById('btn-opcao-padrao');
    const btnOpcaoMl = document.getElementById('btn-opcao-ml');
    const secaoPadrao = document.getElementById('secao-formulario-padrao');
    const secaoMl = document.getElementById('secao-formulario-ml');

    // Toast
    const toast = document.getElementById('toast-notificacao');

    // ------------------------------------------
    // 1. Formatação de Placas (Maiúsculas e Hífen)
    // ------------------------------------------
    if (inputPlacas) {
        inputPlacas.addEventListener('input', (e) => {
            let valor = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (valor.length > 3 && !valor.includes('-') && /^[A-Z]{3}[0-9]/.test(valor)) {
                // Formato padrão antigo AAA-9999 ou Mercosul AAA9A99
                if (/^[A-Z]{3}[0-9]{4}$/.test(valor)) {
                    valor = valor.substring(0, 3) + '-' + valor.substring(3);
                }
            }
            e.target.value = valor.substring(0, 8);
        });
    }

    // ------------------------------------------
    // 2. Bloqueio de Hífen / Negativos no KM
    // ------------------------------------------
    function aplicarBloqueioNegativoKm(input) {
        if (!input) return;

        input.addEventListener('keydown', (e) => {
            // Proíbe hífen/menos (-), Expoente (e, E), mais (+) e tecla do teclado numérico
            if (e.key === '-' || e.key === 'Minus' || e.code === 'NumpadSubtract' || e.key === 'e' || e.key === 'E' || e.key === '+') {
                e.preventDefault();
            }
        });

        input.addEventListener('input', (e) => {
            // Garante estritamente apenas números positivos
            const valorLimpo = e.target.value.replace(/[^0-9]/g, '');
            if (e.target.value !== valorLimpo) {
                e.target.value = valorLimpo;
            }
            calcularKmTotal();
        });

        input.addEventListener('paste', (e) => {
            const pasteData = (e.clipboardData || window.clipboardData).getData('text');
            if (pasteData && /[^0-9]/.test(pasteData)) {
                e.preventDefault();
                const limpo = pasteData.replace(/[^0-9]/g, '');
                document.execCommand('insertText', false, limpo);
                calcularKmTotal();
            }
        });
    }

    aplicarBloqueioNegativoKm(inputKmSaida);
    aplicarBloqueioNegativoKm(inputKmChegada);
    aplicarBloqueioNegativoKm(inputKmTotal);

    // ------------------------------------------
    // 3. Validação de Destino (Proíbe Números e Caracteres Especiais)
    // ------------------------------------------
    function aplicarValidacaoDestino(input) {
        if (!input) return;

        input.addEventListener('keydown', (e) => {
            // Permitir teclas de navegação e edição
            if (e.ctrlKey || e.altKey || e.metaKey || [
                'Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Delete', 'Home', 'End'
            ].includes(e.key)) {
                return;
            }

            // Bloquear se for número (0-9) ou caractere especial proibido (ex: %$#@!* etc.)
            // Permite apenas letras (com acentos), espaços e hífen
            if (/[0-9%$#@!&*()+=[\]{};:?^~|<>`\\\/_"]/.test(e.key) || /[^a-zA-ZáàâãéèêíïóôõöúçñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ\s\-]/.test(e.key)) {
                e.preventDefault();
            }
        });

        input.addEventListener('input', (e) => {
            // Remove instantaneamente qualquer número ou caractere especial
            const valorLimpo = e.target.value.replace(/[^A-Za-zÀ-ÿ\s\-]/g, '');
            if (e.target.value !== valorLimpo) {
                e.target.value = valorLimpo;
            }
        });

        input.addEventListener('paste', (e) => {
            const pasteData = (e.clipboardData || window.clipboardData).getData('text');
            if (pasteData && /[^A-Za-zÀ-ÿ\s\-]/.test(pasteData)) {
                e.preventDefault();
                const limpo = pasteData.replace(/[^A-Za-zÀ-ÿ\s\-]/g, '');
                document.execCommand('insertText', false, limpo);
            }
        });
    }

    aplicarValidacaoDestino(inputDestinoInicial);
    aplicarValidacaoDestino(inputDestinoFinal);

    // ------------------------------------------
    // 4. Cálculo Automático do KM / HM Total
    // ------------------------------------------
    function calcularKmTotal() {
        if (!inputKmSaida || !inputKmChegada || !inputKmTotal) return;

        const valSaida = inputKmSaida.value.replace(/\D/g, '');
        const valChegada = inputKmChegada.value.replace(/\D/g, '');

        if (!valSaida || !valChegada) {
            inputKmTotal.value = '';
            return;
        }

        const kmSaida = parseInt(valSaida, 10);
        const kmChegada = parseInt(valChegada, 10);

        if (!isNaN(kmSaida) && !isNaN(kmChegada)) {
            if (kmChegada >= kmSaida) {
                const total = kmChegada - kmSaida;
                inputKmTotal.value = total;
            } else {
                inputKmTotal.value = '';
            }
        } else {
            inputKmTotal.value = '';
        }
    }

    if (inputKmSaida && inputKmChegada) {
        inputKmSaida.addEventListener('input', calcularKmTotal);
        inputKmChegada.addEventListener('input', calcularKmTotal);
    }

    // ------------------------------------------
    // 3. Formatação e Cálculo Monetário (R$)
    // ------------------------------------------
    function parseMoeda(str) {
        if (!str) return 0;
        const apenasDigitos = str.toString().replace(/\D/g, '');
        if (!apenasDigitos) return 0;
        return parseFloat(apenasDigitos) / 100;
    }

    function formatarMoeda(valor) {
        if (isNaN(valor) || valor === null) return 'R$ 0,00';
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }

    function aplicarMascaraMoeda(input) {
        if (!input) return;

        input.addEventListener('input', (e) => {
            let digitos = e.target.value.replace(/\D/g, '');
            if (!digitos) {
                e.target.value = '';
                calcularTotalFrete();
                return;
            }

            const valorNumerico = parseFloat(digitos) / 100;
            e.target.value = formatarMoeda(valorNumerico);
            calcularTotalFrete();
        });

        input.addEventListener('blur', (e) => {
            if (e.target.value.trim() !== '') {
                const valorNumerico = parseMoeda(e.target.value);
                e.target.value = formatarMoeda(valorNumerico);
            }
        });
    }

    // Aplica máscara nos campos monetários
    const camposMoeda = [
        inputAdiantamento,
        inputFreteOrigem,
        inputRetorno1,
        inputRetorno2,
        inputRetorno3,
        inputTotalFrete,
        inputVrComissao
    ];

    camposMoeda.forEach(aplicarMascaraMoeda);

    // ------------------------------------------
    // 4. Cálculo Automático do Total de Fretes
    // ------------------------------------------
    function calcularTotalFrete() {
        if (!inputTotalFrete) return;

        const valOrigem = parseMoeda(inputFreteOrigem ? inputFreteOrigem.value : '');
        const valRetorno1 = parseMoeda(inputRetorno1 ? inputRetorno1.value : '');
        const valRetorno2 = parseMoeda(inputRetorno2 ? inputRetorno2.value : '');
        const valRetorno3 = parseMoeda(inputRetorno3 ? inputRetorno3.value : '');

        const total = valOrigem + valRetorno1 + valRetorno2 + valRetorno3;

        if (total > 0) {
            inputTotalFrete.value = formatarMoeda(total);
        } else {
            inputTotalFrete.value = '';
        }
    }

    // ------------------------------------------
    // 5. Exibição de Toast / Notificações
    // ------------------------------------------
    function exibirToast(mensagem, tipo = 'sucesso') {
        if (!toast) return;

        const msgElem = toast.querySelector('.toast-mensagem');
        if (msgElem) msgElem.textContent = mensagem;

        toast.className = `toast toast-${tipo} toast-visivel`;

        setTimeout(() => {
            toast.className = 'toast';
        }, 3500);
    }

    // ------------------------------------------
    // 6. Alternância do Tipo de Relatório
    // ------------------------------------------
    const STORAGE_TIPO_KEY = 'ajborges_tipo_relatorio_escolhido';

    function selecionarTipoRelatorio(tipo, dispararToast = true) {
        if (tipo === 'padrao') {
            if (btnOpcaoPadrao) btnOpcaoPadrao.classList.add('opcao-selecionada');
            if (btnOpcaoMl) btnOpcaoMl.classList.remove('opcao-selecionada');

            if (secaoPadrao) {
                secaoPadrao.classList.remove('oculto');
                secaoPadrao.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            if (secaoMl) secaoMl.classList.add('oculto');

            if (dispararToast) {
                exibirToast('Opção selecionada: Relatório de viagem', 'info');
            }
        } else if (tipo === 'ml') {
            if (btnOpcaoMl) btnOpcaoMl.classList.add('opcao-selecionada');
            if (btnOpcaoPadrao) btnOpcaoPadrao.classList.remove('opcao-selecionada');

            if (secaoMl) {
                secaoMl.classList.remove('oculto');
                secaoMl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
            if (secaoPadrao) secaoPadrao.classList.add('oculto');

            if (dispararToast) {
                exibirToast('Opção selecionada: Relatório de viagem - ML', 'info');
            }
        }

        localStorage.setItem(STORAGE_TIPO_KEY, tipo);
    }

    if (btnOpcaoPadrao) {
        btnOpcaoPadrao.addEventListener('click', () => selecionarTipoRelatorio('padrao', true));
    }

    if (btnOpcaoMl) {
        btnOpcaoMl.addEventListener('click', () => selecionarTipoRelatorio('ml', true));
    }

    // ------------------------------------------
    // 7. Salvar e Carregar Dados em Andamento
    // ------------------------------------------
    const STORAGE_KEY = 'ajborges_relatorio_viagem_rascunho';

    function salvarProgressoAutomatico() {
        const dados = {
            motorista: inputMotorista ? inputMotorista.value : '',
            placas: inputPlacas ? inputPlacas.value : '',
            dataSaida: inputDataSaida ? inputDataSaida.value : '',
            dataChegada: inputDataChegada ? inputDataChegada.value : '',
            kmSaida: inputKmSaida ? inputKmSaida.value : '',
            kmChegada: inputKmChegada ? inputKmChegada.value : '',
            kmTotal: inputKmTotal ? inputKmTotal.value : '',
            destinoInicial: inputDestinoInicial ? inputDestinoInicial.value : '',
            destinoFinal: inputDestinoFinal ? inputDestinoFinal.value : '',
            valorAdiantamento: inputAdiantamento ? inputAdiantamento.value : '',
            freteOrigem: inputFreteOrigem ? inputFreteOrigem.value : '',
            retorno1: inputRetorno1 ? inputRetorno1.value : '',
            retorno2: inputRetorno2 ? inputRetorno2.value : '',
            retorno3: inputRetorno3 ? inputRetorno3.value : '',
            totalFrete: inputTotalFrete ? inputTotalFrete.value : '',
            vrComissao: inputVrComissao ? inputVrComissao.value : ''
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    }

    // Salvar progresso ao digitar em qualquer campo
    const todosCampos = [
        inputMotorista, inputPlacas, inputDataSaida, inputDataChegada,
        inputKmSaida, inputKmChegada, inputKmTotal, inputDestinoInicial,
        inputDestinoFinal, inputAdiantamento, inputFreteOrigem,
        inputRetorno1, inputRetorno2, inputRetorno3, inputTotalFrete, inputVrComissao
    ];

    todosCampos.forEach(campo => {
        if (campo) {
            campo.addEventListener('change', salvarProgressoAutomatico);
        }
    });

    function carregarProgresso() {
        try {
            const rascunhoSalvo = localStorage.getItem(STORAGE_KEY);
            if (rascunhoSalvo) {
                const dados = JSON.parse(rascunhoSalvo);
                if (dados) {
                    if (inputMotorista && dados.motorista) inputMotorista.value = dados.motorista;
                    if (inputPlacas && dados.placas) inputPlacas.value = dados.placas;
                    if (inputDataSaida && dados.dataSaida) inputDataSaida.value = dados.dataSaida;
                    if (inputDataChegada && dados.dataChegada) inputDataChegada.value = dados.dataChegada;
                    if (inputKmSaida && dados.kmSaida) inputKmSaida.value = dados.kmSaida;
                    if (inputKmChegada && dados.kmChegada) inputKmChegada.value = dados.kmChegada;
                    if (inputKmTotal && dados.kmTotal) inputKmTotal.value = dados.kmTotal;
                    if (inputDestinoInicial && dados.destinoInicial) inputDestinoInicial.value = dados.destinoInicial;
                    if (inputDestinoFinal && dados.destinoFinal) inputDestinoFinal.value = dados.destinoFinal;
                    if (inputAdiantamento && dados.valorAdiantamento) inputAdiantamento.value = dados.valorAdiantamento;

                    if (inputFreteOrigem && dados.freteOrigem) inputFreteOrigem.value = dados.freteOrigem;
                    if (inputRetorno1 && dados.retorno1) inputRetorno1.value = dados.retorno1;
                    if (inputRetorno2 && dados.retorno2) inputRetorno2.value = dados.retorno2;
                    if (inputRetorno3 && dados.retorno3) inputRetorno3.value = dados.retorno3;
                    if (inputTotalFrete && dados.totalFrete) inputTotalFrete.value = dados.totalFrete;
                    if (inputVrComissao && dados.vrComissao) inputVrComissao.value = dados.vrComissao;

                    calcularKmTotal();
                    calcularTotalFrete();
                }
            }

            // Restaurar tipo de relatório selecionado
            const tipoSalvo = localStorage.getItem(STORAGE_TIPO_KEY);
            if (tipoSalvo) {
                selecionarTipoRelatorio(tipoSalvo, false);
            }
        } catch (e) {
            console.error('Erro ao carregar dados salvos:', e);
        }
    }

    carregarProgresso();
});
