const http = require("http");
const fs = require("fs");
const path = require("path");

const tipos = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

http
  .createServer((req, res) => {
    const url = req.url.split("?")[0];
    const nome = url === "/" ? "/index.html" : url;
    const arquivo = path.join(__dirname, path.normalize(nome));

    if (!arquivo.startsWith(__dirname)) {
      res.writeHead(403);
      return res.end("Acesso negado");
    }

    fs.readFile(arquivo, (erro, dados) => {
      if (erro) {
        res.writeHead(404);
        return res.end("Arquivo não encontrado");
      }
      res.writeHead(200, {
        "Content-Type": tipos[path.extname(arquivo)] || "application/octet-stream",
      });
      res.end(dados);
    });
  })
  .listen(8080, () => console.log("App em http://localhost:8080"));
