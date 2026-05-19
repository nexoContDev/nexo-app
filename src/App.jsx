/**
 * NEXO Portal do Cliente - Versao Completa
 * Configure SUPABASE_URL e SUPABASE_KEY com seus dados
 */
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wnwlzcjlgbdcktjhsigx.supabase.co";
const SUPABASE_KEY = "SUA-ANON-KEY";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

const C = {
  navy:"#0d1f3c", navyL:"#132240", navyM:"#1a2f52",
  blue:"#2f7fd4", blueD:"#1a5fb4",
  green:"#3cb96a", greenD:"#27a558",
  white:"#ffffff", muted:"rgba(255,255,255,0.45)",
  border:"rgba(255,255,255,0.08)", borderH:"rgba(255,255,255,0.18)",
  danger:"#f87171", warn:"#ffd080",
};

function Logo({ size=32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4aa8f0"/><stop offset="100%" stopColor="#1a5fb4"/>
        </linearGradient>
        <linearGradient id="lg2" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#27a558"/><stop offset="100%" stopColor="#5dd48a"/>
        </linearGradient>
      </defs>
      <path d="M10 10 L32 10 L58 52 L50 62 Z" fill="url(#lg1)"/>
      <path d="M90 90 L68 90 L42 48 L50 62 Z" fill="url(#lg1)"/>
      <path d="M90 10 L68 10 L42 52 L50 62 Z" fill="url(#lg2)"/>
      <path d="M10 90 L32 90 L58 48 L50 38 Z" fill="url(#lg2)"/>
      <path d="M50 38 L58 48 L50 62 L42 48 Z" fill="white" opacity="0.9"/>
    </svg>
  );
}

const fmtBRL  = v => v ? `R$ ${Number(v).toLocaleString("pt-BR",{minimumFractionDigits:2})}` : "—";
const fmtDate = s => s ? new Date(s+"T12:00:00").toLocaleDateString("pt-BR") : "—";
const fmtBytes= b => !b?"—": b<1024?b+" B": b<1048576?(b/1024).toFixed(1)+" KB":(b/1048576).toFixed(1)+" MB";
const fileIcon= n => n?.endsWith(".pdf")?"📕": n?.match(/\.(doc|docx)$/)?"📘": n?.match(/\.(xls|xlsx)$/)?"📗": n?.match(/\.(jpg|jpeg|png|gif)$/)?"🖼️":"📄";

const CATS = ["Societário","Fiscal","Licenças","Declarações","Relatórios","Guias","Outros"];
const catSt = {
  "Societário":  {bg:"rgba(47,127,212,.2)",  c:"#7ec8f8"},
  "Fiscal":      {bg:"rgba(60,185,106,.2)",  c:"#7edfa8"},
  "Licenças":    {bg:"rgba(255,180,60,.18)", c:"#ffd080"},
  "Declarações": {bg:"rgba(160,100,240,.18)",c:"#d0a8ff"},
  "Relatórios":  {bg:"rgba(255,100,100,.18)",c:"#ffaaaa"},
  "Guias":       {bg:"rgba(60,200,200,.18)", c:"#80e8e8"},
  "Outros":      {bg:"rgba(255,255,255,.08)",c:"#aaa"},
};

