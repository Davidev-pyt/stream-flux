// 1. DATA MODELING: Lista Oficial de Filmes com Separação de Card e Banner HD
const lista_filmes = [
    {
        id: 1,
        titulo: "Interestelar",
        sinopse: "As reservas de recursos da Terra estão chegando ao fim. Um grupo de astronautas recebe a missão de verificar planetas que possam receber a raça humana.",
        card: "inter.png", //O card principal do filme
        banner: "banner-interestelar.png" //Banner em uma qualidade melhor
    },
    {
        id: 2,
        titulo: "O Cavaleiro das Trevas",
        sinopse: "Com a ajuda de Jim Gordon e Harvey Dent, Batman mantém a ordem em Gotham. Mas um jovem e brilhante criminoso conhecido como Coringa espalha o caos.",
        card: "batman.png", // Seu arquivo local em pé
        banner: "banner-batman.png" // Wallpaper Gotham conceitual HD
    },
    {
        id: 3,
        titulo: "A Origem",
        sinopse: "Dom Cobb é um ladrão de segredos que consegue extrair informações valiosas do subconsciente das pessoas durante o sono. Agora ele recebe uma missão reversa.",
        card: "origem.png", // Seu arquivo local em pé
        banner: "banner-origem.png" // Wallpaper abstrato de arquitetura HD
    }
];

// 2. CAPTURA OS ELEMENTOS PRINCIPAIS DO HTML
const container_carrossel = document.getElementById('carrossel-filmes');
const banner_topo = document.getElementById('hero-banner');
const texto_titulo = document.getElementById('filme-titulo');
const texto_sinopse = document.getElementById('filme-sinopse');

// 3. FUNÇÃO QUE RENDERIZA OS PÔSTERES AUTOMATICAMENTE
function carregarCarrossel() {
    lista_filmes.forEach(filme => {
        // Cria uma div para cada card
        const card_elemento = document.createElement('div');
        card_elemento.className = "min-w-[140px] md:min-w-[180px] h-[220px] md:h-[270px] bg-zinc-900 rounded-xl overflow-hidden cursor-pointer shadow-md transition-transform duration-300 hover:scale-105 hover:border-2 hover:border-red-600 flex-shrink-0";
        
        // Injeta a imagem do pôster dentro do card
        card_elemento.innerHTML = `
            <img src="${filme.card}" alt="${filme.titulo}" class="w-full h-full object-cover">
        `;

        // Atualiza o banner do topo instantaneamente!
        card_elemento.addEventListener('click', () => {
            banner_topo.style.backgroundImage = `url('${filme.banner}')`;
            texto_titulo.textContent = filme.titulo;
            texto_sinopse.textContent = filme.sinopse;
            
            console.log(`StreamFlux carregou: ${filme.titulo}`);
        });

        // Coloca o card dentro do carrossel horizontal
        container_carrossel.appendChild(card_elemento);
    });
}

// 4. INICIALIZAÇÃO AUTOMÁTICA DO LAYOUT
carregarCarrossel();

// Inicia o site exibindo os dados do primeiro filme (posição 0 do array) no topo!
if (lista_filmes.length > 0) {
    banner_topo.style.backgroundImage = `url('${lista_filmes[0].banner}')`;
    texto_titulo.textContent = lista_filmes[0].titulo;
    texto_sinopse.textContent = lista_filmes[0].sinopse;
}

