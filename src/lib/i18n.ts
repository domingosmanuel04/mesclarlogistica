export type Locale = "pt" | "en";

const dict = {
  pt: {
    home: "Início",
    books: "Livros",
    ebooks: "eBooks",
    physical: "Livros Físicos",
    authors: "Profissionais",
    services: "Serviços",
    training: "Formação",
    about: "Sobre",
    cart: "Carrinho",
    login: "Entrar",
    register: "Criar conta",
    logout: "Sair",
    account: "Conta",
    search: "Pesquisar",
    buy: "Comprar",
    download: "Baixar",
    free: "Grátis",
    support: "Suporte",
    coupon: "Cupão",
    apply: "Aplicar",
    send: "Enviar",
    language: "Idioma",
  },
  en: {
    home: "Home",
    books: "Books",
    ebooks: "eBooks",
    physical: "Physical books",
    authors: "Industry professionals",
    services: "Services",
    training: "Training",
    about: "About",
    cart: "Cart",
    login: "Sign in",
    register: "Create account",
    logout: "Sign out",
    account: "Account",
    search: "Search",
    buy: "Buy",
    download: "Download",
    free: "Free",
    support: "Support",
    coupon: "Coupon",
    apply: "Apply",
    send: "Send",
    language: "Language",
  },
} as const;

export type DictKey = keyof typeof dict.pt;

export function t(locale: Locale, key: DictKey): string {
  return dict[locale][key] ?? dict.pt[key];
}

export { dict };
