import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from './build.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));
const port=Number(process.env.PORT||5174);
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.pdf':'application/pdf'};
build();
const server=http.createServer((req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1');
  const requestPath=decodeURIComponent(url.pathname);
  const resolved=path.resolve(root,'.'+requestPath);
  if(resolved!==root&&!resolved.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  let target=resolved;
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory()){
   if(!url.pathname.endsWith('/')){res.writeHead(302,{Location:url.pathname+'/'+url.search});res.end();return;}
   target=path.join(target,'index.html');
  }
  if(!fs.existsSync(target)||!fs.statSync(target).isFile()||!mime[path.extname(target)]){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('페이지를 찾을 수 없습니다.');return;}
  res.writeHead(200,{'Content-Type':mime[path.extname(target)],'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  if(req.method==='HEAD')res.end();else fs.createReadStream(target).pipe(res);
 }catch{res.writeHead(400);res.end('Bad request');}
});
fs.watchFile(path.join(root,'content.json'),{interval:500},()=>{try{build();console.log('Content rebuilt.')}catch(e){console.error('Content error:',e.message)}});
server.listen(port,'127.0.0.1',()=>console.log(`New portfolio: http://127.0.0.1:${port}/`));
process.on('SIGINT',()=>{fs.unwatchFile(path.join(root,'content.json'));server.close(()=>process.exit(0))});
