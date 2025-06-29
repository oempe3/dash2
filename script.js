// configurações
const DATE_START = 2015, DATE_END = 2025;
const Y_MIN = 180, Y_MAX = 250;
const BP_DATE = '2021-11-01';
const OVERHAUL = {
  'DG#01':'2016-11-24','DG#03':'2018-09-07','DG#04':'2018-07-01',
  'DG#05':'2017-07-24','DG#06':'2016-10-15','DG#08':'2017-01-19',
  'DG#09':'2018-11-17','DG#10':'2020-04-26','DG#11':'2017-04-25',
  'DG#12':'2017-03-06','DG#13':'2019-10-31','DG#14':'2016-09-01',
  'DG#15':'2019-08-01','DG#16':'2020-03-01','DG#17':'2017-06-18',
  'DG#18':'2016-07-20','DG#20':'2019-01-09','DG#21':'2017-05-23',
  'DG#22':'2019-03-14','DG#23':'2016-05-02'
};

// seleção de cores
function corBarra(v){
  if(v < 196 || v > 216) return 'red';
  if(v > 206)          return 'yellow';
  return 'green';
}

// carrega CSV
Papa.parse('data.csv', {
  download: true, header: true, dynamicTyping: true, skipEmptyLines: true,
  complete: ({ data })=>{
    // filtra
    const rows = data.filter(r=>{
      const ano = new Date(r.B).getFullYear();
      return ano >= DATE_START && ano <= DATE_END && r.F >= 195 && r.F <= 240;
    });
    buildMainChart(rows);
    initDGNav(rows);
  }
});

// 1) Gráfico principal
function buildMainChart(rows){
  const map = {};
  rows.forEach(r=>{
    const d = r.B.slice(0,10);
    if(!map[d]) map[d] = {F: [], D: 0, C: new Set()};
    map[d].F.push(r.F);
    map[d].D += r.D;
    map[d].C.add(r.C);
  });
  const dates = Object.keys(map).sort();
  const y     = dates.map(d=> map[d].F.reduce((a,b)=>a+b,0) / map[d].F.length );
  const colors= y.map(corBarra);
  const text  = y.map(v=> v.toFixed(1));
  const custom= dates.map(d=> ({maquinas: map[d].C.size, geracao: map[d].D/1000}));

  const trace = {
    x: dates, y, type:'bar',
    marker:{ color: colors },
    text, textposition:'outside',
    hovertemplate:
      '%{x}<br>Consumo: %{y:.1f}<br>' +
      'Máquinas: %{customdata.maquinas}<br>' +
      'Geração: %{customdata.geracao:.2f} MWh<extra></extra>',
    customdata: custom
  };
  const layout = {
    title:'Consumo específico UTE Pernambuco 3',
    yaxis:{ range: [Y_MIN, Y_MAX] },
    shapes:[{
      type:'line', x0: BP_DATE, x1: BP_DATE,
      y0: Y_MIN, y1: Y_MAX,
      line:{ color:'blue', dash:'dot' }
    }]
  };
  Plotly.newPlot('main-chart', [trace], layout, { responsive: true });
}

// 2) Inicializa nav e primeiro gráfico DG
function initDGNav(rows){
  const byDG = {};
  rows.forEach(r=>{
    if(!byDG[r.C]) byDG[r.C]=[];
    byDG[r.C].push(r);
  });
  const dgList = Object.keys(byDG).sort();
  const nav = document.getElementById('dg-nav');

  dgList.forEach((dg, idx)=>{
    const btn = document.createElement('button');
    btn.textContent = dg;
    btn.addEventListener('click', ()=>{
      document.querySelectorAll('.dg-nav button').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      renderDGChart(dg, byDG[dg]);
    });
    nav.appendChild(btn);
    // ativa o primeiro
    if(idx===0) {
      btn.classList.add('active');
      renderDGChart(dg, byDG[dg]);
    }
  });
}

// 3) Renderiza um DG específico no container
function renderDGChart(dg, arr){
  const container = document.getElementById('dg-chart-container');
  container.innerHTML = '';     // limpa
  const div = document.createElement('div');
  div.id = `chart-${dg}`;
  container.appendChild(div);

  const dates = arr.map(r=>r.B.slice(0,10));
  const vals  = arr.map(r=>r.E);
  const colors= vals.map(corBarra);
  const trace = {
    x: dates, y: vals, type:'bar',
    marker:{ color: colors },
    text: vals.map(v=>v.toFixed(1)),
    textposition: 'outside'
  };
  const shapes = [{
    type:'line', x0: BP_DATE, x1: BP_DATE,
    y0: Y_MIN, y1: Y_MAX,
    line:{ color:'blue', dash:'dot' }
  }];
  if(OVERHAUL[dg]){
    shapes.push({
      type:'line', x0: OVERHAUL[dg], x1: OVERHAUL[dg],
      y0: Y_MIN, y1: Y_MAX,
      line:{ color:'green', dash:'dash' }
    });
  }
  const layout = {
    title: `Consumo específico ${dg}`,
    yaxis: { range: [Y_MIN, Y_MAX] },
    shapes
  };

  Plotly.newPlot(div.id, [trace], layout, { responsive: true });
}
