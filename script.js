// 1. CONFIGURAÇÃO DA INFRAESTRUTURA DA API (TMDb)
let API_KEY = "";

// Verifica de forma segura se a variável local existe sem travar o navegador
if (typeof CHAVE_PRIVADA_TMDB !== 'undefined') {
    API_KEY = CHAVE_PRIVADA_TMDB;
}

const API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`;
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const BANNER_URL = "https://image.tmdb.org/t/p/w1280";

// FILMES LOCAIS DE SEGURANÇA
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

// Array na memória que vai guardar os filmes ativos
let lista_filmes = [];
let filme_selecionado = null;

// 3. O MOTOR DE CONEXÃO COM FALLBACK INTELIGENTE
async function buscarFilmesDaAPI() {
    // Se a chave não existir (Caso do GitHub Pages na Web), ativa os filmes locais de segurança na hora!
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
function renderizarStreamFlux() {
    container_carrossel.innerHTML = "";

    lista_filmes.forEach((filme, index) => {
        const card_elemento = document.createElement('div');
        card_elemento.className = "min-w-[140px] md:min-w-[180px] h-[220px] md:h-[270px] bg-zinc-900 rounded-xl overflow-hidden cursor-pointer shadow-md transition-transform duration-300 hover:scale-105 hover:border-2 hover:border-red-600 flex-shrink-0";
        
        // Diferencia as rotas: se for local, pega o arquivo do PC; se for da API, monta o link
        const caminho_card = filme.isLocal ? filme.cardLocal : (IMAGE_URL + filme.poster_path);
        const caminho_banner = filme.isLocal ? filme.bannerLocal : (BANNER_URL + filme.backdrop_path);

        card_elemento.innerHTML = `
            <img src="${caminho_card}" alt="${filme.title}" class="w-full h-full object-cover">
        `;

        card_elemento.addEventListener('click', () => {
            banner_topo.style.backgroundImage = `url('${caminho_banner}')`;
            texto_titulo.textContent = filme.title;
            texto_sinopse.textContent = filme.overview || "Sinopse não disponível em português.";
            filme_selecionado = filme;
        });

        container_carrossel.appendChild(card_elemento);

        if (index === 0) {
            banner_topo.style.backgroundImage = `url('${caminho_banner}')`;
            texto_titulo.textContent = filme.title;
            texto_sinopse.textContent = filme.overview || "Sinopse não disponível em português.";
            filme_selecionado = filme;
        }
    });
}

// 5. LÓGICA DE CONTROLE DO POP-UP DE TRAILERS DE HOLLYWOOD
botao_assistir.addEventListener('click', async () => {
    if (!filme_selecionado) return;
    
    // Se for um filme do catálogo local, abre o trailer da pasta sem chamar a API!
    if (filme_selecionado.isLocal) {
        iframe_trailer.src = filme_selecionado.trailerLocal;
        modal_player.classList.remove('hidden');
        return;
    }
    
    // Processo normal para buscar trailers dinâmicos da API da TMDb
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

// DISPARA O MOTOR DO SITE
buscarFilmesDaAPI();
