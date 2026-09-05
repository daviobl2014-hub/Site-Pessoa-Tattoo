/* ARQUIVO TEMPORARIO DE DIAGNOSTICO - apagar depois */
(function () {
  function rodar() {
    var docEl = document.documentElement;
    var larguraVisivel = docEl.clientWidth;
    var larguraReal = docEl.scrollWidth;

    var culpados = [];
    document.querySelectorAll('body *').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      // ignora quem esta dentro de um container rolavel (ex: carrossel da galeria):
      // esses vazam em relacao a viewport mas rolam na propria caixa
      var pai = el.parentElement;
      var dentroDeScroll = false;
      while (pai && pai !== document.body) {
        var ov = getComputedStyle(pai).overflowX;
        if (ov === 'auto' || ov === 'scroll' || ov === 'hidden') {
          dentroDeScroll = true;
          break;
        }
        pai = pai.parentElement;
      }
      if (dentroDeScroll) return;
      var vazaDireita = r.right > larguraVisivel + 1;
      var vazaEsquerda = r.left < -1;
      if (!vazaDireita && !vazaEsquerda) return;
      culpados.push({
        el: el,
        lado: vazaDireita ? 'direita' : 'esquerda',
        excesso: Math.round(vazaDireita ? r.right - larguraVisivel : -r.left),
        largura: Math.round(r.width),
      });
    });

    // o mais externo de cada ramo interessa mais que os filhos herdados
    culpados.sort(function (a, b) { return b.excesso - a.excesso; });

    culpados.slice(0, 6).forEach(function (c) {
      c.el.style.outline = '2px solid red';
      c.el.style.outlineOffset = '-2px';
    });

    function nome(el) {
      return el.tagName.toLowerCase() +
        (el.id ? '#' + el.id : '') +
        (el.className && typeof el.className === 'string'
          ? '.' + el.className.trim().split(/\s+/).join('.')
          : '');
    }

    var linhas = culpados.slice(0, 10).map(function (c) {
      return nome(c.el) + ' — vaza ' + c.excesso + 'px pela ' + c.lado +
        ' (largura ' + c.largura + 'px)';
    });

    var painel = document.getElementById('debug-overflow-painel');
    if (!painel) {
      painel = document.createElement('div');
      painel.id = 'debug-overflow-painel';
      document.body.appendChild(painel);
    }
    painel.setAttribute('style', [
      'position:fixed', 'left:0', 'top:0', 'z-index:99999',
      'max-width:100%', 'box-sizing:border-box',
      'background:#111', 'color:#0f0', 'border:2px solid #0f0',
      'font:11px/1.45 monospace', 'padding:8px', 'white-space:pre-wrap',
      'overflow-wrap:anywhere', 'pointer-events:none',
    ].join(';'));

    painel.textContent =
      'viewport (clientWidth): ' + larguraVisivel + 'px\n' +
      'documento (scrollWidth): ' + larguraReal + 'px\n' +
      'excesso total: ' + (larguraReal - larguraVisivel) + 'px\n' +
      '--------------------------------\n' +
      (linhas.length ? linhas.join('\n') : 'nenhum elemento vazando');

    console.log('[debug-overflow]', larguraVisivel, '->', larguraReal, culpados);
  }

  window.addEventListener('load', rodar);
  window.addEventListener('resize', rodar);
})();
