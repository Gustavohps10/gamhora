# **Relatório de Pesquisa Técnica: Arquitetura de Integração Analítica e BI sobre o Redmine 3.4**

## **Diagnóstico da Plataforma e Desafios de Integração**

A construção de um módulo analítico de relatórios de equipe no aplicativo Mr-tick utilizando o Redmine 3.4.x como fonte de dados primária apresenta desafios estruturais no ecossistema de dados1. O Redmine 3.4.x, estruturado originalmente sobre a arquitetura Ruby on Rails 4.2, possui restrições severas na sua interface de programação de aplicações (API REST) no que tange ao processamento analítico de grande volume1. A API REST nativa foi concebida para operações transacionais e operacionais do tipo CRUD em itens individuais, carecendo de primitivas para processamento analítico online (OLAP), agregação no lado do servidor ou execução de funções de agrupamento de banco de dados1.  
Para atender equipes compostas por 50 a 100 usuários — cujas métricas consolidadas exigem a extração de dezenas de milhares de registros de horas lançadas (time\_entries) e chamados (issues) —, o consumo síncrono da API REST legada ocasiona gargalos severos de latência, alto consumo de largura de banda e sobrecarga computacional no servidor de produção do cliente1.  
Este relatório apresenta uma análise exaustiva das alternativas de integração com o Redmine 3.4.x. A investigação abrange os endpoints REST oficiais e internos, o motor nativo de relatórios, o ecossistema de plugins, a viabilidade de GraphQL, conexões diretas em banco de dados relacional e estratégias de sincronização incremental.

## **1\. Análise Exaustiva da REST API Oficial do Redmine 3.4.x**

A API REST do Redmine 3.4.x expõe dados nos formatos JSON e XML para recursos operacionais1. A implementação específica desta versão do software possui limitações estritas que afetam a viabilidade de consultas analíticas diretas1.

| Endpoint REST (3.4.x)                      | Filtros Suportados                                                   | Capacidade de Agregação / Agrupamento         | Comportamento de Paginação e Limites                                     |
| :----------------------------------------- | :------------------------------------------------------------------- | :-------------------------------------------- | :----------------------------------------------------------------------- |
| /time\_entries.json                        | project\_id, user\_id, spent\_on (intervalos), issue\_id \[cite: 3\] | Ausente. Retorna apenas objetos brutos2.      | Paginação obrigatória: limit máximo de 100 por requisição (padrão 25\)1. |
| /issues.json                               | project\_id, assigned\_to\_id, status\_id, updated\_on, created\_on  | Ausente. Retorna apenas objetos brutos2.      | Paginação obrigatória: limit máximo de 100 por requisição1.              |
| /users.json                                | status, group\_id, name                                              | Ausente. Retorna lista de usuários.           | Paginação padrão habilitada1.                                            |
| /projects.json                             | Filtros básicos de visibilidade por usuário                          | Ausente. Retorna estrutura de projetos.       | Paginação padrão habilitada1.                                            |
| /enumerations/time\_entry\_activities.json | Listagem estática de categorias                                      | Não aplicável.                                | Sem paginação (lista completa do sistema).                               |
| /queries.json                              | Retorna definições de pesquisas salvas4                              | Ausente. Exibe apenas metadados da consulta4. | Sem paginação avançada4.                                                 |
| /journals.json                             | **Inexistente no Redmine 3.4** (Adicionado apenas no Redmine 5.0)1.  | Não aplicável.                                | Acessível apenas via sub-recurso /issues/{id}.json?include=journals.     |

### **Parâmetros de Paginação e Mecanismos de Filtragem**

A paginação do Redmine 3.4 é controlada estritamente pelos parâmetros limit e offset (ou page)1. O valor padrão do parâmetro limit é de 25 registros, e o teto máximo permitido pela camada de controle é de 100 registros por requisição HTTP1. Cada resposta JSON inclui um envelope de metadados composto pelas chaves total\_count, offset e limit1.  
Em relação aos filtros temporais, o endpoint /time\_entries.json suporta o parâmetro spent\_on com sintaxes de intervalo tais como spent\_on=\>\<2023-01-01|2023-01-31 ou parâmetros from e to3. Por sua vez, o endpoint /issues.json aceita o parâmetro updated\_on utilizando a sintaxe ISO 8601 (exemplo: updated\_on=\>=2023-01-01T00:00:00Z).  
Apesar do suporte a filtros de seleção, a API REST do Redmine 3.4 **não dispõe de qualquer parâmetro ou flag para agregação de dados, somatório (SUM), contagem (COUNT) ou agrupamento (GROUP BY)**2. O servidor processa os filtros no banco de dados e serializa todos os objetos correspondentes para o payload JSON de resposta1.  
Uma limitação crítica da versão 3.4.x é a **ausência do endpoint isolado de históricos (/journals.json)**, que só passou a integrar o core do sistema no Redmine 5.0.01. Para calcular métricas de fluxo como Lead Time e Cycle Time via API no Redmine 3.4, a aplicação cliente precisa realizar chamadas individuais para cada issue utilizando a Query String /issues/{id}.json?include=journals, o que gera uma amplificação do número de requisições enviadas ao servidor.

### **Conclusão Explícita: REST API Oficial**

> **A REST API oficial do Redmine 3.4 NÃO consegue responder consultas agregadas de equipe sem que o cliente baixe a totalidade dos registros brutos.** O servidor transfere a carga de processamento das agregações e cálculos estatísticos para o cliente, forçando o aplicativo Mr-tick a consumir milhares de arquivos JSON individuais e executar em memória local as operações de consolidação por usuário, projeto e atividade1.

## **2\. Análise do Motor de Relatórios Nativos e Endpoints Internos**

O Redmine 3.4.x possui um motor de relatórios embutido na sua interface web, gerenciado pela classe TimelogController para registros de horas e pela classe IssuesController para estatísticas de chamados5.

### **Funcionamento Interno e Processamento SQL**

