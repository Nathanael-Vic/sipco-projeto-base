# 📡 Sistema Inteligente para Planejamento de Cabeamento Óptico  
**Documentação Consolidada — Versão Atualizada MVP**

Você é uma IA de desenvolvimento especializada em organizar projetos e gerar código.  
Seu objetivo é ajudar no desenvolvimento de um Sistema Inteligente para Planejamento de Cabeamento Óptico.

**IMPORTANTE:** Este é um MVP (Produto Mínimo Viável). Foque no básico funcionando bem, sem complexidades desnecessárias, sem IA ainda, apenas as funcionalidades essenciais.

---

## 📋 CONTEXTO DO PROJETO

### **Tecnologias**
- **Frontend:** React (com Vite) + Konva.js
- **Backend:** Python (com FastAPI)
- **Banco de Dados:** Supabase (PostgreSQL)

### **Objetivo do Sistema**
Mapear e gerenciar infraestrutura de data center:
- Racks (servidores, switches, cross-connects)
- Eletrocalhas (caminhos físicos para cabos)
- Rotas de cabeamento entre racks
- Ocupação e capacidade de eletrocalhas
- Planta do Data Hall em 2D com grid

---

## 🎯 PROBLEMA E SOLUÇÃO

### **Problema (≤250 caracteres)**
O planejamento de conexões ópticas em data centers é complexo. Sem ferramenta adequada, é difícil escolher rotas e alocar hardware, prejudicando eficiência e confiabilidade.

### **Solução (≤250 caracteres)**
Ferramenta com gêmeo digital que simula, visualiza e recomenda rotas ideais de cabeamento, considerando distância, ocupação e limitações físicas.

---

## 👥 PERSONAS

### **Cláudio — Planejador de Infraestrutura**
Escolhe rotas e posições de novos hardwares. Precisa visualizar ocupação e planejar expansões.

### **Mariana — Arquiteta de Data Center**
Planejamento estratégico, expansão e identificação de riscos de capacidade.

### **Felipe — Técnico de Campo**
Executa a instalação física do cabeamento. Precisa de informações claras sobre rotas.

---

## ⚙️ FUNCIONALIDADES PRINCIPAIS (MVP)

### ✅ Já Implementado
1. Sistema de autenticação (login, cadastro, recuperação de senha)
2. Dashboard com planta 2D interativa
3. Adicionar racks no grid
4. Visualizar detalhes de racks

### 🚧 A Implementar
5. **Eletrocalhas** - Cadastro manual e sugestão automática em grid (CRUD base e sugestão funcional)
6. **Rotas de Cabeamento** - Planejamento visual entre racks
7. **Sistema de Coordenadas** - Nomenclatura alfanumérica (AA, AB... / 00, 01...)
8. **Racks Cross-Connect (CC)** - Ponto central de interconexão
9. **Gestão de Ocupação** - Controle de capacidade de eletrocalhas

---

## 🗺️ FLUXO COMPLETO: ELETROCALHAS

### **O que são Eletrocalhas?**
Canaletas metálicas (teto/piso) por onde os cabos passam. Têm capacidade limitada de cabos.

### **Opção A: Cadastro Manual**

1. Usuário clica em **"Adicionar Eletrocalha"**
2. Seleciona modo **"Manual"**
3. Define propriedades:
   - Nome/ID (ex: "EL-H1", "EL-V3")
   - Capacidade total (ex: 50 cabos)
4. **Desenha no grid:**
   - Clica na célula inicial (ponto A)
   - Clica na célula final (ponto B)
   - Sistema desenha linha reta conectando os pontos
5. Pode repetir para criar várias eletrocalhas
6. **Resultado:** Eletrocalhas customizadas onde o usuário quiser

### **Opção B: Sugerir Layout em Grid (Automático) - RECOMENDADO**

1. Usuário define tamanho da planta do Data Hall
2. Sistema **automaticamente sugere** layout de eletrocalhas em malha
3. **Geração automática:**
   - Linhas horizontais entre as fileiras
   - Linhas verticais entre as colunas
   - Espaçamento regular a cada 4 placas de piso elevado
   - Forma uma "malha" completa (como imagem de referência)
4. Usuário pode definir:
   - Capacidade padrão para todas (ex: 40 cabos)
   - Aceitar ou ajustar o layout
