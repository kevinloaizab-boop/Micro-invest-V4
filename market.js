export default async function handler(req, res) {
  const key = process.env.ALPHA_VANTAGE_API_KEY;
  if (!key) return res.status(500).json({error:"Falta ALPHA_VANTAGE_API_KEY en Vercel."});
  const fn = String(req.query.function || "GLOBAL_QUOTE");
  const symbol = String(req.query.symbol || "AAPL").trim().toUpperCase();
  const allowed = new Set(["GLOBAL_QUOTE","TIME_SERIES_DAILY","NEWS_SENTIMENT","SYMBOL_SEARCH","OVERVIEW"]);
  if (!allowed.has(fn)) return res.status(400).json({error:"Función no permitida."});
  const u = new URL("https://www.alphavantage.co/query");
  u.searchParams.set("function",fn); u.searchParams.set("apikey",key);
  if(fn==="NEWS_SENTIMENT"){u.searchParams.set("tickers",symbol);u.searchParams.set("sort","LATEST");u.searchParams.set("limit","20");}
  else if(fn==="SYMBOL_SEARCH"){u.searchParams.delete("symbol");u.searchParams.set("keywords",String(req.query.keywords||symbol));}
  else u.searchParams.set("symbol",symbol);
  try { const r=await fetch(u); const d=await r.json(); res.setHeader("Cache-Control","s-maxage=300, stale-while-revalidate=600"); return res.status(r.ok?200:r.status).json(d); }
  catch(e){ return res.status(502).json({error:"No fue posible consultar Alpha Vantage."}); }
}