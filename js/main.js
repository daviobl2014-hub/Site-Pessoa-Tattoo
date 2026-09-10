/* ================================================================
   PESSÔA TATTOO — scripts do site
   Cada bloco é protegido por uma checagem, para que este mesmo
   arquivo possa ser usado em páginas que não têm todas as seções.
   ================================================================ */

/* ================================================================
   1. GALERIA — carrossel e filtros
   ================================================================ */
const galeria = document.querySelector('.galeria');

if (galeria) {
  const trilho = galeria.querySelector('.trilho');
  const prev = galeria.querySelector('.prev');
  const next = galeria.querySelector('.next');
  const botoes = galeria.querySelectorAll('.filtros button');

  /* quanto rolar por clique: largura de um card + o gap */
  function passo() {
    const item = trilho.querySelector('.g-item:not([hidden])');
    if (!item) return 284;
    const gap = parseFloat(getComputedStyle(trilho).columnGap) || 14;
    return item.offsetWidth + gap;
  }

  /* desliga a seta quando a rolagem chega na ponta */
  function atualizaSetas() {
    const fim = trilho.scrollWidth - trilho.clientWidth - 2;
    prev.disabled = trilho.scrollLeft <= 2;
    next.disabled = trilho.scrollLeft >= fim;
  }

  prev.addEventListener('click', () => trilho.scrollBy({ left: -passo() }));
  next.addEventListener('click', () => trilho.scrollBy({ left: passo() }));

  trilho.addEventListener('scroll', atualizaSetas, { passive: true });
  window.addEventListener('resize', atualizaSetas);

  /* filtros por categoria */
  botoes.forEach((btn) => {
    btn.addEventListener('click', () => {
      botoes.forEach((b) => b.classList.remove('is-ativo'));
      btn.classList.add('is-ativo');

      const cat = btn.dataset.filtro;
      trilho.querySelectorAll('.g-item').forEach((item) => {
        item.hidden = !(cat === 'todos' || item.dataset.cat === cat);
      });

      trilho.scrollTo({ left: 0 });
      setTimeout(atualizaSetas, 50);
    });
  });

  atualizaSetas();
}

/* ================================================================
   2. LIGHTBOX — popup da foto ao clicar no card
   ================================================================ */
const lightbox = document.getElementById('lightbox');

if (lightbox && galeria) {
  const lbImg = lightbox.querySelector('img');
  const lbLegenda = lightbox.querySelector('.lightbox-legenda');

  galeria.querySelectorAll('.g-item').forEach((item) => {
    item.addEventListener('click', () => {
      const foto = item.querySelector('img');
      const legenda = item.querySelector('figcaption');

      lbImg.src = foto.src;
      lbImg.alt = foto.alt;
      lbLegenda.textContent = legenda ? legenda.textContent : '';

      lightbox.showModal();
    });
  });

  lightbox
    .querySelector('.lightbox-fechar')
    .addEventListener('click', () => lightbox.close());

  /* clicar no fundo (fora da foto) fecha */
  lightbox.addEventListener('click', (evento) => {
    if (evento.target === lightbox) lightbox.close();
  });
}

/* ================================================================
   3. BOTÃO FLUTUANTE DO WHATSAPP
   Só aparece depois que o hero sai da tela — no hero já existe
   um botão de agendamento, e dois competiriam entre si.
   ================================================================ */
const btnFlutuante = document.querySelector('.logo-whatssap');
const hero = document.querySelector('.hero');

if (btnFlutuante && hero) {
  const observador = new IntersectionObserver(
    ([entrada]) => {
      btnFlutuante.classList.toggle('visivel', !entrada.isIntersecting);
    },
    { threshold: 0 },
  );

  observador.observe(hero);
}

/* ================================================================
   4. NAV — destaca o link da seção que está na tela
   ================================================================ */
const secoes = document.querySelectorAll('section[id]');
const linksNav = document.querySelectorAll('.nav-links a[href^="#"]');

if (secoes.length && linksNav.length) {
  const observadorNav = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (!entrada.isIntersecting) return;

        linksNav.forEach((link) => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === '#' + entrada.target.id,
          );
        });
      });
    },
    /* faixa estreita no meio da tela: evita o menu piscar
       quando duas seções aparecem ao mesmo tempo */
    { rootMargin: '-40% 0px -55% 0px' },
  );

  secoes.forEach((secao) => observadorNav.observe(secao));
}
const cabecalhos = document.querySelectorAll('.cabecalho-item');

cabecalhos.forEach((cabecalho) => {
  cabecalho.addEventListener('click', () => {
    // Fecha todos os outros
    cabecalhos.forEach((item) => {
      if (item !== cabecalho) {
        item.classList.remove('aberto');
      }
    });

    // Abre ou fecha o clicado
    cabecalho.classList.toggle('aberto');
  });
});

/* ================================================================
   5. MENU HAMBÚRGUER — só existe abaixo de 500px
   O CSS é quem esconde/mostra; aqui só cuidamos do estado.
   ================================================================ */
const btnMenu = document.querySelector('.btn-menu');
const cabecalho = document.querySelector('.header');

if (btnMenu && cabecalho) {
  const abrirFechar = (abrir) => {
    cabecalho.classList.toggle('menu-aberto', abrir);
    btnMenu.setAttribute('aria-expanded', String(abrir));
    btnMenu.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
  };

  btnMenu.addEventListener('click', () => {
    abrirFechar(!cabecalho.classList.contains('menu-aberto'));
  });

  /* clicou num link interno (nav ou logo): o menu já cumpriu o papel.
     as redes sociais ficam de fora: abrem em outra aba */
  cabecalho.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', () => abrirFechar(false));
  });

  document.addEventListener('keydown', (evento) => {
    if (evento.key === 'Escape') abrirFechar(false);
  });

  /* voltou para tela larga com o menu aberto: o CSS já mostra tudo,
     mas a classe sobraria e o ícone ficaria no "X" */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 500) abrirFechar(false);
  });
}

/* ============================================================
   ANIMACOES NA ROLAGEM
   antes as animacoes rodavam todas no load do site, entao quem
   chegava na galeria ou nas duvidas ja encontrava tudo parado.
   agora cada secao so solta a sua animacao na primeira vez que
   aparece na tela.

   o CSS deixa tudo com animation-play-state: paused; aqui a
   gente so tira a pausa adicionando .na-tela na secao.
   ============================================================ */
const secoesAnimadas = document.querySelectorAll('section');

if (secoesAnimadas.length) {
  /* avisa o css que o js esta no ar: sem essa classe nada fica
     pausado, entao se o script falhar o site aparece do mesmo jeito */
  document.documentElement.classList.add('js-anima');

  const semMovimento = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (semMovimento || !('IntersectionObserver' in window)) {
    /* navegador antigo ou usuario que pediu menos movimento:
       libera tudo de uma vez */
    secoesAnimadas.forEach((secao) => secao.classList.add('na-tela'));
  } else {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add('na-tela');
          /* animacao de entrada e so na primeira vez: para de observar */
          observador.unobserve(entrada.target);
        });
      },
      {
        /* dispara quando ~15% da secao aparece, tirando 10% da
           borda de baixo pra nao acionar cedo demais */
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px',
      }
    );

    secoesAnimadas.forEach((secao) => observador.observe(secao));
  }
}
