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


// 🔥 CONTROLE DE ÁUDIO
let audioAtivo = false;

function ativarAudio() {
    audioAtivo = !audioAtivo;

    const btn = document.getElementById("btn-audio");

    if (audioAtivo) {
        btn.innerHTML = '<span class="material-symbols-outlined">volume_up</span>';

        const msg = new SpeechSynthesisUtterance("Áudio ativado");
        msg.lang = "pt-BR";
        window.speechSynthesis.speak(msg);

    } else {
        btn.innerHTML = '<span class="material-symbols-outlined">volume_off</span>';
        window.speechSynthesis.cancel();
    }
}


// 🔥 RELÓGIO
function atualizarRelogio() {
    const agora = new Date();

    const opcoes = {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };

    const horaBrasilia = new Intl.DateTimeFormat('pt-BR', opcoes).format(agora);
    document.getElementById('current-time').textContent = horaBrasilia;
}

setInterval(atualizarRelogio, 1000);
atualizarRelogio();


// 🔥 VOZ IA (ELEVENLABS COM SUA VOZ)
async function anunciarPaciente(id, nome, sala, depto) {

    if (!audioAtivo) return;

    const texto = `Senha: ${id}, ${nome}. Dirija-se à ${sala} de ${depto}.`;

    try {
    // 🔊 beep inicial (sem esperar o áudio inteiro)
    const beepInicio = new Audio("beep.mp3");
    beepInicio.play();

    // espera só um tempo curto (corta o silêncio do mp3)
    await new Promise(resolve => setTimeout(resolve, 300));

        // 🔥 gera voz IA
        const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/1U7hjYhIrPNoAH64muTX", {
            method: "POST",
            headers: {
                "xi-api-key": "sk_b864fffdc83b7482145d07ca968bf61ed1f6554f803f833e",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                text: texto,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.80,
                    similarity_boost: 1,
                    style: 0.01
                }
            })
        });

        if (!response.ok) {
            const erroTexto = await response.text();
            console.error("Erro ElevenLabs:", response.status, erroTexto);
            return;
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        const voz = new Audio(audioUrl);
        await voz.play();

        // espera a voz terminar
        await new Promise(resolve => {
            voz.onended = resolve;
        });

        // 🔊 beep final
        const beepFim = new Audio("beep.mp3");
        beepFim.play();

    } catch (erro) {
        console.error("Erro no áudio:", erro);
    }
}

// 🔥 TEMPO REAL (FIREBASE)
db.ref("atual").on("value", (snapshot) => {
    const data = snapshot.val();

    if (data) {
        document.getElementById("active-ticket").textContent = data.id;
        document.getElementById("active-patient").textContent = data.nome;
        document.getElementById("active-room").textContent = data.sala;
        document.getElementById("active-specialty").textContent = data.depto;

        // 🔥 ANIMAÇÃO DA SENHA (AQUI)
        const senha = document.getElementById("active-ticket");

        senha.classList.remove("animar-senha");
        void senha.offsetWidth;
        senha.classList.add("animar-senha");

        anunciarPaciente(data.id, data.nome, data.sala, data.depto);
    }
});