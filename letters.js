if (typeof window !== 'undefined') {
    if (!window.letterPoints) window.letterPoints = [];
} else {
    globalThis.letterPoints = [];
}

if (typeof window !== 'undefined') {
    window.letterPoints = window.letterPoints;
    if (typeof createVectorLetterSingle === 'function') {
        window.createVectorLetterSingle = createVectorLetterSingle;
    }
    if (typeof createGridLetterSingle === 'function') {
        window.createGridLetterSingle = createGridLetterSingle;
    }
}

function getCustomKerning(char, nextChar = null) {
  // Configuração do espaçamento das letras - mais compacto (5% do fontSize)
  const defaultSpacing = 0.05;
  
  // Retornar espaçamento padrão para todas as letras
  // Isso garante que todas as letras tenham o mesmo espaçamento base
  return defaultSpacing;
}

// Função para calcular largura de texto (copiada do textarea.js)
function calculateTextWidth(text, fontSz) {
  if (!text || text.length === 0) return 0;

  let testCanvas = createGraphics(500, 100);
  // Usar a variável global font se disponível, senão usar a fonte padrão
  if (typeof font !== 'undefined' && font) {
    testCanvas.textFont(font);
  }
  testCanvas.textSize(fontSz);
  let width = testCanvas.textWidth(text);
  testCanvas.remove();
  return width;
}

