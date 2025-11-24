# Sistema de Controle de Estoque - Frontend

<div align="center">
  <h3>📦 Base Administrativa de Caçapava</h3>
  <p>Frontend do sistema de gerenciamento de estoque do almoxarifado e farmácia</p>

  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
  ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
  ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
</div>

# 🚦 Como Executar

### Pré-requisitos
- Node.js (v18 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório
```bash
git clone https://github.com/Sync-FATEC/API-5-FRONT/
```

2. Instale as dependências
```bash
npm install
```

3. Inicie o servidor
```bash
npm run dev
```

## 📁 Estrutura de Diretórios
```
src/
├── app/                          # Configuração principal da aplicação
│   ├── Layout/                   # Componente de layout principal
│   ├── App.tsx                   # Componente raiz e configuração de rotas
│   ├── main.tsx                  # Ponto de entrada da aplicação
│   ├── store.ts                  # Configuração do Redux store
│   ├── hooks.ts                  # Hooks do Redux (useAppDispatch, useAppSelector)
│   └── index.css                 # Estilos globais (Tailwind)
│
├── components/                   # Componentes reutilizáveis
│   ├── BalanceForecastChart/     # Gráfico de previsão de saldo (novo)
│   ├── ConfirmDialog/            # Modal de confirmação
│   ├── LayoutFooter/             # Rodapé do layout
│   ├── LayoutHeader/             # Cabeçalho do layout
│   ├── Pagination/               # Componente de paginação
│   ├── ProtectedRoute.tsx        # HOC para proteção de rotas
│   ├── Sidebar/                  # Menu lateral
│   ├── StockChangeModal/         # Modal de alteração de estoque
│   ├── SuccessModal/             # Modal de sucesso (novo)
│   ├── SupplierEditModal/        # Modal de edição de fornecedor
│   ├── SupplierForm/             # Formulário de fornecedor
│   ├── UserExcelImport/          # Importação de usuários via Excel
│   ├── UserForm/                 # Formulário de usuário
│   └── index.ts                  # Barrel export dos componentes
│
├── pages/                        # Páginas da aplicação
│   ├── CommitmentNotes/          # Página de notas de compromisso (novo)
│   ├── EmailTemplates/           # Página de templates de email (novo)
│   ├── Forecast/                 # Página de previsão de estoque (novo)
│   ├── Home/                     # Página inicial / Dashboard
│   ├── Invoices/                 # Página de pedidos
│   ├── Login/                    # Página de login
│   ├── NoMatch/                  # Página 404
│   ├── StockDetails/             # Detalhes do estoque
│   ├── Stocks/                   # Listagem de estoques
│   ├── Supplier/                 # Página de fornecedores
│   ├── Users/                    # Página de usuários
│   └── index.ts                  # Barrel export das páginas
│
├── services/                     # Serviços de integração com APIs
│   ├── authService.ts            # Serviço de autenticação
│   ├── commitmentNotesService.ts # Serviço de notas de compromisso (novo)
│   ├── emailTemplatesService.ts  # Serviço de templates de email (novo)
│   ├── reportsService.ts         # Serviço de relatórios/dashboard
│   ├── stockServices.ts          # Serviço de estoques
│   └── supplierService.ts        # Serviço de fornecedores
│
├── contexts/                     # Contextos React
│   ├── AuthContext.tsx           # Contexto de autenticação
│   └── useAuth.ts                # Hook customizado para autenticação
│
├── hooks/                        # Hooks customizados
│   └── [hooks específicos do projeto]
│
├── config/                       # Configurações da aplicação
│   └── firebase.ts               # Configuração do Firebase
│
├── shared/                       # Recursos compartilhados
│   └── api.ts                    # Instância configurada do Axios
│
└── types/                        # Definições de tipos TypeScript
    └── [tipos e interfaces da aplicação]
```

## 👥 Time
| Nome | Função |
|------|--------|
| José Eduardo Fernandes| Scrum Master |
| Ana Laura Moratelli | Product Owner |
| Arthur Karnas | Desenvolvedora |
| Erik Yokota | Desenvolvedor |
| Filipe Colla | Desenvolvedor |
| João Gabriel Solis  | Desenvolvedor |
| Kauê Francisco | Desenvolvedor |
