// ===== SEGMENT SYSTEM FUNCTIONS =====
// Arquivo dedicado para funções de controle de segmentos e animações

function initializeSegmentSystem() {
  // Garantir que todas as estruturas estão inicializadas
  if (!window.segmentSystemState.segmentAnimations) {
    window.segmentSystemState.segmentAnimations = [0, 1, 2, 3, 4];
  }

  if (!window.segmentSystemState.segmentVisibility) {
    window.segmentSystemState.segmentVisibility = { 0: true, 1: true, 2: true, 3: true, 4: true };
  }
}

function setupSegmentSystem() {
  initializeSegmentSystem();
}

// ===== FUNÇÕES DE VERIFICAÇÃO E CONSULTA =====

function shouldDrawSegment(segmentIndex) {
  // Verificar se o segmento deve ser desenhado baseado na visibilidade
  return window.segmentSystemState.segmentVisibility[segmentIndex] === true;
}

function getActiveSegments() {
  return Object.keys(window.segmentSystemState.segmentVisibility)
    .filter(key => window.segmentSystemState.segmentVisibility[key])
    .map(Number);
}

// ===== FUNÇÕES DE MAPEAMENTO =====

function applyAnimationMapping() {
  const activeSegments = getActiveSegments();

  if (activeSegments.length === 0) {
    return;
  }

  // Criar mapeamento de segmentos invisíveis para visíveis
  const segmentMapping = createSegmentMapping(activeSegments);

  for (let i = 0; i < window.letterPoints.length; i++) {
    const p = window.letterPoints[i];
    const previousSegment = p.segment;
    const previousAnimationType = window.segmentSystemState.segmentAnimations[p.segment];

    // Armazenar segmento original se não existir
    if (typeof p.originalSegment === 'undefined') {
      p.originalSegment = p.segment;
    }

    // Aplicar mapeamento baseado no segmento original
    if (window.segmentSystemState.segmentVisibility[p.originalSegment]) {
      // Se o segmento original está visível, mantém
      p.segment = p.originalSegment;
    } else {
      // Se o segmento original está invisível, mapeia para um substituto
      p.segment = segmentMapping[p.originalSegment];
    }

    // Obter novo tipo de animação
    const newAnimationType = window.segmentSystemState.segmentAnimations[p.segment];

    // Só reconfigurar se o segmento ou tipo de animação mudou
    if (p.segment !== previousSegment || newAnimationType !== previousAnimationType) {
      configureSegmentParams(p);
    }
  }
}

function createSegmentMapping(activeSegments) {
  const mapping = {};

  // Para cada segmento, construir mapa de segmentos válidos por letra
  const validSegmentsByLetter = new Map();
  window.letterPoints.forEach(p => {
    if (!validSegmentsByLetter.has(p.letterIndex)) {
      validSegmentsByLetter.set(p.letterIndex, new Set());
    }
    validSegmentsByLetter.get(p.letterIndex).add(p.originalSegment);
  });

  // Para cada segmento inativo, mapear para um segmento ativo válido
  for (let segmentIndex = 0; segmentIndex < 5; segmentIndex++) {
    if (window.segmentSystemState.segmentVisibility[segmentIndex]) {
      // Se está visível, mantém o mesmo
      mapping[segmentIndex] = segmentIndex;
    } else {
      // Se está invisível, precisa encontrar um substituto válido
      mapping[segmentIndex] = null; // Inicialmente null
    }
  }

  return mapping;
}

