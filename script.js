// 1. CONFIGURAÇÃO DA INFRAESTRUTURA DA API (TMDb)
let API_KEY = "";


// Verifica de forma segura se a variável local existe sem travar o navegador
if (typeof CHAVE_PRIVADA_TMDB !== 'undefined') {
    API_KEY = CHAVE_PRIVADA_TMDB;
}

const API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`;
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const BANNER_URL = "https://image.tmdb.org/t/p/w1280";

// Rota de pesquisa oficial integrada com os parâmetros corretos da API v3 do TMDb
const SEARCH_URL = `https://api.themoviedb.org/3/search/movie`;





// FILMES LOCAIS DE SEGURANÇA (GitHub Pages fallback)
const filmes_locais = [
    {
        id: 991,
        title: "Interestelar",
        overview: "As reservas de recursos da Terra estão chegando ao fim. Um grupo de astronautas recebe a missão de verificar planetas que possam receber a raça humana.",
        isLocal: true,
        cardLocal: "inter.png",
        bannerLocal: "banner-interestelar.png",
        trailerLocal: "https://youtube.com"
    },
    {
        id: 992,
        title: "O Cavaleiro das Trevas",
        overview: "Com a ajuda de Jim Gordon e Harvey Dent, Batman mantém a ordem em Gotham. Mas um jovem e brilhante criminoso conhecido como Coringa espalha o caos.",
        isLocal: true,
        cardLocal: "batman.png",
        bannerLocal: "banner-batman.png",
        trailerLocal: "https://youtube.com"
    },
    {
        id: 993,
        title: "A Origem",
        overview: "Dom Cobb é um ladrão de segredos que consegue extrair informações valiosas do subconsciente das pessoas durante o sono. Agora ele recebe uma missão reversa.",
        isLocal: true,
        cardLocal: "origem.png",
        bannerLocal: "banner-origem.png",
        trailerLocal: "https://youtube.com"
    }
];


// 2. CAPTURA OS ELEMENTOS DO HTML
const container_carrossel = document.getElementById('carrossel-filmes');
const banner_topo = document.getElementById('hero-banner');
const texto_titulo = document.getElementById('filme-titulo');
const texto_sinopse = document.getElementById('filme-sinopse');
const botao_assistir = document.querySelector('#hero-banner button'); 
const modal_player = document.getElementById('modal-player');
const botao_fechar = document.getElementById('btn-fechar');
const iframe_trailer = document.getElementById('iframe-trailer');
const input_busca = document.getElementById('input-busca');
const botao_busca = document.getElementById('btn-busca');

// Array na memória que vai guardar os filmes ativos
let lista_filmes = [];
let filme_selecionado = null;

// 3. O MOTOR DE CONEXÃO COM FALLBACK INTELIGENTE
async function buscarFilmesDaAPI() {
    if (!API_KEY) {
        console.log("Ambiente web de produção detectado. Ativando catálogo local de segurança!");
        lista_filmes = filmes_locais;
        renderizarStreamFlux();
        return;
    }

    try {
        const resposta = await fetch(API_URL);
        const dados = await resposta.json();
        lista_filmes = dados.results;
        console.log("Centenas de filmes carregados da API com sucesso!", lista_filmes);
        renderizarStreamFlux();
    } catch (erro) {
        console.error("Erro na requisição. Ativando catálogo local de emergência!", erro);
        lista_filmes = filmes_locais;
        renderizarStreamFlux();
    }
}

// 4. FUNÇÃO QUE DESENHA OS CARDS DINÂMICOS NA TELA
// 4. FUNÇÃO QUE DESENHA OS CARDS DINÂMICOS NA TELA (BLINDADA CONTRA ERROS DE CHAVES)
function renderizarStreamFlux() {
    if (!container_carrossel) return;
    container_carrossel.innerHTML = "";

    lista_filmes.forEach((filme, index) => {
        // Pula os filmes da API externa que venham totalmente sem imagem de pôster
        if (!filme.isLocal && !filme.poster_path) return;

        const card_elemento = document.createElement('div');
        card_elemento.className = "min-w-[140px] md:min-w-[180px] h-[220px] md:h-[270px] bg-zinc-900 rounded-xl overflow-hidden cursor-pointer shadow-md transition-transform duration-300 hover:scale-105 hover:border-2 hover:border-red-600 flex-shrink-0";
        
        const caminho_card = filme.isLocal ? filme.cardLocal : (IMAGE_URL + filme.poster_path);
        
        // Trata o banner: se o filme da busca não tiver banner horizontal, usa o pôster vertical de fundo como garantia!
        const foto_backdrop = filme.backdrop_path ? filme.backdrop_path : filme.poster_path;
        const caminho_banner = filme.isLocal ? filme.bannerLocal : (BANNER_URL + foto_backdrop);

        // Define com precisão o título (alguns resultados da busca usam .name em vez de .title)
        const titulo_final = filme.title || filme.name || "Título Desconhecido";

        card_elemento.innerHTML = `
            <img src="${caminho_card}" alt="${titulo_final}" class="w-full h-full object-cover" onerror="this.src='inter.png'">
        `;

        // 🌟 REATIVIDADE MÁXIMA: O clique agora atualiza o banner, textos e a memória global com segurança!
        card_elemento.addEventListener('click', () => {
            if (banner_topo) banner_topo.style.backgroundImage = `url('${caminho_banner}')`;
            if (texto_titulo) texto_titulo.textContent = titulo_final;
            if (texto_sinopse) texto_sinopse.textContent = filme.overview || "Sinopse não disponível em português.";
            
            // Atualiza a memória global para o botão Assistir dar o play no trailer certo!
            filme_selecionado = filme;
            console.log(`Clicou em: ${titulo_final}`);
        });

        container_carrossel.appendChild(card_elemento);

        // CONFIGURAÇÃO DO PRE-LOAD: Já destaca o primeiro filme da busca no topo assim que ela acontece!
        if (index === 0) {
            if (banner_topo) banner_topo.style.backgroundImage = `url('${caminho_banner}')`;
            if (texto_titulo) texto_titulo.textContent = titulo_final;
            if (texto_sinopse) texto_sinopse.textContent = filme.overview || "Sinopse não disponível em português.";
            filme_selecionado = filme;
        }
    });
}

