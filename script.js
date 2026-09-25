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
const SEARCH_URL = `https://themoviedb.org{API_KEY}&language=pt-BR&query=`;


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
function renderizarStreamFlux() {
    container_carrossel.innerHTML = "";

    lista_filmes.forEach((filme, index) => {
        // Pula os filmes que possam vir sem pôster da API externa
        if (!filme.isLocal && !filme.poster_path) return;

        const card_elemento = document.createElement('div');
        card_elemento.className = "min-w-[140px] md:min-w-[180px] h-[220px] md:h-[270px] bg-zinc-900 rounded-xl overflow-hidden cursor-pointer shadow-md transition-transform duration-300 hover:scale-105 hover:border-2 hover:border-red-600 flex-shrink-0";
        
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

// FUNÇÃO DE CONSULTA DA LUPA COM O TERMO DIGITADO
async function pesquisarFilmeNaAPI(termo) {
    if (!termo || termo.trim() === "") {
        buscarFilmesDaAPI();
        return;
    }

    if (!API_KEY) {
        const filtrados = filmes_locais.filter(f => f.title.toLowerCase().includes(termo.toLowerCase()));
        if (filtrados.length > 0) {
            lista_filmes = filtrados;
            renderizarStreamFlux();
        } else {
            container_carrossel.innerHTML = `<p class="text-zinc-500 text-sm py-4 px-4">Nenhum título local encontrado para "${termo}".</p>`;
        }
        return;
    }

    try {
        const resposta = await fetch(SEARCH_URL + encodeURIComponent(termo));
        const dados = await resposta.json();
        lista_filmes = dados.results || [];
        
        console.log(`Busca realizada na API para: ${termo}`, lista_filmes);
        
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
// Variável global para controlar o tempo do debounce
 

// Função interna que busca os dados especificamente para o autocomplete
async function ejecutarBuscaAutocomplete(termo) {
    // FALLBACK: Se não houver API_KEY, busca nos filmes locais
    if (!API_KEY) {
        const filtrados = filmes_locais.filter(f => f.title.toLowerCase().includes(termo.toLowerCase()));
        renderizarSugestoes(filtrados);
        return;
    }

    try {
        const resposta = await fetch(SEARCH_URL + encodeURIComponent(termo));
        const dados = await resposta.json();
        const resultados = dados.results || [];
        renderizarSugestoes(resultados);
    } catch (erro) {
        console.error("Erro ao buscar sugestões no autocomplete:", erro);
    }
}

// Desenha as linhas de sugestão na tela abaixo do input
function renderizarSugestoes(filmes) {
    lista_autocomplete.innerHTML = "";

    if (filmes.length === 0) {
        lista_autocomplete.classList.add('hidden');
        return;
    }

    // Limita a exibição a no máximo 5 sugestões para não poluir a tela
    filmes.slice(0, 5).forEach(filme => {
        const item = document.createElement('li');
        item.className = "p-3 text-zinc-300 hover:bg-zinc-900 hover:text-white cursor-pointer transition-colors text-sm flex items-center gap-3";
        
        // Pega a imagem miniatura (se existir)
        const foto = filme.isLocal ? filme.cardLocal : (filme.poster_path ? IMAGE_URL + filme.poster_path : null);
        
        item.innerHTML = `
            ${foto ? `<img src="\${foto}" class="w-8 h-10 object-cover rounded" />` : '<div class="w-8 h-10 bg-zinc-800 rounded"></div>'}
            <span class="truncate font-medium">${filme.title}</span>
        `;

        // Evento de clique na sugestão
        item.addEventListener('click', () => {
            input_busca.value = filme.title;
            lista_autocomplete.classList.add('hidden');
            
            // Simula o clique atualizando o carrossel e o banner principal com o filme selecionado
            lista_filmes = [filme]; 
            renderizarStreamFlux();
        });

        lista_autocomplete.appendChild(item);
    });

    // Exibe a lista agora preenchida
    lista_autocomplete.classList.remove('hidden');
}

// Fecha o autocomplete se o usuário clicar em qualquer outro lugar da tela
document.addEventListener('click', (evento) => {
    if (!input_busca.contains(evento.target) && !lista_autocomplete.contains(evento.target)) {
        lista_autocomplete.classList.add('hidden');
    }
});

// Mantém o funcionamento do botão da Lupa (pesquisa completa ao submeter)
botao_busca.addEventListener('click', () => {
    lista_autocomplete.classList.add('hidden');
    pesquisarFilmeNaAPI(input_busca.value);
});

// Permite buscar também ao apertar a tecla "Enter" dentro do input
input_busca.addEventListener('keypress', (evento) => {
    if (evento.key === 'Enter') {
        lista_autocomplete.classList.add('hidden');
        pesquisarFilmeNaAPI(input_busca.value);
    }
});

buscarFilmesDaAPI();
// Variável global para controlar o tempo do debounce
let autocompleteTimeout;

// Captura a lista de autocomplete que já existe no HTML
const lista_autocomplete = document.getElementById('autocomplete-results');

// 6. EVENTO DE INPUT COM DEBOUNCE PARA AUTOCOMPLETE
input_busca.addEventListener('input', (evento) => {
    const termo = evento.target.value.trim();

    // Limpa o temporizador anterior para evitar requisições a cada tecla digitada
    clearTimeout(autocompleteTimeout);

    // Se o usuário limpar o campo ou digitar apenas 1 letra, esconde a lista
    if (termo.length < 2) {
        lista_autocomplete.innerHTML = "";
        lista_autocomplete.classList.add('hidden');
        return;
    }

    // Aguarda 400ms após o usuário parar de digitar antes de fazer a busca
    autocompleteTimeout = setTimeout(async () => {
        let sugestoes = [];

        if (!API_KEY) {
            // Modo Fallback Local: Filtra no seu array de filmes locais
            sugestoes = filmes_locais.filter(f => f.title.toLowerCase().includes(termo.toLowerCase()));
            renderizarSugestoes(sugestoes);
        } else {
            // Modo API TMDb: Busca os dados em tempo real na API
            try {
                const resposta = await fetch(SEARCH_URL + encodeURIComponent(termo));
                const dados = await resposta.json();
                // Limita a 5 sugestões para manter o menu elegante na tela
                sugestoes = dados.results ? dados.results.slice(0, 5) : []; 
                renderizarSugestoes(sugestoes);
            } catch (erro) {
                console.error("Erro no autocomplete da API:", erro);
            }
        }
    }, 400);
});

// 7. FUNÇÃO QUE RENDERIZA AS OPÇÕES DENTRO DA LISTA
function renderizarSugestoes(filmesFiltrados) {
    lista_autocomplete.innerHTML = "";

    if (filmesFiltrados.length === 0) {
        lista_autocomplete.classList.add('hidden');
        return;
    }

    filmesFiltrados.forEach(filme => {
        // Cria um elemento <li> para manter a semântica da tag <ul> do HTML
        const item = document.createElement('li');
        item.className = "px-4 py-3 text-white text-sm hover:bg-zinc-800 cursor-pointer transition-colors duration-200 border-b border-zinc-800 last:border-0 flex items-center gap-3";
        
        // Define o caminho da imagem miniatura (Local ou API)
        const caminho_thumb = filme.isLocal ? filme.cardLocal : (filme.poster_path ? IMAGE_URL + filme.poster_path : "");
        
        item.innerHTML = `
            ${caminho_thumb ? `<img src="\${caminho_thumb}" class="w-8 h-11 object-cover rounded shadow-sm" />` : ''}
            <span class="font-medium tracking-wide">${filme.title}</span>
        `;

        // Lógica de clique na sugestão
        item.addEventListener('click', () => {
            input_busca.value = filme.title;       // Preenche a barra com o título escolhido
            lista_autocomplete.classList.add('hidden'); // Esconde a caixinha de sugestões
            
            // Executa a busca principal para carregar o filme selecionado no carrossel
            pesquisarFilmeNaAPI(filme.title);
        });

        lista_autocomplete.appendChild(item);
    });

    lista_autocomplete.classList.remove('hidden');
}

// Fecha o autocomplete se o usuário clicar em qualquer outro lugar fora da busca
document.addEventListener('click', (evento) => {
    if (!input_busca.contains(evento.target) && !lista_autocomplete.contains(evento.target)) {
        lista_autocomplete.classList.add('hidden');
    }
});

