(function(){
"use strict";

/* ---------- Datos iniciales: cultivos y variables de evaluación ----------
   Variables propuestas como punto de partida; cada una se puede editar,
   agregar o eliminar por cultivo desde la pestaña Cultivos. */
var CULTIVOS_INICIALES = [
  {nombre:"Cebolla", variables:[
    v("Emergencia","%"), v("Vigor","1-5"), v("Diámetro de bulbo","mm"),
    v("Peso de bulbo","g"), v("Incidencia de plagas","%"),
    v("Incidencia de enfermedades","%"), v("Rendimiento","kg/parcela")]},
  {nombre:"Tomate", variables:[
    v("Emergencia","%"), v("Vigor","1-5"), v("Altura de planta","cm"),
    v("Frutos por planta","n°"), v("Peso de fruto","g"), v("Sólidos solubles","°Brix"),
    v("Incidencia de plagas","%"), v("Incidencia de enfermedades","%"), v("Rendimiento","kg/parcela")]},
  {nombre:"Pimiento", variables:[
    v("Emergencia","%"), v("Vigor","1-5"), v("Altura de planta","cm"),
    v("Frutos por planta","n°"), v("Peso de fruto","g"),
    v("Incidencia de plagas","%"), v("Incidencia de enfermedades","%"), v("Rendimiento","kg/parcela")]},
  {nombre:"Zanahoria", variables:[
    v("Emergencia","%"), v("Vigor","1-5"), v("Longitud de raíz","cm"),
    v("Diámetro de raíz","mm"), v("Peso de raíz","g"), v("Cobertura de malezas","%"),
    v("Incidencia de enfermedades","%"), v("Rendimiento","kg/parcela")]},
  {nombre:"Pepinillo", variables:[
    v("Emergencia","%"), v("Vigor","1-5"), v("Frutos por planta","n°"),
    v("Longitud de fruto","cm"), v("Peso de fruto","g"),
    v("Incidencia de plagas","%"), v("Incidencia de enfermedades","%"), v("Rendimiento","kg/parcela")]},
  {nombre:"Lechuga", variables:[
    v("Emergencia","%"), v("Vigor","1-5"), v("Peso de cabeza","g"),
    v("Diámetro de cabeza","cm"), v("Incidencia de plagas","%"),
    v("Incidencia de enfermedades","%"), v("Rendimiento","kg/parcela")]},
  {nombre:"Beterraga", variables:[
    v("Emergencia","%"), v("Vigor","1-5"), v("Diámetro de raíz","mm"),
    v("Peso de raíz","g"), v("Cobertura de malezas","%"),
    v("Incidencia de enfermedades","%"), v("Rendimiento","kg/parcela")]},
  {nombre:"Coliflor", variables:[
    v("Emergencia","%"), v("Vigor","1-5"), v("Peso de cabeza","g"),
    v("Diámetro de cabeza","cm"), v("Incidencia de plagas","%"),
    v("Incidencia de enfermedades","%"), v("Rendimiento","kg/parcela")]},
  {nombre:"Brócoli", variables:[
    v("Emergencia","%"), v("Vigor","1-5"), v("Peso de cabeza","g"),
    v("Diámetro de cabeza","cm"), v("Incidencia de plagas","%"),
    v("Incidencia de enfermedades","%"), v("Rendimiento","kg/parcela")]},
  {nombre:"Sandía", variables:[
    v("Emergencia","%"), v("Vigor","1-5"), v("Frutos por planta","n°"),
    v("Peso de fruto","kg"), v("Sólidos solubles","°Brix"),
    v("Incidencia de plagas","%"), v("Incidencia de enfermedades","%"), v("Rendimiento","kg/parcela")]},
  {nombre:"Melón", variables:[
    v("Emergencia","%"), v("Vigor","1-5"), v("Frutos por planta","n°"),
    v("Peso de fruto","kg"), v("Sólidos solubles","°Brix"),
    v("Incidencia de plagas","%"), v("Incidencia de enfermedades","%"), v("Rendimiento","kg/parcela")]}
];
var TIPOS_ENSAYO = ["Sin especificar","Segmentación","Caracterización","Lanzamiento"];
var SEGMENTOS = ["Verano","Invierno","Todo el año","Otro"];
var CONCLUSIONES = ["Pendiente","Favorable","No favorable"];

function v(nombre, unidad){ return {id: slug(nombre)+"_"+Math.random().toString(36).slice(2,7), nombre: nombre, unidad: unidad||""}; }
function slug(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,"_"); }
function uid(){ return "id_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,7); }

/* ---------- Estado y persistencia local ---------- */
var CLAVE = "gestorEnsayosV1";
var estado = cargar();
function cargar(){
  try{
    var crudo = localStorage.getItem(CLAVE);
    if(crudo){
      var d = JSON.parse(crudo);
      if(!Array.isArray(d.semillas)) d.semillas = [];
      return d;
    }
  }catch(e){}
  return {
    cultivos: CULTIVOS_INICIALES.map(function(c){ return {id: uid(), nombre: c.nombre, variables: c.variables}; }),
    semillas: [],
    ensayos: []
  };
}
function guardar(){ localStorage.setItem(CLAVE, JSON.stringify(estado)); }

/* ---------- Navegación ---------- */
var app = document.getElementById("app");
var tabActual = "cultivos";
var vista = null;
var botones = document.querySelectorAll("nav button");
botones.forEach(function(b){
  b.addEventListener("click", function(){
    tabActual = b.dataset.tab; vista = null;
    botones.forEach(function(x){ x.classList.toggle("activo", x===b); });
    render();
  });
});
function render(){
  if(vista){ vista(); return; }
  if(tabActual==="cultivos") renderCultivos();
  else if(tabActual==="semillas") renderSemillas();
  else if(tabActual==="ensayos") renderEnsayos();
  else if(tabActual==="evaluar") renderEvaluar();
  else renderResultados();
}
function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g, function(c){
  return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
function nombreCultivo(id){
  var c = estado.cultivos.find(function(x){ return x.id===id; });
  return c ? c.nombre : "(cultivo eliminado)";
}
function cultivoDe(id){ return estado.cultivos.find(function(x){ return x.id===id; }); }
function semillaDe(id){ return estado.semillas.find(function(x){ return x.id===id; }); }
function etiquetaSemilla(s){
  return nombreCultivo(s.cultivoId)+" - "+s.variedad+(s.proveedor?" ("+s.proveedor+")":"");
}
function opciones(lista, actual){
  return lista.map(function(x){ return '<option'+(x===actual?' selected':'')+'>'+esc(x)+'</option>'; }).join("");
}

/* ---------- Cultivos ---------- */
function renderCultivos(){
  var html = '<div class="tarjeta"><h2>Cultivos y variables de evaluación</h2>'+
    '<p class="muted">Toca un cultivo para ver y editar las variables que se evaluarán en sus ensayos. Los cambios aplican a las evaluaciones nuevas.</p></div>'+
    '<ul class="lista">';
  estado.cultivos.forEach(function(c, i){
    html += '<li data-i="'+i+'"><strong>'+esc(c.nombre)+'</strong>'+
      '<div class="sub">'+c.variables.length+' variables: '+
      esc(c.variables.map(function(x){return x.nombre;}).join(", "))+'</div></li>';
  });
  html += '</ul><div class="tarjeta"><h2>Agregar cultivo</h2><div class="fila">'+
    '<div class="campo"><input id="nuevoCultivo" placeholder="Nombre del cultivo"></div>'+
    '<button class="btn" id="btnAgregarCultivo">Agregar</button></div></div>'+
    tarjetaRespaldo();
  app.innerHTML = html;
  app.querySelectorAll(".lista li").forEach(function(li){
    li.addEventListener("click", function(){ vista = function(){ renderCultivo(+li.dataset.i); }; render(); });
  });
  document.getElementById("btnAgregarCultivo").addEventListener("click", function(){
    var nombre = document.getElementById("nuevoCultivo").value.trim();
    if(!nombre) return;
    estado.cultivos.push({id: uid(), nombre: nombre, variables: []});
    guardar(); render();
  });
  activarRespaldo();
}
function renderCultivo(i){
  var c = estado.cultivos[i];
  var html = '<button class="volver" id="volver">← Volver a cultivos</button>'+
    '<div class="tarjeta"><h2>'+esc(c.nombre)+'</h2>'+
    '<p class="muted">Variables de evaluación de este cultivo.</p>';
  c.variables.forEach(function(x, j){
    html += '<div class="fila" style="margin-top:6px">'+
      '<div class="campo"><label>Variable</label><input data-j="'+j+'" class="varNom" value="'+esc(x.nombre)+'"></div>'+
      '<div class="campo" style="max-width:110px"><label>Unidad</label><input data-j="'+j+'" class="varUni" value="'+esc(x.unidad)+'"></div>'+
      '<button class="mini" data-j="'+j+'" style="margin-top:14px">Quitar</button></div>';
  });
  html += '<div class="acciones"><button class="btn sec" id="agregarVar">+ Agregar variable</button></div></div>';
  app.innerHTML = html;
  document.getElementById("volver").addEventListener("click", function(){ vista=null; guardar(); render(); });
  document.getElementById("agregarVar").addEventListener("click", function(){
    c.variables.push(v("Nueva variable","")); guardar(); render();
  });
  app.querySelectorAll(".varNom").forEach(function(inp){
    inp.addEventListener("change", function(){ c.variables[+inp.dataset.j].nombre = inp.value.trim()||c.variables[+inp.dataset.j].nombre; guardar(); });
  });
  app.querySelectorAll(".varUni").forEach(function(inp){
    inp.addEventListener("change", function(){ c.variables[+inp.dataset.j].unidad = inp.value.trim(); guardar(); });
  });
  app.querySelectorAll("button.mini").forEach(function(b){
    b.addEventListener("click", function(){ c.variables.splice(+b.dataset.j,1); guardar(); render(); });
  });
}

/* ---------- Semillas (inventario / kardex) ---------- */
function renderSemillas(){
  var html = '<div class="tarjeta"><h2>Inventario de semillas</h2>'+
    '<p class="muted">Registra las semillas que usas en tus ensayos: variedad, proveedor y stock.</p></div>';
  if(!estado.semillas.length){
    html += '<div class="aviso">Todavía no hay semillas registradas. Agrega la primera abajo.</div>';
  } else {
    html += '<div class="envoltura-tabla tarjeta"><table><thead><tr>'+
      '<th>Cultivo</th><th>Variedad</th><th>Proveedor</th><th>Tipología</th><th>Lote</th><th>Stock</th><th>Código</th><th></th>'+
      '</tr></thead><tbody>';
    estado.semillas.forEach(function(s, i){
      html += '<tr><td>'+esc(nombreCultivo(s.cultivoId))+'</td><td><strong>'+esc(s.variedad)+'</strong></td>'+
        '<td>'+esc(s.proveedor||"—")+'</td><td>'+esc(s.tipologia||"—")+'</td><td>'+esc(s.lote||"—")+'</td>'+
        '<td>'+(s.stock!==""&&s.stock!=null?esc(s.stock)+" "+esc(s.unidad||""):"—")+'</td>'+
        '<td>'+esc(s.codigo||"—")+'</td>'+
        '<td><button class="mini" data-i="'+i+'">Quitar</button></td></tr>';
    });
    html += '</tbody></table></div>';
  }
  html += '<div class="tarjeta"><h2>Nueva semilla</h2><div class="fila">'+
    '<div class="campo"><label>Cultivo *</label><select id="sCultivo">'+
      estado.cultivos.map(function(c){ return '<option value="'+c.id+'">'+esc(c.nombre)+'</option>'; }).join("")+
    '</select></div>'+
    '<div class="campo"><label>Variedad *</label><input id="sVariedad" placeholder="Ej.: Variedad Demo A"></div>'+
    '<div class="campo"><label>Proveedor</label><input id="sProveedor" placeholder="Ej.: Semillas Demo SAC"></div>'+
    '<div class="campo"><label>Tipología</label><input id="sTipologia" placeholder="Ej.: Híbrido"></div>'+
    '<div class="campo"><label>Lote</label><input id="sLote"></div>'+
    '<div class="campo" style="max-width:100px"><label>Stock</label><input id="sStock" inputmode="decimal"></div>'+
    '<div class="campo" style="max-width:90px"><label>Unidad</label><input id="sUnidad" placeholder="kg"></div>'+
    '<div class="campo" style="max-width:130px"><label>Código</label><input id="sCodigo" placeholder="Ej.: ENS-001"></div>'+
    '</div><div class="acciones"><button class="btn" id="crearSemilla">Agregar semilla</button></div></div>';
  app.innerHTML = html;
  app.querySelectorAll("button.mini").forEach(function(b){
    b.addEventListener("click", function(){
      if(confirm("¿Quitar esta semilla del inventario? Los ensayos que la usan conservarán su nombre como referencia.")){
        estado.semillas.splice(+b.dataset.i,1); guardar(); render();
      }
    });
  });
  document.getElementById("crearSemilla").addEventListener("click", function(){
    var variedad = document.getElementById("sVariedad").value.trim();
    if(!variedad){ alert("Falta la variedad."); return; }
    estado.semillas.push({
      id: uid(),
      cultivoId: document.getElementById("sCultivo").value,
      variedad: variedad,
      proveedor: document.getElementById("sProveedor").value.trim(),
      tipologia: document.getElementById("sTipologia").value.trim(),
      lote: document.getElementById("sLote").value.trim(),
      stock: document.getElementById("sStock").value.trim(),
      unidad: document.getElementById("sUnidad").value.trim(),
      codigo: document.getElementById("sCodigo").value.trim()
    });
    guardar(); render();
  });
}

/* ---------- Ensayos ---------- */
function renderEnsayos(){
  var html = '<div class="tarjeta"><h2>Ensayos</h2>'+
    '<p class="muted">Cada ensayo pertenece a un cultivo y usa las variables de ese cultivo en sus evaluaciones.</p></div>';
  if(!estado.ensayos.length){
    html += '<div class="aviso">Todavía no hay ensayos. Crea el primero abajo.</div>';
  } else {
    html += '<ul class="lista">';
    estado.ensayos.forEach(function(e){
      html += '<li data-id="'+e.id+'"><strong>'+esc(e.nombre)+'</strong>'+
        '<div class="sub">'+esc(nombreCultivo(e.cultivoId))+
        (e.tipo&&e.tipo!=="Sin especificar"?' · '+esc(e.tipo):'')+
        (e.productor?' · '+esc(e.productor):'')+(e.localidad?' · '+esc(e.localidad):'')+
        ' · '+e.tratamientos.length+' tratamientos × '+e.repeticiones+' repeticiones'+
        ' · '+e.evaluaciones.length+' evaluaciones · '+esc(e.conclusion||"Pendiente")+'</div></li>';
    });
    html += '</ul>';
  }
  html += '<div class="tarjeta"><h2>Nuevo ensayo</h2>'+
    '<div class="fila">'+
    '<div class="campo"><label>Nombre o código del ensayo *</label><input id="eNombre" placeholder="Ej.: ENS-001 Variedades tomate"></div>'+
    '<div class="campo"><label>Tipo de ensayo</label><select id="eTipo">'+opciones(TIPOS_ENSAYO)+'</select></div>'+
    '<div class="campo"><label>Cultivo *</label><select id="eCultivo">'+
      estado.cultivos.map(function(c){ return '<option value="'+c.id+'">'+esc(c.nombre)+'</option>'; }).join("")+
    '</select></div>'+
    '<div class="campo"><label>Semilla (del inventario, opcional)</label><select id="eSemilla"><option value="">— Sin vincular —</option></select></div>'+
    '<div class="campo"><label>Productor</label><input id="eProductor" placeholder="Ej.: Fundo Demo"></div>'+
    '<div class="campo"><label>Localidad</label><input id="eLocalidad" placeholder="Ej.: Valle Demo"></div>'+
    '<div class="campo"><label>Responsable</label><input id="eResponsable" placeholder="Ej.: Juan Demo"></div>'+
    '<div class="campo" style="max-width:110px"><label>Cantidad</label><input id="eCantidad" inputmode="decimal"></div>'+
    '<div class="campo"><label>Campo de testigo</label><input id="eTestigo"></div>'+
    '<div class="campo"><label>F. siembra</label><input id="eFSiembra" type="date"></div>'+
    '<div class="campo"><label>F. trasplante</label><input id="eFTrasplante" type="date"></div>'+
    '<div class="campo"><label>F. cosecha</label><input id="eFCosecha" type="date"></div>'+
    '<div class="campo"><label>Segmento</label><select id="eSegmento">'+opciones(SEGMENTOS)+'</select></div>'+
    '<div class="campo"><label>Especificaciones de segmento</label><input id="eSegmentoDetalle"></div>'+
    '<div class="campo" style="max-width:140px"><label>Latitud</label><input id="eLat" inputmode="decimal"></div>'+
    '<div class="campo" style="max-width:140px"><label>Longitud</label><input id="eLon" inputmode="decimal"></div>'+
    '<div class="campo" style="min-width:170px"><label>&nbsp;</label><button class="btn sec" id="btnGeo" type="button">Capturar ubicación</button><span class="muted" id="geoMsg"></span></div>'+
    '</div>'+
    '<div class="fila">'+
    '<div class="campo"><label>Tratamientos (separados por coma) *</label><input id="eTrat" placeholder="Ej.: Testigo, T1, T2, T3"></div>'+
    '<div class="campo" style="max-width:130px"><label>Repeticiones</label><input id="eRep" type="number" min="1" value="3"></div>'+
    '</div>'+
    '<div class="acciones"><button class="btn" id="crearEnsayo">Crear ensayo</button></div></div>';
  app.innerHTML = html;

  var selCultivo = document.getElementById("eCultivo");
  var selSemilla = document.getElementById("eSemilla");
  function poblarSemillas(){
    var opts = '<option value="">— Sin vincular —</option>';
    estado.semillas.forEach(function(s){
      if(s.cultivoId===selCultivo.value){
        opts += '<option value="'+s.id+'">'+esc(etiquetaSemilla(s))+'</option>';
      }
    });
    selSemilla.innerHTML = opts;
  }
  selCultivo.addEventListener("change", poblarSemillas);
  poblarSemillas();

  document.getElementById("btnGeo").addEventListener("click", function(){
    var msg = document.getElementById("geoMsg");
    if(!navigator.geolocation){ msg.textContent = " Este navegador no permite geolocalización."; return; }
    msg.textContent = " Obteniendo...";
    navigator.geolocation.getCurrentPosition(function(pos){
      document.getElementById("eLat").value = pos.coords.latitude.toFixed(6);
      document.getElementById("eLon").value = pos.coords.longitude.toFixed(6);
      msg.textContent = " Listo.";
    }, function(){ msg.textContent = " No se pudo obtener; ingresa las coordenadas a mano."; }, {timeout: 10000});
  });

  app.querySelectorAll(".lista li").forEach(function(li){
    li.addEventListener("click", function(){ vista = function(){ renderEnsayo(li.dataset.id); }; render(); });
  });
  document.getElementById("crearEnsayo").addEventListener("click", function(){
    var nombre = document.getElementById("eNombre").value.trim();
    if(!nombre){ alert("Falta el nombre del ensayo."); return; }
    var trat = document.getElementById("eTrat").value.split(",").map(function(t){return t.trim();}).filter(Boolean);
    if(!trat.length){ alert("Indica al menos un tratamiento."); return; }
    var rep = Math.max(1, parseInt(document.getElementById("eRep").value,10)||1);
    estado.ensayos.push({
      id: uid(), nombre: nombre,
      tipo: document.getElementById("eTipo").value,
      cultivoId: selCultivo.value,
      semillaId: selSemilla.value || null,
      productor: document.getElementById("eProductor").value.trim(),
      localidad: document.getElementById("eLocalidad").value.trim(),
      responsable: document.getElementById("eResponsable").value.trim(),
      cantidad: document.getElementById("eCantidad").value.trim(),
      testigo: document.getElementById("eTestigo").value.trim(),
      fSiembra: document.getElementById("eFSiembra").value,
      fTrasplante: document.getElementById("eFTrasplante").value,
      fCosecha: document.getElementById("eFCosecha").value,
      segmento: document.getElementById("eSegmento").value,
      segmentoDetalle: document.getElementById("eSegmentoDetalle").value.trim(),
      lat: document.getElementById("eLat").value.trim(),
      lon: document.getElementById("eLon").value.trim(),
      tratamientos: trat, repeticiones: rep,
      resultado: "", conclusion: "Pendiente",
      evaluaciones: []
    });
    guardar(); render();
  });
}
function renderEnsayo(id){
  var e = estado.ensayos.find(function(x){ return x.id===id; });
  if(!e){ vista=null; render(); return; }
  var c = cultivoDe(e.cultivoId);
  var s = e.semillaId ? semillaDe(e.semillaId) : null;
  var html = '<button class="volver" id="volver">← Volver a ensayos</button>'+
    '<div class="tarjeta"><h2>'+esc(e.nombre)+'</h2>'+
    '<p><span class="chip">'+esc(nombreCultivo(e.cultivoId))+'</span>'+
    (e.tipo&&e.tipo!=="Sin especificar"?'<span class="chip">'+esc(e.tipo)+'</span>':'')+
    '<span class="chip">'+e.tratamientos.length+' tratamientos</span>'+
    '<span class="chip">'+e.repeticiones+' repeticiones</span>'+
    '<span class="chip">'+esc(e.conclusion||"Pendiente")+'</span></p>'+
    '<dl class="detalle">'+
    (s?'<dt>Semilla</dt><dd>'+esc(etiquetaSemilla(s))+(s.lote?' · lote '+esc(s.lote):'')+'</dd>':'')+
    (e.productor?'<dt>Productor</dt><dd>'+esc(e.productor)+'</dd>':'')+
    (e.localidad?'<dt>Localidad</dt><dd>'+esc(e.localidad)+'</dd>':'')+
    (e.responsable?'<dt>Responsable</dt><dd>'+esc(e.responsable)+'</dd>':'')+
    (e.cantidad?'<dt>Cantidad</dt><dd>'+esc(e.cantidad)+'</dd>':'')+
    (e.testigo?'<dt>Campo de testigo</dt><dd>'+esc(e.testigo)+'</dd>':'')+
    (e.fSiembra?'<dt>F. siembra</dt><dd>'+esc(e.fSiembra)+'</dd>':'')+
    (e.fTrasplante?'<dt>F. trasplante</dt><dd>'+esc(e.fTrasplante)+'</dd>':'')+
    (e.fCosecha?'<dt>F. cosecha</dt><dd>'+esc(e.fCosecha)+'</dd>':'')+
    (e.segmento?'<dt>Segmento</dt><dd>'+esc(e.segmento)+(e.segmentoDetalle?' — '+esc(e.segmentoDetalle):'')+'</dd>':'')+
    (e.lat&&e.lon?'<dt>Ubicación</dt><dd>'+esc(e.lat)+', '+esc(e.lon)+'</dd>':'')+
    '<dt>Tratamientos</dt><dd>'+esc(e.tratamientos.join(", "))+'</dd>'+
    '<dt>Variables</dt><dd>'+(c?esc(c.variables.map(function(x){return x.nombre;}).join(", ")):"-")+'</dd>'+
    '</dl></div>'+
    '<div class="tarjeta"><h2>Resultado y conclusión</h2>'+
    '<div class="campo"><label>Resultados</label><textarea id="eResultado" placeholder="Describe los resultados del ensayo...">'+esc(e.resultado||"")+'</textarea></div>'+
    '<div class="campo" style="max-width:200px"><label>Conclusión</label><select id="eConclusion">'+opciones(CONCLUSIONES, e.conclusion||"Pendiente")+'</select></div>'+
    '<div class="acciones"><button class="btn" id="guardarCierre">Guardar resultado</button></div></div>'+
    '<div class="tarjeta"><h2>Evaluaciones registradas</h2>';
  if(!e.evaluaciones.length){
    html += '<p class="muted">Sin evaluaciones todavía. Regístralas desde la pestaña Evaluar.</p>';
  } else {
    html += '<ul class="lista">';
    e.evaluaciones.slice().sort(function(a,b){ return a.fecha<b.fecha?1:-1; }).forEach(function(ev){
      var llenas = Object.keys(ev.valores||{}).length;
      html += '<li><strong>'+esc(ev.fecha)+'</strong><div class="sub">'+llenas+' parcelas con datos</div></li>';
    });
    html += '</ul>';
  }
  html += '</div><div class="acciones"><button class="btn peligro" id="borrarEnsayo">Eliminar ensayo</button></div>';
  app.innerHTML = html;
  document.getElementById("volver").addEventListener("click", function(){ vista=null; guardar(); render(); });
  document.getElementById("guardarCierre").addEventListener("click", function(){
    e.resultado = document.getElementById("eResultado").value.trim();
    e.conclusion = document.getElementById("eConclusion").value;
    guardar(); render();
  });
  document.getElementById("borrarEnsayo").addEventListener("click", function(){
    if(confirm("¿Eliminar este ensayo y todas sus evaluaciones?")){
      estado.ensayos = estado.ensayos.filter(function(x){ return x.id!==id; });
      guardar(); vista=null; render();
    }
  });
}

/* ---------- Evaluar ---------- */
function parcelas(e){
  var p = [];
  e.tratamientos.forEach(function(t, i){
    for(var r=1; r<=e.repeticiones; r++){ p.push({tratamiento: t, rep: r, clave: "T"+(i+1)+"-R"+r}); }
  });
  return p;
}
function renderEvaluar(){
  if(!estado.ensayos.length){
    app.innerHTML = '<div class="aviso">Primero crea un ensayo en la pestaña Ensayos.</div>';
    return;
  }
  var html = '<div class="tarjeta"><h2>Registrar evaluación</h2>'+
    '<div class="fila">'+
    '<div class="campo"><label>Ensayo</label><select id="selEnsayo">'+
      estado.ensayos.map(function(e){ return '<option value="'+e.id+'">'+esc(e.nombre)+' ('+esc(nombreCultivo(e.cultivoId))+')</option>'; }).join("")+
    '</select></div>'+
    '<div class="campo" style="max-width:170px"><label>Fecha de evaluación</label><input id="fEval" type="date" value="'+new Date().toISOString().slice(0,10)+'"></div>'+
    '</div><div class="acciones"><button class="btn" id="abrirPlanilla">Abrir planilla</button></div></div>';
  app.innerHTML = html;
  document.getElementById("abrirPlanilla").addEventListener("click", function(){
    var id = document.getElementById("selEnsayo").value;
    var fecha = document.getElementById("fEval").value;
    vista = function(){ renderPlanilla(id, fecha); };
    render();
  });
}
function renderPlanilla(id, fecha){
  var e = estado.ensayos.find(function(x){ return x.id===id; });
  var c = cultivoDe(e.cultivoId);
  if(!c || !c.variables.length){
    app.innerHTML = '<button class="volver" id="volver">← Volver</button>'+
      '<div class="aviso">El cultivo de este ensayo no tiene variables definidas. Agrégalas en la pestaña Cultivos.</div>';
    document.getElementById("volver").addEventListener("click", function(){ vista=null; render(); });
    return;
  }
  var html = '<button class="volver" id="volver">← Volver</button>'+
    '<div class="tarjeta"><h2>'+esc(e.nombre)+' - '+esc(fecha)+'</h2>'+
    '<p class="muted">Planilla por parcela (tratamiento-repetición). Deja vacío lo que no se evaluó.</p></div>'+
    '<div class="envoltura-tabla"><table><thead><tr><th>Parcela</th>';
  c.variables.forEach(function(x){
    html += '<th>'+esc(x.nombre)+(x.unidad?' ('+esc(x.unidad)+')':'')+'</th>';
  });
  html += '</tr></thead><tbody>';
  parcelas(e).forEach(function(p){
    html += '<tr><td><strong>'+esc(p.clave)+'</strong><br><span class="muted">'+esc(p.tratamiento)+'</span></td>';
    c.variables.forEach(function(x){
      html += '<td><input data-p="'+p.clave+'" data-v="'+x.id+'" inputmode="decimal"></td>';
    });
    html += '</tr>';
  });
  html += '</tbody></table></div><div class="acciones"><button class="btn" id="guardarEval">Guardar evaluación</button></div>';
  app.innerHTML = html;
  document.getElementById("volver").addEventListener("click", function(){ vista=null; render(); });
  document.getElementById("guardarEval").addEventListener("click", function(){
    var valores = {};
    app.querySelectorAll("td input").forEach(function(inp){
      var val = inp.value.trim();
      if(val==="") return;
      var pk = inp.dataset.p, vk = inp.dataset.v;
      if(!valores[pk]) valores[pk] = {};
      valores[pk][vk] = val;
    });
    if(!Object.keys(valores).length){ alert("No ingresaste ningún dato."); return; }
    e.evaluaciones.push({id: uid(), fecha: fecha, valores: valores});
    guardar();
    alert("Evaluación guardada: "+Object.keys(valores).length+" parcelas con datos.");
    vista = null; render();
  });
}

/* ---------- Respaldo completo de datos (JSON) ---------- */
function tarjetaRespaldo(){
  return '<div class="tarjeta"><h2>Respaldo de datos</h2>'+
    '<p class="muted">Los datos se guardan en este dispositivo y navegador. Si se borran los datos del navegador o cambias de equipo, se perderían. Descarga un respaldo de vez en cuando: incluye cultivos, variables, semillas, ensayos y todas las evaluaciones.</p>'+
    '<div class="acciones">'+
    '<button class="btn sec" id="btnRespaldo">Descargar respaldo (JSON)</button>'+
    '<button class="btn sec" id="btnRestaurar">Restaurar respaldo</button>'+
    '<input type="file" id="archivoRestaurar" accept="application/json,.json" style="display:none">'+
    '</div>'+
    '<p class="muted" id="estadoRespaldo"></p></div>';
}
function activarRespaldo(){
  document.getElementById("btnRespaldo").addEventListener("click", function(){
    var blob = new Blob([JSON.stringify(estado, null, 2)], {type:"application/json"});
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "respaldo_ensayos_"+new Date().toISOString().slice(0,10)+".json";
    document.body.appendChild(a); a.click();
    setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
    document.getElementById("estadoRespaldo").textContent = "Respaldo descargado.";
  });
  var input = document.getElementById("archivoRestaurar");
  document.getElementById("btnRestaurar").addEventListener("click", function(){ input.click(); });
  input.addEventListener("change", function(){
    var f = input.files && input.files[0];
    if(!f) return;
    var lector = new FileReader();
    lector.onload = function(){
      try{
        var datos = JSON.parse(lector.result);
        if(!datos || !Array.isArray(datos.cultivos) || !Array.isArray(datos.ensayos) || !Array.isArray(datos.semillas)){
          throw new Error("formato");
        }
        if(!confirm("Restaurar reemplaza TODOS los datos actuales ("+estado.cultivos.length+" cultivos, "+estado.semillas.length+" semillas, "+estado.ensayos.length+" ensayos) por los del respaldo ("+datos.cultivos.length+" cultivos, "+datos.semillas.length+" semillas, "+datos.ensayos.length+" ensayos). ¿Continuar?")){
          input.value = ""; return;
        }
        estado = datos;
        guardar(); vista = null; render();
      }catch(err){
        alert("El archivo no es un respaldo válido de esta aplicación.");
      }
      input.value = "";
    };
    lector.readAsText(f);
  });
}

/* ---------- Resultados ---------- */
function renderResultados(){
  if(!estado.ensayos.length){
    app.innerHTML = '<div class="aviso">Primero crea un ensayo y registra evaluaciones.</div>';
    return;
  }
  var html = '<div class="tarjeta"><h2>Resultados por tratamiento</h2>'+
    '<div class="fila">'+
    '<div class="campo"><label>Ensayo</label><select id="selRes">'+
      estado.ensayos.map(function(e){ return '<option value="'+e.id+'">'+esc(e.nombre)+' ('+esc(nombreCultivo(e.cultivoId))+')</option>'; }).join("")+
    '</select></div>'+
    '<div class="campo" id="campoFecha"></div>'+
    '</div></div><div id="resDetalle"></div>';
  app.innerHTML = html;
  var sel = document.getElementById("selRes");
  function pintar(){ prepararFechas(sel.value); }
  sel.addEventListener("change", pintar);
  pintar();
}
function fechasDeEnsayo(e){
  var fechas = [];
  e.evaluaciones.forEach(function(ev){ if(fechas.indexOf(ev.fecha)<0) fechas.push(ev.fecha); });
  return fechas.sort().reverse();
}
function prepararFechas(id){
  var campo = document.getElementById("campoFecha");
  var e = estado.ensayos.find(function(x){ return x.id===id; });
  if(!e.evaluaciones.length){
    campo.innerHTML = "";
    document.getElementById("resDetalle").innerHTML = '<div class="aviso">Este ensayo no tiene evaluaciones todavía.</div>';
    return;
  }
  var fechas = fechasDeEnsayo(e);
  campo.innerHTML = '<label>Fecha de evaluación</label><select id="selFecha">'+
    fechas.map(function(f){ return '<option value="'+f+'">'+f+'</option>'; }).join("")+
    '</select>';
  var selF = document.getElementById("selFecha");
  selF.addEventListener("change", function(){ pintarResultados(id, selF.value); });
  pintarResultados(id, selF.value);
}
function pintarResultados(id, fecha){
  var detalle = document.getElementById("resDetalle");
  var e = estado.ensayos.find(function(x){ return x.id===id; });
  var c = cultivoDe(e.cultivoId);
  var acum = {}; // trat -> varId -> {suma, parcelas:{}}
  e.evaluaciones.forEach(function(ev){
    if(ev.fecha !== fecha) return;
    Object.keys(ev.valores||{}).forEach(function(clave){
      var tratIdx = parseInt(clave.split("-")[0].slice(1),10)-1;
      var trat = e.tratamientos[tratIdx] || clave;
      var vals = ev.valores[clave];
      Object.keys(vals).forEach(function(vid){
        var num = parseFloat(String(vals[vid]).replace(",", "."));
        if(isNaN(num)) return;
        if(!acum[trat]) acum[trat] = {};
        if(!acum[trat][vid]) acum[trat][vid] = {suma:0, parcelas:{}};
        acum[trat][vid].suma += num;
        acum[trat][vid].parcelas[clave] = true;
      });
    });
  });
  var html = '<div class="envoltura-tabla tarjeta"><table><thead><tr><th>Variable</th>';
  e.tratamientos.forEach(function(t){ html += '<th>'+esc(t)+'</th>'; });
  html += '</tr></thead><tbody>';
  (c?c.variables:[]).forEach(function(x){
    html += '<tr><td><strong>'+esc(x.nombre)+'</strong>'+(x.unidad?' <span class="muted">('+esc(x.unidad)+')</span>':'')+'</td>';
    e.tratamientos.forEach(function(t){
      var a = acum[t] && acum[t][x.id];
      var n = a ? Object.keys(a.parcelas).length : 0;
      html += '<td>'+(a ? (Math.round(a.suma/n*100)/100)+' <span class="muted">(n='+n+')</span>' : '—')+'</td>';
    });
    html += '</tr>';
  });
  html += '</tbody></table></div>'+
    '<div class="acciones"><button class="btn sec" id="exportCSV">Exportar todos los datos a CSV</button></div>'+
    '<p class="muted">Promedios simples por tratamiento de la evaluación del '+esc(fecha)+'; n = parcelas con dato en esa fecha. El CSV incluye todas las fechas.</p>';
  detalle.innerHTML = html;
  document.getElementById("exportCSV").addEventListener("click", function(){ exportarCSV(e, c); });
}
function exportarCSV(e, c){
  var vars = c ? c.variables : [];
  var cab = ["Ensayo","Cultivo","Semilla","Fecha evaluación","Parcela","Tratamiento","Repetición"]
    .concat(vars.map(function(x){ return x.nombre+(x.unidad?" ("+x.unidad+")":""); }));
  var lineas = [cab.map(function(x){ return '"'+x+'"'; }).join(";")];
  var s = e.semillaId ? semillaDe(e.semillaId) : null;
  e.evaluaciones.forEach(function(ev){
    parcelas(e).forEach(function(p){
      var vals = (ev.valores||{})[p.clave];
      if(!vals) return;
      var fila = [e.nombre, nombreCultivo(e.cultivoId), s?etiquetaSemilla(s):"", ev.fecha, p.clave, p.tratamiento, p.rep];
      vars.forEach(function(x){ fila.push(vals[x.id]!=null ? String(vals[x.id]).replace(",", ".") : ""); });
      lineas.push(fila.map(function(celda){ return '"'+String(celda).replace(/"/g,'""')+'"'; }).join(";"));
    });
  });
  if(lineas.length===1){ alert("No hay datos para exportar."); return; }
  var blob = new Blob(["﻿"+lineas.join("\r\n")], {type:"text/csv;charset=utf-8"});
  var a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "ensayo_"+slug(e.nombre)+".csv";
  document.body.appendChild(a); a.click();
  setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

render();
})();