5. Aparece **preview** com linhas cinzas mostrando o layout sugerido
6. Usuário **confirma** e eletrocalhas são criadas automaticamente
7. Sistema nomeia automaticamente:
   - Horizontais: EL-H1, EL-H2, EL-H3...
   - Verticais: EL-V1, EL-V2, EL-V3...

### **Visualização das Eletrocalhas no Grid**

**Representação visual:**
- Eletrocalhas aparecem como **linhas grossas** entre as células do grid
- **Cor indica ocupação:**
  - 🟢 **Verde (0-50%):** Livre - muita capacidade disponível
  - 🟡 **Amarelo (51-80%):** Parcial - atenção necessária
  - 🔴 **Vermelho (81-100%):** Cheio - capacidade crítica

**Interações:**
- **Hover:** Mostra tooltip com "EL-H3: 25/50 cabos (50%)"
- **Clique:** Abre painel lateral com:
  - Nome e ID
  - Capacidade (ocupado/total)
  - Porcentagem de ocupação
  - Lista de cabos que passam por ela
  - Racks conectados através dela
  - Botões: Editar, Excluir

---

## 🛣️ FLUXO COMPLETO: PLANEJAMENTO DE ROTAS

### **1. Iniciar Planejamento**
- Usuário clica em botão **"Planejar Rota de Cabeamento"** no dashboard
- Abre **modal** solicitando:
  - **Rack de Origem** (dropdown ou seleção no mapa)
  - **Rack de Destino** (dropdown ou seleção no mapa)

### **2. Selecionar Origem**
- Usuário seleciona rack de origem (ex: Rack AA02)
- Rack fica **destacado com borda azul**
- Mensagem aparece: "Agora selecione o rack de destino"

### **3. Selecionar Destino**
- Usuário seleciona rack de destino (ex: Rack AE05)
- Sistema **calcula automaticamente** a melhor rota

### **4. Cálculo Automático da Rota**
Sistema usa algoritmo para encontrar caminho usando eletrocalhas:
- **Prioriza:**
  - Caminho mais curto (menos distância)
  - Eletrocalhas com mais espaço disponível
  - Evita eletrocalhas vermelhas (cheias)
- **Calcula:**
  - Distância total em metros
  - Eletrocalhas utilizadas no trajeto
  - Viabilidade (se há capacidade)

### **5. Visualização da Rota no Grid**

**Destaque visual:**
- **Eletrocalhas do caminho** ficam destacadas (ex: linha azul animada/pulsante)
- **Linha conectando** origem → destino passa por cima das eletrocalhas
- **Exemplo de caminho visual:**
  ```
  Rack AA02 (origem - destaque azul) → 
  EL-H2 (linha azul destacada) → 
  EL-V5 (linha azul destacada) → 
  EL-H7 (linha azul destacada) → 
  Rack AE05 (destino - destaque azul)
  ```

### **6. Painel de Detalhes da Rota**

Mostra informações completas:

```
📍 ROTA: AA02 → AE05

📏 Distância Total: 45 metros

🛣️ Eletrocalhas no Trajeto:
  ✅ EL-H2: 20/50 cabos (40%) - Verde
  ⚠️ EL-V5: 30/50 cabos (60%) - Amarela  
  ✅ EL-H7: 15/50 cabos (30%) - Verde

📊 Status: ✅ Rota viável - capacidade disponível

[Confirmar Rota]  [Cancelar]
```

### **7. Confirmar Rota**
Usuário clica em **"Confirmar Rota"**

Sistema executa:
- Salva a rota no banco de dados
- **Incrementa ocupação** de cada eletrocalha usada (+1 cabo)
- Atualiza cores das eletrocalhas se necessário
- Cria registro: "Cabo-001: AA02 → AE05"
- Exibe mensagem: "✅ Rota criada com sucesso!"

### **8. Rota Salva e Visível**
- Linha da rota fica **permanente** no mapa (mais sutil, semi-transparente)
- Pode visualizar **todas as rotas ativas** no mapa
- Opção de **filtrar/ocultar** rotas para limpar visualização
- Rotas aparecem na lista de cabos do rack

---

## ⚠️ CENÁRIOS ESPECIAIS

### **Cenário 1: Eletrocalha Cheia no Caminho**
- Sistema detecta que EL-V5 está em 48/50 (96% - vermelha)
- **Sugere rota alternativa** automaticamente
- Mostra comparação:
  ```
  Rota A (mais curta): 45m - ⚠️ EL-V5 quase cheia (96%)
  Rota B (alternativa): 52m - ✅ Todas com espaço livre
  
  Recomendação: Use Rota B
  ```