// 5. LÓGICA DE CONTROLE DO POP-UP DE TRAILERS DE HOLLYWOOD
botao_assistir.addEventListener('click', async () => {
    if (!filme_selecionado) return;
    
    if (filme_selecionado.isLocal) {
        iframe_trailer.src = filme_selecionado.trailerLocal;
        modal_player.classList.remove('hidden');
        return;
    }
    
    const VIDEO_API = `https://api.themoviedb.org/3/movie/${filme_selecionado.id}/videos?api_key=${API_KEY}&language=pt-BR`;
    
    try {
        const resposta = await fetch(VIDEO_API);
        const dados = await resposta.json();
        const trailer_oficial = dados.results.find(vid => vid.type === "Trailer" && vid.site === "YouTube");
        
        if (trailer_oficial) {
            iframe_trailer.src = `https://www.youtube.com/embed/${trailer_oficial.key}?autoplay=1`;
        } else {
            const resposta_en = await fetch(`https://api.themoviedb.org/3/movie/${filme_selecionado.id}/videos?api_key=${API_KEY}&language=en-US`);
            const dados_en = await resposta_en.json();
            const trailer_en = dados_en.results.find(vid => vid.type === "Trailer" && vid.site === "YouTube");
            
            if (trailer_en) {
                iframe_trailer.src = `https://www.youtube.com/embed/${trailer_en.key}?autoplay=1`;
            } else {
                alert("Trailer oficial não encontrado para este título.");
                return;
            }
        }
        
        modal_player.classList.remove('hidden');
    } catch (erro) {
        console.error("Erro ao puxar o trailer da API:", erro);
    }
});

botao_fechar.addEventListener('click', () => {
    modal_player.classList.add('hidden');
    iframe_trailer.src = "";
});

// 6. FUNÇÃO DE CONSULTA DA LUPA COM O TERMO DIGITADO
// 🔍 6. FUNÇÃO DE CONSULTA DA LUPA COM CONSTRUÇÃO DE ROTA INTELIGENTE
async function pesquisarFilmeNaAPI(termo) {
    if (!termo || termo.trim() === "") {
        buscarFilmesDaAPI();
        return;
    }

    const termo_ajustado = termo.toLowerCase();

    if (!API_KEY) {
        const filtrados = filmes_locais.filter(f => f.title.toLowerCase().includes(termo_ajustado));
        if (filtrados.length > 0) {
            lista_filmes = filtrados;
            renderizarStreamFlux();
        } else {
            container_carrossel.innerHTML = `<p class="text-zinc-500 text-sm py-4 px-4">Nenhum título local encontrado para "${termo}".</p>`;
        }
        return;
    }

    try {
        // 🌟 A MÁGICA: Juntamos a sua URL base limpa com as chaves corretas e o termo da busca!
        const URL_COMPLETA = `${SEARCH_URL}?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(termo_ajustado)}`;
        
        const resposta = await fetch(URL_COMPLETA);
        const dados = await resposta.json();
        lista_filmes = dados.results || [];
        
        console.log(`Busca realizada na API para: ${termo_ajustado}`, lista_filmes);
        
        if (lista_filmes.length > 0) {
            renderizarStreamFlux();
        } else {
            container_carrossel.innerHTML = `
                <p class="text-zinc-500 text-sm py-4 px-4">Nenhum título encontrado para "${termo}". Tente outra pesquisa.</p>
            `;
        }
    } catch (erro) {
        console.error("Erro ao realizar busca na API:", erro);
    }
}




 

// 🔍 7. GATILHO REATIVO DO AUTOCOMPLETE: Escuta cada letra digitada e atualiza os cards na hora!
if (input_busca) {
    input_busca.addEventListener('input', (evento) => {
        pesquisarFilmeNaAPI(evento.target.value);
    });
}

// Mantém o clique físico na lupa como garantia secundária
if (botao_busca) {
    botao_busca.addEventListener('click', () => {
        if (input_busca) pesquisarFilmeNaAPI(input_busca.value);
    });
}

// DISPARA O MOTOR INICIAL DO SITE
buscarFilmesDaAPI();