function createSmartSegmentMapping(activeSegments) {
  const mapping = {};

  // Mapear segmentos invisíveis para os mais "próximos" visualmente
  const segmentProximity = {
    0: [1, 2, 3, 4], // Segmento 0 prefere ser substituído por 1, depois 2, etc.
    1: [0, 2, 3, 4],
    2: [1, 3, 0, 4],
    3: [2, 4, 1, 0],
    4: [3, 2, 1, 0]
  };

  for (let segmentIndex = 0; segmentIndex < 5; segmentIndex++) {
    if (window.segmentSystemState.segmentVisibility[segmentIndex]) {
      mapping[segmentIndex] = segmentIndex;
    } else {
      // Encontrar o primeiro segmento "próximo" que está ativo
      const proximityList = segmentProximity[segmentIndex];
      let substitute = activeSegments[0]; // fallback

      for (let proximateSegment of proximityList) {
        if (activeSegments.includes(proximateSegment)) {
          substitute = proximateSegment;
          break;
        }
      }

      mapping[segmentIndex] = substitute;
    }
  }

  return mapping;
}

// ===== CONFIGURAÇÃO DE PARÂMETROS =====

function configureSegmentParams(p) {
  // Limpar parâmetros anteriores
  p.lineSegment = null;
  p.waveParams = null;
  p.pulseParams = null;
  p.orgParams = null;

  // Configurar novos parâmetros baseado no segmento atual
  switch (p.segment) {
    case 0: // Flocking
      p.maxSpeed = 2;
      p.maxForce = 0.2;
      break;

    case 1: // Bass orbital motion - MOVIMENTO ORBITAL RESPONSIVO AO BASS
      // MOVIMENTO ORBITAL: cada partícula orbita em torno da sua posição original
      // RAIO ORBITAL: bass * peakMultiplier * 25 (aumenta com bass)
      // VELOCIDADE ORBITAL: 0.04 (base) + bass * peakMultiplier * 0.06 (adicional)
      // SEM BASS: órbita pequena constante (raio 3px) com velocidade lenta (0.02)
      // EFEITO: mantém forma das letras com movimento circular individual
      // Implementado no class.js com órbitas locais por partícula
      p.pulseParams = {
        frequency: random(0.03, 0.08),
        amplitude: random(2, 4),
        phase: random(TWO_PI)
      };
      break;

    case 2: // Mid Wave - MOVIMENTO ONDULAR SIMPLES E DIRETO 🌊
      // MOVIMENTO ONDULAR: simples e direto, lado a lado + vertical suave
      // AMPLITUDE BASE: 20px sempre visível + 0-40px extra com mid
      // MOVIMENTO PRINCIPAL: horizontal (sin) para movimento lado a lado
      // MOVIMENTO SECUNDÁRIO: vertical suave (cos * 0.6) para naturalidade
      // SEMPRE EM MOVIMENTO: nunca para, só intensifica com áudio
      // EFEITO: movimento ondular claro e bem visível!
      p.waveParams = {
        amplitude: random(1, 3),
        frequency: random(0.05, 0.1),
        phase: random(TWO_PI)
      };
      break;

    case 3: // Lines
      // PRESERVAR coordenadas da linha se já existem (vindas do canvas)
      let existingLineCoords = null;
      if (p.lineSegment && p.lineSegment.x1 !== undefined) {
        existingLineCoords = {
          x1: p.lineSegment.x1,
          y1: p.lineSegment.y1,
          x2: p.lineSegment.x2,
          y2: p.lineSegment.y2
        };
        console.log(`[configureSegmentParams] 🎵 PRESERVANDO coordenadas da linha: x1=${existingLineCoords.x1}, y1=${existingLineCoords.y1}, x2=${existingLineCoords.x2}, y2=${existingLineCoords.y2}`);
      }
      
      p.lineSegment = {
        freqIndex: floor(random(40, 120)),
        amplitudeFactor: random(2, 6),
        frequencyShift: random(-2, 2),
        timbralVariation: random(0.8, 1.2),
        currentOffset1: createVector(0, 0),
        currentOffset2: createVector(0, 0),
        targetOffset1: createVector(0, 0),
        targetOffset2: createVector(0, 0)
      };
      
      // RESTAURAR coordenadas preservadas
      if (existingLineCoords) {
        p.lineSegment.x1 = existingLineCoords.x1;
        p.lineSegment.y1 = existingLineCoords.y1;
        p.lineSegment.x2 = existingLineCoords.x2;
        p.lineSegment.y2 = existingLineCoords.y2;
        console.log(`[configureSegmentParams] 🎵 RESTAURADAS coordenadas: x1=${p.lineSegment.x1}, y1=${p.lineSegment.y1}, x2=${p.lineSegment.x2}, y2=${p.lineSegment.y2}`);
      }
      
      p.seed = random(1000);
      break;

    case 4: // Organic
      p.orgParams = {
        amplitude: random(1, 3),
        frequency: random(0.05, 0.1),
        phase: random(TWO_PI),
        baseAmplitude: random(0.8, 1.5)
      };
      break;
  }

  // Garantir que todos os parâmetros necessários existam
  if (!p.orgParams && p.segment === 4) {
    p.orgParams = {
      amplitude: random(1, 3),
      frequency: random(0.05, 0.1),
      phase: random(TWO_PI),
      baseAmplitude: random(0.8, 1.5)
    };
  }

  // Garantir que vetores estão inicializados
  if (p.segment === 3 && p.lineSegment) {
    if (!p.lineSegment.currentOffset1) p.lineSegment.currentOffset1 = createVector(0, 0);
    if (!p.lineSegment.currentOffset2) p.lineSegment.currentOffset2 = createVector(0, 0);
    if (!p.lineSegment.targetOffset1) p.lineSegment.targetOffset1 = createVector(0, 0);
    if (!p.lineSegment.targetOffset2) p.lineSegment.targetOffset2 = createVector(0, 0);
  }

  // Garantir que posição e velocidade existam
  if (!p.pos) p.pos = createVector(p.x || 0, p.y || 0);
  if (!p.vel) p.vel = createVector(0, 0);
  if (!p.acc) p.acc = createVector(0, 0);
}

