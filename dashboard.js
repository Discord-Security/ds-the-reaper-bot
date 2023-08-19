const SoftUI = require('dbd-soft-ui');
let DBD = require('discord-dashboard');

module.exports = async client => {
  const Handler = new DBD.Handler();
  // { store: new Keyv(process.env.DB) }

  await DBD.useLicense(process.env.DBD_LICENSE);
  DBD.Dashboard = DBD.UpdatedClass();

  const Dashboard = new DBD.Dashboard({
    port: 3000,
    client: {
      id: process.env.DISCORD_ID,
      secret: process.env.DISCORD_SECRET,
    },
    redirectUri: process.env.DBD_DOMAIN + '/discord/callback',
    domain: process.env.DBD_DOMAIN,
    ownerIDs: ['354233941550694400'],
    useThemeMaintenance: true,
    useTheme404: true,
    bot: client,
    theme: SoftUI({
      storage: Handler,
      locales: {
        enUS: {
          name: 'Português',
          index: {
            feeds: [
              'Usuários Atuais',
              'CPU',
              'Plataforma do Sistema',
              'Contador de Servidores',
            ],
            card: {
              image: 'link para imagem',
              category: 'The Reaper',
              title: 'Retirando os tóxicos do seu servidor!',
              description:
                'The Reaper foi criado originalmente para banir usuários tóxicos em todos os servidores pertencentes à sua rede. Desde então, o bot vem sendo atualizado e melhorado para torná-lo o mais simples e eficiente possível na proteção de todos os servidores.',
              footer: 'Isto tudo é graças á Discord Sec.',
            },
            feedsTitle: 'Feeds',
            graphTitle: 'Gráficos',
          },
          manage: {
            settings: {
              memberCount: 'Membros',
              info: {
                info: 'Informação',
                server: 'Informação do servidor',
              },
            },
            title: 'Seus servidores',
            description: 'gerencie suas comunidades',
          },
          admin: {
            feeds: {
              feedBuilder: 'Construtor de Feed',
              feedIcon: 'Ícone do Feed',
              feedDescription: 'Descrição do Feed',
              feedColour: 'Cor do Feed',
              colors: {
                pink: 'Rosa',
                red: 'Vermelho',
                orange: 'Laranja',
                green: 'Verde',
                gray: 'Cinzento',
                blue: 'Azul',
                dark: 'Escuro',
              },
              feedSubmit: 'Enviar',
              feedFeedPreview: 'Pré-visualização do Feed',
              feedPreview: 'Pré-visualize',
              feedCurrent: 'Atuais feeds',
              feedShowIcons: 'Mostrar Icons',
            },
            admin: {
              title: 'Controlos do ADM',
              adminUpdates: 'Conferir atualizações',
            },
          },
          guild: {
            home: 'Início',
            settingsCategory: 'Configurações',
            updates: {
              title: 'Mudanças á vista!',
              reset: 'Apagar',
              save: 'Salvar',
            },
          },
          privacyPolicy: {
            title: 'Política de Privacidade',
            description: 'Termos do Serviço e política de privacidade',
            pp: 'Complete a Política de Privacidade, Kuriel',
          },
          partials: {
            sidebar: {
              dash: 'Painel',
              settings: 'Gerenciar Servidores',
              commands: 'Comandos',
              pp: 'Política de Privacidade',
              admin: 'ADM',
              account: 'Páginas de Usuário',
              login: 'Entrar',
              logout: 'Sair',
            },
            navbar: {
              home: 'Início',
              pages: {
                manage: 'Gerenciar Servidores',
                settings: 'Gerenciar Servidores',
                commands: 'Comandos',
                pp: 'Política de Privacidade',
                admin: 'Painel do ADM',
                error: 'Erro',
                credits: 'Créditos',
                debug: 'Debug',
                leaderboard: 'Classificação',
                profile: 'Perfil',
                maintenance: 'Em manutenção',
                pages: 'Páginas',
                dashboard: 'Configurações',
              },
            },
            title: {
              pages: {
                manage: 'Gerenciar Servidores',
                settings: 'Gerenciar Servidores',
                commands: 'Comandos',
                pp: 'Política de Privacidade',
                admin: 'Painel do ADM',
                error: 'Erro',
                credits: 'Créditos',
                debug: 'Debug',
                leaderboard: 'Classificação',
                profile: 'Perfil',
                maintenance: 'Em manutenção',
              },
            },
            preloader: {
              text: 'Vendo se há tóxicos na área...',
            },
            premium: {
              title: 'Quer mais do Assistants?',
              description: 'Cheque mais as funções premium abaixo!',
              buttonText: 'Seja Premium',
            },
            settings: {
              title: 'Configs do Site',
              description: 'Opções configuráveis visíveis',
              theme: {
                title: 'Tema do Site',
                description: 'Faça o site ficar mais agradável aos seus olhos!',
                dark: 'Escuro',
                light: 'Claro',
                auto: 'Auto',
              },
              language: {
                title: 'Linguagem do Site',
                description: 'Selecione a sua linguagem preferida!',
              },
            },
          },
        },
      },
      customThemeOptions: {
        index: async ({ req, res, config }) => {
          return {
            values: [],
            graph: {}, // More info at https://dbd-docs.assistantscenter.com/soft-ui/docs/customThemeOptions/
            cards: [],
          };
        },
      },
      websiteName: 'The Reaper Dashboard',
      colorScheme: 'red',
      supporteMail: 'support@reaperbot.website',
      icons: {
        favicon: 'https://i.imgur.com/0l33Z8s.png',
        noGuildIcon:
          'https://pnggrid.com/wp-content/uploads/2021/05/Discord-Logo-Circle-1024x1024.png',
        sidebar: {
          darkUrl: 'https://i.imgur.com/0l33Z8s.png',
          lightUrl: 'https://i.imgur.com/0l33Z8s.png',
          hideName: true,
          borderRadius: false,
          alignCenter: true,
        },
      },
      preloader: {
        image: '/img/soft-ui.webp',
        spinner: false,
        text: 'Page is loading',
      },
      index: {
        graph: {
          enabled: false,
          lineGraph: false,
          tag: 'Memória (MB)',
          max: 4000,
        },
      },
      sweetalert: {
        errors: {},
        success: {
          login: 'Logado com sucesso.',
        },
      },
      preloader: {
        image: '/img/soft-ui.webp',
        spinner: true,
        text: 'Page is loading',
      },
      admin: {
        pterodactyl: {
          enabled: false,
          apiKey: 'apiKey',
          panelLink: 'https://panel.website.com',
          serverUUIDs: [],
        },
      },
      commands: [],
    }),
    settings: [
      {
        categoryId: 'logs',
        categoryName: 'Logs / Registros',
        categoryDescription:
          'Defina o bot para enviar os registros nos canais!',
        categoryOptionsList: [
          {
            optionId: 'welcomeLog',
            optionName: 'Entrada de Membros',
            optionDescription:
              'Aqui é onde ficará o registro de entrada dos membros do servidor',
            optionType: DBD.formTypes.channelsSelect(
              false,
              (channelTypes = [0]),
            ),
            getActualSet: async ({ guild }) => {
              const doc = await client.db.Guilds.findOne({ _id: guild.id });
              return doc.logs.joinedMember;
            },
            setNew: async ({ guild, newData }) => {
              const doc = await client.db.Guilds.findOne({ _id: guild.id });
              if (doc) {
                doc.logs.joinedMember = newData;
                doc.save();
              }
              if (!doc)
                new client.db.Guilds({
                  _id: guild.id,
                  logs: { joinedMember: newData },
                }).save();
              return;
            },
          },
          {
            optionId: 'exitLog',
            optionName: 'Saída de Membros',
            optionDescription:
              'Aqui é onde ficará o registro de saída dos membros do servidor',
            optionType: DBD.formTypes.channelsSelect(
              false,
              (channelTypes = [0]),
            ),
            getActualSet: async ({ guild }) => {
              const doc = await client.db.Guilds.findOne({ _id: guild.id });
              return doc.logs.leftMember;
            },
            setNew: async ({ guild, newData }) => {
              const doc = await client.db.Guilds.findOne({ _id: guild.id });
              if (doc) {
                doc.logs.leftMember = newData;
                doc.save();
              }
              if (!doc)
                new client.db.Guilds({
                  _id: guild.id,
                  logs: { leftMember: newData },
                }).save();
              return;
            },
          },
          {
            optionId: 'editedMessageLog',
            optionName: 'Mensagem editada',
            optionDescription:
              'Aqui é onde ficará o registro de mensagens editadas',
            optionType: DBD.formTypes.channelsSelect(
              false,
              (channelTypes = [0]),
            ),
            getActualSet: async ({ guild }) => {
              const doc = await client.db.Guilds.findOne({ _id: guild.id });
              return doc.logs.editedMessage;
            },
            setNew: async ({ guild, newData }) => {
              const doc = await client.db.Guilds.findOne({ _id: guild.id });
              if (doc) {
                doc.logs.editedMessage = newData;
                doc.save();
              }
              if (!doc)
                new client.db.Guilds({
                  _id: guild.id,
                  logs: { editedMessage: newData },
                }).save();
              return;
            },
          },
          {
            optionId: 'deletedMessageLog',
            optionName: 'Mensagem apagada',
            optionDescription:
              'Aqui é onde ficará o registro de mensagem apagada',
            optionType: DBD.formTypes.channelsSelect(
              false,
              (channelTypes = [0]),
            ),
            getActualSet: async ({ guild }) => {
              const doc = await client.db.Guilds.findOne({ _id: guild.id });
              return doc.logs.deletedMessage;
            },
            setNew: async ({ guild, newData }) => {
              const doc = await client.db.Guilds.findOne({ _id: guild.id });
              if (doc) {
                doc.logs.deletedMessage = newData;
                doc.save();
              }
              if (!doc)
                new client.db.Guilds({
                  _id: guild.id,
                  logs: { deletedMessage: newData },
                }).save();
              return;
            },
          },
          {
            optionId: 'punishmentsLog',
            optionName: 'Punições Reaper',
            optionDescription:
              'Aqui é onde ficará o registro de todas as punições feitas no seu servidor',
            optionType: DBD.formTypes.channelsSelect(
              false,
              (channelTypes = [0]),
            ),
            getActualSet: async ({ guild }) => {
              const doc = await client.db.Guilds.findOne({ _id: guild.id });
              return doc.logs.punishments;
            },
            setNew: async ({ guild, newData }) => {
              const doc = await client.db.Guilds.findOne({ _id: guild.id });
              if (doc) {
                doc.logs.punishments = newData;
                doc.save();
              }
              if (!doc)
                new client.db.Guilds({
                  _id: guild.id,
                  logs: { punishments: newData },
                }).save();
              return;
            },
          },
        ],
      },
    ],
  });
  Dashboard.init();
};
