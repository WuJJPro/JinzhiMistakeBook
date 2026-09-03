/*
 * 生成 assets/fonts.css：把标题字体（Noto Serif SC 900）和手写字体（Long Cang）
 * 按页面实际用到的字符做子集，再以 data URI 内嵌，页面不依赖任何外部字体服务。
 *
 * 用法：node tools/subset-fonts.js      （依赖：npm i subset-font；首次运行会从 Google Fonts 下载字体到 tools/.cache）
 * 两款字体均为 SIL Open Font License 1.1。
 */
const fs=require('fs'),path=require('path'),https=require('https'),crypto=require('crypto');
const subsetFont=require('subset-font');
const root=path.join(__dirname,'..');
const cache=path.join(__dirname,'.cache');fs.mkdirSync(cache,{recursive:true});
const UA='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
function get(url){return new Promise((res,rej)=>{https.get(url,{headers:{'User-Agent':UA}},r=>{if(r.statusCode>=300&&r.headers.location)return get(r.headers.location).then(res,rej);if(r.statusCode!==200)return rej(new Error('HTTP '+r.statusCode+' '+url));const b=[];r.on('data',d=>b.push(d));r.on('end',()=>res(Buffer.concat(b)))}).on('error',rej)})}
// 带 text 参数向 Google Fonts 请求：Long Cang 会直接返回子集，Noto Serif SC 会返回整字（约 5MB，缓存后本地再子集）
async function fetchFont(key,family,text){
  const f=path.join(cache,key+'-'+crypto.createHash('md5').update(text).digest('hex').slice(0,8)+'.woff2');
  const full=path.join(cache,key+'.woff2');
  if(fs.existsSync(full))return fs.readFileSync(full);
  if(fs.existsSync(f))return fs.readFileSync(f);
  const css=(await get('https://fonts.googleapis.com/css2?family='+encodeURIComponent(family)+'&text='+encodeURIComponent(text)+'&display=swap')).toString();
  const m=css.match(/url\((https:[^)]+)\)/);if(!m)throw new Error('no font url for '+family);
  const buf=await get(m[1]);fs.writeFileSync(buf.length>2e6?full:f,buf);return buf;
}
function textOf(html,re){let out='';for(const m of html.matchAll(re))out+=m[1].replace(/<[^>]+>/g,'');return out}
(async()=>{
  function walk(d){return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.name==='tools'||e.name==='assets'?[]:e.isDirectory()?walk(path.join(d,e.name)):e.name.endsWith('.html')?[path.join(d,e.name)]:[])}
  const pages=walk(root).map(f=>fs.readFileSync(f,'utf8')).join('\n');
  const display=textOf(pages,/<h1[^>]*>([\s\S]*?)<\/h1>/g)+textOf(pages,/<h2[^>]*>([\s\S]*?)<\/h2>/g)+textOf(pages,/<b>([\s\S]*?)<\/b>/g)+'0123456789.,:%';
  const hand=textOf(pages,/class="[^"]*\bhand\b[^"]*"[^>]*>([\s\S]*?)</g);
  const uniq=s=>[...new Set(s.replace(/\s+/g,''))].join('');
  const dText=uniq(display),hText=uniq(hand);
  console.log('display chars',dText.length,'| hand chars',hText.length,'->',hText);
  const serif=await subsetFont(await fetchFont('notoserif900','Noto Serif SC:wght@900',dText),dText,{targetFormat:'woff2'});
  const cang=await subsetFont(await fetchFont('longcang','Long Cang',hText),hText,{targetFormat:'woff2'});
  const css=`/* 自动生成：node tools/subset-fonts.js —— 请勿手改。Noto Serif SC 与 Long Cang 均为 SIL OFL 1.1 */
@font-face{font-family:"Noto Serif SC Sub";font-weight:900;font-display:swap;src:url(data:font/woff2;base64,${serif.toString('base64')}) format("woff2")}
@font-face{font-family:"Long Cang Sub";font-weight:400;font-display:swap;src:url(data:font/woff2;base64,${cang.toString('base64')}) format("woff2")}
`;
  fs.writeFileSync(path.join(root,'assets','fonts.css'),css);
  console.log('assets/fonts.css written:',serif.length,'+',cang.length,'bytes of woff2');
})().catch(e=>{console.error(e);process.exit(1)});