// Função para determinar os limites de uma letra em um buffer gráfico
function getLetterBounds(graphics) {
  let minX = graphics.width;
  let maxX = 0;
  let minY = graphics.height;
  let maxY = 0;
  let foundPixel = false;

  // Examinar cada pixel do buffer para encontrar os limites da letra
  for (let x = 0; x < graphics.width; x++) {
    for (let y = 0; y < graphics.height; y++) {
      // Calcular o índice do pixel no array de pixels
      const index = 4 * (y * graphics.width + x);
      
      // Verificar se é um pixel não-transparente (branco)
      if (graphics.pixels[index + 3] > 0) {
        foundPixel = true;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
  }

  // Se não encontrou nenhum pixel, retornar valores padrão
  if (!foundPixel) {
    return { minX: 0, maxX: graphics.width / 2, minY: 0, maxY: graphics.height / 2 };
  }

  return { minX, maxX, minY, maxY };
}

//funcoes vetorial ----------------------------------------
function createVectorLetterSingle(char, charIndex, startX, yBase, nextChar = null) {
  
  if (!char || char === ' ') return startX;

  const anatomy = new LetterAnatomy();

  // anatomy já tem capHeight, xHeight, ascender, descender calculados corretamente

  const charBaseline = anatomy.getCharacterBaseline(char);
  const charTopLine = anatomy.getCharacterTopLine(char);
  const charBottomLine = anatomy.getCharacterBottomLine(char);
  const charCenterY = anatomy.getCharacterCenterY(char);
  const charHeight = anatomy.getCharacterHeight(char);

  const charOffsetY = anatomy.getCharacterOffsetY(char);
  const charScaleY = anatomy.getCharacterScaleY(char);

  // Canvas para esta letra específica
  let canvasWidth = fontSize * 1.4;
  let totalTypographicHeight = Math.abs(anatomy.ascender - anatomy.descender);
  let canvasHeight = totalTypographicHeight * 1.2;
  // baseline local do canvas offscreen deve coincidir com a baseline global
  let canvasBaselineY = canvasHeight * 0.8;

  let offscreen = createGraphics(int(canvasWidth), int(canvasHeight));
  offscreen.background(0);
  offscreen.fill(255);
  offscreen.noStroke();
  offscreen.textFont(font);
  offscreen.textSize(fontSize);
  offscreen.textAlign(CENTER, BASELINE);
  offscreen.text(char, offscreen.width / 2, canvasBaselineY);
  offscreen.loadPixels();

  // Determinar bounds da letra
  let letterBounds = getLetterBounds(offscreen);
  let minX = letterBounds.minX;
  let maxX = letterBounds.maxX;
  let minY = letterBounds.minY;
  let maxY = letterBounds.maxY;

  let letterWidth = maxX - minX;
  let letterHeight = maxY - minY;

  // Verificar se encontrou pixels válidos
  if (letterWidth <= 0 || letterHeight <= 0) {
    console.warn(`Letra '${char}' não foi detectada corretamente`);
    offscreen.remove();
    return startX + fontSize * 0.6;
  }

  window.letterPoints.forEach(p => {
    if (!p.renderType) {
      p.renderType = 'vector';
    }
  });

  let gridSize = particleDensity;
  // Calcular a posição central da letra corretamente
  // startX é a posição onde a letra deve começar, não o centro
  let letterCenterX = startX + (letterWidth / 2);

  let numSegments = getSegmentCount(charIndex, char);

  const letterScale = letterHeight / fontSize;
  const segmentBaseSize = {
    minLength: 15 * letterScale,
    maxLength: 30 * letterScale,
    minRadius: 5 * letterScale,
    maxRadius: 15 * letterScale
  };

  // Criar partículas para esta letra específica
  let pointsCreated = new Set(); // Para evitar duplicatas

  for (let x = minX; x <= maxX; x += gridSize) {
    for (let y = minY; y <= maxY; y += gridSize) {
      let index = (x + y * offscreen.width) * 4;

      if (index >= 0 && index < offscreen.pixels.length && offscreen.pixels[index] > 50) {
  let relX = x - offscreen.width / 2;
  let pixelDistanceFromCanvasBaseline = y - canvasBaselineY;
  let globalY = anatomy.baseline + pixelDistanceFromCanvasBaseline;
  let globalX = letterCenterX + relX;

        // Criar chave única para esta posição
        let posKey = `${Math.round(globalX)},${Math.round(globalY)}`;

        // Só criar ponto se não existir nesta posição
        if (!pointsCreated.has(posKey)) {
          pointsCreated.add(posKey);

          // Normalizar coordenadas para cálculo do segmento
          let normalX = (x - minX) / letterWidth;
          let normalY = (y - minY) / letterHeight;

          // Determinar segmento baseado na posição normalizada
          let originalSegment = calculateSegmentFromPosition(normalX, normalY, numSegments);

          // Verificar se o segmento deve ser criado
          if (shouldDrawSegment(originalSegment)) {
            // Adicionar variação à posição inicial para evitar pontos estáticos
            let jitter = gridSize * 0.25;
            let jitteredX = globalX + random(-jitter, jitter);
            let jitteredY = globalY + random(-jitter, jitter);

            let particle = new Particle(
              jitteredX,
              jitteredY,
              originalSegment,
              dist(jitteredX, jitteredY, width / 2, height / 2),
              atan2(jitteredY - height / 2, jitteredX - width / 2)
            );

            // Configurar propriedades adicionais
            particle.originalSegment = originalSegment;
            particle.originalPos = createVector(globalX, globalY); // Manter posição original sem jitter
            particle.character = char;
            particle.letterIndex = charIndex;
            particle.numSegments = numSegments;
            particle.renderType = 'vector';

            // Configurações específicas para segmentos 2 e 4
            if (originalSegment === 2) {
              particle.waveParams = {
                frequency: random(0.03, 0.08),
                amplitude: random(2, 4),
                phase: random(TWO_PI),
                baseAmplitude: random(1, 2)
              };
            } else if (originalSegment === 4) {
              particle.waveParams = {
                frequency: random(0.02, 0.06),
                amplitude: random(1.5, 3),
                phase: random(TWO_PI),
                baseAmplitude: random(0.8, 1.5)
              };
            }

            // Configurar parâmetros específicos do segmento
            configureSegmentParams(particle);

            window.letterPoints.push(particle);
          }
        }
      }
    }
  }

  offscreen.remove();
  // Aplicar kerning como ajuste na posição, não como espaçamento adicional
  const kerningAdjustment = fontSize * getCustomKerning(char, nextChar);
  return startX + calculateTextWidth(char, fontSize) + kerningAdjustment;
}

function drawLetterPoints() {
  if (window.isExportingFont) return;
  if (window.letterPoints.length === 0) return;

  // Verificar se quadTree existe e tem o método clear
  if (typeof quadTree !== 'undefined' && quadTree && typeof quadTree.clear === 'function') {
    quadTree.clear();
  } else {
    // Reinicializar quadTree se não existir
    if (typeof QuadTree !== 'undefined' && typeof Boundary !== 'undefined') {
      quadTree = new QuadTree(new Boundary(width / 2, height / 2, width, height), 10);
    }
  }
  
  for (let p of window.letterPoints) {
    // Só inserir no quadTree se o segmento estiver visível e quadTree existir
    if (shouldDrawSegment(p.segment) && quadTree && typeof quadTree.insert === 'function') {
      quadTree.insert(p);
    }
  }

  for (let p of window.letterPoints) {
    if (!shouldDrawSegment(p.segment)) continue;

    // Atualizar somente se o segmento estiver visível
    if (p.segment === 0 && !isInForm) {
      sharedRange.x = p.pos.x;
      sharedRange.y = p.pos.y;
      // Verificar se quadTree existe antes de usar query
      if (quadTree && typeof quadTree.query === 'function') {
        const neighbors = quadTree.query(sharedRange);
        p.flock(neighbors);
      }
    }
  }
}
//----------------------------------------------------------------------------------------------------------

//funcoes grelha -----------------------------------------
function createGridLetterSingle(char, charIndex, startX, yBase, graphicsBuffer, nextChar = null) {
  if (!char || char === ' ') return startX;

  const anatomy = new LetterAnatomy();

  // anatomy já tem capHeight, xHeight, ascender, descender calculados corretamente

  const charBaseline = anatomy.getCharacterBaseline(char);
  const charTopLine = anatomy.getCharacterTopLine(char);
  const charBottomLine = anatomy.getCharacterBottomLine(char);
  const charCenterY = anatomy.getCharacterCenterY(char);
  const charHeight = anatomy.getCharacterHeight(char);

  const charOffsetY = anatomy.getCharacterOffsetY(char);
  const charScaleY = anatomy.getCharacterScaleY(char);

  // Canvas para esta letra específica (igual à função vetorial)
  let canvasWidth = fontSize * 1.4;
  let totalTypographicHeight = Math.abs(anatomy.ascender - anatomy.descender);
  let canvasHeight = totalTypographicHeight * 1.2;
  // baseline local do canvas offscreen deve coincidir com a baseline global
  let canvasBaselineY = canvasHeight * 0.8;

  // Parâmetros da grelha - ajustados para evitar sobreposições
  const gridCellSize = fontSize / 15; // Reduzido de 15 para 12 para células menores
  const spacing = 2; // Reduzido para menos espaçamento
  const cellGridSize = 4; // Reduzido de 6 para 4 pontos por célula
  const cellSpacing = gridCellSize / cellGridSize;

  // Canvas com resolução adequada
  let offscreen = graphicsBuffer || createGraphics(int(canvasWidth), int(canvasHeight));
  offscreen.background(0);
  offscreen.fill(255);
  offscreen.noStroke();
  offscreen.textFont(font);
  offscreen.textSize(fontSize);
  offscreen.textAlign(CENTER, BASELINE);
  offscreen.text(char, offscreen.width / 2, canvasBaselineY);
  offscreen.loadPixels();
  // Determinar bounds da letra
  let letterBounds = getLetterBounds(offscreen);
  let minX = letterBounds.minX;
  let maxX = letterBounds.maxX;
  let minY = letterBounds.minY;
  let maxY = letterBounds.maxY;

  let letterWidth = maxX - minX;
  let letterHeight = maxY - minY;

  // Verificar se encontrou pixels válidos
  if (letterWidth <= 0 || letterHeight <= 0) {
    if (!graphicsBuffer) offscreen.remove();
    return startX + fontSize * 0.6;
  }

  window.letterPoints.forEach(p => {
    if (!p.renderType) {
      p.renderType = 'grid';
    }
  });

  // Calcular posição da letra corretamente
  // startX é a posição onde a letra deve começar, não o centro
  let letterCenterX = startX + (letterWidth / 2);

  let gridDensity = 15; // densidade alta, quadrados pequenos
  // Calcular número de células baseado na área da letra
  let letterArea = letterWidth * letterHeight;
  let targetCellArea = letterArea / (gridDensity * gridDensity);
  let cellSize = Math.sqrt(targetCellArea);
  cellSize = constrain(cellSize, fontSize / 24, fontSize / 10);

  // Calcular número de células em cada direção, mínimo 2
  let cellsX = Math.max(2, Math.ceil(letterWidth / cellSize));
  let cellsY = Math.max(2, Math.ceil(letterHeight / cellSize));

  // Ajustar cellSize para distribuição uniforme
  let adjustedCellSizeX = letterWidth / cellsX;
  let adjustedCellSizeY = letterHeight / cellsY;

  // Array para contar pixels em cada célula
  let cellDensity = Array(cellsX).fill().map(() => Array(cellsY).fill(0));

  // Calcular densidade de pixels em cada célula
  for (let x = minX; x < maxX; x++) {
    for (let y = minY; y < maxY; y++) {
      let index = (x + y * offscreen.width) * 4;
      if (offscreen.pixels[index] > 50) {
        let cellX = Math.floor((x - minX) / adjustedCellSizeX);
        let cellY = Math.floor((y - minY) / adjustedCellSizeY);
        if (cellX >= 0 && cellX < cellsX && cellY >= 0 && cellY < cellsY) {
          cellDensity[cellX][cellY]++;
        }
      }
    }
  }

  // Criar células apenas onde há densidade suficiente
  let densityThreshold = (adjustedCellSizeX * adjustedCellSizeY) * 0.6; // 60% de preenchimento

  for (let cellX = 0; cellX < cellsX; cellX++) {
    for (let cellY = 0; cellY < cellsY; cellY++) {
      if (cellDensity[cellX][cellY] >= densityThreshold) {
        // Calcular posição central da célula
        let centerX = minX + (cellX + 0.5) * adjustedCellSizeX;
        let centerY = minY + (cellY + 0.5) * adjustedCellSizeY;

  // Converter para coordenadas globais
  let globalX = letterCenterX + (centerX - offscreen.width / 2);
  let globalY = anatomy.baseline + (centerY - canvasBaselineY);

        // Criar caixa
        let box = {
          x: globalX - adjustedCellSizeX / 2,
          y: globalY - adjustedCellSizeY / 2,
          width: adjustedCellSizeX,
          height: adjustedCellSizeY,
          letterIndex: charIndex,
          cellX: cellX,
          cellY: cellY,
          character: char // <-- garantir que cada box tem a letra associada
        };

        letterBoxes.push(box);

        // Criar pontos dentro da célula
        let pointsPerSide = Math.ceil(map(gridDensity, 5, 30, 1, 3));
        let pointSpacingX = adjustedCellSizeX / (pointsPerSide + 1);
        let pointSpacingY = adjustedCellSizeY / (pointsPerSide + 1);

        for (let px = 1; px <= pointsPerSide; px++) {
          for (let py = 1; py <= pointsPerSide; py++) {
            let pointX = box.x + px * pointSpacingX;
            let pointY = box.y + py * pointSpacingY;

            // Adicionar variação controlada à posição
            let jitter = min(pointSpacingX, pointSpacingY) * 0.2;
            pointX += random(-jitter, jitter);
            pointY += random(-jitter, jitter);

            // Atribuir segmento aleatoriamente
            let segmentType = floor(random(5)); // 0 a 4 aleatoriamente

            createParticleAtPosition(pointX, pointY, segmentType, charIndex, char);
          }
        }
      }
    }
  }


  if (!graphicsBuffer) offscreen.remove();
  if (typeof window !== 'undefined') {
    window.letterBoxes = letterBoxes;
  }
  // Aplicar kerning como ajuste na posição, não como espaçamento adicional
  const kerningAdjustment = fontSize * getCustomKerning(char, nextChar);
  return startX + calculateTextWidth(char, fontSize) + kerningAdjustment;
}

// Função auxiliar para criar partículas
function createParticleAtPosition(x, y, segmentType, charIndex, char) {
  let particle = new Particle(
    x, y,
    getAudioTypeFromSegment(segmentType),
    dist(x, y, width / 2, height / 2),
    atan2(y - height / 2, x - width / 2)
  );

  particle.originalSegment = segmentType;
  particle.character = char;
  particle.letterIndex = charIndex;
  particle.segment = segmentType;
  particle.renderType = 'grid';

  // Configurar parâmetros específicos do segmento
  configureSegmentParams(particle);

  window.letterPoints.push(particle);
}

function drawLetterPointsGrid() {
  if (window.isExportingFont) return;
  if (window.letterPoints.length === 0) return;

  // Atualizar quadtree com verificação de segurança
  if (typeof quadTree !== 'undefined' && quadTree && typeof quadTree.clear === 'function') {
    quadTree.clear();
    for (let p of window.letterPoints) {
      if (quadTree && typeof quadTree.insert === 'function') {
        quadTree.insert(p);
      }
    }
  } else {
    // Reinicializar quadTree se não existir
    if (typeof QuadTree !== 'undefined' && typeof Boundary !== 'undefined') {
      quadTree = new QuadTree(new Boundary(width / 2, height / 2, width, height), 10);
      for (let p of window.letterPoints) {
        quadTree.insert(p);
      }
    }
  }

  // Suavização dos valores de áudio
  const audioSmoothFactor = 0.09;

  // Aplicar suavização temporal
  smoothedBass = lerp(smoothedBass || bassValue, bassValue, audioSmoothFactor);
  smoothedMid = lerp(smoothedMid || midValue, midValue, audioSmoothFactor);
  smoothedTreble = lerp(smoothedTreble || trebleValue, trebleValue, audioSmoothFactor);
  smoothedMic = lerp(smoothedMic || micLevel, micLevel, audioSmoothFactor);

  // Multiplicador de áudio com suavização
  let audioMultiplier = 1.0;
  if (typeof peakDetector !== 'undefined' && peakDetector) {
    audioMultiplier = peakDetector.getVisualMultiplier();
  }

  // Valores amplificados com curvas de resposta otimizadas
  const amplifiedBass = Math.pow(smoothedBass * 0.4, 1.2) * audioMultiplier;
  const amplifiedMid = Math.pow(smoothedMid * 0.7, 1.1) * audioMultiplier;
  const amplifiedTreble = Math.pow(smoothedTreble * 1.2, 1.8) * audioMultiplier;
  const amplifiedMic = Math.pow(smoothedMic * 1.0, 1.3) * audioMultiplier;

  // Parâmetros visuais
  const baseHue = 0;
  const baseSaturation = 0;
  const baseBrightness = darkMode ? 0 : 255;
  const minBrightness = darkMode ? 15 : 40;
  const maxBrightness = darkMode ? 0 : 255;

  push();

  for (let p of window.letterPoints) {
    switch (p.segment) {
      case 0: // Flocking com resposta de áudio suavizada
        if (typeof p.flock === 'function') {
          const range = {
            x: p.x || (p.pos ? p.pos.x : p.x),
            y: p.y || (p.pos ? p.pos.y : p.y),
            w: 40 * (1 + amplifiedMic * 0.8),
            h: 40 * (1 + amplifiedMic * 0.8)
          };
          // Verificar se quadTree existe antes de usar query
          if (quadTree && typeof quadTree.query === 'function') {
            const neighbors = quadTree.query(range);
            p.flock(neighbors);
          }
        }

        // Jitter suavizado
        const jitterAmount = amplifiedMic * 2.0;
        const baseX = p.x || (p.pos ? p.pos.x : p.x);
        const baseY = p.y || (p.pos ? p.pos.y : p.y);

        const posX = baseX + sin(frameCount * 0.1 + p.letterIndex * 0.5) * jitterAmount;
        const posY = baseY + cos(frameCount * 0.1 + p.letterIndex * 0.5) * jitterAmount;

        // Tamanho responsivo
        const avgAudio = (amplifiedBass + amplifiedMid + amplifiedTreble) / 3;
        const pointSize = (p.size || 3) * (1 + avgAudio * 1.5);

        // Cor fixa (preto ou branco)
        fill(darkMode ? 0 : 255);
        noStroke();
        ellipse(posX, posY, pointSize, pointSize);
        break;

      case 1: // Bass com pulsação controlada e rotação 360º em grupo
        // Pulsação do TAMANHO controlada mas visível
        const bassResponse = amplifiedBass * 5; // AUMENTADO: Resposta mais intensa
        
        // Pulsação do tamanho das partículas - MAIS INTENSA
        const pulseFreq = 0.1 + bassResponse * 1.0; // AUMENTADO: Frequência mais rápida
        const pulsationBase = sin(frameCount * pulseFreq + p.letterIndex * 0.5);
        
        // TAMANHO que reage ao som de forma mais intensa
        const baseSize = (p.size || 3) * 1.2; // Tamanho base ligeiramente maior
        const sizeMultiplier = 1 + bassResponse * 2.5; // AUMENTADO: Multiplica até 3.5x com som
        const pulseSizeMultiplier = 1 + pulsationBase * bassResponse * 1.2; // AUMENTADO: Pulsação mais visível
        const pulseSize = baseSize * sizeMultiplier * pulseSizeMultiplier;


 
        // MOVIMENTO CIRCULAR SINCRONIZADO para todas as partículas
        const globalCircularAngle = millis() * 0.002; // ângulo global para todas as partículas
        const circularRadius = 8; // raio do movimento circular
        const circularOffsetX = cos(globalCircularAngle) * circularRadius;
        const circularOffsetY = sin(globalCircularAngle) * circularRadius;
        
        // MOVIMENTO CIRCULAR SINCRONIZADO para todas as partículas
        const circularAngle = millis() * 0.002; // ângulo global sincronizado
        const circularRad = 8; // raio do movimento circular
        const offsetX = cos(circularAngle) * circularRad;
        const offsetY = sin(circularAngle) * circularRad;
        
        // SALTO DAS PARTÍCULAS reagindo ao bass
        const jumpIntensity = amplifiedBass * 30; // Intensidade do salto
        const jumpFreq = 0.2 + amplifiedBass * 0.5; // Frequência do salto
        const jumpOffset = sin(frameCount * jumpFreq + p.letterIndex * 0.3) * jumpIntensity;
        
        // Usar posição calculada na física + movimento circular + salto
        const renderX = (p.pos ? p.pos.x : p.x) + offsetX;
        const renderY = (p.pos ? p.pos.y : p.y) + offsetY - Math.abs(jumpOffset); // Salto sempre para cima

        ellipse(renderX, renderY, pulseSize, pulseSize);

        drawingContext.shadowBlur = 0;
        break;

      case 2: // Mid frequency waves - ONDA MEXICANA APENAS COM SOM
        if (p.originalPos && p.pos) {
          // MOVIMENTO APENAS SE HÁ SOM (mid frequency)
          if (amplifiedMid > 0.1) { // Threshold mínimo para ativar
            // ONDA MEXICANA: movimento sequencial da esquerda para direita
            const time = millis() * 0.002; // Velocidade da onda
            
            // Delay baseado na posição X (esquerda começa primeiro)
            const normalizedX = p.originalPos.x / width; // 0 a 1
            const delay = normalizedX * 3; // Delay progressivo
            const particleTime = time - delay;
            
            // Amplitude proporcional ao som
            const amplitude = amplifiedMid * 40; // 0-40px baseado no som
            
            // Movimento apenas quando a onda chega E há som
            const offset = particleTime > 0 ? sin(particleTime * 2) * amplitude : 0;
            
            // Aplicar movimento horizontal
            p.pos.x = p.originalPos.x + offset;
            p.pos.y = p.originalPos.y;
          } else {
            // SEM SOM: voltar à posição original
            p.pos.x = p.originalPos.x;
            p.pos.y = p.originalPos.y;
          }
        }
        
        const size = amplifiedMid > 0.1 ? 3 + amplifiedMid * 3 : 2;
        
        fill(darkMode ? 0 : 255);
        noStroke();
        ellipse(p.pos.x, p.pos.y, size, size);
        break;
        if (p.originalPos) {
          // CRIAR NOSSO PRÓPRIO CONTADOR DE FRAMES
          if (!window.customFrameCount) {
            window.customFrameCount = 0;
            window.lastMillis = millis();
          }
          
          // Incrementar nosso contador baseado no tempo real
          const currentMillis = millis();
          if (currentMillis - window.lastMillis > 16) { // ~60fps
            window.customFrameCount++;
            window.lastMillis = currentMillis;
          }

          // USAR NOSSO CONTADOR em vez do frameCount quebrado
          const ourFrameCount = window.customFrameCount;
          const waveSpeed = 0.1;
          const globalWaveTime = ourFrameCount * waveSpeed;

          // POSIÇÃO NA ONDA: distância da esquerda
          const distanceFromStart = p.originalPos.x;
          const propagationDelay = distanceFromStart * 0.005;

          // TEMPO LOCAL: quando a onda chega
          const localTime = globalWaveTime - propagationDelay;

          // ONDA SÓ ACONTECE se já chegou
          let waveAmplitude = 0;
          if (localTime > 0) {
            const baseAmplitude = 25 + amplifiedMid * 15;
            const decay = Math.exp(-localTime * 0.3);
            waveAmplitude = baseAmplitude * decay;
          }

          // MOVIMENTO DA ONDA
          const waveOffset = localTime > 0 ? sin(localTime * 3) * waveAmplitude : 0;

          // Aplicar movimento
          p.pos.x = p.originalPos.x + waveOffset;
          p.pos.y = p.originalPos.y;

          // Visual
          const waveIntensity = Math.abs(waveAmplitude) / 40;
          const opacity = 40 + waveIntensity * 50;
          
          fill(darkMode ? 0 : 255);
          noStroke();
          ellipse(p.pos.x, p.pos.y, 3 + waveIntensity * 4, 3 + waveIntensity * 4);

        }
        break;

      case 3: // Treble - linhas dinâmicas
        if (p.lineSegment) {
          const spectrum = fft.analyze();
          const segment = p.lineSegment;

          // Movimento único suavizado
          const uniqueTime = frameCount * 0.015 + (p.seed || p.letterIndex) * 100;
          const rotationSpeed = 0.5 + amplifiedTreble * 2.0;
          const angle = uniqueTime * rotationSpeed;

          const centerX = p.pos ? p.pos.x : (p.x || 0);
          const centerY = p.pos ? p.pos.y : (p.y || 0);

          // Comprimento dinâmico
          const baseLength = 15 + amplifiedTreble * 20;
          const lengthVariation = sin(uniqueTime * 2) * amplifiedTreble * 5;
          const finalLength = baseLength + lengthVariation;

          // Calcular pontos da linha
          const x1 = centerX + cos(angle) * finalLength;
          const y1 = centerY + sin(angle) * finalLength;
          const x2 = centerX - cos(angle) * finalLength;
          const y2 = centerY - sin(angle) * finalLength;

          let strokeW = 0.8 + amplifiedTreble * 3;

          // Resposta ao spectrum
          if (spectrum && segment.freqIndex < spectrum.length) {
            const freqValue = spectrum[segment.freqIndex] / 255.0;
            strokeW *= (1 + freqValue * 2);
          }

          stroke(darkMode ? 0 : 255);
          strokeWeight(strokeW);
          line(x1, y1, x2, y2);

          // Efeito glow para picos
          if (peakDetector.peakCount > 0 && amplifiedTreble > 0.5) {
            strokeWeight(strokeW * 2);
            stroke(darkMode ? 0 : 255);
            line(x1, y1, x2, y2);
          }
        }
        break;

      case 4: // Movimento orgânico
        if (p.orgParams) {
          const baseXOrg = p.originalX || p.x || (p.pos ? p.pos.x : p.x);
          const baseYOrg = p.originalY || p.y || (p.pos ? p.pos.y : p.y);

          // Parâmetros de onda orgânica
          const organicTime = frameCount * 0.02;
          const orgAmp = p.orgParams.amplitude * 4 * (1 + amplifiedMic * 1.5);

          // Movimento complexo suavizado
          const orgX = baseXOrg +
            sin(organicTime + p.orgParams.phase) * orgAmp * amplifiedBass +
            cos(organicTime * 0.7 + p.orgParams.phase * 1.3) * (orgAmp * 0.6) * amplifiedMid;

          const orgY = baseYOrg +
            cos(organicTime + p.orgParams.phase) * orgAmp * amplifiedMid +
            sin(organicTime * 0.9 + p.orgParams.phase * 0.8) * (orgAmp * 0.4) * amplifiedTreble;

          // Propriedades visuais
          const combinedAudio = (amplifiedBass + amplifiedMid + amplifiedTreble) / 3;
          const orgAlpha = 50 + combinedAudio * 40;
          const orgSize = (p.size || 3) * (1 + combinedAudio * 2.5);

          fill(darkMode ? 0 : 255);

          // Stroke para picos de áudio
          if (amplifiedMic > 0.6) {
            stroke(darkMode ? 0 : 30);
            strokeWeight(0.3 + amplifiedMic * 0.7);
          } else {
            noStroke();
          }

          ellipse(orgX, orgY, orgSize, orgSize);
          drawingContext.shadowBlur = 0;
        }
        break;
    }

    // Atualizar partícula se tiver método update
    if (typeof p.update === 'function') {
      p.update(amplifiedBass, amplifiedMid, amplifiedTreble, amplifiedMic, true, audioMultiplier);
    }

    // DESENHAR a partícula - COMENTADO para evitar duplicação com desenho manual dos cases
    // if (typeof p.show === 'function') {
    //   p.show();
    // }
  }

  pop();
}

function drawLetterBoxes() {
  if (window.isExportingFont) return;
  push();
  for (let box of letterBoxes) {
    noFill();
    stroke(darkMode ? 0 : 255, 40);
    strokeWeight(2);
    rect(box.x, box.y, box.width, box.height);
  }
  pop();
}

// Função auxiliar para encontrar o ponto de grade mais próximo dentro de uma letra específica
function findClosestLetterGridPoint(x, y, gridPoints) {
  if (!gridPoints || gridPoints.length === 0) return null;

  let closestPoint = null;
  let closestDistance = Infinity;

  for (let i = 0; i < gridPoints.length; i++) {
    let point = gridPoints[i];
    let d = dist(x, y, point.x, point.y);

    if (d < closestDistance) {
      closestDistance = d;
      closestPoint = point;
    }
  }

  return closestPoint;
}

// Modificação na função de desenho dos pontos da grade
function updateAndDrawGridPoints() {
  for (let point of gridPoints) {
    updateGridPointPosition(point);
    // Desenhar com base no segmento
    drawGridPointBySegment(point);
  }
}

function updateGridPointPosition(point) {
  // Cria um vetor força para retornar à posição original
  let returnForce = p5.Vector.sub(point.originalPos, point.pos);
  returnForce.mult(0.03);

  // Aplicar comportamento baseado no segmento
  switch (point.segment) {
    case 0: // Flocking
      applyFlockingBehavior(point);
      break;
    case 1: // Bass circular - CONTROLADO NO class.js
      // Movimento circular individual implementado diretamente no class.js
      // Não aplicar comportamento aqui para evitar interferência
      break;
    case 2: // Mid frequency
      applyMidFrequencyBehavior(point, midValue);
      break;
    case 3: // Treble lines
      applyTrebleBehavior(point, trebleValue);
      break;
    case 4: // Organic movement
      applyOrganicBehavior(point, midValue + trebleValue);
      break;
  }

  // Adicionar força de retorno à posição original
  point.acc.add(returnForce);

  // Aplicar física básica - EXCETO para segmento 1 que já tem posição definida
  if (point.segment !== 1) {
    point.vel.add(point.acc);
    point.vel.limit(2); // Limite de velocidade
    point.pos.add(point.vel);
    point.vel.mult(0.95); // Atrito
  }
  
  point.acc.mult(0);
}

// Funções para cada comportamento específico de segmento
function applyFlockingBehavior(point) {
  // Versão simplificada de flocking
  let neighborRadius = 60;
  let neighbors = [];

  // Encontrar vizinhos próximos
  for (let other of gridPoints) {
    if (other !== point) {
      let d = p5.Vector.dist(point.pos, other.pos);
      if (d < neighborRadius) {
        neighbors.push(other);
      }
    }
  }

  if (neighbors.length > 0) {
    // Aplicar separação
    let separation = createVector(0, 0);
    for (let other of neighbors) {
      let d = p5.Vector.dist(point.pos, other.pos);
      let diff = p5.Vector.sub(point.pos, other.pos);
      diff.div(d * d);
      separation.add(diff);
    }
    separation.normalize();
    separation.mult(0.3);

    // Aplicar coesão
    let cohesion = createVector(0, 0);
    for (let other of neighbors) {
      cohesion.add(other.pos);
    }
    cohesion.div(neighbors.length);
    cohesion.sub(point.pos);
    cohesion.normalize();
    cohesion.mult(0.1);

    point.acc.add(separation);
    point.acc.add(cohesion);
  }

  // Adicionar um componente de ruído
  let noiseValue = noise(point.pos.x * 0.01, point.pos.y * 0.01, frameCount * 0.01);
  let noiseForce = p5.Vector.fromAngle(noiseValue * TWO_PI);
  noiseForce.mult(0.05);
  point.acc.add(noiseForce);
}

function applyBassWaveBehavior(point, bassValue) {
  // ROTAÇÃO ORBITAL EXATAMENTE COMO NO SEU SKETCH ORIGINAL
  
  // Calcular ângulo da partícula em relação ao centro da tela
  const dx = point.originalPos.x - width/2;
  const dy = point.originalPos.y - height/2;
  const angle = atan2(dy, dx);
  
  // FÓRMULA EXATA DO SEU SKETCH: cos(angle + frameCount * 0.05) * bassValue * 10
  const rotationAngle = angle + frameCount * 0.05;
  const distance = bassValue * 10; // Distância diretamente proporcional ao bass
  
  // Calcular offset orbital
  const offsetX = cos(rotationAngle) * distance;
  const offsetY = sin(rotationAngle) * distance;
  
  // Aplicar à posição original
  point.pos.x = point.originalPos.x + offsetX;
  point.pos.y = point.originalPos.y + offsetY;

}

function applyMidFrequencyBehavior(point, midValue) {
  // Movimento pulsante
  let pulseMagnitude = midValue * peakDetector.getVisualMultiplier() * 3;
  let pulseDir = p5.Vector.sub(point.pos, createVector(width / 2, height / 2));
  pulseDir.normalize();
  pulseDir.mult(pulseMagnitude * sin(frameCount * 0.1 + point.distance * 0.05));
  point.acc.add(pulseDir);
}

function applyTrebleBehavior(point, trebleValue) {
  // Movimento de linha
  if (point.lineSegment) {
    let trebleAmplitude = trebleValue * peakDetector.getVisualMultiplier() * 2;
    let lineForce = createVector(
      sin(point.angle + frameCount * 0.05) * trebleAmplitude,
      cos(point.angle + frameCount * 0.05) * trebleAmplitude
    );
    point.acc.add(lineForce);
  }
}

function applyOrganicBehavior(point, energy) {
  // Movimento orgânico baseado em ondas
  if (point.waveParams) {
    let time = frameCount * point.waveParams.frequency;
    let amplitude = point.waveParams.amplitude * 0.4 * peakDetector.getVisualMultiplier();
    energy = constrain(energy * 0.8, 0, 1);

    let waveX = sin(time + point.waveParams.phase) * amplitude * energy;
    let waveY = cos(time * 0.2 + point.waveParams.phase) * amplitude * energy;

    let waveForce = createVector(waveX, waveY);
    point.acc.add(waveForce);
  }
}