### **Cenário 2: Sem Eletrocalhas Conectando**
- Sistema informa: "❌ Não há caminho disponível entre estes racks"
- Sugere: "Adicione eletrocalhas para conectar estes racks"
- Mostra visualmente onde faltam eletrocalhas

### **Cenário 3: Ver Rotas Existentes de um Rack**
Ao clicar em rack AA02, painel mostra:
```
📦 Rack AA02
📍 Posição: Linha AA, Coluna 02
📊 Ocupação: 50/100 U (50%)

🔌 Cabos Conectados: 3
  → Cabo-001: para AE05 (via EL-H2, EL-V5, EL-H7) - 45m
  → Cabo-002: para AF08 (via EL-H2, EL-V8, EL-H9) - 38m
  → Cabo-003: para AB01 (via EL-H1) - 12m

[Editar Rack]  [Excluir Rack]  [Nova Rota]
```

---

## 📐 SISTEMA DE COORDENADAS

### **Nomenclatura do Grid**

**Linhas (Horizontal):**
- AA, AB, AC, AD, AE, AF, AG, AH, AI, AJ, AK...
- Continua: BA, BB, BC... (se necessário)

**Colunas (Vertical):**
- 00, 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11...

**Exemplo de Coordenadas:**
```
    00  01  02  03  04  05
AA  •   •   •   •   •   •
AB  •   •   R1  •   •   •   ← Rack em AB02
AC  •   •   •   •   R2  •   ← Rack em AC04
AD  •   •   •   •   •   •
```

**Exibição no Sistema:**
- Cada rack mostra sua coordenada (ex: "Rack AA02", "Rack AC04")
- Grid exibe labels nas bordas (linhas à esquerda, colunas no topo)
- Tooltip ao passar mouse: "Posição: AA02"

---

## 🏗️ TIPOS DE RACKS

### **1. Rack Padrão (Servidor/Storage)**
- Usa: Servidores, storages, appliances
- Cor: Depende da ocupação (verde/amarelo/vermelho)
- Campos:
  - Nome
  - Coordenadas (ex: AA02)
  - Altura total (U)
  - Ocupação (U usado/total)
  - Porcentagem de ocupação

### **2. Rack Cross-Connect (CC)**
- **O que é:** Ponto central de interconexão do data center
- **Função:** Todos os cabos convergem para esta área de manobra
- **Composição:** Racks dedicados apenas a DIOs (Distribuidores Internos Ópticos)
- **Importância:** Interliga cabeamento entre servidores e switches
- **Visual:** 
  - Cor especial (ex: azul ou cinza)
  - Ícone diferenciado
  - Label "CC" visível
- **Campo adicional:**
  - `is_cross_connect: boolean`

**Por que é importante?**
- Em grandes data centers, conexão direta entre equipamentos dificulta escalabilidade
- Cross-Connect centraliza e organiza todas as interconexões
- Facilita manutenção e expansão

---

# 🗄️ ESTRUTURA DO BANCO DE DADOS

## Tabela: Projetos
- id (int4)
- nome (varchar)
- largura_mm (int4)
- altura_mm (int4)
- created_at (timestamptz)
- user_id (uuid)

## Tabela: Racks
- id (int4)
- project_id (int4)
- nome (varchar)
- coordenada_x (int4)
- coordenada_y (int4)
- altura_u (int4)
- capacidade_u (int4)
- ocupado_u (int4)
- is_cross_connect (bool)

## Tabela: Eletrocalhas
- id (int4)
- Projeto_id (int4)
- nome (text)
- ponto_a_x (int4)
- ponto_a_y (int4)
- ponto_b_x (int4)
- ponto_b_y (int4)
- capacidade_maxima (int4)

## Tabela: Rotas
- id (uuid)
- Project_id (int4)
- nome (text)
- rack_origem_id (int4)
- rack_destino_id (int4)
- distancia_metros (numeric)
- eletrocalhas_ids (int4[])
- caminho_json (jsonb)
- status (text)
- created_at (timestamptz)



---

## 📊 DASHBOARD E GESTÃO

### **Dashboard Principal**

**Componentes:**
1. **Mapa 2D Interativo (central)**
   - Grid com racks e eletrocalhas
   - Zoom e pan
   - Rotas visíveis

