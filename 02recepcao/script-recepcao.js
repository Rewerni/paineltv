// 🔥 FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyBoMhyOV54qyPRRMvBif5VdSweMa1BXVeA",
  authDomain: "cer3-f2d30.firebaseapp.com",
  databaseURL: "https://cer3-f2d30-default-rtdb.firebaseio.com",
  projectId: "cer3-f2d30",
  storageBucket: "cer3-f2d30.firebasestorage.app",
  messagingSenderId: "357179911279",
  appId: "1:357179911279:web:003b3fe84b32d8b3f8b19a"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();


// 🔥 LISTAS
const nomes = [
    "JOÃO", "MARIA", "ANA", "PEDRO", "LUCAS", "CARLOS", "FERNANDA",
    "RAFAEL", "BRUNO", "JULIA", "VÂNIA", "REMANY", "GABRIEL",
    "CAMILA", "MARIANA", "PAULO", "RENATA", "THIAGO", "ALICE"
];

const sobrenomes = [
    "SILVA", "OLIVEIRA", "SOUZA", "SANTOS", "PEREIRA", "ALMEIDA",
    "COSTA", "ROCHA", "LIMA", "MARTINS", "GOMES", "ARAÚJO", "BARBOSA"
];

const especialidades = [
    "FISIOTERAPIA",
    "FONOAUDIOLOGIA",
    "PSICOLOGIA",
    "TERAPIA OCUPACIONAL",
    "NUTRIÇÃO"
];


// 🔥 CONTADOR DE SENHA
let contador = 9;


// 🔥 FILA INICIAL
let fila = [
    { id: "A08", nome: "REMANY VERNEQUES", depto: "FISIOTERAPIA", sala: "SALA 02" },
    { id: "B15", nome: "MARCOS SOUZA OLIVEIRA", depto: "TERAPIA OCUPACIONAL", sala: "SALA 11" },
    { id: "A09", nome: "VÂNIA VERNEQUES", depto: "FONOAUDIOLOGIA", sala: "SALA 05" }
];

let pacienteAtual = null;


// 🔥 DESCOBRIR MAIOR SENHA NUMÉRICA JÁ EXISTENTE
function inicializarContador() {
    fila.forEach(p => {
        const numero = parseInt(p.id.replace(/\D/g, ""), 10);
        if (!isNaN(numero) && numero > contador) {
            contador = numero;
        }
    });
}


// 🔥 GERAR NOME BRASILEIRO
function gerarNome() {
    const nome = nomes[Math.floor(Math.random() * nomes.length)];
    const sobrenome1 = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
    const sobrenome2 = sobrenomes[Math.floor(Math.random() * sobrenomes.length)];
    return `${nome} ${sobrenome1} ${sobrenome2}`;
}


// 🔥 GERAR SENHA SEQUENCIAL
function gerarSenha() {
    contador++;
    return `A${String(contador).padStart(2, '0')}`;
}


// 🔥 GERAR SALA
function gerarSala() {
    const numero = Math.floor(Math.random() * 20) + 1;
    return `SALA ${String(numero).padStart(2, '0')}`;
}


// 🔥 GERAR PACIENTE
function gerarPaciente() {
    const input = document.getElementById("input-nome");
    const nomeDigitado = input.value.trim();

    const paciente = {
        id: gerarSenha(),
        nome: nomeDigitado || gerarNome(),
        depto: especialidades[Math.floor(Math.random() * especialidades.length)],
        sala: gerarSala()
    };

    fila.push(paciente);
    input.value = "";

    renderizarFila();
}


// 🔥 SINCRONIZAR FILA
function sincronizarFilaFirebase() {
    db.ref("fila").set(fila);
}


// 🔥 RENDER FILA
function renderizarFila() {
    const container = document.getElementById("queue-container");
    container.innerHTML = "";

    fila.forEach((paciente, index) => {
        container.innerHTML += `
            <div class="q-item">
                <div class="q-item-left">
                    <div class="q-ticket">${paciente.id}</div>
                    <div class="q-text">
                        <span class="q-name">${paciente.nome}</span>
                        <span class="q-dept">${paciente.depto} • ${paciente.sala}</span>
                    </div>
                </div>

                <div class="q-actions">
                    <button class="btn-call" onclick="chamarDireto(${index})">
                        <span class="material-symbols-outlined">volume_up</span>
                        CHAMAR
                    </button>

                    <button class="btn-remove" onclick="removerPaciente(${index})">
                        ✕
                    </button>
                </div>
            </div>
        `;
    });

    sincronizarFilaFirebase();
}


// 🔥 REMOVER PACIENTE
function removerPaciente(index) {
    fila.splice(index, 1);
    renderizarFila();
}


// 🔥 ATUALIZA CARD DE CIMA + FIREBASE + HISTÓRICO
function atualizarPainel(paciente) {
    document.getElementById("current-ticket").textContent = paciente.id;
    document.getElementById("current-name").textContent = paciente.nome;
    document.getElementById("current-meta").textContent = `${paciente.depto} • ${paciente.sala}`;

    db.ref("atual").set({
        id: paciente.id,
        nome: paciente.nome,
        sala: paciente.sala,
        depto: paciente.depto,
        timestamp: Date.now()
    });

    db.ref("historico").push({
        id: paciente.id,
        nome: paciente.nome,
        sala: paciente.sala
    });
}


// 🔥 CHAMAR PRÓXIMO
function chamarProximo() {
    if (fila.length > 0) {
        const proximo = fila.shift();
        pacienteAtual = proximo;

        atualizarPainel(proximo);
        renderizarFila();
    } else {
        alert("Não há mais pacientes na fila!");
    }
}


// 🔥 CHAMAR DIRETO
function chamarDireto(index) {
    if (fila[index]) {
        const paciente = fila.splice(index, 1)[0];
        pacienteAtual = paciente;

        atualizarPainel(paciente);
        renderizarFila();
    }
}


// 🔥 REPETIR CHAMADA
function repetirChamada() {
    if (pacienteAtual) {
        atualizarPainel(pacienteAtual);
    } else {
        alert("Nenhum paciente em atendimento!");
    }
}


// 🔥 EVENTOS
document.getElementById("btn-next").addEventListener("click", chamarProximo);
document.getElementById("btn-repeat").addEventListener("click", repetirChamada);
document.getElementById("btn-gerar").addEventListener("click", gerarPaciente);


// 🔥 INIT
inicializarContador();
renderizarFila();