// ===== FUNÇÕES DE RANDOMIZAÇÃO =====

function shuffleAnimations() {
  let animations = [];
  for (let i = 0; i < 5; i++) {
    animations[i] = i;
  }

  // Embaralhar usando Fisher-Yates
  for (let i = animations.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [animations[i], animations[j]] = [animations[j], animations[i]];
  }

  segmentAnimations = animations;

  // Atualizar segmento selecionado
  updateSelectedSegment();

  // Atualizar todas as partículas para usar as novas animações
  for (let p of window.letterPoints) {
    const newAnimationType = segmentAnimations[p.segment];
    if (p.animationType !== newAnimationType) {
      p.animationType = newAnimationType;
      configureSegmentParams(p);
    }
  }
}

function randomizeSegments() {
  // 1. Agrupar partículas por letra e por segmento atual
  const particlesByLetter = {};
  for (let p of window.letterPoints) {
    if (!particlesByLetter[p.letterIndex]) {
      particlesByLetter[p.letterIndex] = {};
    }

    const currentSegment = p.segment;
    if (!particlesByLetter[p.letterIndex][currentSegment]) {
      particlesByLetter[p.letterIndex][currentSegment] = [];
    }

    particlesByLetter[p.letterIndex][currentSegment].push(p);
  }

  // 2. Para cada letra, trocar comportamentos entre segmentos ativos
  Object.values(particlesByLetter).forEach(letterSegments => {
    const activeSegments = Object.keys(letterSegments).filter(
      segment => window.segmentSystemState.segmentVisibility[segment]
    ).map(Number);

    if (activeSegments.length < 2) return;

    // 3. Embaralhar os segmentos ativos
    const shuffledSegments = [...activeSegments];
    for (let i = shuffledSegments.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledSegments[i], shuffledSegments[j]] = [shuffledSegments[j], shuffledSegments[i]];
    }

    // 4. Aplicar a troca de comportamentos
    activeSegments.forEach((currentSegment, index) => {
      const newSegment = shuffledSegments[index];
      const particles = letterSegments[currentSegment];

      particles.forEach(p => {
        // Manter posição original
        const originalPos = p.originalPos.copy();
        const currentPos = p.pos.copy();

        // Trocar comportamento
        p.segment = newSegment;
        configureSegmentParams(p);

        // Restaurar posições
        p.originalPos = originalPos;
        p.pos = currentPos;
      });
    });
  });
}

