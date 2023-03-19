import { PrismaClient } from '@prisma/client';
import { Builder, By, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import firefox from 'selenium-webdriver/firefox';

const linksJáPercorridos: string[] = [];
const todosOsLinks: string[] = [];

const pages: any = []

const prisma = new PrismaClient()

async function buscador(url: string, termo: string, produndidade: number) {
  if (produndidade <= 0) {
    return;
  }

  if (linksJáPercorridos.includes(url)) {
    return;
  }

  console.log(`buscando em ${url}`);

  linksJáPercorridos.push(url);

  const driver = await new Builder()
    .forBrowser('firefox')
    .setChromeOptions(new chrome.Options().headless())
    .setFirefoxOptions(new firefox.Options().headless())
    .build();

  await driver.get(url);

  const termoInPage = await pegarTermoNaPagina(driver, termo);
  const temHeader = await verificarSeHáHeader(driver);
  const temFooter = await verificarSePaginatemFooterr(driver);

  if (termoInPage !== null) {
    const page = { link: url, conteudo: termoInPage, temHeader, temFooter }

    pages.push(page)
  }

  const links = await pegarTodosOsLinks(driver, url);

  for (let i = 0; i < links.length; i++) {
    try {
      const currentLink = links[i];

      todosOsLinks.push(currentLink);

      await buscador(currentLink, termo, produndidade - 1);

    } catch (err) {
      return
    }
  }

  await driver.quit();
}

async function pegarTermoNaPagina(driver: WebDriver, termo: string) {
  const body = await driver.getPageSource();
  const removerTags = /(<([^>]+)>)/ig;
  const textoFormatado = body.replace(removerTags, '');
  const conteudo = textoFormatado?.replace(/^\s+/gm, '')?.match(new RegExp(`.{0,20}\\b${termo}\\b.{0,20}`, 'gim'));

  const conteudofiltrado = conteudo?.filter(item => item !== null).join(" ---:--- ");

  if (conteudofiltrado?.length === undefined || conteudofiltrado.trim().length === 0) {
    return null;
  }

  return conteudofiltrado;
}

async function verificarSeHáHeader(driver: WebDriver) {
  const temHeader = await driver.findElement(By.css('header')).isDisplayed();
  return temHeader;
}

async function verificarSePaginatemFooterr(driver: WebDriver) {
  return await driver.findElement(By.css('footer')).isDisplayed();

}

async function pegarTodosOsLinks(driver: WebDriver, url: string) {
  const links = await driver.findElements(By.css('a'));
  const regexDomain = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n]+)/i;
  const domain = url?.match(regexDomain)![1];
  const linksOnlyOfDomain = [];

  for (const link of links) {
    const href = await link.getAttribute('href');
    if (href.includes(domain)) {
      linksOnlyOfDomain.push(href);
    }
  }
  return linksOnlyOfDomain;
}

function pegarQuantidadeDeVezesQueOLinkAparece(todosOsLinks: string[], pages: any[]) {
  const aparicoesDeLinks = pages.map((item: any) => {
    const quantidadeDeAparicoes = todosOsLinks.filter(link => item.link === link).length;
    return {
      quantidadeDeAparicoes: quantidadeDeAparicoes,
      ...item
    }
  });
  return aparicoesDeLinks;
}

async function pegarPaginaNoBd(url: string, termo: string, profundidade: string) {
  return
}


function ordenarPaginas() {
  const aparicoesDeLinks = pegarQuantidadeDeVezesQueOLinkAparece(todosOsLinks, pages);

  const pontuacaoPage = aparicoesDeLinks.map(item => {
    const temFooter = item.temFooter ? 0 : -10
    const temHeader = item.temHeader ? 20 : 0
    return {
      pontuacao: item.quantidadeDeAparicoes + temFooter + temHeader,
      conteudo: item.conteudo,
      link: item.link,
      ...item,
    }
  });
  return pontuacaoPage.sort(ordenar);
}

function ordenar(a: any, b: any) {
  if (a.pontuacao < b.pontuacao) {
    return 1;
  }
  if (a.pontuacao > b.pontuacao) {
    return -1;
  }
  return 0;
}

async function main(url: string, termo: string, profundidade: number) {
  const pageNoBd = await prisma.buscaWeb.findFirst({
    where: {
      termo: termo,
      url: url,
      profundidade: profundidade
    },
    include: { paginas: true }
  })

  if (pageNoBd) {
    console.log(pageNoBd);
  } else {
    await buscador(url, termo, profundidade);

    const pageWithpontuacao = ordenarPaginas();


    await prisma.buscaWeb.create({
      data: {
        profundidade: profundidade,
        termo: termo,
        url: url,
        paginas: {
          create: pageWithpontuacao.map(item => {
            return {
              ...item
            }
          })
        }
      }
    })
    console.log({
      url: url,
      termo,
      profundidade,
      paginas: pageWithpontuacao
    })

  }
}


main('https://www.bbc.com/portuguese', 'brasil', 1)