// Mensalidade primeiro!
const TABS = [
  {id:"boleto",     icon:"💳", label:"Mensalidade"},
  {id:"documentos", icon:"📁", label:"Documentos"},
  {id:"guias",      icon:"📋", label:"Guias de Impostos"},
  {id:"relatorios", icon:"📊", label:"Relatórios"},
  {id:"perfil",     icon:"👤", label:"Meu Perfil"},
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:${C.navy}}
  input,select,textarea{font-family:'DM Sans',sans-serif}
  input:focus,select:focus{outline:none;border-color:${C.blue}!important}
  input::placeholder{color:rgba(255,255,255,0.3)!important}
  .inp{background:rgba(255,255,255,.06)!important;border:1px solid ${C.border}!important;
       color:#fff!important;border-radius:10px;padding:12px 16px;width:100%;font-size:14px;transition:border-color .2s}
  .card{background:${C.navyL};border:1px solid ${C.border};border-radius:14px;padding:20px;transition:all .2s}
  .card:hover{border-color:${C.borderH};box-shadow:0 4px 24px rgba(0,0,0,.3)}
  .row{background:rgba(255,255,255,.03);border:1px solid ${C.border};border-radius:12px;
       padding:14px 18px;display:flex;align-items:center;justify-content:space-between;
       flex-wrap:wrap;gap:10px;transition:border-color .2s}
  .row:hover{border-color:${C.borderH}}
  .tab{flex:1 1 auto;padding:10px 12px;border:none;border-radius:8px;cursor:pointer;
       font-size:13px;font-weight:600;background:transparent;color:${C.muted};
       font-family:'DM Sans',sans-serif;white-space:nowrap;transition:all .18s}
  .tab:hover{background:rgba(47,127,212,.15);color:#fff}
  .tab.on{background:linear-gradient(135deg,${C.blue},${C.blueD});color:#fff;box-shadow:0 4px 16px rgba(47,127,212,.35)}
  .btn{border:none;border-radius:9px;padding:10px 18px;font-size:13px;font-weight:700;
       cursor:pointer;font-family:'DM Sans',sans-serif;transition:opacity .15s}
  .btn:hover{opacity:.84} .btn:disabled{opacity:.4;cursor:not-allowed}
  .btn.blue{background:linear-gradient(135deg,${C.blue},${C.blueD});color:#fff;box-shadow:0 4px 14px rgba(47,127,212,.3)}
  .btn.green{background:linear-gradient(135deg,${C.green},${C.greenD});color:#fff}
  .btn.ghost{background:rgba(255,255,255,.06);border:1px solid ${C.border};color:rgba(255,255,255,.7)}
  .btn.ghost:hover{border-color:${C.borderH};color:#fff}
  .btn.red{background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.25);color:#f87171}
  .btn.red:hover{background:rgba(239,68,68,.28)}
  .btn.sm{padding:7px 13px;font-size:12px}
  .filter{background:transparent;border:1px solid ${C.border};color:${C.muted};border-radius:20px;
          padding:5px 13px;font-size:12px;font-weight:600;cursor:pointer;
          font-family:'DM Sans',sans-serif;transition:all .15s;white-space:nowrap}
  .filter:hover{border-color:${C.borderH};color:#fff}
  .filter.on{background:linear-gradient(135deg,${C.blue},${C.blueD});color:#fff;border-color:transparent;box-shadow:0 3px 12px rgba(47,127,212,.35)}
  .drag{border:2px dashed ${C.border};border-radius:14px;padding:30px;text-align:center;cursor:pointer;transition:all .2s}
  .drag:hover,.drag.over{border-color:${C.blue};background:rgba(47,127,212,.07)}
  .badge{border-radius:20px;padding:3px 11px;font-size:11px;font-weight:600}
  .badge.pago{background:rgba(60,185,106,.2);color:${C.green}}
  .badge.pendente{background:rgba(255,180,60,.18);color:${C.warn}}
  .fade{animation:fd .3s ease}
  @keyframes fd{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  .li{animation:up .5s ease}
  @keyframes up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  .toast{position:fixed;bottom:24px;right:24px;z-index:9999;border-radius:12px;
         padding:13px 18px;font-size:13px;font-weight:600;display:flex;align-items:center;gap:9px;
         box-shadow:0 8px 32px rgba(0,0,0,.45);animation:up .3s ease;max-width:320px}
  .progress{height:6px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden}
  .progress-bar{height:100%;border-radius:99px;background:linear-gradient(90deg,${C.blue},${C.green});transition:width .3s}
  .sep{border:none;border-top:1px solid ${C.border};margin:16px 0}
  .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);
            display:flex;align-items:center;justify-content:center;z-index:100;padding:20px}
  .modal{background:${C.navyL};border:1px solid ${C.borderH};border-radius:18px;
         padding:28px;width:100%;max-width:420px;box-shadow:0 24px 80px rgba(0,0,0,.5)}
  .modal label{display:block;color:${C.muted};font-size:11px;letter-spacing:.08em;
               text-transform:uppercase;margin-bottom:6px;margin-top:2px}
`;

export default function App() {
  const [session,    setSession]    = useState(null);
  const [booting,    setBooting]    = useState(true);
  const [tab,        setTab]        = useState("boleto"); // comea em Mensalidade

  // auth
  const [email,      setEmail]      = useState("");
  const [senha,      setSenha]      = useState("");
  const [authMode,   setAuthMode]   = useState("login");
  const [authErr,    setAuthErr]    = useState("");
  const [authMsg,    setAuthMsg]    = useState("");
  const [authBusy,   setAuthBusy]   = useState(false);

  // docs
  const [docs,       setDocs]       = useState([]);
  const [docsLoad,   setDocsLoad]   = useState(false);
  const [catUp,      setCatUp]      = useState("Fiscal");
  const [catFilt,    setCatFilt]    = useState("Todos");
  const [search,     setSearch]     = useState("");
  const [uploading,  setUploading]  = useState(false);
  const [upPct,      setUpPct]      = useState(0);
  const [dlId,       setDlId]       = useState(null);
  const [delId,      setDelId]      = useState(null);
  const [dragOver,   setDragOver]   = useState(false);
  const fileRef = useRef();

  // guias
  const [guias,      setGuias]      = useState([]);
  const [guiasLoad,  setGuiasLoad]  = useState(false);
  const [dlGuiaId,   setDlGuiaId]   = useState(null);

  // boleto
  const [boleto,     setBoleto]     = useState(null);
  const [boletoLoad, setBoletoLoad] = useState(false);
  const [copied,     setCopied]     = useState(false);

  // perfil / senha
  const [senhaAtual,    setSenhaAtual]    = useState("");
  const [senhaNova,     setSenhaNova]     = useState("");
  const [senhaConfirm,  setSenhaConfirm]  = useState("");
  const [senhaBusy,     setSenhaBusy]     = useState(false);
  const [senhaMsg,      setSenhaMsg]      = useState("");
  const [senhaErr,      setSenhaErr]      = useState("");

  // toast
  const [toast, setToast] = useState(null);
  const showToast = useCallback((msg, type="ok") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 3200);
  },[]);

  //  Auth 
  useEffect(()=>{
    sb.auth.getSession().then(({data})=>{setSession(data.session);setBooting(false)});
    const {data:{subscription}} = sb.auth.onAuthStateChange((_,s)=>setSession(s));
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!session) return;
    fetchDocs(); fetchGuias(); fetchBoleto();
  },[session]);

  const doLogin = async()=>{
    setAuthErr("");setAuthBusy(true);
    const{error}=await sb.auth.signInWithPassword({email,password:senha});
    if(error) setAuthErr("E-mail ou senha incorretos.");
    setAuthBusy(false);
  };

  const doReset = async()=>{
    setAuthErr("");setAuthBusy(true);
    const{error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:window.location.href});
    if(error) setAuthErr("Erro ao enviar e-mail.");
    else setAuthMsg("Link de redefinição enviado! Verifique sua caixa.");
    setAuthBusy(false);
  };

  //  Alterar senha 
  const alterarSenha = async()=>{
    setSenhaErr(""); setSenhaMsg("");
    if(!senhaAtual||!senhaNova||!senhaConfirm){ setSenhaErr("Preencha todos os campos."); return; }
    if(senhaNova !== senhaConfirm){ setSenhaErr("A nova senha e a confirmação não coincidem."); return; }
    if(senhaNova.length < 6){ setSenhaErr("A senha deve ter pelo menos 6 caracteres."); return; }
    setSenhaBusy(true);
    // Reautentica para validar senha atual
    const{error:reErr}=await sb.auth.signInWithPassword({email:session.user.email, password:senhaAtual});
    if(reErr){ setSenhaErr("Senha atual incorreta."); setSenhaBusy(false); return; }
    // Atualiza para nova senha
    const{error}=await sb.auth.updateUser({password:senhaNova});
    if(error) setSenhaErr("Erro ao alterar senha: "+error.message);
    else{
      setSenhaMsg("Senha alterada com sucesso!");
      setSenhaAtual(""); setSenhaNova(""); setSenhaConfirm("");
      showToast("Senha alterada com sucesso!");
    }
    setSenhaBusy(false);
  };

  //  Documentos 
  const fetchDocs = async()=>{
    setDocsLoad(true);
    const{data,error}=await sb.from("documentos").select("*").order("criado_em",{ascending:false});
    if(error) showToast("Erro ao carregar documentos","err");
    else setDocs(data||[]);
    setDocsLoad(false);
  };

  const handleFiles = async(files)=>{
    if(!files||!files.length) return;
    setUploading(true);setUpPct(0);
    for(let i=0;i<files.length;i++){
      const f=files[i];
      const path=`${session.user.id}/${Date.now()}_${f.name}`;
      const iv=setInterval(()=>setUpPct(p=>Math.min(p+10,88)),200);
      const{error:se}=await sb.storage.from("documentos").upload(path,f,{upsert:false});
      clearInterval(iv);
      if(se){showToast(`Erro ao enviar ${f.name}`,"err");continue;}
      const{error:de}=await sb.from("documentos").insert({
        nome:f.name,categoria:catUp,storage_path:path,tamanho:f.size,usuario_id:session.user.id
      });
      if(de) showToast(`Erro ao salvar ${f.name}`,"err");
      else showToast(`${f.name} enviado com sucesso!`);
    }
    setUpPct(100);
    setTimeout(()=>{setUploading(false);setUpPct(0);},600);
    fetchDocs();
  };

  const downloadDoc = async(doc)=>{
    setDlId(doc.id);
    const{data,error}=await sb.storage.from("documentos").download(doc.storage_path);
    if(error) showToast("Erro ao baixar arquivo","err");
    else{
      const url=URL.createObjectURL(data);
      const a=document.createElement("a");a.href=url;a.download=doc.nome;a.click();
      URL.revokeObjectURL(url);showToast(`${doc.nome} baixado!`);
    }
    setDlId(null);
  };

  const deleteDoc = async(doc)=>{
    if(!window.confirm(`Excluir "${doc.nome}"?`)) return;
    setDelId(doc.id);
    await sb.storage.from("documentos").remove([doc.storage_path]);
    await sb.from("documentos").delete().eq("id",doc.id);
    setDocs(p=>p.filter(d=>d.id!==doc.id));
    showToast(`${doc.nome} excluído`,"info");
    setDelId(null);
  };

  const filteredDocs = docs.filter(d=>{
    const mc = catFilt==="Todos"||d.categoria===catFilt;
    const mq = d.nome.toLowerCase().includes(search.toLowerCase());
    return mc&&mq;
  });

  //  Guias 
  const fetchGuias = async()=>{
    setGuiasLoad(true);
    const{data}=await sb.from("guias").select("*").order("vencimento",{ascending:true});
    if(!data||data.length===0){
      setGuias([
        {id:"g1",tipo:"DAS – Simples Nacional",vencimento:"2026-05-20",valor:1240,status:"pendente",storage_path:null},
        {id:"g2",tipo:"FGTS",                  vencimento:"2026-05-07",valor:380, status:"pago",    storage_path:null},
        {id:"g3",tipo:"GPS – INSS",             vencimento:"2026-04-20",valor:520, status:"pago",    storage_path:null},
        {id:"g4",tipo:"DARF – IRPJ",            vencimento:"2026-05-31",valor:890, status:"pendente",storage_path:null},
      ]);
    } else setGuias(data);
    setGuiasLoad(false);
  };

  const downloadGuia = async(g)=>{
    if(!g.storage_path){showToast("Guia ainda não disponível para download","info");return;}
    setDlGuiaId(g.id);
    const{data,error}=await sb.storage.from("documentos").download(g.storage_path);
    if(error) showToast("Erro ao baixar guia","err");
    else{
      const url=URL.createObjectURL(data);
      const a=document.createElement("a");a.href=url;a.download=g.tipo+".pdf";a.click();
      URL.revokeObjectURL(url);showToast(`${g.tipo} baixado!`);
    }
    setDlGuiaId(null);
  };

  //  Boleto 
  const fetchBoleto = async()=>{
    setBoletoLoad(true);
    const{data}=await sb.from("boletos").select("*").order("criado_em",{ascending:false}).limit(1);
    if(data&&data.length>0) setBoleto(data[0]);
    else setBoleto(null);
    setBoletoLoad(false);
  };

  const downloadBoleto = async()=>{
    if(!boleto?.storage_path){ showToast("Boleto PDF não disponível","info"); return; }
    const{data,error}=await sb.storage.from("documentos").download(boleto.storage_path);
    if(error) showToast("Erro ao baixar boleto","err");
    else{
      const url=URL.createObjectURL(data);
      const a=document.createElement("a");a.href=url;a.download="boleto.pdf";a.click();
      URL.revokeObjectURL(url);showToast("Boleto baixado!");
    }
  };

  const copyLine = ()=>{
    if(boleto?.linha_digitavel) navigator.clipboard.writeText(boleto.linha_digitavel);
    setCopied(true);setTimeout(()=>setCopied(false),2000);
    showToast("Código copiado!");
  };

  // 
  if(booting) return(
    <div style={{minHeight:"100vh",background:C.navy,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center"}}>
        <Logo size={52}/><p style={{color:C.muted,marginTop:16,fontSize:14}}>Carregando…</p>
      </div>
    </div>
  );

  //  LOGIN 
  if(!session) return(
    <div style={{
      minHeight:"100vh",background:C.navy,
      display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",
      backgroundImage:`radial-gradient(ellipse at 30% 20%,rgba(47,127,212,.2) 0%,transparent 60%),
                       radial-gradient(ellipse at 75% 80%,rgba(60,185,106,.12) 0%,transparent 55%)`,
    }}>
      <style>{CSS}</style>
      <div className="li" style={{
        width:"100%",maxWidth:420,
        background:"rgba(255,255,255,0.04)",border:`1px solid ${C.border}`,
        borderRadius:20,padding:"48px 40px",backdropFilter:"blur(16px)",
        boxShadow:"0 40px 100px rgba(0,0,0,.5)",
      }}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:10}}>
            <Logo size={42}/>
            <span style={{fontSize:28,fontWeight:700,color:C.white,letterSpacing:".06em"}}>NEXO</span>
          </div>
          <p style={{color:C.muted,fontSize:12,letterSpacing:".06em",textTransform:"uppercase"}}>
            {authMode==="login"?"Portal do Cliente":"Recuperar Senha"}
          </p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label style={{color:C.muted,fontSize:11,letterSpacing:".08em",textTransform:"uppercase",display:"block",marginBottom:6}}>E-mail</label>
            <input className="inp" value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com"/>
          </div>
          {authMode==="login"&&(
            <div>
              <label style={{color:C.muted,fontSize:11,letterSpacing:".08em",textTransform:"uppercase",display:"block",marginBottom:6}}>Senha</label>
              <input className="inp" type="password" value={senha} onChange={e=>setSenha(e.target.value)}
                     onKeyDown={e=>e.key==="Enter"&&doLogin()} placeholder="••••••••"/>
            </div>
          )}
          {authErr&&<p style={{color:C.danger,fontSize:13}}>⚠️ {authErr}</p>}
          {authMsg&&<p style={{color:C.green,fontSize:13}}>✅ {authMsg}</p>}
          {authMode==="login"?(
            <>
              <button className="btn blue" onClick={doLogin} disabled={authBusy}
                      style={{width:"100%",padding:"14px",fontSize:15,marginTop:4}}>
                {authBusy?"Entrando…":"Entrar"}
              </button>
              <button onClick={()=>{setAuthMode("reset");setAuthErr("");setAuthMsg("");}}
                style={{background:"none",border:"none",color:C.muted,fontSize:13,cursor:"pointer",textAlign:"center"}}>
                Esqueci minha senha
              </button>
            </>
          ):(
            <>
              <button className="btn blue" onClick={doReset} disabled={authBusy}
                      style={{width:"100%",padding:"14px",fontSize:15,marginTop:4}}>
                {authBusy?"Enviando…":"Enviar link de recuperação"}
              </button>
              <button onClick={()=>{setAuthMode("login");setAuthErr("");setAuthMsg("");}}
                style={{background:"none",border:"none",color:C.muted,fontSize:13,cursor:"pointer",textAlign:"center"}}>
                ← Voltar ao login
              </button>
            </>
          )}
        </div>
        <p style={{textAlign:"center",color:"rgba(255,255,255,.2)",fontSize:12,marginTop:24}}>
          Acesso exclusivo para clientes NEXO
        </p>
      </div>
    </div>
  );

  //  DASHBOARD 
  return(
    <div style={{minHeight:"100vh",background:C.navy,
                 backgroundImage:`radial-gradient(ellipse at 0% 0%,rgba(47,127,212,.07) 0%,transparent 50%)`}}>
      <style>{CSS}</style>

      {toast&&(
        <div className="toast" style={{
          background: toast.type==="err"?"rgba(239,68,68,.18)":toast.type==="info"?"rgba(255,255,255,.07)":"rgba(60,185,106,.18)",
          border:`1px solid ${toast.type==="err"?"rgba(239,68,68,.4)":toast.type==="info"?"rgba(255,255,255,.15)":"rgba(60,185,106,.4)"}`,
          color: toast.type==="err"?C.danger:toast.type==="info"?"#ccc":C.green,
        }}>
          {toast.type==="err"?"❌":toast.type==="info"?"ℹ️":"✅"} {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <header style={{
        background:"rgba(13,31,60,.94)",backdropFilter:"blur(14px)",
        borderBottom:`1px solid ${C.border}`,padding:"0 24px",
        display:"flex",alignItems:"center",justifyContent:"space-between",
        height:64,position:"sticky",top:0,zIndex:10,
      }}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <Logo size={30}/>
          <span style={{fontSize:19,fontWeight:700,color:C.white,letterSpacing:".06em"}}>NEXO</span>
          <span style={{fontSize:11,color:C.muted,borderLeft:`1px solid ${C.border}`,
                        paddingLeft:12,marginLeft:4,letterSpacing:".08em",textTransform:"uppercase"}}>
            Portal do Cliente
          </span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{
            width:34,height:34,borderRadius:"50%",
            background:`linear-gradient(135deg,${C.blue},${C.green})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:13,fontWeight:700,color:"#fff",
          }}>{(session.user.email||"U")[0].toUpperCase()}</div>
          <button className="btn ghost sm" onClick={()=>sb.auth.signOut()}>Sair</button>
        </div>
      </header>

      <main style={{maxWidth:860,margin:"0 auto",padding:"24px 16px"}}>

        {/* Banner */}
        <div style={{
          background:`linear-gradient(135deg,${C.navyM} 0%,rgba(47,127,212,.22) 100%)`,
          border:`1px solid rgba(47,127,212,.28)`,borderRadius:16,
          padding:"20px 26px",marginBottom:22,
          display:"flex",justifyContent:"space-between",alignItems:"center",
          flexWrap:"wrap",gap:12,boxShadow:"0 8px 40px rgba(0,0,0,.3)",
          position:"relative",overflow:"hidden",
        }}>
          <div style={{position:"absolute",right:-10,top:-10,opacity:.05}}><Logo size={130}/></div>
          <div>
            <div style={{fontSize:12,color:C.muted,letterSpacing:".05em",textTransform:"uppercase",marginBottom:3}}>Bem-vindo(a)</div>
            <div style={{fontSize:17,fontWeight:700,color:C.white}}>{session.user.email}</div>
          </div>
          <div style={{display:"inline-flex",alignItems:"center",gap:6,
                       background:"rgba(60,185,106,.18)",border:"1px solid rgba(60,185,106,.3)",
                       borderRadius:20,padding:"5px 14px",fontSize:12,fontWeight:600,color:C.green}}>
            ● Conectado
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:"flex",gap:6,marginBottom:20,background:C.navyL,
                     borderRadius:12,padding:6,border:`1px solid ${C.border}`,flexWrap:"wrap"}}>
          {TABS.map(t=>(
            <button key={t.id} className={`tab${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)}>
              <span style={{marginRight:6}}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        {/*  MENSALIDADE (BOLETO)  */}
        {tab==="boleto"&&(
          <div className="fade">
            <div className="card">
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:22}}>
                <div style={{width:46,height:46,borderRadius:12,background:"rgba(47,127,212,.18)",
                             display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>💳</div>
                <div>
                  <div style={{fontSize:17,fontWeight:700,color:C.white}}>Mensalidade de Honorários</div>
                  <div style={{fontSize:12,color:C.muted,marginTop:2}}>
                    {boletoLoad?"…":boleto?.competencia||"Nenhum boleto disponível"}
                  </div>
                </div>
              </div>

              {boletoLoad?(
                <div style={{textAlign:"center",padding:"32px 0",color:C.muted}}>Carregando…</div>
              ):!boleto?(
                <div style={{textAlign:"center",padding:"48px 0",border:`1px dashed ${C.border}`,borderRadius:12}}>
                  <div style={{fontSize:32,marginBottom:10}}>💳</div>
                  <div style={{fontSize:13,color:C.muted}}>Nenhum boleto disponível no momento.</div>
                  <div style={{fontSize:12,color:C.muted,marginTop:6}}>Seu contador irá disponibilizar em breve.</div>
                </div>
              ):(
                <>
                  <div style={{background:"rgba(255,255,255,.04)",borderRadius:12,
                               border:`1px solid ${C.border}`,padding:"4px 20px",marginBottom:20}}>
                    {[
                      ["Vencimento", fmtDate(boleto.vencimento)],
                      ["Valor",      fmtBRL(boleto.valor)],
                      ["Status",     boleto.status==="pago"?"✅ Pago":"⏳ Pendente"],
                      ["Competência",boleto.competencia||"—"],
                    ].map(([l,v])=>(
                      <div key={l} style={{display:"flex",justifyContent:"space-between",
                                           padding:"13px 0",borderBottom:`1px solid ${C.border}`,fontSize:14}}>
                        <span style={{color:C.muted}}>{l}</span>
                        <span style={{fontWeight:600,color:C.white}}>{v}</span>
                      </div>
                    ))}
                  </div>

                  {boleto.linha_digitavel&&(
                    <>
                      <div style={{fontSize:11,color:C.muted,letterSpacing:".07em",
                                   textTransform:"uppercase",marginBottom:8}}>Linha Digitável</div>
                      <div style={{background:"rgba(255,255,255,.04)",border:`1px dashed ${C.border}`,
                                   borderRadius:10,padding:"14px 18px",marginBottom:18,
                                   fontFamily:"monospace",fontSize:13,color:"rgba(255,255,255,.55)",
                                   letterSpacing:".04em",wordBreak:"break-all",lineHeight:1.8}}>
                        {boleto.linha_digitavel}
                      </div>
                    </>
                  )}

                  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                    {boleto.storage_path&&(
                      <button className="btn blue" onClick={downloadBoleto}
                              style={{flex:1,padding:"14px",fontSize:14}}>
                        📥 Baixar Boleto PDF
                      </button>
                    )}
                    {boleto.linha_digitavel&&(
                      <button className="btn ghost" onClick={copyLine}
                              style={{flex:1,padding:"14px",fontSize:14,
                                      background:copied?"rgba(60,185,106,.2)":"",
                                      borderColor:copied?"rgba(60,185,106,.4)":"",
                                      color:copied?C.green:""}}>
                        {copied?"✓ Copiado!":"📋 Copiar Código"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/*  DOCUMENTOS  */}
        {tab==="documentos"&&(
          <div className="fade">
            <div className="card" style={{marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                           flexWrap:"wrap",gap:12,marginBottom:16}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:C.white,marginBottom:2}}>📤 Enviar Documentos</div>
                  <div style={{fontSize:12,color:C.muted}}>Arraste ou clique para selecionar • PDF, DOC, XLS, JPG</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <label style={{color:C.muted,fontSize:12}}>Categoria:</label>
                  <select value={catUp} onChange={e=>setCatUp(e.target.value)}
                    style={{background:C.navyM,border:`1px solid ${C.border}`,color:"#fff",
                            borderRadius:8,padding:"7px 12px",fontSize:13,cursor:"pointer"}}>
                    {CATS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className={`drag${dragOver?" over":""}`}
                onClick={()=>fileRef.current.click()}
                onDragOver={e=>{e.preventDefault();setDragOver(true)}}
                onDragLeave={()=>setDragOver(false)}
                onDrop={e=>{e.preventDefault();setDragOver(false);handleFiles(e.dataTransfer.files)}}>
                <input ref={fileRef} type="file" multiple style={{display:"none"}}
                       onChange={e=>handleFiles(e.target.files)}/>
                {uploading?(
                  <div style={{padding:"8px 0"}}>
                    <div style={{fontSize:14,color:C.white,marginBottom:10,fontWeight:600}}>Enviando… {upPct}%</div>
                    <div className="progress"><div className="progress-bar" style={{width:`${upPct}%`}}/></div>
                  </div>
                ):(
                  <>
                    <div style={{fontSize:28,marginBottom:8}}>☁️</div>
                    <div style={{fontSize:14,color:C.white,fontWeight:600,marginBottom:4}}>Clique ou arraste arquivos aqui</div>
                    <div style={{fontSize:12,color:C.muted}}>Máximo 50 MB por arquivo</div>
                  </>
                )}
              </div>
            </div>

            <div className="card">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
                           flexWrap:"wrap",gap:12,marginBottom:14}}>
                <div style={{fontSize:15,fontWeight:700,color:C.white}}>
                  📁 Meus Documentos
                  {docs.length>0&&(
                    <span style={{marginLeft:8,fontSize:11,fontWeight:600,
                                  background:"rgba(47,127,212,.2)",color:C.blue,
                                  borderRadius:20,padding:"2px 10px"}}>{docs.length}</span>
                  )}
                </div>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar…"
                       style={{background:"rgba(255,255,255,.06)",border:`1px solid ${C.border}`,
                               color:"#fff",borderRadius:8,padding:"7px 13px",width:200,fontSize:13}}/>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
                {["Todos",...CATS].map(c=>(
                  <button key={c} className={`filter${catFilt===c?" on":""}`} onClick={()=>setCatFilt(c)}>{c}</button>
                ))}
              </div>
              {docsLoad?(
                <div style={{textAlign:"center",padding:"36px 0",color:C.muted,fontSize:14}}>Carregando…</div>
              ):filteredDocs.length===0?(
                <div style={{textAlign:"center",padding:"40px 0",border:`1px dashed ${C.border}`,borderRadius:12}}>
                  <div style={{fontSize:32,marginBottom:10}}>📂</div>
                  <div style={{fontSize:13,color:C.muted}}>{docs.length===0?"Nenhum documento enviado.":"Sem resultados."}</div>
                </div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {filteredDocs.map(d=>{
                    const cs=catSt[d.categoria]||catSt["Outros"];
                    return(
                      <div key={d.id} className="row">
                        <div style={{display:"flex",alignItems:"center",gap:12,flex:1,minWidth:0}}>
                          <div style={{width:36,height:36,borderRadius:8,background:"rgba(255,255,255,.06)",
                                       flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
                            {fileIcon(d.nome)}
                          </div>
                          <div style={{minWidth:0}}>
                            <div style={{fontWeight:600,color:C.white,fontSize:14,overflow:"hidden",
                                         textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:260}}>{d.nome}</div>
                            <div style={{fontSize:11,color:C.muted,marginTop:2}}>{fmtDate(d.criado_em)} · {fmtBytes(d.tamanho)}</div>
                          </div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                          <span style={{background:cs.bg,color:cs.c,borderRadius:20,padding:"3px 11px",fontSize:11,fontWeight:600}}>
                            {d.categoria}
                          </span>
                          <button className="btn green sm" onClick={()=>downloadDoc(d)} disabled={dlId===d.id}>
                            {dlId===d.id?"…":"⬇ Baixar"}
                          </button>
                          <button className="btn red sm" onClick={()=>deleteDoc(d)} disabled={delId===d.id}>
                            {delId===d.id?"…":"🗑"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/*  GUIAS  */}
        {tab==="guias"&&(
          <div className="fade" style={{display:"flex",flexDirection:"column",gap:10}}>
            {guiasLoad?(
              <div style={{textAlign:"center",padding:"40px 0",color:C.muted}}>Carregando…</div>
            ):guias.map(g=>(
              <div key={g.id} className="row" style={{background:C.navyL,borderRadius:14,padding:"18px 20px"}}>
                <div style={{display:"flex",alignItems:"center",gap:14}}>
                  <div style={{width:40,height:40,borderRadius:10,background:"rgba(47,127,212,.15)",
                               display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🗒️</div>
                  <div>
                    <div style={{fontWeight:600,color:C.white,fontSize:15}}>{g.tipo}</div>
                    <div style={{fontSize:12,color:C.muted,marginTop:2}}>Vencimento: {fmtDate(g.vencimento)}</div>
                  </div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12,flexShrink:0}}>
                  <span className={`badge ${g.status}`}>{g.status==="pago"?"✓ Pago":"Pendente"}</span>
                  <span style={{fontWeight:700,color:C.white,fontSize:16}}>{fmtBRL(g.valor)}</span>
                  {g.status==="pendente"&&(
                    <button className="btn blue sm" onClick={()=>downloadGuia(g)} disabled={dlGuiaId===g.id}>
                      {dlGuiaId===g.id?"…":"Baixar"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/*  RELATRIOS  */}
        {tab==="relatorios"&&(
          <div className="fade">
            <div className="card" style={{marginBottom:14}}>
              <div style={{fontSize:15,fontWeight:700,color:C.white,marginBottom:4}}>📊 Relatórios de Fechamento</div>
              <div style={{fontSize:12,color:C.muted}}>
                Os relatórios são disponibilizados pelo seu contador mensalmente na aba <strong style={{color:C.white}}>Documentos</strong> com a categoria <strong style={{color:C.white}}>Relatórios</strong>.
              </div>
            </div>
            {docs.filter(d=>d.categoria==="Relatórios").length===0?(
              <div style={{textAlign:"center",padding:"48px 0",border:`1px dashed ${C.border}`,borderRadius:14}}>
                <div style={{fontSize:32,marginBottom:10}}>📊</div>
                <div style={{fontSize:14,color:C.muted,marginBottom:16}}>Nenhum relatório disponível ainda.</div>
                <button className="btn ghost" onClick={()=>setTab("documentos")}>Ver todos os documentos</button>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {docs.filter(d=>d.categoria==="Relatórios").map(d=>(
                  <div key={d.id} className="row" style={{background:C.navyL,borderRadius:14,padding:"18px 20px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:40,height:40,borderRadius:10,background:"rgba(60,185,106,.15)",
                                   display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>📊</div>
                      <div>
                        <div style={{fontWeight:600,color:C.white,fontSize:15}}>{d.nome}</div>
                        <div style={{fontSize:12,color:C.muted,marginTop:2}}>{fmtDate(d.criado_em)} · {fmtBytes(d.tamanho)}</div>
                      </div>
                    </div>
                    <button className="btn green sm" onClick={()=>downloadDoc(d)} disabled={dlId===d.id}>
                      {dlId===d.id?"…":"⬇ Baixar PDF"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/*  MEU PERFIL  */}
        {tab==="perfil"&&(
          <div className="fade">
            {/* Info da conta */}
            <div className="card" style={{marginBottom:16}}>
              <div style={{fontSize:15,fontWeight:700,color:C.white,marginBottom:16}}>👤 Minha Conta</div>
              <div style={{background:"rgba(255,255,255,.04)",borderRadius:12,border:`1px solid ${C.border}`,padding:"4px 20px"}}>
                <div style={{display:"flex",justifyContent:"space-between",padding:"13px 0",
                             borderBottom:`1px solid ${C.border}`,fontSize:14}}>
                  <span style={{color:C.muted}}>E-mail</span>
                  <span style={{fontWeight:600,color:C.white}}>{session.user.email}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"13px 0",fontSize:14}}>
                  <span style={{color:C.muted}}>Membro desde</span>
                  <span style={{fontWeight:600,color:C.white}}>{fmtDate(session.user.created_at?.split("T")[0])}</span>
                </div>
              </div>
            </div>

            {/* Alterar senha */}
            <div className="card">
              <div style={{fontSize:15,fontWeight:700,color:C.white,marginBottom:4}}>🔐 Alterar Senha</div>
              <div style={{fontSize:12,color:C.muted,marginBottom:18}}>
                Por segurança, confirme sua senha atual antes de criar uma nova.
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:13}}>
                <div>
                  <label style={{color:C.muted,fontSize:11,letterSpacing:".08em",textTransform:"uppercase",display:"block",marginBottom:6}}>
                    Senha atual
                  </label>
                  <input className="inp" type="password" value={senhaAtual}
                         onChange={e=>setSenhaAtual(e.target.value)} placeholder="••••••••"/>
                </div>
                <div>
                  <label style={{color:C.muted,fontSize:11,letterSpacing:".08em",textTransform:"uppercase",display:"block",marginBottom:6}}>
                    Nova senha
                  </label>
                  <input className="inp" type="password" value={senhaNova}
                         onChange={e=>setSenhaNova(e.target.value)} placeholder="Mínimo 6 caracteres"/>
                </div>
                <div>
                  <label style={{color:C.muted,fontSize:11,letterSpacing:".08em",textTransform:"uppercase",display:"block",marginBottom:6}}>
                    Confirmar nova senha
                  </label>
                  <input className="inp" type="password" value={senhaConfirm}
                         onChange={e=>setSenhaConfirm(e.target.value)}
                         onKeyDown={e=>e.key==="Enter"&&alterarSenha()}
                         placeholder="Repita a nova senha"/>
                </div>
                {senhaErr&&<p style={{color:C.danger,fontSize:13}}>⚠️ {senhaErr}</p>}
                {senhaMsg&&<p style={{color:C.green,fontSize:13}}>✅ {senhaMsg}</p>}
                <button className="btn blue" onClick={alterarSenha} disabled={senhaBusy}
                        style={{padding:"13px",fontSize:14,marginTop:4}}>
                  {senhaBusy?"Alterando…":"🔐 Alterar Senha"}
                </button>
              </div>
            </div>
          </div>
        )}

        <footer style={{textAlign:"center",marginTop:28,color:"rgba(255,255,255,.18)",fontSize:11,letterSpacing:".04em"}}>
          NEXO Portal · Dados protegidos com criptografia SSL + Supabase RLS
        </footer>
      </main>
    </div>
  );
}