2. **Painel Superior (toolbar)**
   - Botão: "Adicionar Rack"
   - Botão: "Adicionar Eletrocalha"
   - Botão: "Planejar Rota"
   - Filtros: Mostrar/Ocultar Rotas
   - Busca por rack

3. **Painel Lateral (detalhes)**
   - Informações do elemento selecionado
   - Estatísticas do projeto
   - Alertas e notificações

### **Lista de Eletrocalhas**
Tabela com:
- Nome | Tipo | Ocupação | Status | Ações
- EL-H1 | Horizontal | 20/50 (40%) | 🟢 Livre | Ver/Editar/Excluir
- EL-V5 | Vertical | 40/50 (80%) | 🟡 Atenção | Ver/Editar/Excluir
- EL-H7 | Horizontal | 48/50 (96%) | 🔴 Crítico | Ver/Editar/Excluir

**Filtros:**
- Todas / Livres / Atenção / Críticas
- Horizontais / Verticais

### **Alertas e Monitoramento**
- 🟡 "EL-H5 está em 75% - planeje nova eletrocalha paralela"
- 🔴 "EL-V2 está em 95% - capacidade crítica!"
- ℹ️ "3 eletrocalhas com mais de 80% de ocupação"

### **Estatísticas do Projeto**
```
📊 Resumo do Projeto

Total de Racks: 45
  - Racks Padrão: 42
  - Cross-Connects: 3

Total de Eletrocalhas: 28
  - Livres (verde): 18
  - Atenção (amarelo): 7
  - Críticas (vermelho): 3

Total de Rotas: 127 cabos
Distância Total: 3.450 metros

Eletrocalha mais ocupada: EL-V2 (48/50 - 96%)
Maior rota: 68m (Rack AA01 → AJ10)
```

---

## 🎨 DESIGN E UX

### **Princípios**
- **Corporativo:** Profissional e confiável
- **Minimalista:** Sem elementos desnecessários
- **Limpo:** Organização visual clara
- **Intuitivo:** Fácil de aprender e usar

### **Paleta de Cores**

**Status de Ocupação:**
- 🟢 Verde: `#22c55e` (Tailwind green-500) - 0-50%
- 🟡 Amarelo: `#eab308` (Tailwind yellow-500) - 51-80%
- 🔴 Vermelho: `#ef4444` (Tailwind red-500) - 81-100%

**Elementos:**
- Grid: Cinza claro `#e5e7eb` (gray-200)
- Racks: Cores de status + borda escura
- Eletrocalhas: Linhas grossas com cores de status
- Rotas ativas: Azul `#3b82f6` (blue-500) com animação
- Background: Branco ou cinza muito claro
- Texto: Cinza escuro `#1f2937` (gray-800)

### **Responsividade**
- Desktop: Layout completo com todos os painéis
- Tablet: Painéis colapsáveis
- Mobile: Menu hamburguer, visualização simplificada

---

## 🚀 ROADMAP DE DESENVOLVIMENTO (MVP)

### **Fase 1: Base (Já Implementada) ✅**
- [x] Autenticação (login, cadastro, recuperação)
- [x] Dashboard principal
- [x] Grid 2D interativo
- [x] Adicionar racks
- [x] Visualizar detalhes de racks

### **Fase 2: Eletrocalhas ✅**
- [x] Modelo de dados de eletrocalhas (tipos e nomes de campos ajustados e funcionais)
- [x] Interface para adicionar eletrocalha manual (funcional)
- [x] Interface para sugerir layout em grid automático (funcional)
- [x] Visualização de eletrocalhas no grid com cores (dados sendo carregados corretamente)
- [ ] Painel de detalhes de eletrocalha
- [ ] Editar e excluir eletrocalhas

### **Fase 3: Rotas de Cabeamento 🚧**
- [ ] Modal de planejamento de rota
- [ ] Seleção de origem e destino
- [ ] Algoritmo de cálculo de rota (Dijkstra simplificado)
- [ ] Visualização da rota no grid
- [ ] Painel de detalhes da rota
- [ ] Confirmar e salvar rota
- [ ] Atualização de ocupação das eletrocalhas
- [ ] Listar rotas de um rack

### **Fase 4: Melhorias e Refinamentos 📋**
- [ ] Sistema de coordenadas AA/00
- [ ] Rack Cross-Connect (CC)
- [ ] Lista e filtros de eletrocalhas
- [ ] Estatísticas e dashboard de ocupação
- [ ] Alertas de capacidade
- [ ] Filtrar/ocultar rotas no mapa
- [ ] Busca de racks
- [ ] Exportar relatórios básicos

