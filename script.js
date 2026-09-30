// CONFIGURAÇÃO DA INFRAESTRUTURA DA API (TMDb)
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
const TOP_RATED_URL = `https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}&language=pt-BR&page=1`;
const UPCOMING_URL = `https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=pt-BR&page=1`;





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
let index_filme_atual = 0;
let cronometro_banner = null;

//MOTOR DE CONEXÃO COM FALLBACK INTELIGENTE
async function buscarFilmesDaAPI() {
    if (!API_KEY) {
        console.log("Ambiente web de produção detectado. Ativando catálogo local de segurança!");
        lista_filmes = filmes_locais;
        renderizarStreamFlux(lista_filmes, container_carrossel); // Sincroniza o carrossel padrão
        return;
    }

    try {
        const [resposta_pop, resposta_top, resposta_up] = await Promise.all([
            fetch(API_URL),
            fetch(TOP_RATED_URL),
            fetch(UPCOMING_URL)
        ]);

        // Converte as três respostas em arquivos JSON legíveis
        const [dados_pop, dados_top, dados_up] = await Promise.all([
            resposta_pop.json(),
            resposta_top.json(),
            resposta_up.json()
        ]);

        //  Carrega o carrossel 1
        lista_filmes = dados_pop.results || [];
        renderizarStreamFlux(lista_filmes, container_carrossel);

        // Carrega o carrossel 2
        const carrossel_top = document.getElementById('carrossel-top-rated');
        const lista_top = dados_top.results || [];
        renderizarStreamFlux(lista_top, carrossel_top);

        // Carrega o carrossel 3
        const carrossel_up = document.getElementById('carrossel-upcoming');
        const lista_up = dados_up.results || [];
        renderizarStreamFlux(lista_up, carrossel_up);

        console.log("Todas as 3 categorias carregadas da API com sucesso!");
        iniciarCronometro(); // Liga a chave do relógio do banner principal do topo!
        
    } catch (erro) {
        console.error("Erro na requisição multi-categorias. Ativando catálogo local!", erro);
        lista_filmes = filmes_locais;
        renderizarStreamFlux(lista_filmes, container_carrossel);
    }
}
// FUNÇÃO QUE DESENHA OS CARDS DINÂMICOS NA TELA
function renderizarStreamFlux(filmes, container) {
    if (!container) return;
    container.innerHTML = "";
   const filmes_exibidos = filmes;

    filmes_exibidos.forEach((filme, index) => {
        if (!filme.isLocal && !filme.poster_path) return;

        const card_elemento = document.createElement('div');
        card_elemento.className = "min-w-[140px] md:min-w-[180px] h-[220px] md:h-[270px] bg-zinc-900 rounded-xl overflow-hidden cursor-pointer shadow-md transition-transform duration-300 hover:scale-105 hover:border-2 hover:border-red-600 flex-shrink-0";
        
        const caminho_card = filme.isLocal ? filme.cardLocal : (IMAGE_URL + filme.poster_path);
        const foto_backdrop = filme.backdrop_path ? filme.backdrop_path : filme.poster_path;
        const caminho_banner = filme.isLocal ? filme.bannerLocal : (BANNER_URL + foto_backdrop);
        const titulo_final = filme.title || filme.name || "Título Desconhecido";

        card_elemento.innerHTML = `
            <img src="${caminho_card}" alt="${titulo_final}" class="w-full h-full object-cover" onerror="this.src='inter.png'">
        `;

        card_elemento.addEventListener('click', () => {
            if (banner_topo) banner_topo.style.backgroundImage = `url('${caminho_banner}')`;
            if (texto_titulo) texto_titulo.textContent = titulo_final;
            if (texto_sinopse) texto_sinopse.textContent = filme.overview || "Sinopse não disponível em português.";

            filme_selecionado = filme;
            console.log(`Clicou em: ${titulo_final}`);
            index_filme_atual = index;
            iniciarCronometro();
        });

        container.appendChild(card_elemento);

        // CONFIGURAÇÃO DO PRE-LOAD: Só destaca o primeiro filme se for a fileira principal de Tendências
        if (index === 0 && container === container_carrossel) {
            if (banner_topo) banner_topo.style.backgroundImage = `url('${caminho_banner}')`;
            if (texto_titulo) texto_titulo.textContent = titulo_final;
            if (texto_sinopse) texto_sinopse.textContent = filme.overview || "Sinopse não disponível em português.";
            filme_selecionado = filme;
        }
    });
}
//LÓGICA DE CONTROLE DO POP-UP DE TRAILERS DE HOLLYWOOD
if (botao_assistir) {
    botao_assistir.addEventListener('click', async () => {
        if (!filme_selecionado || !iframe_trailer || !modal_player) return;
        
        if (filme_selecionado.isLocal) {
            iframe_trailer.src = filme_selecionado.trailerLocal;
            modal_player.classList.remove('hidden');
            return;
        }
    
        const VIDEO_API = `https://api.themoviedb.org/3/movie/${filme_selecionado.id}/videosapi_key=${API_KEY}&language=pt-BR`;

        try {
            const resposta = await fetch(VIDEO_API);
            const dados = await resposta.json();
            let trailer_oficial = dados.results ? dados.results.find(vid => vid.type === "Trailer" && vid.site === "YouTube") : null;
            
            if (!trailer_oficial) {
                const resposta_en = await fetch(`https://api.themoviedb.org/3/movie/${filme_selecionado.id}/videos?api_key=${API_KEY}&language=en-US`);
                const dados_en = await resposta_en.json();
                trailer_oficial = dados_en.results ? dados_en.results.find(vid => vid.type === "Trailer" && vid.site === "YouTube") : null;
            }

            if (trailer_oficial) {
                iframe_trailer.src = `https://youtube.com/embed/${trailer_oficial.key}?autoplay=1`;
                modal_player.classList.remove('hidden');
            } else {
                alert("Trailer oficial não encontrado para este título.");
            }
        } catch (erro) {
            console.error("Erro ao carregar o trailer:", erro);
        }
    });
}


