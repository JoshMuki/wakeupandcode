import { SearchResult } from "../types/types";

export const mockSearchResults: SearchResult[] = [
  {
    id: 1,
    title: "React Hooks Kullanımı",
    content:
      "React Hooks, fonksiyonel bileşenlerde state ve yaşam döngüsü özelliklerini kullanmanızı sağlar. useState ve useEffect en yaygın kullanılan hook'lardır.",
    relevanceScore: 0.95,
  },
  {
    id: 2,
    title: "TypeScript ile Tip Güvenliği",
    content:
      "TypeScript, JavaScript'e statik tip tanımlama özelliği ekleyerek kod kalitesini artırır ve hataları azaltır. Interface ve generics gibi özellikler güçlü tip kontrolü sağlar.",
    relevanceScore: 0.88,
  },
  {
    id: 3,
    title: "Node.js ve Express.js ile Backend Geliştirme",
    content:
      "Node.js, JavaScript'i sunucu tarafında çalıştırmanıza olanak tanır. Express.js ise Node.js üzerinde web uygulamaları geliştirmek için popüler bir framework'tür.",
    relevanceScore: 0.82,
  },
  {
    id: 4,
    title: "Redux ile State Yönetimi",
    content:
      "Redux, React uygulamalarında karmaşık state yönetimini kolaylaştıran bir kütüphanedir. Actions, reducers ve store kavramlarıyla çalışır.",
    relevanceScore: 0.79,
  },
  {
    id: 5,
    title: "GraphQL ve Apollo Client Kullanımı",
    content:
      "GraphQL, REST API'lere alternatif olarak geliştirilmiş bir sorgu dilidir. Apollo Client, GraphQL API'ler ile etkileşim kurmak için kullanılan güçlü bir istemci kütüphanesidir.",
    relevanceScore: 0.75,
  },
  {
    id: 6,
    title: "React Native ile Mobil Uygulama Geliştirme",
    content:
      "React Native, tek kod tabanı ile iOS ve Android platformları için native mobil uygulamalar geliştirmenizi sağlar. JSX ve React'e benzer bir syntax kullanır.",
    relevanceScore: 0.72,
  },
  {
    id: 7,
    title: "WebAssembly ile Performanslı Web Uygulamaları",
    content:
      "WebAssembly, tarayıcıda yüksek performanslı uygulamalar geliştirmek için kullanılan bir düşük seviyeli sanal makine. C++, C# gibi dillerde yazılan kodları derleyerek web uygulamalarına entegre edebilirsiniz.",
    relevanceScore: 0.69,
  },
  {
    id: 8,
    title: "Next.js ile Server-Side Rendering (SSR)",
    content:
      "Next.js, React üzerine kurulu bir framework olup, SSR ve statik site oluşturma gibi özelliklerle performanslı ve SEO dostu web uygulamaları geliştirmenizi sağlar.",
    relevanceScore: 0.67,
  },
  {
    id: 9,
    title: "Docker ile Konteynerizasyon",
    content:
      "Docker, uygulamalarınızı bağımsız ve taşınabilir konteynerler içinde çalıştırmanıza olanak tanır. Node.js uygulamalarınızı Docker ile konteynerize edebilirsiniz.",
    relevanceScore: 0.65,
  },
  {
    id: 10,
    title: "Jest ile Unit Testing",
    content:
      "Jest, JavaScript kodlarını test etmek için kullanılan popüler bir test framework'üdür. React bileşenlerini ve diğer JavaScript kodlarını test etmek için idealdir.",
    relevanceScore: 0.63,
  },
  {
    id: 11,
    title: "MongoDB ile NoSQL Veritabanı",
    content:
      "MongoDB, esnek bir NoSQL veritabanı olup, Node.js uygulamaları ile sıkça kullanılır. JSON benzeri bir belge yapısı kullanır.",
    relevanceScore: 0.61,
  },
  {
    id: 12,
    title: "Serverless Mimari ile Fonksiyonel Programlama",
    content:
      "Serverless mimari, sunucu yönetimi yapmadan fonksiyonel olarak çalışan kod parçacıkları yazmanıza olanak tanır. AWS Lambda gibi platformlarda Node.js fonksiyonları çalıştırabilirsiniz.",
    relevanceScore: 0.59,
  },
  {
    id: 13,
    title: "GraphQL Şemaları Tasarımı",
    content:
      "GraphQL şemaları, API'lerinizin yapısını tanımlar. TypeDefs ve resolvers kullanarak GraphQL şemaları oluşturabilirsiniz.",
    relevanceScore: 0.57,
  },
  {
    id: 14,
    title: "TypeScript ile Generics",
    content:
      "TypeScript generics, kodunuzu daha esnek ve yeniden kullanılabilir hale getirmenizi sağlar. Fonksiyonlar ve sınıflar için generic tipler tanımlayabilirsiniz.",
    relevanceScore: 0.55,
  },
  {
    id: 15,
    title: "React Context API ile State Yönetimi",
    content:
      "React Context API, büyük uygulamalarda state'i yukarıdan aşağıya doğru paylaşmak için kullanılan bir mekanizmadır. Redux'a alternatif olarak kullanılabilir.",
    relevanceScore: 0.53,
  },
  {
    id: 16,
    title: "Webpack ile Modül Birleştirme",
    content:
      "Webpack, modern JavaScript uygulamalarında modülleri birleştirmek ve optimize etmek için kullanılan bir araçtır. React uygulamalarında sıkça kullanılır.",
    relevanceScore: 0.51,
  },
  {
    id: 17,
    title: "Cypress ile End-to-End Testler",
    content:
      "Cypress, modern web uygulamaları için end-to-end testler yazmak için kullanılan bir test framework'üdür. React uygulamalarını tarayıcıda test etmek için idealdir.",
    relevanceScore: 0.49,
  },
];

export function searchMockData(query: string): SearchResult[] {
  const lowercaseQuery = query.toLowerCase();
  return mockSearchResults
    .filter(
      (result) =>
        result.title.toLowerCase().includes(lowercaseQuery) ||
        result.content.toLowerCase().includes(lowercaseQuery)
    )
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 3);
}