function randomizeSegmentVisibility() {
  // Garantir que pelo menos 2 segmentos fiquem visíveis
  const minVisibleSegments = 2;
  const totalSegments = 5;

  // Resetar visibilidade
  for (let i = 0; i < totalSegments; i++) {
    window.segmentSystemState.segmentVisibility[i] = false;
  }

  // Selecionar segmentos aleatórios para ficarem visíveis
  const numVisible = Math.floor(Math.random() * (totalSegments - minVisibleSegments + 1)) + minVisibleSegments;
  const visibleIndices = [];

  while (visibleIndices.length < numVisible) {
    const randomIndex = Math.floor(Math.random() * totalSegments);
    if (!visibleIndices.includes(randomIndex)) {
      visibleIndices.push(randomIndex);
      window.segmentSystemState.segmentVisibility[randomIndex] = true;
    }
  }
}

// ===== FUNÇÕES DE VISIBILIDADE E CONTROLE =====

function updateSegmentVisibility(segmentIndex, isVisible) {
  // Verificar se há pelo menos dois segmentos ativos antes de desativar
  let activeCount = Object.values(segmentVisibility).filter(v => v).length;

  segmentVisibility[segmentIndex] = isVisible;

  // Se estiver desativando um segmento
  if (!isVisible) {
    // Obter lista de segmentos ativos disponíveis
    const activeSegments = Object.entries(segmentVisibility)
      .filter(([_, visible]) => visible && parseInt(_) !== segmentIndex)
      .map(([_]) => parseInt(_));

    // Agrupar partículas por letra
    const particlesByLetter = {};
    window.letterPoints.forEach(p => {
      if (!particlesByLetter[p.letterIndex]) {
        particlesByLetter[p.letterIndex] = [];
      }
      particlesByLetter[p.letterIndex].push(p);
    });

    // Para cada letra, encontrar um segmento ativo disponível
    Object.values(particlesByLetter).forEach(letterParticles => {
      // Encontrar segmentos ativos que existem nesta letra
      const availableSegments = activeSegments.filter(segment =>
        letterParticles.some(p => p.originalSegment === segment)
      );

      if (availableSegments.length > 0) {
        // Escolher aleatoriamente um dos segmentos disponíveis
        const targetSegment = availableSegments[
          Math.floor(Math.random() * availableSegments.length)
        ];

        // Atribuir o segmento escolhido a todas as partículas do segmento desativado nesta letra
        letterParticles.forEach(p => {
          if (p.segment === segmentIndex) {
            p.segment = targetSegment;
            configureSegmentParams(p);
          }
        });
      }
    });
  } else {
    // Se estiver reativando um segmento, restaurar segmentos originais
    window.letterPoints.forEach(p => {
      if (p.originalSegment === segmentIndex) {
        p.segment = p.originalSegment;
        configureSegmentParams(p);
      }
    });
  }
}

function findNextValidSegment(particle) {
  // Procurar primeiro segmento visível que seja válido para esta letra
  for (let i = 0; i < particle.numSegments; i++) {
    if (i !== particle.originalSegment &&
        segmentVisibility[i] &&
        i < particle.numSegments) {
      return i;
    }
  }
  // Se não encontrar, manter o original
  return particle.originalSegment;
}

