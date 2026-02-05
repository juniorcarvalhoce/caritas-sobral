# Cáritas Diocesana de Sobral

Este repositório contém o código-fonte do site institucional da **Cáritas Diocesana de Sobral**. O projeto é uma aplicação web moderna desenvolvida para divulgar as ações, projetos, editais e notícias da organização, promovendo transparência e engajamento com a comunidade.

## 📋 Funcionalidades

O sistema possui uma interface pública para visitantes e uma área administrativa para gestão de conteúdo.

### Área Pública
- **Página Inicial:** Apresentação da instituição, missão e valores.
- **Projetos:** Divulgação das áreas de atuação (Convivência com Semiárido, Economia Solidária, Juventudes, Políticas Públicas).
- **Notícias:** Carrossel e listagem de notícias atualizadas sobre as ações da Cáritas.
- **Editais:** Área dedicada para publicação e consulta de editais.
- **Mapa Interativo:** Visualização das áreas de atuação e projetos.
- **Contato:** Formulário e informações de contato.

### Área Administrativa
- **Autenticação:** Login seguro para administradores.
- **Gestão de Editais:** Cadastro, edição e remoção de editais.
- **Gestão de Notícias:** Publicação e gerenciamento de notícias e artigos.

## 🚀 Tecnologias Utilizadas

O projeto foi construído utilizando as seguintes tecnologias principais:

- **Frontend:**
  - [React](https://react.dev/) - Biblioteca JavaScript para construção de interfaces.
  - [Vite](https://vitejs.dev/) - Ferramenta de build rápida e moderna.
  - [TypeScript](https://www.typescriptlang.org/) - Superset JavaScript com tipagem estática.
  - [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário para estilização ágil.
  - [Shadcn UI](https://ui.shadcn.com/) - Coleção de componentes de interface reutilizáveis.
  - [Framer Motion](https://www.framer.com/motion/) - Biblioteca para animações fluidas.
  - [React Router](https://reactrouter.com/) - Gerenciamento de rotas da aplicação.
  - [TanStack Query](https://tanstack.com/query/latest) - Gerenciamento de estado e requisições assíncronas.

- **Backend & Serviços:**
  - [Supabase](https://supabase.com/) - Backend as a Service (BaaS) utilizado para banco de dados (PostgreSQL), autenticação e armazenamento de arquivos.
  - [Leaflet](https://leafletjs.com/) - Biblioteca para mapas interativos.

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:
- [Node.js](https://nodejs.org/) (versão 18 ou superior recomendada)
- [NPM](https://www.npmjs.com/) (gerenciador de pacotes)

## 🛠️ Como Rodar o Projeto

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/juniorcarvalhoce/caritas-sobral.git
    cd caritas-sobral
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configuração de Variáveis de Ambiente:**
    Crie um arquivo `.env` na raiz do projeto com as credenciais do Supabase (baseado no exemplo ou solicite ao administrador):
    ```env
    VITE_SUPABASE_URL=sua_url_do_supabase
    VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
    ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

5.  **Acesse o projeto:**
    O projeto estará rodando em `http://localhost:8080` (ou outra porta indicada no terminal).

## 📂 Estrutura do Projeto

- `src/pages`: Páginas da aplicação (Home, Login, Admin, etc).
- `src/components`: Componentes reutilizáveis (Header, Footer, UI components).
- `src/lib`: Configurações de serviços externos (Supabase, Utils).
- `src/hooks`: Hooks personalizados do React.
- `public`: Arquivos estáticos públicos.

## 📄 Licença

Todos os direitos reservados à Cáritas Diocesana de Sobral.
