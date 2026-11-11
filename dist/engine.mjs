export const POLICY_VERSION = 'AP-2026.2';
export const VENDORS = [
  {id:'V-101',name:'Northstar Studio LLC',aliases:['Northstar Studio','Northstar Studio LLC'],status:'active'},
  {id:'V-102',name:'Harbor Cloud Inc',aliases:['Harbor Cloud','Harbor Cloud Inc'],status:'active'},
  {id:'V-103',name:'Cedar Office Supply Co',aliases:['Cedar Office Supply','Cedar Office Supply Co'],status:'active'},
  {id:'V-104',name:'Summit Services Ltd',aliases:['Summit Services','Summit Services Ltd'],status:'suspended'}
];
export const DEFAULT_POS = [
  {id:'PO-1001',vendorId:'V-101',description:'Brand design retainer',currency:'USD',total:500000,committed:0,status:'open'},
  {id:'PO-1002',vendorId:'V-102',description:'Cloud infrastructure - Q4',currency:'USD',total:1000000,committed:600000,status:'open'},
  {id:'PO-1003',vendorId:'V-103',description:'Office furniture - east wing',currency:'USD',total:300000,committed:0,status:'open'},
  {id:'PO-1004',vendorId:'V-103',description:'Office furniture - west wing',currency:'USD',total:300000,committed:0,status:'open'},
  {id:'PO-1005',vendorId:'V-104',description:'Facilities maintenance',currency:'USD',total:200000,committed:0,status:'open'}
];
export const emptyState = () => ({version:1,revision:0,runs:[],pos:structuredClone(DEFAULT_POS)});
export const normalize = s => String(s??'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
export function money(cents,currency='USD') { try {return new Intl.NumberFormat('en-US',{style:'currency',currency}).format((cents||0)/100);}catch{return `${currency} ${(cents||0)/100}`;} }
export function cents(value) {
  if (typeof value !== 'string') return null;
  const s=value.trim().replace(/^(?:USD|EUR|GBP|INR|\$|€|£)\s*/i,'').replace(/\s*(?:USD|EUR|GBP|INR)$/i,'');
  if(!/^-?(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(s))return null;
  const [whole,frac='']=s.replaceAll(',','').split('.');
  const n=Number(whole)*100+(whole.startsWith('-')?-1:1)*Number(frac.padEnd(2,'0'));
  return Number.isSafeInteger(n)?n:null;
}
export function extractInvoice(text) {
  const lines=text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const sources={},warnings=[];
  function field(key,pattern,convert=x=>x.trim()) {
    const matches=lines.map((line,i)=>({m:line.match(pattern),line,lineNumber:i+1})).filter(x=>x.m);
    const values=matches.map(x=>convert(x.m[1]));
    if(new Set(values.map(x=>JSON.stringify(x))).size>1)warnings.push(`Conflicting ${key} values; verify the original document.`);
    if(matches.length)sources[key]={line:matches[0].line,lineNumber:matches[0].lineNumber};
    return values[0]??null;
  }
  const result={
    vendor:field('vendor',/^(?:Vendor|Supplier|From)(?:\s*:\s*|\s+)(.+)$/i),
    invoiceNumber:field('invoiceNumber',/^(?:Invoice\s*(?:number|no\.?|#)|Invoice ID)(?:\s*:\s*|\s+)(.+)$/i),
    date:field('date',/^(?:Invoice\s*date|Date)(?:\s*:\s*|\s+)(.+)$/i),
    po:field('po',/^(?:PO(?:\s*(?:number|no\.?|reference))?|Purchase order)(?:\s*:\s*|\s+)(PO-[A-Z0-9-]+)$/i,x=>x.trim().toUpperCase()),
    currency:field('currency',/^Currency(?:\s*:\s*|\s+)([A-Z]{3})$/i,x=>x.toUpperCase()),
    subtotal:field('subtotal',/^(?:Subtotal|Net amount)(?:\s*:\s*|\s+)(.+)$/i,cents),
    tax:field('tax',/^(?:Tax|Sales tax|VAT|GST)(?:\s*\([^)]+\))?(?:\s*:\s*|\s+)(.+)$/i,cents),
    total:field('total',/^(?:Total|Grand total|Amount due|Invoice total)(?:\s*:\s*|\s+)(.+)$/i,cents)
  };
  for(const key of ['subtotal','tax','total']) {
    const line=sources[key]?.line||'';
    const currencies=line.match(/\b(?:USD|EUR|GBP|INR)\b/gi)||[];
    if(line.includes('$'))currencies.push('USD');
    if(/[€£]/.test(line))currencies.push(line.includes('€')?'EUR':'GBP');
    if(result.currency&&currencies.some(c=>c.toUpperCase()!==result.currency))warnings.push(`Currency on ${key} conflicts with declared ${result.currency}; verify the source.`);
  }
  const items=[];
  for(const [i,line] of lines.entries()) {
    const m=line.match(/^Item\s*:\s*(.+?)\s*\|\s*Qty\s*:\s*(\d+(?:\.\d+)?)\s*\|\s*Unit\s*:\s*(.+?)\s*\|\s*Amount\s*:\s*(.+)$/i);
    if(m)items.push({description:m[1],quantity:Number(m[2]),unit:cents(m[3]),amount:cents(m[4]),lineNumber:i+1});
  }
  return {...result,items,sources,warnings,textCharacters:text.trim().length};
}
export const remainingFor = (po,state) => po.total-po.committed-state.runs.filter(r=>r.status==='Approved'&&r.matchedPo===po.id).reduce((s,r)=>s+r.fields.total,0);
export function evaluate(fields,state,{hash='',today=new Date().toISOString().slice(0,10),excludeId=null}={}) {
  state={...state,runs:state.runs.filter(r=>r.id!==excludeId)};
  const checks=[];
  const add=(code,label,result,detail)=>checks.push({code,label,result,detail});
  const vendor=VENDORS.find(v=>v.aliases.some(a=>normalize(a)===normalize(fields.vendor)));
  const duplicates=state.runs.filter(r=>r.status==='Approved'&&((hash&&r.hash===hash)||(vendor&&r.vendorId===vendor.id&&normalize(r.fields.invoiceNumber)===normalize(fields.invoiceNumber)&&fields.invoiceNumber)));
  add('duplicate','Duplicate protection',duplicates.length?'block':'pass',duplicates.length?`Already approved in ${duplicates[0].id}. No second commitment was created.`:'No previously approved invoice matches this file or supplier + invoice number.');
  const required=['vendor','invoiceNumber','date','currency','subtotal','tax','total'];
  const missing=required.filter(k=>fields[k]===null||fields[k]===undefined||fields[k]==='');
  add('required','Required invoice fields',missing.length?'review':'pass',missing.length?`Missing or unreadable: ${missing.join(', ')}. Verify against the source PDF.`:'Supplier, invoice number, date, currency, subtotal, tax and total are present.');
  const iso=/^\d{4}-\d{2}-\d{2}$/.test(fields.date||'');
  const dt=iso?new Date(`${fields.date}T00:00:00Z`):null;
  const validDate=dt&&!Number.isNaN(dt.getTime())&&dt.toISOString().slice(0,10)===fields.date;
  add('date','Invoice date',validDate&&fields.date<=today?'pass':'review',validDate&&fields.date<=today?`Valid date: ${fields.date}.`:'Use a real ISO date (YYYY-MM-DD) that is not in the future.');
  add('vendor','Approved supplier',vendor?.status==='active'?'pass':vendor?'block':'review',vendor?.status==='active'?`${vendor.name} is active in the supplier register.`:vendor?'Supplier is suspended. Procurement must resolve the suspension.':'No unique approved supplier alias was found. Confirm supplier identity.');
  const amounts=['subtotal','tax','total'].every(k=>Number.isSafeInteger(fields[k])&&fields[k]>=0)&&fields.total>0;
  const arithmetic=amounts&&fields.subtotal+fields.tax===fields.total;
  const itemValid=!fields.items?.length||fields.items.every(i=>Number.isFinite(i.quantity)&&i.quantity>0&&Number.isSafeInteger(i.unit)&&i.unit>=0&&Number.isSafeInteger(i.amount)&&i.amount>=0&&Math.abs(Math.round(i.quantity*i.unit)-i.amount)<=1)&&Math.abs(fields.items.reduce((s,i)=>s+i.amount,0)-fields.subtotal)<=1;
  add('arithmetic','Amount reconciliation',arithmetic&&itemValid?'pass':'review',arithmetic&&itemValid?`Subtotal + tax = total. ${fields.items?.length?`${fields.items.length} item(s) reconcile to subtotal.`:'Bundled invoice: totals checked; no structured item rows found.'}`:'Totals or item arithmetic do not reconcile. Negative values and credit notes need a separate workflow.');
  add('extraction','Extraction consistency',fields.warnings?.length?'review':'pass',fields.warnings?.join(' ')||'No conflicting labeled values detected. No values were inferred from an AI model.');
  let po=null,candidates=[];
  if(fields.po){po=state.pos.find(p=>normalize(p.id)===normalize(fields.po));if(po)candidates=[po];}
  else if(vendor)candidates=state.pos.filter(p=>p.vendorId===vendor.id&&p.currency===fields.currency&&p.status==='open');
  add('po','Purchase order match',po?'pass':'review',po?`Explicit reference matched ${po.id}.`:fields.po?`Reference ${fields.po} is not in the PO register.`:candidates.length?`No explicit PO. ${candidates.length} candidate(s): ${candidates.map(p=>p.id).join(', ')}. AP must verify the intended PO.`:'No explicit PO and no eligible candidate. Ask the supplier for a PO.');
  if(po){
    add('po-vendor','Supplier and PO consistency',po.vendorId===vendor?.id?'pass':vendor?'block':'review',po.vendorId===vendor?.id?'Invoice supplier owns the matched PO.':vendor?'Invoice supplier does not own the referenced PO. Do not process against another supplier.':'Supplier identity must be verified before comparing it with the PO owner.');
    add('currency','Currency and PO status',po.currency===fields.currency&&po.status==='open'?'pass':'review',po.currency===fields.currency&&po.status==='open'?`${po.currency}, open PO; no currency conversion required.`:'Currency mismatch or closed PO. Obtain a corrected invoice or an authorized PO.');
    const remaining=remainingFor(po,state),tolerance=Math.min(Math.round(po.total*0.02),2500);
    const within=amounts&&fields.total<=remaining+tolerance;
    add('balance','Cumulative PO budget',within?'pass':'review',`${money(remaining,po.currency)} uncommitted + ${money(tolerance,po.currency)} tolerance. Invoice ${money(fields.total,fields.currency||po.currency)}${within?' fits.':` exceeds by ${money(fields.total-remaining-tolerance,po.currency)}. Request an amended PO.`}`);
  }
  const status=checks.some(c=>c.result==='block')?'Blocked':checks.some(c=>c.result==='review')?'Needs review':'Approved';
  const reasons=checks.filter(c=>c.result!=='pass');
  const nextAction=status==='Approved'?'Ready for AP posting. Approval reserves the PO budget in this browser; no payment is initiated.':reasons.map(c=>c.detail).join(' ');
  return {status,checks,vendorId:vendor?.id??null,matchedPo:po?.id??null,candidates:candidates.map(p=>p.id),nextAction,summary:status==='Approved'?'All controls passed. Ready for AP.':reasons[0]?.detail,policyVersion:POLICY_VERSION};
}
export function parsePoCsv(csv,state) {
  const rows=csv.trim().split(/\r?\n/).filter(Boolean).map(l=>l.split(',').map(x=>x.trim()));
  const header=['id','vendorId','description','currency','total','committed','status'];
  if(rows[0]?.join(',')!==header.join(','))throw new Error('Use the exact CSV header: '+header.join(','));
  if(rows.length<2||rows.length>501)throw new Error('Import 1 to 500 PO rows.');
  const seen=new Set();
  return rows.slice(1).map((r,i)=>{
    if(r.length!==7)throw new Error(`Row ${i+2}: seven columns required; avoid commas inside descriptions.`);
    const o=Object.fromEntries(header.map((h,j)=>[h,r[j]]));
    if(!/^PO-[A-Z0-9-]{1,30}$/.test(o.id)||seen.has(o.id))throw new Error(`Row ${i+2}: invalid or duplicate PO ID.`);
    seen.add(o.id);
    if(!VENDORS.some(v=>v.id===o.vendorId))throw new Error(`Row ${i+2}: unknown supplier ID.`);
    o.total=cents(o.total);o.committed=cents(o.committed);
    if(!['USD','EUR','GBP','INR'].includes(o.currency)||!['open','closed'].includes(o.status)||!Number.isSafeInteger(o.total)||o.total<=0||!Number.isSafeInteger(o.committed)||o.committed<0||o.committed>o.total||!o.description)throw new Error(`Row ${i+2}: check currency, positive total, opening commitment, description and status.`);
    return o;
  });
}

export function correctInvoiceFields(original,values,reviewer){
 const fields=structuredClone(original);fields.sources={...fields.sources};
 for(const key of ['vendor','invoiceNumber','date','po','currency','subtotal','tax','total']){
  fields[key]=['subtotal','tax','total'].includes(key)?cents(values[key]):String(values[key]??'').trim();
  fields.sources[key]={line:`Verified by ${reviewer}`,reviewed:true};
 }
 fields.warnings=[];
 // Header corrections never erase the line-item arithmetic evidence.
 return fields;
}
