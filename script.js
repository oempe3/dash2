
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('details').forEach((section) => {
    const plotDiv = section.querySelector('.plot-container div[id^="grafico"]');
    if (!plotDiv) return;

    // Criar inputs de data com valores padrão
    const wrapper = document.createElement('div');
    wrapper.className = 'filtro-datas';

    const startLabel = document.createElement('label');
    startLabel.innerHTML = '📅 Início: ';
    const start = document.createElement('input');
    start.type = 'date';
    start.className = 'data-inicio';
    start.value = '2015-01-01';
    startLabel.appendChild(start);

    const endLabel = document.createElement('label');
    endLabel.innerHTML = '📅 Fim: ';
    const end = document.createElement('input');
    end.type = 'date';
    end.className = 'data-fim';
    end.value = '2025-12-31';
    endLabel.appendChild(end);

    wrapper.appendChild(startLabel);
    wrapper.appendChild(endLabel);
    section.querySelector('.plot-container').prepend(wrapper);

    const originalData = JSON.parse(JSON.stringify(plotDiv.data));
    const layout = plotDiv.layout;

    function filterData() {
      const startDate = new Date(start.value);
      const endDate = new Date(end.value);

      const newData = originalData.map(trace => {
        if (!trace.x) return trace;
        const newX = [];
        const newY = [];
        const newHover = [];
        for (let i = 0; i < trace.x.length; i++) {
          const currentDate = new Date(trace.x[i]);
          if ((!isNaN(startDate) && currentDate < startDate) || (!isNaN(endDate) && currentDate > endDate)) continue;
          newX.push(trace.x[i]);
          newY.push(trace.y[i]);
          if (trace.hovertext) newHover.push(trace.hovertext[i]);
        }
        return {
          ...trace,
          x: newX,
          y: newY,
          hovertext: newHover.length ? newHover : trace.hovertext
        };
      });

      Plotly.react(plotDiv, newData, layout);
    }

    start.addEventListener('change', filterData);
    end.addEventListener('change', filterData);
  });
});
