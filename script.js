// 1. CONFIGURAÇÃO DA INFRAESTRUTURA DA API (TMDb)
// Chave pública global de testes para liberar o seu acesso à nuvem imediatamente!
// SEGURANÇA MÁXIMA: Puxa a chave privada direto do arquivo local camuflado!
const API_KEY = CHAVE_PRIVADA_TMDB;
const API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=pt-BR&page=1`;
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const BANNER_URL = "https://image.tmdb.org/t/p/w1280";

// 2. CAPTURA OS ELEMENTOS DO HTML
const container_carrossel = document.getElementById('carrossel-filmes');
const banner_topo = document.getElementById('hero-banner');
const texto_titulo = document.getElementById('filme-titulo');
const texto_sinopse = document.getElementById('filme-sinopse');
const botao_assistir = document.querySelector('#hero-banner button'); 
const modal_player = document.getElementById('modal-player');
const botao_fechar = document.getElementById('btn-fechar');
const iframe_trailer = document.getElementById('iframe-trailer');

// Array na memória que vai guardar os filmes vindos da internet automaticamente
let lista_filmes = [];
let filme_selecionado = null;

// 3. O MOTOR DE CONEXÃO COM A NUVEM (Fetch API)
async function buscarFilmesDaAPI() {
    try {
        // Dá a "ligação" para o servidor da TMDb buscando os filmes populares
        const resposta = await fetch(API_URL);
        const dados = await resposta.json();
        
        // Salva a lista de filmes que veio da internet dentro do nosso array!
        lista_filmes = dados.results;
        
        console.log("Centenas de filmes carregados da API com sucesso!", lista_filmes);
        
        // Se a internet respondeu com sucesso, renderiza os cards na tela!
        renderizarStreamFlux();
        
    } catch (erro) {
        console.error("Erro crítico na conexão com a API da nuvem:", erro);
    }
}

// 4. FUNÇÃO QUE DESENHA OS CARDS DINÂMICOS NA TELA
function renderizarStreamFlux() {
    // Limpa o carrossel antes de desenhar
    container_carrossel.innerHTML = "";

    lista_filmes.forEach((filme, index) => {
        const card_elemento = document.createElement('div');
        card_elemento.className = "min-w-[140px] md:min-w-[180px] h-[220px] md:h-[270px] bg-zinc-900 rounded-xl overflow-hidden cursor-pointer shadow-md transition-transform duration-300 hover:scale-105 hover:border-2 hover:border-red-600 flex-shrink-0";
        
        // Conecta o link da API com o caminho da imagem do pôster!
        card_elemento.innerHTML = `
            <img src="${IMAGE_URL + filme.poster_path}" alt="${filme.title}" class="w-full h-full object-cover">
        `;

        // O clique troca o banner de fundo, o título e a sinopse com os dados reais da nuvem!
        card_elemento.addEventListener('click', () => {
            banner_topo.style.backgroundImage = `url('${BANNER_URL + filme.backdrop_path}')`;
            texto_titulo.textContent = filme.title;
            texto_sinopse.textContent = filme.overview || "Sinopse não disponível em português.";
            
            // Guarda o filme ativo na memória para o botão Assistir buscar o trailer depois
            filme_selecionado = filme;
        });

        container_carrossel.appendChild(card_elemento);

        // CONFIGURAÇÃO DO PRE-LOAD: Já inicia o site exibindo o primeiro filme da lista no topo!
        if (index === 0) {
            banner_topo.style.backgroundImage = `url('${BANNER_URL + filme.backdrop_path}')`;
            texto_titulo.textContent = filme.title;
            texto_sinopse.textContent = filme.overview || "Sinopse não disponível em português.";
            filme_selecionado = filme;
        }
    });
}

// 5. LÓGICA DE CONTROLE DO POP-UP DE TRAILERS DE HOLLYWOOD
botao_assistir.addEventListener('click', async () => {
    if (!filme_selecionado) return;
    
    // MÁGICA DE APID DO TRAILER: Busca o trailer oficial do filme direto na TMDb usando o ID dele!
    const VIDEO_API = `https://api.themoviedb.org/3/movie/${filme_selecionado.id}/videos?api_key=${API_KEY}&language=pt-BR`;
    
    try {
        const resposta = await fetch(VIDEO_API);
        const dados = await resposta.json();
        // Filtra para pegar apenas os vídeos que são trailers oficiais no YouTube
        const trailer_oficial = dados.results.find(vid => vid.type === "Trailer" && vid.site === "YouTube");
        
        if (trailer_oficial) {
            iframe_trailer.src = `https://www.youtube.com/embed/${trailer_oficial.key}?autoplay=1`;
        } else {
            // Caso não tenha dublado, busca o trailer em inglês padrão de mercado
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

// DISPARA O MOTOR DO SITE LIGANDO A CONEXÃO COM A NUVM!
buscarFilmesDaAPI();