### **Fase 5: Otimizações (Futuro) 🔮**
- [ ] Sugestão de rotas alternativas
- [ ] Histórico de mudanças
- [ ] Múltiplos projetos por usuário
- [ ] Colaboração entre usuários
- [ ] Integração com sistemas externos

---

## 🔧 LÓGICA TÉCNICA

### **Algoritmo de Roteamento (Simplificado para MVP)**

A malha de eletrocalhas é tratada como um **grafo**:
- **Nós:** Interseções de eletrocalhas e posições de racks
- **Arestas:** Segmentos de eletrocalha
- **Peso da aresta:** Distância + ocupação

**Fluxo:**
1. Usuário seleciona origem e destino
2. Frontend faz requisição ao backend
3. Backend monta grafo com eletrocalhas
4. Executa **algoritmo de caminho mais curto** (Dijkstra simplificado)
5. Considera ocupação: penaliza eletrocalhas cheias
6. Retorna lista de segmentos (eletrocalhas) no caminho
7. Frontend destaca a rota no mapa

**Representação Visual:**
```text
[Rack A] ●───┐
             │  (Eletrocalhas = arestas)
             ├──●──●──●── (nós/interseções)
[Rack B] ●───┘
```

---

## 💬 HISTÓRIAS DE USUÁRIO

### **HU-01 — Visualizar Planta-Baixa**
- **Como:** Planejador
- **Quero:** Ver a planta 2D do data center
- **Para:** Entender a distribuição dos racks e eletrocalhas
- **Critérios:**
  - Grid visível com coordenadas
  - Racks exibidos nas posições corretas
  - Tooltip ao passar mouse
  - Zoom e pan funcionando

### **HU-02 — Cadastrar Rack**
- **Como:** Planejador
- **Quero:** Adicionar um novo rack no mapa
- **Para:** Registrar equipamento físico
- **Critérios:**
  - Clicar em célula vazia → abrir formulário
  - Preencher: nome, coordenadas, altura U
  - Salvar → rack aparece no mapa
  - Impedir criação em coordenada já ocupada

### **HU-03 — Criar Layout de Eletrocalhas Automaticamente**
- **Como:** Planejador
- **Quero:** Gerar layout de eletrocalhas em malha automaticamente
- **Para:** Economizar tempo e ter estrutura padronizada
- **Critérios:**
  - Definir tamanho da planta
  - Sistema sugere malha completa
  - Preview antes de confirmar
  - Eletrocalhas criadas com nomes automáticos
  - Capacidade padrão configurável

### **HU-04 — Planejar Rota de Cabeamento**
- **Como:** Planejador
- **Quero:** Calcular rota entre dois racks
- **Para:** Saber qual caminho o cabo deve seguir
- **Critérios:**
  - Abrir modal de planejamento
  - Selecionar rack origem e destino
  - Sistema calcula rota automaticamente
  - Visualizar rota destacada no mapa
  - Ver distância e eletrocalhas usadas
  - Confirmar para salvar

### **HU-05 — Visualizar Ocupação de Eletrocalhas**
- **Como:** Planejador
- **Quero:** Ver status de ocupação das eletrocalhas
- **Para:** Identificar gargalos de capacidade
- **Critérios:**
  - Cores indicam ocupação (verde/amarelo/vermelho)
  - Tooltip mostra ocupação ao passar mouse
  - Clicar mostra detalhes completos
  - Lista de eletrocalhas com filtros
  - Alertas para eletrocalhas críticas

### **HU-06 — Gerenciar Racks Cross-Connect**
- **Como:** Arquiteta
- **Quero:** Marcar racks como Cross-Connect
- **Para:** Identificar pontos centrais de interconexão
- **Critérios:**
  - Checkbox "É Cross-Connect" ao criar/editar rack
  - Visual diferenciado no mapa (cor/ícone)
  - Label "CC" visível
  - Filtrar apenas racks CC

---

## 📝 CAMPOS IMPORTANTES

### **Ao Clicar em Rack - Exibir:**
```
📦 Nome do Rack: "Rack AA02"
📍 Posição: Linha AA, Coluna 02
📊 Ocupação: 50/100 U (50%)
🔌 Tipo: Servidor / Cross-Connect
📅 Criado em: 26/11/2024

🔌 Cabos Conectados: 3
  [Lista de rotas]

[Editar Rack] [Excluir Rack] [Nova Rota a partir daqui]
```