if (botao_fechar) {
    botao_fechar.addEventListener('click', () => {
        if (modal_player) modal_player.classList.add('hidden');
        if (iframe_trailer) iframe_trailer.src = "";
    });
}

// MOTOR DE BUSCA GLOBAL DIRETO NA API
async function pesquisarFilmeNaAPI(termo) {
    if (!termo || termo.trim() === "") {
        buscarFilmesDaAPI(); // Se limpar a barra de pesquisa, restaura as categorias normais
        return;
    }

    const termo_ajustado = termo.toLowerCase();

    try {
        const URL_COMPLETA = `${SEARCH_URL}?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(termo_ajustado)}`;
        
        const resposta = await fetch(URL_COMPLETA);
        const dados = await resposta.json();
        const filmes_encontrados = dados.results || [];
        
        if (filmes_encontrados.length > 0) {
            renderizarStreamFlux(filmes_encontrados, container_carrossel);
            clearInterval(cronometro_banner); // Para o relógio automático durante as pesquisas
        } else {
            container_carrossel.innerHTML = `<p class="text-zinc-500 text-sm py-4 px-4">Nenhum título encontrado para "${termo}".</p>`;
        }
    } catch (erro) {
        console.error("Erro no mecanismo de busca:", erro);
    }
}

// Ouvidor de digitação reativa (Autocomplete)
if (input_busca) {
    input_busca.addEventListener('input', (evento) => {
        pesquisarFilmeNaAPI(evento.target.value);
    });
}

// SISTEMA DE RELÓGIO AUTOMÁTICO DO BANNER PRINCIPAL (Slideshow de 5 segundos)
function alternarBannerAutomatico() {
    if (lista_filmes.length === 0) return;
    index_filme_atual = (index_filme_atual + 1) % lista_filmes.length;
    const filme = lista_filmes[index_filme_atual];
    filme_selecionado = filme;

    const foto_backdrop = filme.backdrop_path ? filme.backdrop_path : filme.poster_path;
    const caminho_banner = filme.isLocal ? filme.bannerLocal : (BANNER_URL + foto_backdrop);
    const titulo_final = filme.title || filme.name || "Título Desconhecido";

    if (banner_topo) banner_topo.style.backgroundImage = `url('${caminho_banner}')`;
    if (texto_titulo) texto_titulo.textContent = titulo_final;
    if (texto_sinopse) texto_sinopse.textContent = filme.overview || "Sinopse não disponível em português.";
}

function iniciarCronometro() {
    clearInterval(cronometro_banner);
    cronometro_banner = setInterval(alternarBannerAutomatico, 5000);
}

// NAVEGAÇÃO DAS SETAS DO CARROSSEL 1 (TENDÊNCIAS)
const seta_esquerda = document.getElementById('seta-esquerda');
const seta_direita = document.getElementById('seta-direita');

if (seta_direita) {
    seta_direita.addEventListener('click', () => {
        container_carrossel.scrollBy({ left: 300, behavior: 'smooth' });
    });
}

if (seta_esquerda) {
    seta_esquerda.addEventListener('click', () => {
        container_carrossel.scrollBy({ left: -300, behavior: 'smooth' });
    });
}

// DISPARA O MOTOR INICIAL DO SITE
buscarFilmesDaAPI();

