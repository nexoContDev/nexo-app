/**
 * NEXO Admin Panel — Painel Administrativo Completo
 * ═══════════════════════════════════════════════════
 *
 * CONFIGURAÇÃO:
 * 1. Cole suas credenciais Supabase abaixo
 * 2. No Supabase, crie uma tabela "admins" com o seu e-mail
 *    para separar acesso admin do acesso cliente:
 *
 *    create table admins (
 *      id uuid references auth.users(id) primary key,
 *      email text,
 *      criado_em timestamptz default now()
 *    );
 *    -- Inserir seu usuário admin:
 *    insert into admins (id, email)
 *    select id, email from auth.users where email = 'seu@email.com';
 *
 * 3. API Asaas (boletos):
 *    - Crie conta em https://asaas.com
 *    - Vá em Configurações → Integrações → API
 *    - Copie a chave e cole em ASAAS_KEY abaixo
 *    - Para testes use a sandbox: https://sandbox.asaas.com
 *
 * DEPLOY:
 *    Suba este arquivo como src/Admin.jsx no GitHub
 *    Acesse: seusite.vercel.app/admin
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ══════════════════════════════════════════════════
const SUPABASE_URL  = "https://wnwlzcjlgbdcktjhsigx.supabase.co";
const SUPABASE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indud2x6Y2psZ2JkY2t0amhzaWd4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1ODk1MTMsImV4cCI6MjA5NDE2NTUxM30.1mvfIXexsCmFYec6CsbjNuKCiPN5NW2ZjsbtdtcHnZc";
const ASAAS_KEY     = "SUA-CHAVE-ASAAS";        // $aact_... (sandbox) ou $aas_... (produção)
const ASAAS_BASE    = "https://sandbox.asaas.com/api/v3"; // troque por api.asaas.com em produção
// ══════════════════════════════════════════════════

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Paleta NEXO ───────────────────────────────────
const C = {
  navy:"#0d1f3c", navyL:"#132240", navyM:"#1a2f52",
  blue:"#2f7fd4", blueD:"#1a5fb4",
  green:"#3cb96a", greenD:"#27a558",
  white:"#ffffff", muted:"rgba(255,255,255,0.45)",
  border:"rgba(255,255,255,0.08)", borderH:"rgba(255,255,255,0.2)",
  danger:"#f87171", warn:"#ffd080", purple:"#a78bfa",
};

function Logo({ size=28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="alg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4aa8f0"/><stop offset="100%" stopColor="#1a5fb4"/>
        </linearGradient>
        <linearGradient id="alg2" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#27a558"/><stop offset="100%" stopColor="#5dd48a"/>
        </linearGradient>
      </defs>
      <path d="M10 10 L32 10 L58 52 L50 62 Z" fill="url(#alg1)"/>
      <path d="M90 90 L68 90 L42 48 L50 38 Z" fill="url(#alg1)"/>
      <path d="M90 10 L68 10 L42 52 L50 62 Z" fill="url(#alg2)"/>
      <path d="M10 90 L32 90 L58 48 L50 38 Z" fill="url(#alg2)"/>
      <path d="M50 38 L58 48 L50 62 L42 48 Z" fill="white" opacity="0.9"/>
    </svg>
  );
}

const fmtBRL  = v => v ? `R$ ${Number(v).toLocaleString("pt-BR",{minimumFractionDigits:2})}` : "—";
const fmtDate = s => s ? new Date(s).toLocaleDateString("pt-BR") : "—";
const fmtBytes= b => !b?"—":b<1024?b+" B":b<1048576?(b/1024).toFixed(1)+" KB":(b/1048576).toFixed(1)+" MB";

const CATS = ["Societário","Fiscal","Licenças","Declarações","Relatórios","Guias","Outros"];

const TABS = [
  {id:"dashboard", icon:"📊", label:"Dashboard"},
  {id:"clientes",  icon:"👥", label:"Clientes"},
  {id:"documentos",icon:"📁", label:"Documentos"},
  {id:"boletos",   icon:"💳", label:"Boletos"},
  {id:"guias",     icon:"🗒️", label:"Guias"},
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'DM Sans',sans-serif;background:${C.navy}}
  input,select,textarea{font-family:'DM Sans',sans-serif}
  input:focus,select:focus,textarea:focus{outline:none;border-color:${C.blue}!important}
  input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.25)!important}
  .inp{background:rgba(255,255,255,.06)!important;border:1px solid ${C.border}!important;
       color:#fff!important;border-radius:9px;padding:10px 14px;width:100%;font-size:13px;transition:border-color .2s}
  .card{background:${C.navyL};border:1px solid ${C.border};border-radius:14px;padding:20px;transition:all .2s}
  .row{background:rgba(255,255,255,.03);border:1px solid ${C.border};border-radius:11px;
       padding:13px 16px;display:flex;align-items:center;justify-content:space-between;
       flex-wrap:wrap;gap:8px;transition:border-color .2s}
  .row:hover{border-color:${C.borderH}}
  .nav-item{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;
            cursor:pointer;transition:all .18s;color:${C.muted};font-size:13px;font-weight:600;
            border:none;background:transparent;font-family:'DM Sans',sans-serif;width:100%;text-align:left}
  .nav-item:hover{background:rgba(255,255,255,.06);color:#fff}
  .nav-item.on{background:linear-gradient(135deg,${C.blue},${C.blueD});color:#fff;box-shadow:0 4px 14px rgba(47,127,212,.3)}
  .btn{border:none;border-radius:8px;padding:9px 16px;font-size:13px;font-weight:700;
       cursor:pointer;font-family:'DM Sans',sans-serif;transition:opacity .15s;display:inline-flex;align-items:center;gap:6px}
  .btn:hover{opacity:.82} .btn:disabled{opacity:.38;cursor:not-allowed}
  .btn.blue{background:linear-gradient(135deg,${C.blue},${C.blueD});color:#fff;box-shadow:0 3px 12px rgba(47,127,212,.28)}
  .btn.green{background:linear-gradient(135deg,${C.green},${C.greenD});color:#fff}
  .btn.red{background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.25);color:#f87171}
  .btn.red:hover{background:rgba(239,68,68,.28)}
  .btn.ghost{background:rgba(255,255,255,.06);border:1px solid ${C.border};color:rgba(255,255,255,.7)}
  .btn.ghost:hover{border-color:${C.borderH};color:#fff}
  .btn.purple{background:linear-gradient(135deg,#7c3aed,#6d28d9);color:#fff}
  .btn.sm{padding:6px 12px;font-size:12px}
  .btn.lg{padding:12px 22px;font-size:14px}
  .badge{border-radius:20px;padding:3px 10px;font-size:11px;font-weight:600}
  .badge.pago{background:rgba(60,185,106,.2);color:${C.green}}
  .badge.pendente{background:rgba(255,180,60,.18);color:${C.warn}}
  .badge.erro{background:rgba(239,68,68,.18);color:#f87171}
  .badge.info{background:rgba(47,127,212,.2);color:#7ec8f8}
  .stat-card{background:${C.navyL};border:1px solid ${C.border};border-radius:14px;
             padding:20px;display:flex;flex-direction:column;gap:8px;transition:all .2s}
  .stat-card:hover{border-color:${C.borderH};transform:translateY(-2px)}
  .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.7);backdrop-filter:blur(4px);
            z-index:100;display:flex;align-items:center;justify-content:center;padding:20px}
  .modal{background:${C.navyL};border:1px solid ${C.border};border-radius:18px;
         padding:28px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;
         box-shadow:0 40px 100px rgba(0,0,0,.6);animation:up .3s ease}
  .drag{border:2px dashed ${C.border};border-radius:12px;padding:24px;text-align:center;cursor:pointer;transition:all .2s}
  .drag:hover,.drag.over{border-color:${C.blue};background:rgba(47,127,212,.07)}
  .progress{height:5px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden}
  .progress-bar{height:100%;border-radius:99px;background:linear-gradient(90deg,${C.blue},${C.green});transition:width .3s}
  .toast{position:fixed;bottom:24px;right:24px;z-index:9999;border-radius:12px;
         padding:13px 18px;font-size:13px;font-weight:600;display:flex;align-items:center;
         gap:9px;box-shadow:0 8px 32px rgba(0,0,0,.45);animation:up .3s ease;max-width:320px}
  .fade{animation:fd .3s ease}
  @keyframes fd{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes up{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  select option{background:${C.navyM}}
  label{color:${C.muted};font-size:11px;letter-spacing:.07em;text-transform:uppercase;display:block;margin-bottom:5px}
  .sep{border:none;border-top:1px solid ${C.border};margin:16px 0}
  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:2px}
`;

// ══════════════════════════════════════════════════════════════════════════
export default function AdminApp() {
  const [session,   setSession]   = useState(null);
  const [booting,   setBooting]   = useState(true);
  const [tab,       setTab]       = useState("dashboard");

  // auth
  const [email,     setEmail]     = useState("");
  const [senha,     setSenha]     = useState("");
  const [authErr,   setAuthErr]   = useState("");
  const [authBusy,  setAuthBusy]  = useState(false);

  // data
  const [clientes,  setClientes]  = useState([]);
  const [docs,      setDocs]      = useState([]);
  const [boletos,   setBoletos]   = useState([]);
  const [guias,     setGuias]     = useState([]);
  const [loading,   setLoading]   = useState(false);

  // modals
  const [modalNovoCliente,  setModalNovoCliente]  = useState(false);
  const [modalUploadDoc,    setModalUploadDoc]    = useState(false);
  const [modalNovoBoleto,   setModalNovoBoleto]   = useState(false);
  const [modalNovaGuia,     setModalNovaGuia]     = useState(false);

  // forms
  const [fCliente,  setFCliente]  = useState({nome:"",email:"",cnpj:"",senha:""});
  const [fDoc,      setFDoc]      = useState({cliente_id:"",categoria:"Fiscal",arquivo:null});
  const [fBoleto,   setFBoleto]   = useState({cliente_id:"",competencia:"",vencimento:"",valor:"",descricao:""});
  const [fGuia,     setFGuia]     = useState({cliente_id:"",tipo:"DAS – Simples Nacional",vencimento:"",valor:"",arquivo:null});

  const [uploading, setUploading] = useState(false);
  const [upPct,     setUpPct]     = useState(0);
  const [dragOver,  setDragOver]  = useState(false);
  const [busy,      setBusy]      = useState(false);
  const [toast,     setToast]     = useState(null);
  const fileRef = useRef();
  const guiaFileRef = useRef();

  const showToast = useCallback((msg, type="ok") => {
    setToast({msg,type}); setTimeout(()=>setToast(null), 3500);
  },[]);

  // ── Auth ──────────────────────────────────────────────────────────────
  useEffect(()=>{
    sb.auth.getSession().then(({data})=>{setSession(data.session);setBooting(false)});
    const {data:{subscription}} = sb.auth.onAuthStateChange((_,s)=>setSession(s));
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{ if(session){ loadAll(); } },[session]);

  const doLogin = async()=>{
    setAuthErr(""); setAuthBusy(true);
    const{error}=await sb.auth.signInWithPassword({email,password:senha});
    if(error) setAuthErr("E-mail ou senha incorretos.");
    setAuthBusy(false);
  };

  // ── Load all data ─────────────────────────────────────────────────────
  const loadAll = async()=>{
    setLoading(true);
    await Promise.all([loadClientes(), loadDocs(), loadBoletos(), loadGuias()]);
    setLoading(false);
  };

  const loadClientes = async()=>{
    const{data}=await sb.from("perfis").select("*").order("criado_em",{ascending:false});
    if(data) setClientes(data);
    else {
      // Fallback: busca usuários auth
      const{data:users}=await sb.auth.admin?.listUsers() || {data:null};
      if(users) setClientes(users.users||[]);
    }
  };

  const loadDocs = async()=>{
    const{data}=await sb.from("documentos").select("*").order("criado_em",{ascending:false});
    if(data) setDocs(data);
  };

  const loadBoletos = async()=>{
    const{data}=await sb.from("boletos").select("*").order("criado_em",{ascending:false});
    if(data) setBoletos(data);
  };

  const loadGuias = async()=>{
    const{data}=await sb.from("guias").select("*").order("criado_em",{ascending:false});
    if(data) setGuias(data);
  };

  // ── Criar cliente ─────────────────────────────────────────────────────
  const criarCliente = async()=>{
    if(!fCliente.email||!fCliente.senha){ showToast("Preencha e-mail e senha","err"); return; }
    setBusy(true);
    const{data,error}=await sb.auth.admin?.createUser({
      email: fCliente.email,
      password: fCliente.senha,
      email_confirm: true,
    }) || {data:null,error:{message:"Use Supabase Dashboard para criar usuários"}};

    if(error){
      // Alternativa: convite por e-mail
      const{error:e2}=await sb.auth.signUp({email:fCliente.email,password:fCliente.senha});
      if(e2){ showToast("Erro: "+e2.message,"err"); setBusy(false); return; }
    }

    // Salvar perfil
    if(data?.user || !error){
      await sb.from("perfis").upsert({
        id: data?.user?.id || crypto.randomUUID(),
        nome_empresa: fCliente.nome,
        cnpj: fCliente.cnpj,
        email: fCliente.email,
      });
    }

    showToast(`Cliente ${fCliente.email} criado!`);
    setModalNovoCliente(false);
    setFCliente({nome:"",email:"",cnpj:"",senha:""});
    await loadClientes();
    setBusy(false);
  };

  // Convidar por e-mail (método alternativo mais simples)
  const convidarCliente = async()=>{
    if(!fCliente.email){ showToast("Preencha o e-mail","err"); return; }
    setBusy(true);
    // Cria usuário com senha temporária e envia e-mail
    const tmpSenha = fCliente.senha || Math.random().toString(36).slice(-10)+"A1!";
    const{error}=await sb.auth.signUp({
      email: fCliente.email,
      password: tmpSenha,
      options:{ data:{ nome_empresa: fCliente.nome, cnpj: fCliente.cnpj } }
    });
    if(error){ showToast("Erro: "+error.message,"err"); setBusy(false); return; }
    showToast(`Convite enviado para ${fCliente.email}!`);
    setModalNovoCliente(false);
    setFCliente({nome:"",email:"",cnpj:"",senha:""});
    await loadClientes();
    setBusy(false);
  };

  // ── Upload documento ──────────────────────────────────────────────────
  const uploadDocumento = async()=>{
    if(!fDoc.arquivo||!fDoc.cliente_id){ showToast("Selecione o cliente e o arquivo","err"); return; }
    setUploading(true); setUpPct(0);
    const f = fDoc.arquivo;
    const path = `${fDoc.cliente_id}/${Date.now()}_${f.name}`;
    const iv = setInterval(()=>setUpPct(p=>Math.min(p+12,88)),200);
    const{error:se}=await sb.storage.from("documentos").upload(path,f,{upsert:false});
    clearInterval(iv);
    if(se){ showToast("Erro no upload: "+se.message,"err"); setUploading(false); return; }
    const{error:de}=await sb.from("documentos").insert({
      nome: f.name, categoria: fDoc.categoria,
      storage_path: path, tamanho: f.size,
      usuario_id: fDoc.cliente_id,
    });
    if(de){ showToast("Erro ao salvar","err"); }
    else { showToast(`${f.name} enviado ao cliente!`); }
    setUpPct(100);
    setTimeout(()=>{setUploading(false);setUpPct(0);},600);
    setModalUploadDoc(false);
    setFDoc({cliente_id:"",categoria:"Fiscal",arquivo:null});
    await loadDocs();
  };

  // ── Gerar boleto Asaas ────────────────────────────────────────────────
  const gerarBoleto = async()=>{
    if(!fBoleto.cliente_id||!fBoleto.valor||!fBoleto.vencimento){
      showToast("Preencha todos os campos","err"); return;
    }
    setBusy(true);

    // Busca customer Asaas ou cria
    const cliente = clientes.find(c=>c.id===fBoleto.cliente_id);

    let asaasId = cliente?.asaas_id;
    if(!asaasId){
      try{
        const res = await fetch(`${ASAAS_BASE}/customers`, {
          method:"POST",
          headers:{"Content-Type":"application/json","access_token":ASAAS_KEY},
          body: JSON.stringify({
            name: cliente?.nome_empresa||cliente?.email||"Cliente",
            cpfCnpj: (cliente?.cnpj||"").replace(/\D/g,""),
            email: cliente?.email,
          })
        });
        const cData = await res.json();
        asaasId = cData.id;
        // Salva asaas_id no perfil
        if(asaasId) await sb.from("perfis").update({asaas_id:asaasId}).eq("id",fBoleto.cliente_id);
      } catch(e){ showToast("Erro ao conectar com Asaas. Verifique a chave API.","err"); setBusy(false); return; }
    }

    // Cria cobrança
    let linhaDigitavel = "";
    let asaasBoletoId  = "";
    try{
      const res = await fetch(`${ASAAS_BASE}/payments`, {
        method:"POST",
        headers:{"Content-Type":"application/json","access_token":ASAAS_KEY},
        body: JSON.stringify({
          customer: asaasId,
          billingType: "BOLETO",
          value: parseFloat(fBoleto.valor),
          dueDate: fBoleto.vencimento,
          description: fBoleto.descricao||`Honorários ${fBoleto.competencia}`,
        })
      });
      const pData = await res.json();
      asaasBoletoId  = pData.id;
      linhaDigitavel = pData.bankSlipUrl||"";
      if(pData.errors){ showToast("Asaas: "+pData.errors[0]?.description,"err"); setBusy(false); return; }
    } catch(e){ showToast("Erro na API Asaas. Verifique a chave.","err"); setBusy(false); return; }

    // Salva no Supabase
    await sb.from("boletos").insert({
      usuario_id: fBoleto.cliente_id,
      competencia: fBoleto.competencia,
      vencimento: fBoleto.vencimento,
      valor: parseFloat(fBoleto.valor),
      linha_digitavel: linhaDigitavel,
      asaas_id: asaasBoletoId,
      status: "pendente",
    });

    showToast("Boleto gerado e enviado ao cliente!");
    setModalNovoBoleto(false);
    setFBoleto({cliente_id:"",competencia:"",vencimento:"",valor:"",descricao:""});
    await loadBoletos();
    setBusy(false);
  };

  // ── Adicionar guia ────────────────────────────────────────────────────
  const adicionarGuia = async()=>{
    if(!fGuia.cliente_id||!fGuia.valor||!fGuia.vencimento){
      showToast("Preencha todos os campos","err"); return;
    }
    setBusy(true);
    let storagePath = null;

    if(fGuia.arquivo){
      const f = fGuia.arquivo;
      const path = `${fGuia.cliente_id}/${Date.now()}_${f.name}`;
      const{error}=await sb.storage.from("documentos").upload(path,f,{upsert:false});
      if(!error) storagePath = path;
    }

    await sb.from("guias").insert({
      usuario_id: fGuia.cliente_id,
      tipo: fGuia.tipo,
      vencimento: fGuia.vencimento,
      valor: parseFloat(fGuia.valor),
      status: "pendente",
      storage_path: storagePath,
    });

    showToast("Guia adicionada!");
    setModalNovaGuia(false);
    setFGuia({cliente_id:"",tipo:"DAS – Simples Nacional",vencimento:"",valor:"",arquivo:null});
    await loadGuias();
    setBusy(false);
  };

  // ── Deletar ───────────────────────────────────────────────────────────
  const deletarDoc = async(doc)=>{
    if(!window.confirm(`Excluir "${doc.nome}"?`)) return;
    await sb.storage.from("documentos").remove([doc.storage_path]);
    await sb.from("documentos").delete().eq("id",doc.id);
    setDocs(p=>p.filter(d=>d.id!==doc.id));
    showToast("Documento excluído","info");
  };

  const deletarBoleto = async(b)=>{
    if(!window.confirm("Excluir este boleto?")) return;
    await sb.from("boletos").delete().eq("id",b.id);
    setBoletos(p=>p.filter(x=>x.id!==b.id));
    showToast("Boleto excluído","info");
  };

  const marcarBoletoComoPago = async(b)=>{
    await sb.from("boletos").update({status:"pago"}).eq("id",b.id);
    setBoletos(p=>p.map(x=>x.id===b.id?{...x,status:"pago"}:x));
    showToast("Boleto marcado como pago!");
  };

  const marcarGuiaComoPaga = async(g)=>{
    await sb.from("guias").update({status:"pago"}).eq("id",g.id);
    setGuias(p=>p.map(x=>x.id===g.id?{...x,status:"pago"}:x));
    showToast("Guia marcada como paga!");
  };

  // ── Stats ─────────────────────────────────────────────────────────────
  const stats = {
    clientes: clientes.length,
    docs: docs.length,
    boletosPendentes: boletos.filter(b=>b.status==="pendente").length,
    receitaMes: boletos.filter(b=>b.status==="pago").reduce((a,b)=>a+(b.valor||0),0),
    guiasPendentes: guias.filter(g=>g.status==="pendente").length,
  };

  // ─────────────────────────────────────────────────────────────────────
  if(booting) return(
    <div style={{minHeight:"100vh",background:C.navy,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center"}}><Logo size={48}/><p style={{color:C.muted,marginTop:12,fontSize:14}}>Carregando…</p></div>
    </div>
  );

  // LOGIN ADMIN
  if(!session) return(
    <div style={{minHeight:"100vh",background:C.navy,display:"flex",alignItems:"center",
                 justifyContent:"center",padding:20,
                 backgroundImage:`radial-gradient(ellipse at 30% 20%,rgba(47,127,212,.18) 0%,transparent 60%)`}}>
      <style>{CSS}</style>
      <div style={{width:"100%",maxWidth:400,background:"rgba(255,255,255,.04)",
                   border:`1px solid ${C.border}`,borderRadius:20,padding:"44px 36px",
                   backdropFilter:"blur(16px)",boxShadow:"0 40px 100px rgba(0,0,0,.5)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:10,marginBottom:10}}>
            <Logo size={40}/><span style={{fontSize:26,fontWeight:700,color:C.white,letterSpacing:".06em"}}>NEXO</span>
          </div>
          <div style={{display:"inline-block",background:"rgba(167,139,250,.15)",border:"1px solid rgba(167,139,250,.3)",
                       borderRadius:20,padding:"3px 14px",fontSize:11,fontWeight:600,color:C.purple,letterSpacing:".08em"}}>
            PAINEL ADMIN
          </div>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div>
            <label>E-mail</label>
            <input className="inp" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@nexo.com.br"/>
          </div>
          <div>
            <label>Senha</label>
            <input className="inp" type="password" value={senha} onChange={e=>setSenha(e.target.value)}
                   onKeyDown={e=>e.key==="Enter"&&doLogin()} placeholder="••••••••"/>
          </div>
          {authErr&&<p style={{color:C.danger,fontSize:13}}>⚠️ {authErr}</p>}
          <button className="btn blue lg" onClick={doLogin} disabled={authBusy} style={{marginTop:4,justifyContent:"center"}}>
            {authBusy?"Entrando…":"Entrar no Painel"}
          </button>
        </div>
      </div>
    </div>
  );

  // PAINEL ADMIN
  return(
    <div style={{minHeight:"100vh",background:C.navy,display:"flex"}}>
      <style>{CSS}</style>

      {/* Toast */}
      {toast&&(
        <div className="toast" style={{
          background:toast.type==="err"?"rgba(239,68,68,.18)":toast.type==="info"?"rgba(255,255,255,.07)":"rgba(60,185,106,.18)",
          border:`1px solid ${toast.type==="err"?"rgba(239,68,68,.4)":toast.type==="info"?"rgba(255,255,255,.15)":"rgba(60,185,106,.4)"}`,
          color:toast.type==="err"?C.danger:toast.type==="info"?"#ccc":C.green,
        }}>
          {toast.type==="err"?"❌":toast.type==="info"?"ℹ️":"✅"} {toast.msg}
        </div>
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{
        width:220,background:"rgba(13,31,60,.98)",borderRight:`1px solid ${C.border}`,
        padding:"0 12px 24px",display:"flex",flexDirection:"column",
        position:"sticky",top:0,height:"100vh",flexShrink:0,
      }}>
        <div style={{padding:"20px 8px 16px",borderBottom:`1px solid ${C.border}`,marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <Logo size={26}/>
            <span style={{fontSize:17,fontWeight:700,color:C.white,letterSpacing:".06em"}}>NEXO</span>
          </div>
          <div style={{background:"rgba(167,139,250,.15)",border:"1px solid rgba(167,139,250,.25)",
                       borderRadius:20,padding:"2px 10px",fontSize:10,fontWeight:700,
                       color:C.purple,letterSpacing:".1em",display:"inline-block"}}>
            ADMIN
          </div>
        </div>

        <nav style={{display:"flex",flexDirection:"column",gap:2,flex:1}}>
          {TABS.map(t=>(
            <button key={t.id} className={`nav-item${tab===t.id?" on":""}`} onClick={()=>setTab(t.id)}>
              <span style={{fontSize:16}}>{t.icon}</span>{t.label}
            </button>
          ))}
        </nav>

        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:12}}>
          <div style={{fontSize:11,color:C.muted,marginBottom:8,paddingLeft:8}}>{session.user.email}</div>
          <button className="btn ghost sm" onClick={()=>sb.auth.signOut()} style={{width:"100%",justifyContent:"center"}}>
            Sair
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{flex:1,padding:"24px",overflowY:"auto",minHeight:"100vh"}}>

        {/* ══ DASHBOARD ══ */}
        {tab==="dashboard"&&(
          <div className="fade">
            <div style={{marginBottom:24}}>
              <h1 style={{fontSize:22,fontWeight:700,color:C.white,marginBottom:4}}>Dashboard</h1>
              <p style={{fontSize:13,color:C.muted}}>Visão geral do escritório NEXO</p>
            </div>

            {/* Stats */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:24}}>
              {[
                {icon:"👥",label:"Clientes",val:stats.clientes,   color:C.blue},
                {icon:"📁",label:"Documentos",val:stats.docs,     color:C.green},
                {icon:"💳",label:"Boletos pendentes",val:stats.boletosPendentes, color:C.warn},
                {icon:"💰",label:"Receita paga",val:fmtBRL(stats.receitaMes), color:C.green},
                {icon:"🗒️",label:"Guias pendentes",val:stats.guiasPendentes, color:C.danger},
              ].map(s=>(
                <div key={s.label} className="stat-card">
                  <div style={{fontSize:22}}>{s.icon}</div>
                  <div style={{fontSize:26,fontWeight:700,color:s.color}}>{s.val}</div>
                  <div style={{fontSize:12,color:C.muted}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Ações rápidas */}
            <div className="card" style={{marginBottom:16}}>
              <div style={{fontSize:14,fontWeight:700,color:C.white,marginBottom:14}}>⚡ Ações Rápidas</div>
              <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                <button className="btn blue" onClick={()=>setModalNovoCliente(true)}>👤 Novo Cliente</button>
                <button className="btn green" onClick={()=>setModalUploadDoc(true)}>📤 Enviar Documento</button>
                <button className="btn purple" onClick={()=>setModalNovoBoleto(true)}>💳 Gerar Boleto</button>
                <button className="btn ghost" onClick={()=>setModalNovaGuia(true)}>🗒️ Adicionar Guia</button>
              </div>
            </div>

            {/* Últimos boletos */}
            <div className="card">
              <div style={{fontSize:14,fontWeight:700,color:C.white,marginBottom:14}}>💳 Boletos Recentes</div>
              {boletos.slice(0,5).length===0?(
                <div style={{textAlign:"center",padding:"24px 0",color:C.muted,fontSize:13}}>Nenhum boleto ainda.</div>
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {boletos.slice(0,5).map(b=>(
                    <div key={b.id} className="row">
                      <div>
                        <div style={{fontWeight:600,color:C.white,fontSize:13}}>{b.competencia||"—"}</div>
                        <div style={{fontSize:11,color:C.muted}}>Venc: {fmtDate(b.vencimento)}</div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontWeight:700,color:C.white}}>{fmtBRL(b.valor)}</span>
                        <span className={`badge ${b.status}`}>{b.status==="pago"?"✓ Pago":"Pendente"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ CLIENTES ══ */}
        {tab==="clientes"&&(
          <div className="fade">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
              <div>
                <h1 style={{fontSize:20,fontWeight:700,color:C.white,marginBottom:2}}>👥 Clientes</h1>
                <p style={{fontSize:12,color:C.muted}}>{clientes.length} cliente(s) cadastrado(s)</p>
              </div>
              <button className="btn blue" onClick={()=>setModalNovoCliente(true)}>+ Novo Cliente</button>
            </div>
            {clientes.length===0?(
              <div style={{textAlign:"center",padding:"48px 0",border:`1px dashed ${C.border}`,borderRadius:14}}>
                <div style={{fontSize:32,marginBottom:10}}>👥</div>
                <div style={{fontSize:13,color:C.muted,marginBottom:16}}>Nenhum cliente cadastrado.</div>
                <button className="btn blue" onClick={()=>setModalNovoCliente(true)}>Cadastrar primeiro cliente</button>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {clientes.map(c=>(
                  <div key={c.id} className="row" style={{background:C.navyL,borderRadius:12,padding:"15px 18px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:38,height:38,borderRadius:"50%",
                                   background:`linear-gradient(135deg,${C.blue},${C.green})`,
                                   display:"flex",alignItems:"center",justifyContent:"center",
                                   fontSize:14,fontWeight:700,color:"#fff",flexShrink:0}}>
                        {(c.nome_empresa||c.email||"?")[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontWeight:600,color:C.white,fontSize:14}}>{c.nome_empresa||c.email}</div>
                        <div style={{fontSize:11,color:C.muted,marginTop:1}}>{c.cnpj||c.email} · desde {fmtDate(c.criado_em)}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button className="btn green sm" onClick={()=>{setFDoc(p=>({...p,cliente_id:c.id}));setModalUploadDoc(true);}}>
                        📤 Enviar doc
                      </button>
                      <button className="btn purple sm" onClick={()=>{setFBoleto(p=>({...p,cliente_id:c.id}));setModalNovoBoleto(true);}}>
                        💳 Boleto
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ DOCUMENTOS ══ */}
        {tab==="documentos"&&(
          <div className="fade">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
              <div>
                <h1 style={{fontSize:20,fontWeight:700,color:C.white,marginBottom:2}}>📁 Documentos</h1>
                <p style={{fontSize:12,color:C.muted}}>{docs.length} documento(s) enviado(s)</p>
              </div>
              <button className="btn green" onClick={()=>setModalUploadDoc(true)}>📤 Enviar Documento</button>
            </div>
            {docs.length===0?(
              <div style={{textAlign:"center",padding:"48px 0",border:`1px dashed ${C.border}`,borderRadius:14}}>
                <div style={{fontSize:32,marginBottom:10}}>📁</div>
                <div style={{fontSize:13,color:C.muted}}>Nenhum documento enviado.</div>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {docs.map(d=>(
                  <div key={d.id} className="row" style={{background:C.navyL,borderRadius:12,padding:"13px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0}}>
                      <div style={{width:34,height:34,borderRadius:8,background:"rgba(255,255,255,.06)",
                                   display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0}}>
                        {d.nome?.endsWith(".pdf")?"📕":d.nome?.match(/\.(doc|docx)$/)?"📘":"📄"}
                      </div>
                      <div style={{minWidth:0}}>
                        <div style={{fontWeight:600,color:C.white,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:280}}>{d.nome}</div>
                        <div style={{fontSize:11,color:C.muted,marginTop:1}}>{d.categoria} · {fmtDate(d.criado_em)} · {fmtBytes(d.tamanho)}</div>
                      </div>
                    </div>
                    <button className="btn red sm" onClick={()=>deletarDoc(d)}>🗑</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ BOLETOS ══ */}
        {tab==="boletos"&&(
          <div className="fade">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
              <div>
                <h1 style={{fontSize:20,fontWeight:700,color:C.white,marginBottom:2}}>💳 Boletos</h1>
                <p style={{fontSize:12,color:C.muted}}>{stats.boletosPendentes} pendente(s)</p>
              </div>
              <button className="btn purple" onClick={()=>setModalNovoBoleto(true)}>+ Gerar Boleto</button>
            </div>

            {/* Info API */}
            <div style={{background:"rgba(167,139,250,.1)",border:"1px solid rgba(167,139,250,.25)",
                         borderRadius:12,padding:"12px 16px",marginBottom:16,
                         display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:18}}>🔌</span>
              <div style={{fontSize:12,color:"rgba(255,255,255,.7)"}}>
                Integração via <strong style={{color:C.white}}>API Asaas</strong> — boletos gerados automaticamente e enviados por e-mail ao cliente.
                Configure sua chave em <code style={{background:"rgba(255,255,255,.1)",padding:"1px 6px",borderRadius:4,color:C.purple}}>ASAAS_KEY</code> no arquivo.
              </div>
            </div>

            {boletos.length===0?(
              <div style={{textAlign:"center",padding:"48px 0",border:`1px dashed ${C.border}`,borderRadius:14}}>
                <div style={{fontSize:32,marginBottom:10}}>💳</div>
                <div style={{fontSize:13,color:C.muted,marginBottom:16}}>Nenhum boleto gerado.</div>
                <button className="btn purple" onClick={()=>setModalNovoBoleto(true)}>Gerar primeiro boleto</button>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {boletos.map(b=>(
                  <div key={b.id} className="row" style={{background:C.navyL,borderRadius:12,padding:"14px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:36,height:36,borderRadius:9,background:"rgba(167,139,250,.15)",
                                   display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>💳</div>
                      <div>
                        <div style={{fontWeight:600,color:C.white,fontSize:13}}>{b.competencia||"Mensalidade"}</div>
                        <div style={{fontSize:11,color:C.muted,marginTop:1}}>Venc: {fmtDate(b.vencimento)}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontWeight:700,color:C.white,fontSize:15}}>{fmtBRL(b.valor)}</span>
                      <span className={`badge ${b.status}`}>{b.status==="pago"?"✓ Pago":"Pendente"}</span>
                      {b.status==="pendente"&&(
                        <button className="btn green sm" onClick={()=>marcarBoletoComoPago(b)}>✓ Pago</button>
                      )}
                      <button className="btn red sm" onClick={()=>deletarBoleto(b)}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══ GUIAS ══ */}
        {tab==="guias"&&(
          <div className="fade">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
              <div>
                <h1 style={{fontSize:20,fontWeight:700,color:C.white,marginBottom:2}}>🗒️ Guias de Impostos</h1>
                <p style={{fontSize:12,color:C.muted}}>{stats.guiasPendentes} pendente(s)</p>
              </div>
              <button className="btn blue" onClick={()=>setModalNovaGuia(true)}>+ Adicionar Guia</button>
            </div>
            {guias.length===0?(
              <div style={{textAlign:"center",padding:"48px 0",border:`1px dashed ${C.border}`,borderRadius:14}}>
                <div style={{fontSize:32,marginBottom:10}}>🗒️</div>
                <div style={{fontSize:13,color:C.muted,marginBottom:16}}>Nenhuma guia adicionada.</div>
                <button className="btn blue" onClick={()=>setModalNovaGuia(true)}>Adicionar guia</button>
              </div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {guias.map(g=>(
                  <div key={g.id} className="row" style={{background:C.navyL,borderRadius:12,padding:"14px 16px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12}}>
                      <div style={{width:36,height:36,borderRadius:9,background:"rgba(47,127,212,.15)",
                                   display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🗒️</div>
                      <div>
                        <div style={{fontWeight:600,color:C.white,fontSize:13}}>{g.tipo}</div>
                        <div style={{fontSize:11,color:C.muted,marginTop:1}}>Venc: {fmtDate(g.vencimento)}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontWeight:700,color:C.white,fontSize:15}}>{fmtBRL(g.valor)}</span>
                      <span className={`badge ${g.status}`}>{g.status==="pago"?"✓ Pago":"Pendente"}</span>
                      {g.status==="pendente"&&(
                        <button className="btn green sm" onClick={()=>marcarGuiaComoPaga(g)}>✓ Pago</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ══════════ MODAIS ══════════ */}

      {/* Modal: Novo Cliente */}
      {modalNovoCliente&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setModalNovoCliente(false)}>
          <div className="modal">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:16,fontWeight:700,color:C.white}}>👤 Cadastrar Novo Cliente</div>
              <button className="btn ghost sm" onClick={()=>setModalNovoCliente(false)}>✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              <div><label>Nome da empresa</label><input className="inp" value={fCliente.nome} onChange={e=>setFCliente(p=>({...p,nome:e.target.value}))} placeholder="Ex: Silva & Filhos Ltda"/></div>
              <div><label>CNPJ</label><input className="inp" value={fCliente.cnpj} onChange={e=>setFCliente(p=>({...p,cnpj:e.target.value}))} placeholder="00.000.000/0001-00"/></div>
              <div><label>E-mail do cliente *</label><input className="inp" value={fCliente.email} onChange={e=>setFCliente(p=>({...p,email:e.target.value}))} placeholder="cliente@empresa.com"/></div>
              <div><label>Senha de acesso *</label><input className="inp" type="password" value={fCliente.senha} onChange={e=>setFCliente(p=>({...p,senha:e.target.value}))} placeholder="Mínimo 6 caracteres"/></div>
              <div style={{background:"rgba(255,255,255,.04)",borderRadius:10,padding:"10px 14px",fontSize:12,color:C.muted}}>
                💡 O cliente receberá acesso ao portal com este e-mail e senha.
              </div>
              <div style={{display:"flex",gap:8,marginTop:4}}>
                <button className="btn blue lg" onClick={convidarCliente} disabled={busy} style={{flex:1,justifyContent:"center"}}>
                  {busy?"Criando…":"✓ Criar Cliente"}
                </button>
                <button className="btn ghost" onClick={()=>setModalNovoCliente(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Upload Documento */}
      {modalUploadDoc&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setModalUploadDoc(false)}>
          <div className="modal">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:16,fontWeight:700,color:C.white}}>📤 Enviar Documento ao Cliente</div>
              <button className="btn ghost sm" onClick={()=>setModalUploadDoc(false)}>✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              <div>
                <label>Cliente *</label>
                <select value={fDoc.cliente_id} onChange={e=>setFDoc(p=>({...p,cliente_id:e.target.value}))}
                  style={{background:C.navyM,border:`1px solid ${C.border}`,color:fDoc.cliente_id?"#fff":"rgba(255,255,255,.3)",
                          borderRadius:9,padding:"10px 14px",width:"100%",fontSize:13}}>
                  <option value="">Selecione o cliente…</option>
                  {clientes.map(c=><option key={c.id} value={c.id}>{c.nome_empresa||c.email}</option>)}
                </select>
              </div>
              <div>
                <label>Categoria</label>
                <select value={fDoc.categoria} onChange={e=>setFDoc(p=>({...p,categoria:e.target.value}))}
                  style={{background:C.navyM,border:`1px solid ${C.border}`,color:"#fff",
                          borderRadius:9,padding:"10px 14px",width:"100%",fontSize:13}}>
                  {CATS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label>Arquivo *</label>
                <div className={`drag${dragOver?" over":""}`}
                     onClick={()=>fileRef.current.click()}
                     onDragOver={e=>{e.preventDefault();setDragOver(true)}}
                     onDragLeave={()=>setDragOver(false)}
                     onDrop={e=>{e.preventDefault();setDragOver(false);setFDoc(p=>({...p,arquivo:e.dataTransfer.files[0]}))}}>
                  <input ref={fileRef} type="file" style={{display:"none"}}
                         onChange={e=>setFDoc(p=>({...p,arquivo:e.target.files[0]}))}/>
                  {fDoc.arquivo?(
                    <div style={{fontSize:13,color:C.green,fontWeight:600}}>✓ {fDoc.arquivo.name}</div>
                  ):(
                    <><div style={{fontSize:22,marginBottom:6}}>📄</div>
                    <div style={{fontSize:13,color:C.white,fontWeight:600}}>Clique ou arraste o arquivo</div></>
                  )}
                </div>
              </div>
              {uploading&&(
                <div>
                  <div style={{fontSize:12,color:C.muted,marginBottom:6}}>Enviando… {upPct}%</div>
                  <div className="progress"><div className="progress-bar" style={{width:`${upPct}%`}}/></div>
                </div>
              )}
              <div style={{display:"flex",gap:8,marginTop:4}}>
                <button className="btn green lg" onClick={uploadDocumento} disabled={uploading||!fDoc.arquivo||!fDoc.cliente_id} style={{flex:1,justifyContent:"center"}}>
                  {uploading?"Enviando…":"📤 Enviar Documento"}
                </button>
                <button className="btn ghost" onClick={()=>setModalUploadDoc(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo Boleto */}
      {modalNovoBoleto&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setModalNovoBoleto(false)}>
          <div className="modal">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:16,fontWeight:700,color:C.white}}>💳 Gerar Boleto de Mensalidade</div>
              <button className="btn ghost sm" onClick={()=>setModalNovoBoleto(false)}>✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              <div>
                <label>Cliente *</label>
                <select value={fBoleto.cliente_id} onChange={e=>setFBoleto(p=>({...p,cliente_id:e.target.value}))}
                  style={{background:C.navyM,border:`1px solid ${C.border}`,color:fBoleto.cliente_id?"#fff":"rgba(255,255,255,.3)",
                          borderRadius:9,padding:"10px 14px",width:"100%",fontSize:13}}>
                  <option value="">Selecione o cliente…</option>
                  {clientes.map(c=><option key={c.id} value={c.id}>{c.nome_empresa||c.email}</option>)}
                </select>
              </div>
              <div><label>Competência</label><input className="inp" value={fBoleto.competencia} onChange={e=>setFBoleto(p=>({...p,competencia:e.target.value}))} placeholder="Ex: Junho/2026"/></div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><label>Vencimento *</label><input className="inp" type="date" value={fBoleto.vencimento} onChange={e=>setFBoleto(p=>({...p,vencimento:e.target.value}))}/></div>
                <div><label>Valor (R$) *</label><input className="inp" type="number" step="0.01" value={fBoleto.valor} onChange={e=>setFBoleto(p=>({...p,valor:e.target.value}))} placeholder="650.00"/></div>
              </div>
              <div><label>Descrição</label><input className="inp" value={fBoleto.descricao} onChange={e=>setFBoleto(p=>({...p,descricao:e.target.value}))} placeholder="Honorários contábeis – Junho/2026"/></div>
              <div style={{background:"rgba(167,139,250,.08)",border:"1px solid rgba(167,139,250,.2)",
                           borderRadius:10,padding:"10px 14px",fontSize:12,color:"rgba(255,255,255,.6)"}}>
                🔌 O boleto será gerado via <strong style={{color:C.white}}>Asaas</strong> e enviado automaticamente por e-mail ao cliente.
              </div>
              <div style={{display:"flex",gap:8,marginTop:4}}>
                <button className="btn purple lg" onClick={gerarBoleto} disabled={busy} style={{flex:1,justifyContent:"center"}}>
                  {busy?"Gerando…":"💳 Gerar Boleto"}
                </button>
                <button className="btn ghost" onClick={()=>setModalNovoBoleto(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nova Guia */}
      {modalNovaGuia&&(
        <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&setModalNovaGuia(false)}>
          <div className="modal">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <div style={{fontSize:16,fontWeight:700,color:C.white}}>🗒️ Adicionar Guia de Imposto</div>
              <button className="btn ghost sm" onClick={()=>setModalNovaGuia(false)}>✕</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:13}}>
              <div>
                <label>Cliente *</label>
                <select value={fGuia.cliente_id} onChange={e=>setFGuia(p=>({...p,cliente_id:e.target.value}))}
                  style={{background:C.navyM,border:`1px solid ${C.border}`,color:fGuia.cliente_id?"#fff":"rgba(255,255,255,.3)",
                          borderRadius:9,padding:"10px 14px",width:"100%",fontSize:13}}>
                  <option value="">Selecione o cliente…</option>
                  {clientes.map(c=><option key={c.id} value={c.id}>{c.nome_empresa||c.email}</option>)}
                </select>
              </div>
              <div>
                <label>Tipo de guia</label>
                <select value={fGuia.tipo} onChange={e=>setFGuia(p=>({...p,tipo:e.target.value}))}
                  style={{background:C.navyM,border:`1px solid ${C.border}`,color:"#fff",borderRadius:9,padding:"10px 14px",width:"100%",fontSize:13}}>
                  {["DAS – Simples Nacional","FGTS","GPS – INSS","DARF – IRPJ","DARF – CSLL","ISS","ICMS","Outros"].map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div><label>Vencimento *</label><input className="inp" type="date" value={fGuia.vencimento} onChange={e=>setFGuia(p=>({...p,vencimento:e.target.value}))}/></div>
                <div><label>Valor (R$) *</label><input className="inp" type="number" step="0.01" value={fGuia.valor} onChange={e=>setFGuia(p=>({...p,valor:e.target.value}))} placeholder="1240.00"/></div>
              </div>
              <div>
                <label>Anexar PDF da guia (opcional)</label>
                <div className="drag" style={{padding:"16px"}} onClick={()=>guiaFileRef.current.click()}>
                  <input ref={guiaFileRef} type="file" accept=".pdf" style={{display:"none"}}
                         onChange={e=>setFGuia(p=>({...p,arquivo:e.target.files[0]}))}/>
                  {fGuia.arquivo?(
                    <div style={{fontSize:13,color:C.green,fontWeight:600}}>✓ {fGuia.arquivo.name}</div>
                  ):(
                    <div style={{fontSize:13,color:C.muted}}>📎 Clique para anexar PDF</div>
                  )}
                </div>
              </div>
              <div style={{display:"flex",gap:8,marginTop:4}}>
                <button className="btn blue lg" onClick={adicionarGuia} disabled={busy} style={{flex:1,justifyContent:"center"}}>
                  {busy?"Salvando…":"🗒️ Adicionar Guia"}
                </button>
                <button className="btn ghost" onClick={()=>setModalNovaGuia(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
