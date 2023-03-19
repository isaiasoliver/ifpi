-- CreateTable
CREATE TABLE "BuscaWeb" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "termo" TEXT NOT NULL,
    "profundidade" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "PaginaWeb" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "pontuacao" INTEGER NOT NULL,
    "conteudo" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "quantidadeDeAparicoes" INTEGER NOT NULL,
    "temHeader" BOOLEAN NOT NULL,
    "temFooter" BOOLEAN NOT NULL,
    "buscaWebId" INTEGER NOT NULL,
    CONSTRAINT "PaginaWeb_buscaWebId_fkey" FOREIGN KEY ("buscaWebId") REFERENCES "BuscaWeb" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
