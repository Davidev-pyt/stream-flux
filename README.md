# 🎬 StreamFlux 2.0 — Plataforma de Streaming Reativa e Assíncrona

<p align="center">
  <img src="https://shields.io" alt="JavaScript" />
  <img src="https://shields.io" alt="Tailwind CSS" />
  <img src="https://shields.io" alt="TMDb API" />
  <img src="https://shields.io" alt="GitHub Actions" />
</p>

O **StreamFlux 2.0** é uma SPA (Single Page Application) moderna de catálogo de vídeos inspirada na interface premium da Netflix. O projeto consome dados centralizados em tempo real diretamente dos servidores da API v3 do TMDb, aplicando conceitos avançados de engenharia de software, assincronismo e total reatividade no ecossistema do Front-End.

---

##  Arquitetura e Engenharia de Funcionalidades

* **Processamento Paralelo Multi-Categorias:** Carregamento simultâneo e independente de três fileiras dinâmicas no carrossel de mídias (`Tendências Agora`, `Mais Bem Avaliados` e `Próximos Lançamentos`) através da resolução otimizada de promessas paralelas com `Promise.all`.
* **Motor de Autocomplete e Busca Global:** Integração assíncrona baseada no evento de escuta de `input` do teclado. O algoritmo intercepta os caracteres digitados em tempo real, normaliza os dados para letras minúsculas e consulta dinamicamente a nuvem de dados global do TMDb.
* **Ciclo de Slideshow Inteligente Automatizado:** O banner de destaque do topo (Hero Backdrop) alterna as fotos em altíssima definição (1280px), títulos secundários e sinopses de 5 em 5 segundos (`setInterval`). Possui gatilho de sincronização reativa: se o usuário clicar manualmente em um card, o temporizador reseta do zero para respeitar o tempo de leitura do cliente.
* **Componentização e Reutilização de Métodos:** A função de desenho no DOM (`renderizarStreamFlux`) foi refatorada e componentizada para operar de forma polimórfica, recebendo dinamicamente arrays e escopos de contêineres diferentes sem duplicar linhas de código.
* **Player e Fallback Avançado de Trailers:** Engine assíncrona que varre as referências de vídeo da mídia e renderiza o player do YouTube dentro de um modal. Conta com fallback linguístico automatizado (se não encontrar o trailer oficial dublado em `pt-BR`, o sistema consulta e entrega a versão em `en-US` para blindar a usabilidade).

---

##  DevOps e Blindagem de Credenciais (CI/CD)

Para mitigar a vulnerabilidade de exposição de chaves privadas (tokens de API) em páginas estáticas hospedadas publicamente, o projeto adota uma esteira profissional de automação:

1. **GitHub Secrets:** A credencial secreta da API do TMDb fica guardada de forma criptografada nos servidores do GitHub (`TMDB_API_KEY`).
2. **Esteira Automatizada (GitHub Actions):** Arquitetado um workflow robusto em YAML. A cada push efetuado na branch `main`, um container virtual roda nos bastidores, extrai o token do cofre, constrói de forma invisível o arquivo estrutural de configuração (`config.js`) e efetua o deploy compilado direto na branch pública `gh-pages`.
3. **Mecanismo Defensivo de Fallback:** O script implementa validações rigorosas de escopo (`typeof`). Em cenários de indisponibilidade de credenciais na nuvem, o JavaScript detecta o estado e chaveia automaticamente para um catálogo de contingência.

---

## Como Executar o Projeto Localmente

1. Clone o repositório na sua máquina:
   ```bash
   git clone https://github.com
   ```
2. Na raiz do projeto, crie o arquivo de credenciais local `config.js`.
3. Adicione a sua chave de acesso conforme a assinatura do escopo:
   ```javascript
   const CHAVE_PRIVADA_TMDB = "SUA_CHAVE_API_AQUI";
   ```
4. Execute o arquivo `index.html` através da extensão **Live Server** e assista ao show de reatividade assíncrona!

---
<p align="center">Desenvolvido com foco em Clean Code, UX e Performance Arquitetural. 🍿🎬</p>
