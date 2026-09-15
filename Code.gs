/* BACKEND GOOGLE APPS SCRIPT. Jangan unggah file ini ke GitHub publik jika berisi token asli. */
const SPREADSHEET_ID = 'https://docs.google.com/spreadsheets/d/16lFhbAVCZacX7lPgt9Smzrqgx7JNSXtjNB0YoiR7pcI/edit?usp=sharing';
const DRIVE_FOLDER_ID = 'https://drive.google.com/drive/folders/1DauCdNPSwg4c4cmbw94XFdP1sLsV4lWt?usp=sharing';
const APP_TOKEN = 'AKfycbz6rgZIRGt24HNb8uVXm56n9_ZD-4zh0BNlKVwNqnR2WU8l6Mb7z0H9kwU6Xq6p81Ao';
const SHEET_NAME = 'Inspeksi HSE';
const HEADERS = ['Timestamp','No. Temuan','Tanggal','Lokasi','Inspector','Kategori','Severity','Status','Deskripsi','Tindakan','Checklist JSON','Checklist Tidak Sesuai','File ID','URL Foto'];

function doGet() {
  return output_({ok:true, message:'HSE API aktif'});
}

function doPost(e) {
  try {
    const req = JSON.parse(e.postData.contents || '{}');
    if (!APP_TOKEN || req.token !== APP_TOKEN) throw new Error('Token aplikasi tidak valid.');
    if (req.action === 'save') return output_(save_(req.data));
    if (req.action === 'list') return output_({ok:true, data:list_()});
    if (req.action === 'status') return output_(updateStatus_(req.nomor, req.status));
    throw new Error('Aksi tidak dikenal.');
  } catch (err) {
    return output_({ok:false, message:String(err.message || err)});
  }
}

function sheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1,1,1,HEADERS.length).setFontWeight('bold').setBackground('#075985').setFontColor('#ffffff');
    sh.setFrozenRows(1);
  }
  return sh;
}

function save_(d) {
  ['tanggal','lokasi','inspector','severity','kategori'].forEach(k=>{if(!d || !String(d[k]||'').trim()) throw new Error('Data wajib belum lengkap: '+k);});
  if (!/^data:image\/(jpeg|jpg|png|webp);base64,/.test(d.photo||'')) throw new Error('Format foto tidak valid.');
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const sh=sheet_(), nomor=nextNumber_(sh,d.tanggal);
    const match=d.photo.match(/^data:(image\/[\w.+-]+);base64,(.+)$/), bytes=Utilities.base64Decode(match[2]);
    if(bytes.length>6*1024*1024) throw new Error('Foto setelah kompresi melebihi 6 MB.');
    const ext=match[1].includes('png')?'png':match[1].includes('webp')?'webp':'jpg';
    const blob=Utilities.newBlob(bytes,match[1],nomor+'.'+ext);
    const file=DriveApp.getFolderById(DRIVE_FOLDER_ID).createFile(blob);
    const checks=Array.isArray(d.checks)?d.checks:[];
    const tidakSesuai=checks.filter(x=>x.hasil==='Tidak Sesuai').map(x=>x.item).join('; ');
    sh.appendRow([new Date(),nomor,d.tanggal,safe_(d.lokasi),safe_(d.inspector),safe_(d.kategori),safe_(d.severity),d.status==='Close'?'Close':'Open',safe_(d.deskripsi),safe_(d.tindakan),JSON.stringify(checks),tidakSesuai,file.getId(),file.getUrl()]);
    return {ok:true,nomor,fotoUrl:file.getUrl()};
  } finally { lock.releaseLock(); }
}

function nextNumber_(sh,date) {
  const key=String(date).replace(/-/g,''),prefix='HSE-'+key+'-';
  const values=sh.getLastRow()>1?sh.getRange(2,2,sh.getLastRow()-1,1).getDisplayValues().flat():[];
  const max=values.filter(x=>x.startsWith(prefix)).reduce((m,x)=>Math.max(m,Number(x.slice(-3))||0),0);
  return prefix+String(max+1).padStart(3,'0');
}

function list_() {
  const sh=sheet_(); if(sh.getLastRow()<2)return [];
  return sh.getRange(2,1,sh.getLastRow()-1,HEADERS.length).getDisplayValues().map(r=>({timestamp:r[0],nomor:r[1],tanggal:r[2],lokasi:r[3],inspector:r[4],kategori:r[5],severity:r[6],status:r[7],deskripsi:r[8],tindakan:r[9],checklistTemuan:r[11],fotoUrl:r[13]})).reverse();
}

function updateStatus_(nomor,status) {
  if(!nomor || !['Open','Close'].includes(status))throw new Error('Status tidak valid.');
  const sh=sheet_(), finder=sh.getRange(2,2,Math.max(1,sh.getLastRow()-1),1).createTextFinder(nomor).matchEntireCell(true).findNext();
  if(!finder)throw new Error('Nomor temuan tidak ditemukan.');
  sh.getRange(finder.getRow(),8).setValue(status);
  return {ok:true,nomor,status};
}

function safe_(v) {
  v=String(v||'').trim();
  return /^[=+\-@]/.test(v)?"'"+v:v;
}

function output_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