function toggleAllSegments() {
  let anyVisible = Object.values(segmentVisibility).some(visible => visible);
  let newState = !anyVisible;

  // Se estamos desativando todos, manter pelo menos um ativo
  if (!newState) {
    segmentVisibility[0] = true;
    segmentCheckboxes[0].checked(true);

    for (let i = 1; i < 5; i++) {
      segmentVisibility[i] = false;
      segmentCheckboxes[i].checked(false);
    }
  } else {
    // Ativar todos
    for (let i = 0; i < 5; i++) {
      segmentVisibility[i] = true;
      segmentCheckboxes[i].checked(true);
    }
  }

  // Atualizar todas as partículas para usar as novas configurações
  for (let p of window.letterPoints) {
    if (p.originalSegment !== undefined) {
      if (segmentVisibility[p.originalSegment]) {
        p.segment = p.originalSegment;
      } else {
        p.segment = findNextValidSegment(p);
      }
      configureSegmentParams(p);
    }
  }
}

function toggleSegmentVisibility(segmentIndex) {
  if (segmentIndex >= 0 && segmentIndex < 5) {
    window.segmentSystemState.segmentVisibility[segmentIndex] = !window.segmentSystemState.segmentVisibility[segmentIndex];
   
    // Aplicar mapeamento após mudança de visibilidade
    applyAnimationMapping();
  }
}

// ===== FUNÇÕES AUXILIARES =====

function ensureVectorSafety() {
  if (this.segment === 3 && this.lineSegment) {
    const segment = this.lineSegment;

    // Criar novos vetores se não existirem ou estiverem inválidos
    if (!segment.currentOffset1 || !(segment.currentOffset1 instanceof p5.Vector)) {
      segment.currentOffset1 = createVector(0, 0);
    }
    if (!segment.currentOffset2 || !(segment.currentOffset2 instanceof p5.Vector)) {
      segment.currentOffset2 = createVector(0, 0);
    }
    if (!segment.targetOffset1 || !(segment.targetOffset1 instanceof p5.Vector)) {
      segment.targetOffset1 = createVector(0, 0);
    }
    if (!segment.targetOffset2 || !(segment.targetOffset2 instanceof p5.Vector)) {
      segment.targetOffset2 = createVector(0, 0);
    }
  }
}

function setRenderModeSegmentCount(mode) {
  // Se mudou de modo, gerar novo número de segmentos
  if (window.segmentSystemState.lastRenderMode !== mode) {
    window.segmentSystemState.currentModeSegmentCount = floor(random(2, 6)); // 2, 3, 4 ou 5 segmentos
    window.segmentSystemState.lastRenderMode = mode;
  }

  return window.segmentSystemState.currentModeSegmentCount;
}

function resetRenderMode() {
  window.segmentSystemState.lastRenderMode = null;
}

function getSegmentCount(letterIndex, char) {
  const letterKey = `${char}_${letterIndex}`;

  // Se já existe um número de segmentos para esta posição específica, manter
  if (activeLetterSegments.has(letterKey)) {
    return activeLetterSegments.get(letterKey);
  }

  // Se é uma nova letra ou uma letra reescrita em nova posição
  const segments = floor(random(2, 6));
  activeLetterSegments.set(letterKey, segments);

  return segments;
}

function calculateSegmentFromPosition(normalX, normalY, numSegments) {
  // Agrupamento espacial por setores angulares
  const angle = Math.atan2(normalY - 0.5, normalX - 0.5) + Math.PI; // 0 a 2PI
  const sector = Math.floor((angle / (2 * Math.PI)) * numSegments);
  return sector;
}

function updateSelectedSegment() {
  const activeSegments = Object.entries(segmentVisibility)
    .filter(([_, visible]) => visible)
    .map(([index]) => parseInt(index));

  if (activeSegments.length > 0) {
    selectedSegmentForCamera = activeSegments[
      Math.floor(Math.random() * activeSegments.length)
    ];
  }
}

// ===== INTERFACE PARA BOTÕES =====

function handleRandomizeButton() {
  randomizeSegments();
}

