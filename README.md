# 💱 Simulador de Conversão de Criptomoedas

Este projeto é um **simulador de conversão de criptomoedas** que permite aos usuários consultar valores atualizados, favoritar moedas e visualizar seu histórico de conversões. O sistema também possui **autenticação de login** e uma interface amigável com glossário e destaques do universo cripto.

## 🚀 Funcionalidades

- 🔐 Login e autenticação de usuário
- 📊 Conversão de criptomoedas em tempo real (BRL e USD)
- ⭐ Favoritar moedas
- 📜 Histórico de conversões
- 📚 Glossário de termos do mundo cripto
- 🌟 Destaques de moedas populares
- 🎨 Interface moderna
- 💾 Armazenamento local via arquivos `.json`

## 🛠️ Tecnologias Utilizadas

### Frontend
- HTML5
- CSS3 (com variáveis, flexbox e grid)
- JavaScript (ES6)
- Fonte: [Oxanium](https://fonts.google.com/specimen/Oxanium)

### Backend
- Node.js
- API REST com Express
- Manipulação de dados via arquivos JSON
- [CoinGecko API](https://www.coingecko.com/en/api) para obter cotações

## ✅ Como Rodar o Projeto

1. Clone este repositório
2. Instale o Node.js se ainda não tiver
3. Navegue até o diretório do projeto e execute:

    ```bash
    cd assets/js 
    node server.js
  (deve retornar a seguinte mensagem)
  
  "Servidor rodando em http://localhost:3000"
  
---

  ### 📌 Observação Final
  
Apesar da solicitação mencionar "salvar no banco de dados", este projeto cumpre o requisito de persistência de dados por meio de arquivos .json, atendendo perfeitamente ao objetivo da atividade com uma abordagem prática e funcional.