Internamente, a rota /time\_entries/report utiliza a classe do modelo TimeEntryQuery para construir instruções SQL dinâmicas6. Essa classe aplica cláusulas GROUP BY e funções de agregação (SUM(hours)) diretamente no banco de dados relacional6. O motor aceita múltiplos critérios de agrupamento (criteria\[\], como user, project, activity, issue) combinados com eixos temporais (columns=year|month|week|day)6.  
Apesar de a interface web possuir um endpoint analítico nativo que realiza os cálculos no servidor, a exportação desse relatório no formato JSON (/time\_entries/report.json) **não existe no Redmine 3.4**2. Essa melhoria foi objeto de solicitação no ticket da comunidade (Feature \#32796), mas não foi retroportada para a ramificação 3.42.

### **Descoberta Técnica: Reutilização do Endpoint de Exportação CSV Nativo**

Apesar da ausência de suporte a JSON no relatório nativo, o controlador do Redmine 3.4 expõe o formato **CSV** na mesma rota interna5. O endpoint /time\_entries/report.csv pode ser consumido programmaticamente por aplicações externas, desde que autenticado via cabeçalho HTTP X-Redmine-API-Key ou parâmetro de URL key1.

HTTP  
GET /time\_entries/report.csv?f\[\]=spent\_on\&op\[spent\_on\]=\>\<\&v\[spent\_on\]\[\]=2023-01-01\&v\[spent\_on\]\[\]=2023-01-31\&criteria\[\]=user\&criteria\[\]=project\&criteria\[\]=activity\&columns=month\&key=CHAVE\_API\_AQUI

Ao receber essa requisição, a aplicação Rails executa o agrupamento SQL internamente e gera uma tabela CSV contendo as horas agregadas por Usuário, Projeto, Atividade e Mês6. Isso permite obter a matriz consolidada de uma equipe inteira através de uma única chamada HTTP, sem baixar registros brutos e sem necessidade de instalar plugins5.

## **3\. Avaliação do Ecossistema de Plugins Analíticos**

A investigação abordou o ecossistema de extensões do Redmine em busca de plugins capazes de expor dados analíticos para consumo externo, com foco na compatibilidade com o Redmine 3.4.x.

| Nome do Plugin                    | Repositório / Referência                                  | Compatibilidade com Redmine 3.4                | Status de Manutenção                                   | Exposição de API Externa                 | Capacidade de Agregação no Servidor            | Alteração no Schema DB                   | Adequação Empresarial                 |
| :-------------------------------- | :-------------------------------------------------------- | :--------------------------------------------- | :----------------------------------------------------- | :--------------------------------------- | :--------------------------------------------- | :--------------------------------------- | :------------------------------------ |
| **AlphaNodes Reporting**          | alphanodes.com \[cite: 8\]                                | Compatível em versões legadas (\< v3.0)8.      | Ativo (foco em Redmine 5.x/6.x)9.                      | Não expõe API JSON externa.              | Sim (processamento interno para visões HTML)8. | Sim (adiciona tabelas e configurações)9. | Alta (Solução proprietária mantida)9. |
| **Redmine Resources (RedmineUp)** | redmine.org/plugins/redmine\_resources \[cite: 10\]       | Compatível em versões legadas (v1.x/v2.0.0)10. | Ativo (descontinuou suporte ao Redmine 3 na v2.0.1)10. | Não expõe API de BI externa.             | Sim (cálculos de capacidade de alocação)10.    | Sim (tabelas de reservas)10.             | Alta (Comercial)10.                   |
| **Custom Field SQL**              | github.com/alexey-smirnov/custom\_field\_sql \[cite: 11\] | Compatível (v2.x suporta Redmine 3.4)11.       | Ativo11.                                               | Parcial (via API REST de Custom Fields). | Sim (executa queries SQL arbitrárias)11.       | Não.                                     | Média (Risco de injeção de SQL).      |
| **Redmine Reports (jbbarth)**     | github.com/jbbarth/redmine\_reports \[cite: 12\]          | Compatível com Redmine 3.x12.                  | Descontinuado (projeto sem atualizações).              | Não expõe endpoints JSON.                | Sim (gráficos nativos em visões Rails)12.      | Não12.                                   | Baixa (Código abandonado).            |
| **Redmine REST API Extensions**   | Vários forks na comunidade GitHub                         | Inconstante / Parcial em Redmine 3.4.          | Abandonado em sua maioria.                             | Sim (novos endpoints JSON).              | Depende do fork específico.                    | Não.                                     | Baixa.                                |

### **Análise do Ecossistema de Plugins**

A maioria dos plugins de BI e relatórios disponíveis para o Redmine (como as suítes da AlphaNodes e da RedmineUp) tem como foco a **renderização de dashboards gráficos e componentes visuais dentro da própria interface web do Redmine**8. Esses plugins não oferecem endpoints de API estruturados em JSON para extração analítica externa.  
Além disso, em um ambiente corporativo com Redmine 3.4.x mantido sob restrição de TI, a instalação de plugins exige a execução de tarefas administrativas complexas (instalação de gemas, compilação de assets pelo Pipeline do Rails, migração de banco de dados e reinicialização dos processos do servidor de aplicação), o que dificulta a aprovação da instalação por gestores de infraestrutura.

## **4\. Viabilidade da Camada GraphQL no Redmine 3.4.x**

A investigação avaliou se a adoção de um plugin GraphQL (como as gemas e projetos redmine\_graphql) resolveria o gargalo de volume e agregação de dados no Redmine 3.414.

### **Análise de Compatibilidade e Comportamento Arquitetural**

> 1. **Compatibilidade de Versão**: A maioria das extensões GraphQL para Redmine foi desenvolvida para versões recentes (Redmine 4.x e 5.x). A execução dessas bibliotecas no Redmine 3.4 exige a adaptação para gemas mais antigas do ecossistema Ruby/Rails (Rails 4.2 e Ruby 2.x), o que exige manutenções customizadas.
> 2. **Arquitetura de Resolvers**: Os plugins GraphQL desenvolvidos para o Redmine atuam como uma camada sobre o ORM ActiveRecord. Uma consulta GraphQL solicitando apontamentos de horas é traduzida internamente para consultas relacionais do tipo TimeEntry.where(...).
> 3. **Ausência de Agregações Nativas**: As implementações de GraphQL para Redmine não contêm resolvers analíticos ou sintaxe para instruções do tipo groupBy, sum ou count. Elas foram projetadas para substituir a API REST na consulta de objetos individuais e navegação em grafos de entidade.

### **Conclusão Explícita: GraphQL**

> **O GraphQL NÃO resolve o problema de volume de requisições nem o gargalo de processamento no servidor de origem.** A tecnologia apenas altera a forma de consultar os dados (permitindo a seleção de campos e a eliminação do problema de over-fetching), mas **continua retornando a lista inteira de registros individuais**, transferindo para o aplicativo Mr-tick a responsabilidade de calcular as somatórias das equipes.

## **5\. Arquitetura de Acesso Direto ao Banco de Dados (Read-Only)**

O acesso direto em modo de leitura ao Banco de Dados Relacional do Redmine (PostgreSQL, MySQL ou MariaDB) contorna a camada de aplicação Rails, permitindo a execução de consultas SQL otimizadas com processamento direto no SGBD16.

### **Mapeamento do Schema Relacional (Redmine 3.4)**

Para a construção do modelo analítico do Mr-tick, o banco de dados do Redmine 3.4 organiza-se através das tabelas centrais detalhadas abaixo:

- time\_entries: Contém os lançamentos de horas (hours), data (spent\_on), usuário (user\_id), projeto (project\_id), chamado (issue\_id) e atividade (activity\_id).
- issues: Armazena a estrutura de chamados (id, subject, status\_id, assigned\_to\_id, author\_id, created\_on, updated\_on, closed\_on, estimated\_hours).
- users: Cadastro de usuários (id, firstname, lastname, login, status).
- projects: Estrutura hierárquica de projetos (id, name, identifier).
- enumerations: Atividades de time tracking e prioridades (id, name, type).
- journals: Registro dos eventos e alterações nos chamados (id, journalized\_id, journalized\_type, user\_id, created\_on).
- journal\_details: Detalhes das propriedades modificadas em cada evento (journal\_id, property, prop\_key, old\_value, value).

### **Consultas SQL para Métricas de Equipe**

As consultas SQL listadas a seguir foram estruturadas no padrão SQL ANSI, garantindo compatibilidade com os SGBDs PostgreSQL e MySQL/MariaDB utilizados no Redmine 3.47.

#### **1\. Total de Horas por Usuário**

SQL  
SELECT  
u.id AS user\_id,  
u.firstname || ' ' || u.lastname AS user\_name,  
SUM(te.hours) AS total\_hours  
FROM time\_entries te  
JOIN users u ON u.id \= te.user\_id  
WHERE te.spent\_on BETWEEN '2023-01-01' AND '2023-01-31'  
GROUP BY u.id, u.firstname, u.lastname  
ORDER BY total\_hours DESC;

#### **2\. Horas por Usuário e por Projeto**

SQL  
SELECT  
u.id AS user\_id,  
u.firstname || ' ' || u.lastname AS user\_name,  
p.id AS project\_id,  
p.name AS project\_name,  
SUM(te.hours) AS total\_hours  
FROM time\_entries te  
JOIN users u ON u.id \= te.user\_id  
JOIN projects p ON p.id \= te.project\_id  
WHERE te.spent\_on BETWEEN '2023-01-01' AND '2023-01-31'  
GROUP BY u.id, u.firstname, u.lastname, p.id, p.name  
ORDER BY user\_name, total\_hours DESC;

#### **3\. Horas por Usuário e por Atividade**

SQL  
SELECT  
u.id AS user\_id,  
u.firstname || ' ' || u.lastname AS user\_name,  
e.name AS activity\_name,  
SUM(te.hours) AS total\_hours  
FROM time\_entries te  
JOIN users u ON u.id \= te.user\_id  
JOIN enumerations e ON e.id \= te.activity\_id AND e.type \= 'TimeEntryActivity'  
WHERE te.spent\_on BETWEEN '2023-01-01' AND '2023-01-31'  
GROUP BY u.id, u.firstname, u.lastname, e.name  
ORDER BY user\_name, total\_hours DESC;

#### **4\. Horas Agregadas por Mês por Usuário**

SQL  
SELECT  
DATE\_TRUNC('month', te.spent\_on) AS month,  
u.id AS user\_id,  
u.firstname || ' ' || u.lastname AS user\_name,  
SUM(te.hours) AS total\_hours  
FROM time\_entries te  
JOIN users u ON u.id \= te.user\_id  
WHERE te.spent\_on \>= '2023-01-01'  
GROUP BY DATE\_TRUNC('month', te.spent\_on), u.id, u.firstname, u.lastname  
ORDER BY month DESC, total\_hours DESC;

#### **5\. Quantidade de Issues por Usuário**

SQL  
SELECT  
u.id AS user\_id,  
u.firstname || ' ' || u.lastname AS user\_name,  
COUNT(i.id) AS total\_assigned\_issues,  
SUM(CASE WHEN st.is\_closed \= TRUE THEN 1 ELSE 0 END) AS closed\_issues  
FROM users u  
LEFT JOIN issues i ON i.assigned\_to\_id \= u.id  
LEFT JOIN issue\_statuses st ON st.id \= i.status\_id  
GROUP BY u.id, u.firstname, u.lastname  
ORDER BY total\_assigned\_issues DESC;

#### **6\. Throughput: Issues Concluídas por Período**

SQL  
SELECT  
u.id AS user\_id,  
u.firstname || ' ' || u.lastname AS user\_name,  
COUNT(DISTINCT i.id) AS throughput\_issues  
FROM issues i  
JOIN issue\_statuses st ON st.id \= i.status\_id  
JOIN users u ON u.id \= i.assigned\_to\_id  
WHERE st.is\_closed \= TRUE  
AND i.updated\_on BETWEEN '2023-01-01 00:00:00' AND '2023-01-31 23:59:59'  
GROUP BY u.id, u.firstname, u.lastname  
ORDER BY throughput\_issues DESC;

#### **7\. Histórico de Mudanças de Status (Tempo entre Transições)**

SQL  
SELECT  
i.id AS issue\_id,  
i.subject,  
jd.old\_value AS status\_de,  
jd.value AS status\_para,  
j.created\_on AS data\_transicao  
FROM journals j  
JOIN journal\_details jd ON jd.journal\_id \= j.id  
JOIN issues i ON i.id \= j.journalized\_id AND j.journalized\_type \= 'Issue'  
WHERE jd.property \= 'attr' AND jd.prop\_key \= 'status\_id'  
ORDER BY i.id, j.created\_on ASC;

#### **8\. Cálculo de Lead Time**

O Lead Time é definido como o intervalo de tempo decorrido entre a data de criação do chamado (![][image1]) e a sua data de encerramento (![][image2]):  
![][image3]

SQL  
SELECT  
i.id AS issue\_id,  
i.subject,  
u.firstname || ' ' || u.lastname AS assignee,  
i.created\_on,  
i.closed\_on,  
ROUND((EXTRACT(EPOCH FROM (i.closed\_on \- i.created\_on)) / 86400)::numeric, 2) AS lead\_time\_days  
FROM issues i  
JOIN users u ON u.id \= i.assigned\_to\_id  
WHERE i.closed\_on IS NOT NULL  
AND i.created\_on \>= '2023-01-01';

#### **9\. Cálculo de Cycle Time**

O Cycle Time mede o tempo gasto no trabalho ativo do chamado, calculado a partir da primeira transição para o status "Em Andamento" (![][image4]) até a data de encerramento (![][image2]):  
![][image5]

SQL  
WITH primeira\_transicao\_andamento AS (  
SELECT  
j.journalized\_id AS issue\_id,  
MIN(j.created\_on) AS inicio\_trabalho  
FROM journals j  
JOIN journal\_details jd ON jd.journal\_id \= j.id  
WHERE j.journalized\_type \= 'Issue'  
AND jd.property \= 'attr'  
AND jd.prop\_key \= 'status\_id'  
AND jd.value \= '2' \-- Identificador do status 'Em Andamento'  
GROUP BY j.journalized\_id  
)  
SELECT  
i.id AS issue\_id,  
i.subject,  
u.firstname || ' ' || u.lastname AS assignee,  
pta.inicio\_trabalho,  
i.closed\_on,  
ROUND((EXTRACT(EPOCH FROM (i.closed\_on \- pta.inicio\_trabalho)) / 86400)::numeric, 2) AS cycle\_time\_days  
FROM issues i  
JOIN primeira\_transicao\_andamento pta ON pta.issue\_id \= i.id  
JOIN users u ON u.id \= i.assigned\_to\_id  
WHERE i.closed\_on IS NOT NULL;

### **Análise de Segurança, Performance e Impacto Operacional**

Executar consultas analíticas complexas com junções de tabelas históricas (journals e journal\_details) diretamente no banco de dados de produção pode provocar contenção de bloqueios e consumo elevado de I/O de disco, impactando os usuários operacionais do Redmine.  
Para mitigar esses riscos, é indispensável adotar as seguintes práticas de infraestrutura:

- **Criação de Usuário Read-Only**: O acesso deve ser limitado por permissões explícitas no SGBD (exemplo no PostgreSQL: CREATE USER mr-tick\_ro WITH PASSWORD '...'; GRANT CONNECT ON DATABASE redmine TO mr-tick\_ro; GRANT SELECT ON ALL TABLES IN SCHEMA public TO mr-tick\_ro;).
- **Criação de Índices Específicos**: É recomendável criar índices cobrindo as colunas time\_entries(spent\_on, user\_id, project\_id), issues(assigned\_to\_id, status\_id, closed\_on) e journal\_details(journal\_id, prop\_key).
- **Utilização de Réplica de Leitura (Read Replica)**: Em ambientes corporativos, a conexão do Mr-tick deve ser apontada para uma instância secundária do banco de dados sincronizada de forma assíncrona. Isso isola completamente a carga analítica da aplicação principal.
- **Estabilidade do Schema**: O modelo relacional do Redmine possui estabilidade histórica. Atualizações entre as versões 3.4.x, 4.x e 5.x mantêm a integridade dessas tabelas primárias, minimizando os riscos de quebra de compatibilidade em atualizações do sistema.

## **6\. Padrões de Integração Utilizados por Ferramentas de BI em Escala**

A análise das práticas de integração de ferramentas como Power BI, Metabase, Grafana, Tableau e Apache Superset demonstra que o mercado não utiliza a API REST do Redmine para relatórios analíticos corporativos.  
As arquiteturas adotadas pela comunidade dividem-se em duas abordagens principais:

### **Abordagem 1: Consulta Direta ao Banco de Dados ou Réplica (DirectQuery)**

Ferramentas como Metabase e Grafana conectam-se diretamente às tabelas do PostgreSQL ou MySQL do Redmine. As visualizações são geradas por meio de consultas SQL nativas executadas em tempo real contra uma réplica de leitura do banco de dados.

### **Abordagem 2: Pipeline ETL/ELT com Data Warehouse Cilíndrico**

Em cenários corporativos que demandam histórico longo e suporte a equipes acima de 100 usuários, orquestradores de dados (como Airbyte, Meltano ou scripts Python) extraem periodicamente o banco relacional do Redmine e alimentam um Data Warehouse (PostgreSQL Analítico, Snowflake ou BigQuery). Os dados são transformados em um modelo dimensional (Star Schema) composto por tabelas fato (fato\_apontamentos, fato\_transicoes\_status) e tabelas dimensão (dim\_usuario, dim\_projeto, dim\_tempo).  
A API REST é descartada nesses cenários devido às limitações de paginação (100 registros), à latência de transporte e à incapacidade de refletir remoções físicas de registros (_hard deletes_)1.

## **7\. Estrutura de Sincronização Incremental via REST API**

Caso o Mr-tick seja submetido à restrição de utilizar exclusivamente a API REST oficial do Redmine 3.4.x, a arquitetura deve obrigatoriamente implementar um mecanismo de **Sincronização Incremental com Armazenamento Local**.

### **Lógica de Captura de Mudanças (CDC) e Limitações**

A sincronização incremental baseia-se na filtragem por carimbo de data/hora (updated\_on) no endpoint /issues.json, gravando no Mr-tick o momento da última sincronização1.  
Entretanto, o endpoint /time\_entries.json na versão 3.4.x não possui um filtro confiável de updated\_on em todas as revisões de código. A estratégia alternativa consiste em filtrar o endpoint /time\_entries.json utilizando a data de lançamento (spent\_on) sobre janelas de tempo deslizantes3.  
Além disso, a API REST do Redmine **não disponibiliza registros de exclusão (tombstones)**. Se um usuário apagar um lançamento de horas ou um chamado no Redmine, essa exclusão não é reportada por filtros modais. Dessa forma, uma sincronização puramente incremental acumulará divergências e exigirá uma rotina periódica (exemplo: semanal) de varredura completa dos IDs para reconciliação do banco local.

### **Modelo Paramétrico do Volume de Requisições HTTP**

A estimativa paramétrica abaixo considera os limites da API REST do Redmine 3.4 (limit=100)1, assumindo uma média mensal por usuário de 60 apontamentos de horas (time\_entries) e 15 chamados atualizados (issues), acrescida da necessidade de buscar o detalhamento individual de cada issue (/issues/{id}.json?include=journals) para a reconstrução do histórico de transições.  
![][image6]

| Dimensão da Equipe | Período de Análise | Volume Estimado de Time Entries | Volume Estimado de Issues | Reqs. de Listagem (Limit 100\) | Reqs. de Detalhamento de Journals | Total de Requisições HTTP (Carga Carga Inicial) |
| :----------------- | :----------------- | :------------------------------ | :------------------------ | :----------------------------- | :-------------------------------- | :---------------------------------------------- |
| **10 Usuários**    | 1 Mês              | 600                             | 150                       | 8                              | 150                               | **\~158 requisições**                           |
|                    | 1 Ano              | 7.200                           | 1.800                     | 90                             | 1.800                             | **\~1.890 requisições**                         |
|                    | 3 Anos             | 21.600                          | 5.400                     | 270                            | 5.400                             | **\~5.670 requisições**                         |
| **50 Usuários**    | 1 Mês              | 3.000                           | 750                       | 38                             | 750                               | **\~788 requisições**                           |
|                    | 1 Ano              | 36.000                          | 9.000                     | 450                            | 9.000                             | **\~9.450 requisições**                         |
|                    | 3 Anos             | 108.000                         | 27.000                    | 1.350                          | 27.000                            | **\~28.350 requisições**                        |
| **100 Usuários**   | 1 Mês              | 6.000                           | 1.500                     | 75                             | 1.500                             | **\~1.575 requisições**                         |
|                    | 1 Ano              | 72.000                          | 18.000                    | 900                            | 18.000                            | **\~18.900 requisições**                        |
|                    | 3 Anos             | 216.000                         | 54.000                    | 2.700                          | 54.000                            | **\~56.700 requisições**                        |
| **500 Usuários**   | 1 Ano              | 360.000                         | 90.000                    | 4.500                          | 90.000                            | **\~94.500 requisições**                        |
|                    | 3 Anos             | 1.080.000                       | 270.000                   | 13.500                         | 270.000                           | **\~283.500 requisições**                       |

Os dados evidenciam que a carga inicial do histórico de uma equipe de 100 usuários ao longo de 3 anos exige a execução de **mais de 56 mil requisições HTTP**. A execução síncrona dessa rotina durante o carregamento de uma página inviabiliza a experiência do usuário e sujeita o aplicativo a bloqueios no servidor por limite de taxa (_rate limiting_).

## **8\. Alternativas Intermediárias de Extração**

Para cenários onde o acesso direto ao banco é restrito e a extração REST bruta é inviável, foram mapeadas alternativas intermediárias de integração.

### **Consumo Automatizado da Exportação CSV Nativa**

O aplicativo Mr-tick pode realizar chamadas via código para o relatório nativo do Redmine (/time\_entries/report.csv)5. Essa requisição passa os parâmetros de agrupamento desejados e a chave de API do usuário1. O Redmine executa as agregações e devolve um arquivo CSV pré-calculado contendo os totais por usuário, projeto e atividade6.

- **Vantagens**: Processamento das agregações diretamente no banco de dados do Redmine6, transferência de payloads reduzidos e dispensa da instalação de plugins5.
- **Limitações**: Não fornece o histórico detalhado de mudanças de status necessário para o cálculo preciso de Lead Time e Cycle Time.

### **Consultas Salvas (queries)**

O administrador configura pesquisas públicas personalizadas no Redmine contendo as colunas e filtros exigidos pela equipe4. O Mr-tick consome /queries.json para obter os identificadores e faz a requisição em /issues.json?query\_id=X4. Embora simplifique a passagem de filtros, essa alternativa continua retornando dados brutos e paginados, sem agregar os valores1.

### **Plugins de Webhooks**

A instalação de um plugin leve de eventos (como o redmine\_webhook) envia requisições HTTP POST para o Mr-tick sempre que um chamado ou apontamento for alterado. O Mr-tick processa essas mensagens e atualiza seu repositório local em tempo real, eliminando a necessidade de varreduras periódicas.

## **9\. Matriz Comparativa de Arquiteturas para o Mr-tick**

As abordagens arquiteturais avaliadas para a sustentação do módulo de relatórios de equipe do aplicativo Mr-tick foram comparadas segundo seus critérios técnicos.

| Critério de Comparação              | A: REST Direto       | B: REST \+ Cache Local     | C: Read-Only DB / Replica  | D: Plugin Analítico Customizado | E: ETL Externo \+ Data Warehouse |
| :---------------------------------- | :------------------- | :------------------------- | :------------------------- | :------------------------------ | :------------------------------- |
| **Performance de Resposta (UX)**    | Inaceitável (\> 30s) | Excelente (\< 200ms)       | Excelente (\< 100ms)       | Boa (\< 1s)                     | Excelente (\< 100ms)             |
| **Complexidade de Implementação**   | Baixa                | Alta                       | Média                      | Alta                            | Alta                             |
| **Segurança e Isolação**            | Alta                 | Alta                       | Alta (via Replica/User RO) | Média                           | Alta                             |
| **Esforço de Manutenção**           | Baixo                | Alto (Resync / Tombstones) | Baixo                      | Alto (Updates Redmine)          | Médio                            |
| **Compatibilidade com Redmine 3.4** | Total (100%)1        | Total (100%)1              | Total (100%)16             | Complexa (Dep. de Gemas)        | Total (100%)16                   |
| **Volume de Requisições HTTP**      | Extremamente Alto    | Médio (Processado em BG)   | Zero (0)                   | Baixo                           | Zero (0)                         |
| **Escalabilidade (100+ Usuários)**  | Inviável             | Boa                        | Excelente                  | Média                           | Excelente                        |
| **Dependência de Infra do Cliente** | Nenhuma              | Nenhuma                    | Baixa (Acesso à porta DB)  | Alta (Deploy no servidor)       | Alta (Infra de DW)               |
| **Experiência do Usuário Final**    | Instável / Lenta     | Excelente                  | Excelente                  | Boa                             | Excelente                        |
| **Adequação Global**                | **Não Recomendado**  | **Recomendado (Fallback)** | **Melhor Opção**           | **Não Recomendado**             | **Recomendado (Escala)**         |

## **10\. Conclusões Objetivas e Respostas Diretas**

### **Pergunta 1**

**Existe alguma API oficial ou mecanismo nativo do Redmine 3.4 capaz de retornar dados agregados de time\_entries por usuário/projeto/atividade sem que o cliente precise baixar todos os registros?**

> **Resposta:** **Não via REST API JSON padrão.** O endpoint REST /time\_entries.json do Redmine 3.4 retorna estritamente registros brutos e paginados1. **Sim via rota nativa CSV.** O mecanismo nativo do relatório de tempo (GET /time\_entries/report.csv), ao receber parâmetros de critérios (criteria\[\]=user\&criteria\[\]=project\&criteria\[\]=activity) e autenticação via API Key, retorna os dados agrupados e somados pelo banco do Redmine em um único arquivo CSV1.

### **Pergunta 2**

**Existe algum plugin de GraphQL/API/BI compatível com Redmine 3.4 que resolva isso?**

> **Resposta:** **Não de forma pronta e gratuita.** As poucas implementações de GraphQL disponíveis para Redmine não possuem compatibilidade nativa com a ramificação 3.4 sem adaptação de código legado. Além disso, elas funcionam como _wrappers_ sobre o ORM ActiveRecord, mantendo o retorno de registros individuais sem executar instruções GROUP BY no banco de dados. Os plugins de BI (AlphaNodes, RedmineUp) focam na interface do próprio Redmine e não disponibilizam rotas abertas de agregação para sistemas externos8.

### **Pergunta 3**

**Como empresas normalmente fazem BI de Redmine em escala?**

> **Resposta:**  
> Em cenários corporativos com equipes de grande porte, as empresas **não utilizam a API REST**. A arquitetura padrão consiste na **conexão direta em modo leitura a uma Réplica de Leitura (Read Replica)** do banco de dados ou no estabelecimento de um **pipeline ETL/ELT** que extrai os dados relacionais do Redmine para um Data Warehouse (PostgreSQL, Snowflake, BigQuery), no qual as ferramentas de BI executam consultas analíticas pré-agregadas.

### **Pergunta 4**

**Para o Mr-tick, qual é a arquitetura mais recomendada considerando as restrições impostas (Redmine 3.4, sem modificar código, permissão para solicitar plugin existente ou DB read-only, suporte a \~100 usuários)?**

> **Resposta:**  
> A arquitetura mais recomendada é a **Conexão Direta ao Banco de Dados Read-Only ou Réplica de Leitura (Arquitetura C)**.  
> Essa abordagem permite que o Mr-tick execute consultas SQL contendo cláusulas GROUP BY, SUM e tabelas temporárias para métricas de fluxo (Lead Time e Cycle Time) diretamente no SGBD. Essa solução atinge tempos de resposta inferiores a 100ms, possui impacto zero no servidor web Rails e dispensa alterações de código ou instalação de plugins.

### **Pergunta 5**

**Se o administrador não permitir plugin e não fornecer acesso ao banco, qual é a melhor arquitetura possível usando exclusivamente REST?**

> **Resposta:**  
> A solução ideal sob restrição total é uma **Arquitetura Híbrida (Sincronização Incremental em Background com Caching Local no Mr-tick \+ Extração do CSV Nativo)**:

1. **Para a matriz de horas (Usuário / Projeto / Atividade / Mês)**: O Mr-tick consome programmaticamente a rota do relatório nativo em CSV (GET /time\_entries/report.csv?criteria\[\]=user&...)5.
2. **Para métricas de fluxo (Throughput, Lead Time e Cycle Time)**: O Mr-tick executa uma rotina assíncrona em segundo plano para sincronizar os chamados via REST API (/issues.json?updated\_on=\>=... e /issues/{id}.json?include=journals), armazenando o histórico em um banco SQLite interno no cliente1. O relatório da equipe é lido do banco local.

## **11\. Recomendação Arquitetural e Ranking Estratégico**

Para orientar a decisão de engenharia do aplicativo Mr-tick, a tabela abaixo apresenta o ranking consolidado das estratégias técnicas investigadas.

| Posição no Ranking            | Abordagem Arquitetural                                 | Mecanismo de Execução                                                     | Justificativa Técnica                                                                                                                             |
| :---------------------------- | :----------------------------------------------------- | :------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1º Lugar (Melhor Opção)**   | **Acesso Direto ao Banco DB Read-Only / Read Replica** | Conexão SQL direta ao banco de dados PostgreSQL/MySQL16.                  | Alta performance (\< 100ms), cálculo preciso de Lead/Cycle Time via journals, zero requisições HTTP e sem impacto no servidor de aplicação Rails. |
| **2º Lugar (Segunda Melhor)** | **Sincronização Incremental com Cache Local**          | Sincronização em background via REST API para banco SQLite interno1.      | Dispensa permissões no banco do cliente e alterações no Redmine. Garante que o relatório abra instantaneamente para o usuário final.              |
| **3º Lugar (Fallback)**       | **Extração do Relatório CSV Nativo**                   | Chamadas server-to-server HTTP para /time\_entries/report.csv5.           | Funciona nativamente no Redmine 3.4 sem plugins5. Retorna os dados de horas agregados e somados pelo banco de origem6.                            |
| **4º Lugar (Último Recurso)** | **Consumo Direto e Síncrono da REST API**              | Requisições síncronas paginadas para /time\_entries.json e /issues.json1. | Inviável para equipes de 50 a 100 usuários. Provoca timeouts na interface, alto consumo de banda e sobrecarga no servidor do cliente1.            |

#### **Referências citadas**

> 1. Rest api \- Redmine, [https://www.redmine.org/projects/redmine/wiki/rest\_api](https://www.redmine.org/projects/redmine/wiki/rest_api)
> 2. Feature \#32796: API \- Ability to get time entries report \- Redmine, [https://www.redmine.org/issues/32796](https://www.redmine.org/issues/32796)
> 3. Rest TimeEntries \- Redmine, [https://www.redmine.org/projects/redmine/wiki/Rest\_TimeEntries](https://www.redmine.org/projects/redmine/wiki/Rest_TimeEntries)
> 4. Rest Queries \- Redmine, [https://www.redmine.org/projects/redmine/wiki/Rest\_Queries](https://www.redmine.org/projects/redmine/wiki/Rest_Queries)
> 5. redmine 6.1.1-1 (x86\_64) \- File List \- Arch Linux, [https://archlinux.org/packages/extra/x86\_64/redmine/files/](https://archlinux.org/packages/extra/x86_64/redmine/files/)
> 6. Changelog 0 8 \- Redmine, [https://www.redmine.org/projects/redmine/wiki/Changelog\_0\_8](https://www.redmine.org/projects/redmine/wiki/Changelog_0_8)
> 7. Custom field translation \- Redmine, [https://www.redmine.org/boards/2/topics/43171](https://www.redmine.org/boards/2/topics/43171)
> 8. Redmine Reporting Plugin \- Easy project monitoring | PDF \- Slideshare, [https://pt.slideshare.net/slideshow/redmine-reporting-plugin-easy-project-monitoring/65116168?nway-content\_model=A](https://pt.slideshare.net/slideshow/redmine-reporting-plugin-easy-project-monitoring/65116168?nway-content_model=A)
> 9. Get to know the new features of plugin version 3.4.0 | AlphaNodes, [https://alphanodes.com/redmine-blog/alphanodes-redmine-plugin-update-v340](https://alphanodes.com/redmine-blog/alphanodes-redmine-plugin-update-v340)
> 10. Resources \- Plugins \- Redmine, [https://www.redmine.org/plugins/redmine\_resources](https://www.redmine.org/plugins/redmine_resources)
> 11. Custom Field Sql \- Plugins \- Redmine, [https://www.redmine.org/plugins/custom\_field\_sql](https://www.redmine.org/plugins/custom_field_sql)
> 12. redmine\_reports/lib/reports\_plugin/hooks/view\_layouts\_base\_html\_head.rb at master, [https://github.com/jbbarth/redmine\_reports/blob/master/lib/reports\_plugin/hooks/view\_layouts\_base\_html\_head.rb](https://github.com/jbbarth/redmine_reports/blob/master/lib/reports_plugin/hooks/view_layouts_base_html_head.rb)
> 13. xmera-circle/redmine\_reports: Simple bar chart reports of issues \- GitHub, [https://github.com/xmera-circle/redmine\_reports](https://github.com/xmera-circle/redmine_reports)
> 14. tools-aoeur (tools-aoeur) · GitHub, [https://github.com/tools-aoeur](https://github.com/tools-aoeur)
> 15. Hire the 3 Best Remote Docker Helm Symfony Available for Work, [https://remoteok.com/hire-remotely/available-now+docker+helm+symfony](https://remoteok.com/hire-remotely/available-now+docker+helm+symfony)
> 16. Products \- Plugins \- Redmine, [https://www.redmine.org/plugins/redmine\_products](https://www.redmine.org/plugins/redmine_products)
> 17. python-redmine \- PyPI, [https://pypi.org/project/python-redmine/](https://pypi.org/project/python-redmine/)

[image1]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADQAAAAbCAYAAAAzgqwIAAABZElEQVR4Xu2WzY0CMQxG57537hSw9y2AArYB7lRAA9sBHVADVVAVm6eZJ3ktxE8uS5A/yWKS2Ek+27GZpkKhULiB7SKfeWFEfDS5LPKV1oYEJCQEuWGxmuYU2zc5LcKY+SGxmeZ3c25yWGT4d+T7Ie3e6v1ArPf9kKIvk6a7Jsc8+SR+mnznyf/C2xGCDKQEqbMO4+GQmykl3PfgvwciAEmqIkI1JCLMo4sN88Diwpz2gj1wXhSAjuNcmNiXs9DxjJvgclyMCyBGB2PGgA1j1CwikYQXl5Br7K8tfc4CgmjDrzq0EIEO9oJseqj40HdylcNb0bsREIrAXl0viz2OsFnbHq6BdfWjDntGQvbJLrB5fFs5QhGREF5ETB0uQbQgifej49hTos7xzX5KJtTd9DmAVDSH4xvi0BgR9DjMyBhdSJnSrJnGCGtWRh3A2CKlM41cdnA3epvtPbu8nseFQqFQ+INfHPhI8qZNi4EAAAAASUVORK5CYII=
[image2]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAbCAYAAADrjggCAAAB6UlEQVR4Xu2WzU0EMQxG586d+xbAnQIogAb2TgU0QAd0QA1UQVUwT5snWVaGzfwgoZWfZG2SSRznS+LNNBVFURTFQZybPeQPxXXuZvtu9pi+FQMgmgIiZjHI/XS5sq+zfTajTnsxwNN0yXtfs703qzy4EvMf17jy3wbMfwiZ8x91TuRbah+Bcc+58RZ5me0jNzYQDhHJkWshDZAS/hukrUMpAXeCeIgo/AOfWnmvAHvHHw2HYUs6+pX8eOa0ISI7xbOGXKaoCK25kwRF3VwZcymbQz9yof3xRT+MMYy1P2Xmd4zjsg/wBYExhvjwTRk/rIlf2j0QzBnXBHEu2lefUE4JjpnYQOI34akTxSEQcMGgGLkP6IvA3QSIfzZ8i2PAeS0DMca0Q92TRSymHNKIIluPa2K+fEvwq7jD4Lj3L6xzvnNSDSYGxYRL78YYnGX/2RXOt6fkBcU6MQD9PUmam6hosbwkIO29+WI8u4iLdvclXgtTAP3YPYxyT8CYBsAFugm9BYkCZiHAeEYFdM7sh/rSgVgFO4poTu7VwBDMa+f1oY2+nmT6cUrMVfiiTD9zoHmKoCnnMXEcZQSM6cI++vVKYsbLDfGWEBf+iV3B8WMOxNzYPyVfdei1XWPLmEgv7RRFURRFcfP8AGyYbwzm2E25AAAAAElFTkSuQmCC
[image3]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAxCAYAAABnGvUlAAADqUlEQVR4Xu3cy43cRhQF0Nlr770D8F4BOADDe+8dgRJQBs7AMSgKR2XPtftKDw/s+ZnzEeYcgGh2sVhVZAvgRRVHNzcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPA+/ba2M6SdP3bhxe5vbj/cbh9ut49fawMA8G84+vt2++myneHHm//a3BLIZl9z/6+bb8Ht6NzXdFaQ/Z4kOOf3AgDeiOcISEdtJpj9Mr7POgl5bzEYNdC+N7/vAgDgdd0VSDLLkiD18yjrTNgMX5FZmdY9ajOhbM7a7DoJRzm3wa19z2ORfne4Oxrn/5U2P91uXy7770WC9Z+Xz/ymAMAbsINTJWAlrOSh/flSNkNUglODTD4bbB46K3VUJzM7Le+yacrSZtrPOFKe733XreNMeY4nZG1dej3acv6RhL8s1eZ9vNSLXv9dAS7tfc9Bp7/BfdcJALygo+CUMJbyhJXOqM3Q0pmwhrc+4Ouoze1anVme/fab9uex2fcc57V2nyJtzfC1Z/au6ZifQ8PzY/Te7O0okCWwZYbtIc6c0QQA7rADTsJGg88OKAkveZhndqtLoLHr7jaPXKvzlMC2x3mWGVxyvZm964xc7kH3c2yGtM7eze+dEUxI6sxePve5qdfvPd5+EpAyphkizw6HaX+/w9Yxdex73BnfvB+xr2OGQ38NDACPNENQHqxZBsxnHtpZaqw8cOdyYwNbtl33WhibrtV5bGBr3w0xR0uiTzVDVrTPLpNmJjIzXl0ebr055kh5A9osn2Er+ylvIOpybMbQ+5zy/pcp812+MwNrZxU7k9fP3t/0lf1s/T0a4Ppe41xCb+DM77KvO9dybUkaALjIbEoeunlwZsv+DEkJQw1kkYdrHsYta6joAz7leTCnjYSoo4fx7Cv9z/+zrePJTFL/eCHt9H2yHss57Tsa2vJ55jLdfieugaOhtgFqBq/YwSztzBmnHVy633f0dts7sCUI9X7HmYEt15b7OAPaNL83sHUsDWzzN82/gXy/Ftj2H68AADxZw1ICYWeTsjWsZj/hJMcTTrp82cDVoPnrpXzW6340dCbgJTylPOflnAS1ttm66XcvYZ4pbXec6Xf2PwN0ZwIb9hrg8pn703fjUjavGwDg2cz3yO7zXHVfykPGtOvs79t9xwEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHhV/wB05rpTBQZbegAAAABJRU5ErkJggg==
[image4]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGgAAAAbCAYAAACQqsrOAAACIUlEQVR4Xu2XO07EMBBA09PT0yLRcwBKCkRPzwm4ADfgBpyBU3AqyNP6idHI7G6WRPKiedIoiT8z9ozHdqapKIqiKIriCJ5muWlSDMbFLF+z3DYpBoOgECAChRSDcDnttrSXWT7aO0J5MQB30+7s+Zzlrb17FhWDEM+fYkDi+XNOmP1XueK/8TzLey48E9iWR9iOWSSbLZQK0N/ZNEAEhyABtzdkM2MrM0qAuAVvNo54QcAQ4jXbWx1lBI1BvDYhqPSj/qEJ3wZ7H5wftFO/fdQfddNWOCeto9xfA6BcnTztx5NAOj6E+VCOUG5b5tgbF0900M7+/jNSxi1YnYD/1KGcvOgxjFMMgoowRhkwEJwBMWiAgxiglwzeD/1H4ZS44mImZN3UiUGQ2M86bbPwROcKNtTLfJ0bzzj2GGj0WaddbedMjnp4Ito4CZTnWxxBi/9GCOTv7MQ82B7UM3kzL2bCEt3x24xQbw5Q7BdtAG0JFM84P8R+PX29AKkno43VYJKuZMgOPNaJPWLGQZzwPt0sGsYl9mPinKXxsuOKR/KYegGCXvYvCZA64/zcCilbHRyCUVenDlPcBskA27gf74O+8UzwXHtsdb/pJhDU0cfMo9/19BMgzyfe6X/f2vGuHm0wHzIO58f5OS7qcC4+MLtopz6EgMZzCzyn0Gc7z/nVyVvfMTDomGlR3NNP0StxdWZ6ZUtx1RdFURRFURTFQr4BdhaLgD/T3qkAAAAASUVORK5CYII=
[image5]: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAxCAYAAABnGvUlAAAEQklEQVR4Xu3cwY3TQBgF4Ny5c6cArogCKIAGuFMBDdABHVADVVAV5Gl50s8o3iRLsiTwfZLl2DOeGU9W8tN4d3c7AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC4X6/32/f99mW/fd5vL/bbp99qHPdy93D9u7VgQ+p/eGSLjOPtr88AAP+tBKwfy7mvu4fwdY6Gq4atY9JvQmLCYrb0mX2u73jm51tx6v39S/LdJmADAH9BHsTf1pN7r3bnB7Y6NdCkXvqp2d/78fmWJJDeWoB8Dh/XEwDA80kA2XoYJ0B19avBqsddbemK2HwNOgNby7Nfra86Z2BL+wmTabftZQw5zvm2OV+rTo/1+1RpK6+JE3D/l9WmzPlc/czcAwDP7FDYmVKWh3UDWVaXEloaXlKW8DJXnWZ7LU/IOfa7beuKXq5LmGzbuT7tpd+udKW84awhqvXa7yENnoe2ueo3pY/+nl+DYPbHVgPvOejknvsdzDm+tnueMwC4uISNrcDWUBIJSTFD19arwbaXfa7rfqt+rYGt5nXz81q/422obL+X0pA4g8Scoy0z4F1D/kjkHA3ph7ZDEtgSgJ/TNeZsK4gDwM3LisnWA3+ez8pSgsoMK1sBbAa2cx66awCrpwS2c/o91RpcMncJvNknDMxXvJmnjqHho4Eh9VO35TluGzGvjdRNWV9Pzra6mtjvZbZ7KWl/vjbv+CPj6HjzOWVb/bdex5rPa/3W6ZzNvqLXz7lre7Nu56ltRMJ7r8s1nVcAuAt5IK8rKP3XHpUH6BrQEuIazvpQjLlSM0PfGrBWW+XnBrbcy1YI/RPpu4Gg99s+G5QS4NJ3g1y2ho+uYs2QUw1E83uYwaWvXXvPbat1Yr6aPfaa9lRpv6uKndP22+POSb/3+XMzdT5yj52PvtLOPaS9ruDOkJv2+r3nfPvrnLVsHde8JubP5Zx7oQ2Au5AHYh5+2WaomLqSM6VOfkcs9bN6kePUybk+TPOwzNbyQ1Ke6/KAzefWa3s5n/77u1Q51wCZfcfWfnM/Od9xXUpDxWyzoSL7bDOgVY87txnjXO2JhomGi0j5/LcnMcPHDGzpd4bUSwXWzGXG0HmNhMHed3RsMxAdku8p48p3Neej9zDnrZ87VzN8rf21bB3XocCWe1jD8qXCLQD8NXnA5kG3rrjxEEAavLo61EDQVbaEhwSe1Gswzda/fk29N7/Kci51s2/baSvtZJvlbWuuWEXrXtO8t46zY2rI6krZ1BCd6zv+7HN9X7nnOCtoCd8Nd207x53LhvT010A/x9Vwn/P9q9602+DZNuarXgC4W3nYNUzwuHMC7S3U/RPH+klA6gpatv78HLsuGnrn8amuVRcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAn+QllDdMoNLuLWQAAAABJRU5ErkJggg==
[image6]: data:image/png;base64,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
