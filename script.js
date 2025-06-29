
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('details').forEach((section) => {
    const plotDiv = section.querySelector('.plot-container div');
    if (!plotDiv) return;

    // Criar inputs de data
    const wrapper = document.createElement('div');
    wrapper.style.marginBottom = '10px';

    const start = document.createElement('input');
    start.type = 'date';
    start.style.marginRight = '10px';

    const end = document.createElement('input');
    end.type = 'date';

    wrapper.appendChild(start);
    wrapper.appendChild(end);
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
