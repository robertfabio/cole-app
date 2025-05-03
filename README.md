# Cole - Cronômetro de Estudos (2025)

Um aplicativo de cronômetro de estudos com recursos de gamificação para motivar hábitos consistentes de estudo.

## Versão Atual: 0.1.6

## Funcionalidades Principais

### 1. Cronômetro
- Controle preciso do tempo de estudo com opções para foco e pausas
- Modo Pomodoro automatizado
- Modo Zen para estudo sem distrações (ativado com duplo toque na tela)
- Interface minimalista para maior concentração

### 2. Sistema de Conquistas
- Mais de 20 conquistas desbloqueáveis para incentivar bons hábitos
- Conquistas diárias que renovam a cada dia
- Conquistas em várias categorias: tempo, sessões, consistência, pomodoros e especiais
- Ganhe XP para subir de nível

### 3. Agenda de Estudos
- Crie um cronograma semanal de sessões de estudo
- Configure alertas para lembrar você das sessões
- Inicie sessões diretamente do agendamento
- Desbloqueie conquistas especiais ao seguir sua agenda

### 4. Estatísticas
- Visualize seu progresso com gráficos detalhados
- Análise por dia, semana, mês ou ano
- Acompanhe o tempo total de estudo, sessões concluídas e mais
- Veja sua sequência atual e recordes

### 5. Personalização
- Modos de tema claro e escuro
- Configurações personalizáveis para pomodoro e notificações
- Backup e recuperação de dados de estudo

## Como Usar a Função de Agenda

1. Acesse a aba "Agenda" no menu inferior
2. Toque no botão "+" para adicionar uma nova sessão
3. Configure o nome, dia da semana, horário, duração e modo (foco ou pausa)
4. Ative lembretes se desejar receber notificações
5. Salve a sessão para adicioná-la à sua agenda

Quando chegar o horário agendado, você poderá ver a próxima sessão na tela inicial. Toque em "Começar Agora" para iniciar o cronômetro com as configurações definidas na agenda.

## Requisitos do Sistema
- Expo SDK 53 ou superior
- React Native 0.72+
- iOS 13+ ou Android 8+

## Recursos Principais

### Cronometragem Flexível
- **Timer Padrão**: Contagem progressiva para registrar tempo de estudo
- **Timer com Contagem Regressiva**: Defina uma duração específica
- **Método Pomodoro**: Ciclos de foco e pausa para melhorar concentração e produtividade

### Visualização
- **Modo Normal**: Interface completa com todos os controles
- **Modo Tela Cheia**: Visualização expandida com controles minimalistas
- **Modo Zen**: Ativado com duplo toque na tela cheia, oculta todos os controles para foco total

### Gamificação
- **Sistema de Conquistas**: Mais de 20 conquistas organizadas por categorias
  - Tempo (horas de estudo acumuladas)
  - Sessões (número de sessões completadas)
  - Consistência (dias consecutivos de estudo)
  - Pomodoro (ciclos completados)
  - Especiais (conquistas situacionais: estudar cedo, tarde, em feriados, etc.)
- **Conquistas Diárias**: Tarefas que podem ser completadas diariamente para ganhar XP
- **Sistema de Níveis**: Ganhe XP ao completar conquistas para subir de nível
- **Indicador de Sequência**: Acompanhe visualmente sua consistência de dias de estudo

### Estatísticas
- **Histórico de Sessões**: Consulte todas as sessões salvas
- **Estatísticas Detalhadas**: Visualize gráficos de tempo de estudo por dia, semana e mês
- **Metas Diárias**: Configure e acompanhe seu progresso diário

### Customização
- **Tema Claro/Escuro**: Interface adaptável com temas otimizados
- **Configurações de Pomodoro**: Personalize duração de foco e pausas
- **Notificações**: Alertas quando os timers são completados

## Melhorias Recentes

### Gamificação Avançada
- ✅ Implementação completa do sistema de conquistas com 20+ desafios
- ✅ Adicionadas conquistas diárias que renovam a cada dia
- ✅ Notificações visuais para conquistas desbloqueadas
- ✅ Indicador de sequência (streak) de dias de estudo
- ✅ Progresso visual para conquista "Mestre Zen" ao usar modo zen

### Interface e Experiência do Usuário
- ✅ Tema claro otimizado com equilíbrio entre cores neutras e identidade visual
- ✅ Modo zen para estudo com foco total, ativado por duplo toque
- ✅ Transições e animações fluidas com react-native-reanimated
- ✅ Memoização de componentes para melhor performance
- ✅ Correção para conflitos de tema durante transições claro/escuro

### Estabilidade
- ✅ Gestão adequada da StatusBar e orientação de tela
- ✅ Tratamento de recursos para evitar vazamentos de memória
- ✅ Serviço de notificações com modo stub para compatibilidade no Expo SDK 53

## Como Usar

1. Clone o repositório
2. Instale as dependências com `npm install` ou `yarn install`
3. Execute o projeto com `npx expo start`

## Tecnologias

- React Native
- Expo
- React Navigation
- React Native Paper (UI)
- React Native Reanimated (Animações)
- AsyncStorage (Persistência local)

## Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

cole-app/
├── assets/             # Imagens e recursos visuais
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── contexts/       # Contextos React para estado global
│   ├── screens/        # Telas principais do aplicativo
│   └── utils/          # Funções utilitárias
├── App.tsx             # Ponto de entrada do aplicativo
├── app.json            # Configuração do Expo
└── package.json        # Dependências do projeto
``` 