### **Ao Clicar em Eletrocalha - Exibir:**
```
🛤️ Nome: "EL-H5"
📐 Tipo: Horizontal
📊 Ocupação: 35/50 cabos (70%)
⚠️ Status: Atenção (Amarelo)
📍 De: AA00 até AA10
📏 Comprimento: 15 metros

🔌 Cabos que passam aqui: 35
  [Lista de rotas]

[Editar] [Excluir]
```

---

## ⚙️ CAMPOS REMOVIDOS (NÃO USAR NO MVP)

Para simplificar o MVP, os seguintes campos **NÃO** serão implementados:
- ❌ Temperatura do rack
- ❌ Potência consumida
- ❌ PDU (Power Distribution Unit)
- ❌ Sensores ambientais
- ❌ Perda óptica em dB
- ❌ Previsão de saturação com IA
- ❌ Múltiplos tipos de cabo (rede, fibra, energia)

**Foco:** Apenas visualização, capacidade e roteamento básico.

---

## 🎓 EXEMPLO PRÁTICO COMPLETO

### **Cenário Real de Uso:**

**Situação:**
- Data center com grid 10x10 células
- Técnico precisa conectar servidor no rack AA02 ao switch no rack AE05

**Passo a Passo:**

1. **Preparação:**
   - ✅ Técnico já criou layout sugerido de eletrocalhas (malha em grid)
   - Grid mostra racks e eletrocalhas com cores de status

2. **Iniciar Planejamento:**
   - Clica em "Planejar Rota" no dashboard
   - Modal abre pedindo origem e destino

3. **Selecionar Origem:**
   - Escolhe "Rack AA02" no dropdown (ou clica no mapa)
   - Rack AA02 fica com borda azul destacada

4. **Selecionar Destino:**
   - Escolhe "Rack AE05" no dropdown (ou clica no mapa)
   - Sistema processa...

5. **Sistema Calcula:**
   - Algoritmo encontra caminho mais curto
   - Caminho: AA02 → (direita via EL-H2) → (desce via EL-V5) → (direita via EL-H7) → AE05
   - Distância: 42 metros
   - Todas eletrocalhas têm capacidade ✅

6. **Visualização:**
   - Rota aparece destacada em **azul animado** no mapa
   - Linhas pulsam mostrando o caminho
   - Painel lateral mostra:
     ```
     📍 ROTA: AA02 → AE05
     📏 42 metros
     
     🛣️ Caminho:
     ✅ EL-H2: 20/50 (40%) 🟢
     ✅ EL-V5: 30/50 (60%) 🟡
     ✅ EL-H7: 15/50 (30%) 🟢
     
     [Confirmar Rota] [Cancelar]
     ```

7. **Confirmar:**
   - Técnico clica "Confirmar Rota"
   - Sistema salva como "Cabo-001"
   - Atualiza ocupação:
     - EL-H2: 20/50 → 21/50
     - EL-V5: 30/50 → 31/50  
     - EL-H7: 15/50 → 16/50
   - Mensagem: "✅ Rota criada com sucesso!"

8. **Resultado:**
   - Rota fica visível no mapa (linha azul semi-transparente)
   - Pode ver rota ao clicar em qualquer rack envolvido
   - Eletrocalhas mantêm cores atualizadas
   - Técnico tem informação clara para instalação física

---

## 🏁 LEMBRETES IMPORTANTES

### ⭐ **FOCO NO MVP:**
- ✅ Funcionalidades básicas funcionando perfeitamente
- ✅ Interface limpa e intuitiva
- ✅ Dados persistidos corretamente
- ❌ NÃO adicionar complexidades desnecessárias
- ❌ NÃO implementar IA ainda
- ❌ NÃO adicionar features avançadas

### 🎯 **PRIORIDADES:**
1. Visualização clara do data center
2. Cadastro de racks e eletrocalhas funcionando
3. Planejamento de rotas simples mas efetivo
4. Gestão de ocupação/capacidade
5. Interface responsiva e agradável

**Fim da Documentação do MVP**

Esta documentação deve ser usada como referência para todas as decisões de desenvolvimento. Mantenha o foco no MVP e nas funcionalidades essenciais.
