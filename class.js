class LetterAnatomy {
  constructor() {
    // Obter métricas da fonte carregada
    const openTypeFont = font.font; // Acessar objeto OpenType da fonte p5.js

    // Métricas normalizadas da fonte
    this.unitsPerEm = openTypeFont.unitsPerEm;
    this.ascenderValue = openTypeFont.ascender;
    this.descenderValue = openTypeFont.descender;
    this.xHeightValue = openTypeFont.tables.os2.sxHeight;
    this.capHeightValue = openTypeFont.tables.os2.sCapHeight;

    // Converter métricas para pixels baseado no fontSize atual
    const scale = fontSize / this.unitsPerEm;

    // Centro da tela como baseline
    this.baseline = height / 2 + 150;

    // Converter valores da fonte para nossa escala de canvas
    this.capHeight = this.baseline - (this.capHeightValue * scale);
    this.xHeight = this.baseline - (this.xHeightValue * scale);
    this.ascender = this.baseline - (this.ascenderValue * scale);
    this.descender = this.baseline + (Math.abs(this.descenderValue) * scale);
  }

  // Função para atualizar métricas quando fontSize mudar
  updateMetrics(newFontSize) {
    const scale = newFontSize / this.unitsPerEm;
    this.capHeight = this.baseline - (this.capHeightValue * scale);
    this.xHeight = this.baseline - (this.xHeightValue * scale);
    this.ascender = this.baseline - (this.ascenderValue * scale);
    this.descender = this.baseline + (Math.abs(this.descenderValue) * scale);
  }

  // Função para obter métricas específicas de um caractere
  getCharacterMetrics(char) {
    const openTypeFont = font.font;
    const glyph = openTypeFont.charToGlyph(char);
    const scale = fontSize / this.unitsPerEm;

    return {
      width: glyph.advanceWidth * scale,
      height: (this.ascenderValue - this.descenderValue) * scale,
      bearingX: glyph.leftSideBearing * scale,
      bearingY: glyph.yMax * scale,
      bounds: {
        xMin: glyph.xMin * scale,
        xMax: glyph.xMax * scale,
        yMin: glyph.yMin * scale,
        yMax: glyph.yMax * scale
      }
    };
  }

  // Os outros métodos permanecem iguais, mas agora usando as métricas corretas da fonte
  normalizeY(y, canvasHeight, baselineY) {
    return baselineY - y;
  }

  getAnatomicalRegion(y, canvasHeight, baselineY) {
    const normalizedY = this.normalizeY(y, canvasHeight, baselineY);

    if (normalizedY >= this.xHeight && normalizedY <= this.capHeight) {
      return 'capHeight';
    } else if (normalizedY >= 0 && normalizedY < this.xHeight) {
      return 'xHeight';
    } else if (normalizedY > this.capHeight) {
      return 'ascender';
    } else if (normalizedY < 0 && normalizedY >= this.descender) {
      return 'descender';
    } else {
      return 'other';
    }
  }

  getCharacterBaseline(char) {
    return this.baseline;
  }

  getCharacterTopLine(char) {
    const metrics = this.getCharacterMetrics(char);
    const scale = fontSize / this.unitsPerEm;

    // Se for minúscula com ascender (b, d, f, h, k, l, t)
    if (/[bdfhklt]/.test(char)) {
      return this.baseline - (this.ascenderValue * scale * 1.2); // Usar altura do ascender
    }
    // Se for maiúscula
    else if (/[A-Z]/.test(char)) {
      return this.baseline - (this.capHeightValue * scale); // Usar capHeight
    }
    // Para outras minúsculas
    else {
      return this.baseline - (this.xHeightValue * scale); // Usar xHeight
    }
  }

  getCharacterBottomLine(char) {
    const metrics = this.getCharacterMetrics(char);
    const scale = fontSize / this.unitsPerEm;

    // Usar métricas específicas do caractere
    return this.baseline - (metrics.bounds.yMin * scale);
  }

  getCharacterCenterY(char) {
    const topLine = this.getCharacterTopLine(char);
    const bottomLine = this.getCharacterBottomLine(char);
    return (topLine + bottomLine) / 2;
  }

  getCharacterHeight(char) {
    const topLine = this.getCharacterTopLine(char);
    const bottomLine = this.getCharacterBottomLine(char);
    return Math.abs(bottomLine - topLine);
  }

  getCharacterOffsetY(char) {
    // Ajustar offset para minúsculas com ascender
    if (/[bdfhklt]/.test(char)) {
      return -this.ascenderValue * 1.2; // Aumentar offset para ascender
    } else if (/[gjpqy]/.test(char)) {
      return this.descenderValue;
    }
    return 0;
  }

  getCharacterScaleY(char) {
    // Ajustar escala vertical para minúsculas com ascender
    if (/[bdfhklt]/.test(char)) {
      return 1.4; // Aumentar escala para ascender
    } else if (/[gjpqy]/.test(char)) {
      return 1.2; // Manter escala para descender
    }
    return 1.0;
  }
}

class Boundary {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;

    this.left = x - w / 2;
    this.right = x + w / 2;
    this.top = y - h / 2;
    this.bottom = y + h / 2;
  }

  contains(point) {
    return (
      point.pos.x >= this.left &&
      point.pos.x <= this.right &&
      point.pos.y >= this.top &&
      point.pos.y <= this.bottom
    );
  }

  intersects(range) {
    return !(
      range.x - range.r > this.right ||
      range.x + range.r < this.left ||
      range.y - range.r > this.bottom ||
      range.y + range.r < this.top
    );
  }
}

class Circle {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
  }
}

class QuadTree {
  constructor(boundary, capacity) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
  }

  clear() {
    this.points = [];
    if (this.divided) {
      this.northWest.clear();
      this.northEast.clear();
      this.southWest.clear();
      this.southEast.clear();
      this.divided = false;
    }
  }

  insert(point) {
    if (!this.boundary.contains(point)) {
      return false;
    }

    if (this.points.length < this.capacity && !this.divided) {
      this.points.push(point);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    return (
      this.northWest.insert(point) ||
      this.northEast.insert(point) ||
      this.southWest.insert(point) ||
      this.southEast.insert(point)
    );
  }

  subdivide() {
    const x = this.boundary.x;
    const y = this.boundary.y;
    const w = this.boundary.w / 2;
    const h = this.boundary.h / 2;

    const nw = new Boundary(x - w / 2, y - h / 2, w, h);
    const ne = new Boundary(x + w / 2, y - h / 2, w, h);
    const sw = new Boundary(x - w / 2, y + h / 2, w, h);
    const se = new Boundary(x + w / 2, y + h / 2, w, h);

    this.northWest = new QuadTree(nw, this.capacity);
    this.northEast = new QuadTree(ne, this.capacity);
    this.southWest = new QuadTree(sw, this.capacity);
    this.southEast = new QuadTree(se, this.capacity);

    this.divided = true;

    // Transferir pontos existentes
    for (let p of this.points) {
      this.northWest.insert(p) ||
        this.northEast.insert(p) ||
        this.southWest.insert(p) ||
        this.southEast.insert(p);
    }

    this.points = [];
  }

  query(range, found = []) {
    if (!this.boundary.intersects(range)) {
      return found;
    }

    const rangeX = range.x;
    const rangeY = range.y;
    const rangeRSquared = range.r * range.r;

    for (let p of this.points) {
      const dx = p.pos.x - rangeX;
      const dy = p.pos.y - rangeY;
      if (dx * dx + dy * dy <= rangeRSquared) {
        found.push(p);
      }
    }

    if (this.divided) {
      this.northWest.query(range, found);
      this.northEast.query(range, found);
      this.southWest.query(range, found);
      this.southEast.query(range, found);
    }

    return found;
  }
}

class ImprovedPeakDetector {
  constructor() {
    this.threshold = 0.12;         // Threshold mais alto para picos reais
    this.decayRate = 0.88;         // Decay mais lento para efeitos duradouros
    this.peakHold = 15;            // Hold time otimizado
    this.peakCount = 0;
    this.peaks = [];
    this.prevLevel = 0;
    this.minTimeBetweenPeaks = 3;  // Reduzido para mais responsividade
    this.lastPeakTime = 0;
    this.energyHistory = [];
    this.historySize = 8;          // Histórico menor para mais responsividade
    this.smoothedLevel = 0;        // Para suavização
    this.levelBuffer = [];         // Buffer para suavização temporal
    this.bufferSize = 5;
  }

  update(rawLevel) {
    if (isNaN(rawLevel)) rawLevel = 0;

    // Suavização temporal do nível
    this.levelBuffer.push(rawLevel);
    if (this.levelBuffer.length > this.bufferSize) {
      this.levelBuffer.shift();
    }

    const level = this.levelBuffer.reduce((sum, val) => sum + val, 0) / this.levelBuffer.length;
    this.smoothedLevel = lerp(this.smoothedLevel, level, 0.3);

    // Histórico de energia
    this.energyHistory.push(level);
    if (this.energyHistory.length > this.historySize) {
      this.energyHistory.shift();
    }

    const avgEnergy = this.energyHistory.reduce((sum, val) => sum + val, 0) / this.energyHistory.length;
    const energyVariance = this.calculateVariance(this.energyHistory);

    // Detecção de picos mais inteligente
    const currentFrame = frameCount;
    const energyRatio = avgEnergy > 0 ? level / avgEnergy : 0;
    const derivativeThreshold = level - this.prevLevel;

    if (level > this.threshold &&
      energyRatio > 1.4 &&
      derivativeThreshold > 0.02 &&
      energyVariance > 0.001 &&
      currentFrame - this.lastPeakTime > this.minTimeBetweenPeaks) {

      this.peaks.push({
        strength: level * 2.0,
        countdown: this.peakHold,
        birthtime: currentFrame,
        type: this.classifyPeak(level, energyRatio)
      });

      this.lastPeakTime = currentFrame;
    }

    // Atualizar picos existentes
    for (let i = this.peaks.length - 1; i >= 0; i--) {
      this.peaks[i].strength *= this.decayRate;
      this.peaks[i].countdown--;

      if (this.peaks[i].countdown <= 0 || this.peaks[i].strength < 0.05) {
        this.peaks.splice(i, 1);
      }
    }

    this.peakCount = this.peaks.length;
    this.prevLevel = level;
    return this.peakCount;
  }

  calculateVariance(values) {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  }

  classifyPeak(level, ratio) {
    if (level > 0.7 && ratio > 2.0) return 'strong';
    if (level > 0.4 && ratio > 1.8) return 'medium';
    return 'weak';
  }

  getVisualMultiplier() {
    if (this.peaks.length === 0) return 1.0;

    let multiplier = 1.0;
    for (let peak of this.peaks) {
      const age = frameCount - peak.birthtime;
      const ageNormalized = Math.max(0, 1 - (age / this.peakHold));

      let peakContribution = peak.strength * ageNormalized;

      // Multiplicador baseado no tipo de pico
      switch (peak.type) {
        case 'strong': peakContribution *= 3.0; break;
        case 'medium': peakContribution *= 2.0; break;
        case 'weak': peakContribution *= 1.2; break;
      }

      multiplier += peakContribution;
    }

    return Math.min(multiplier, 5.0); // Limite máximo para evitar explosões visuais
  }

  getSmoothedLevel() {
    return this.smoothedLevel;
  }
}

class Particle {
  constructor(x, y, segment, distance, angle) {
    this.originalPos = createVector(x, y);
    this.pos = createVector(x, y);
    this.vel = createVector(random(-0.5, 0.5), random(-0.5, 0.5));
    this.acc = createVector(0, 0);
    this.maxSpeed = 2;
    this.maxForce = 0.2;
    this.size = random(3, 7);

    this.color = color(20, 20, 20, random(30, 80));

    this.angle = angle;
    this.distance = distance;
    this.segment = segment;

    this.lastStablePosition = this.originalPos.copy();

    // Ajustando os parâmetros de flocking para tornar o comportamento mais natural
    this.alignmentDistSq = 2500;  // Aumentado de 1600
    this.cohesionDistSq = 3600;   // Aumentado de 2025
    this.separationDistSq = 1600; // Aumentado de 900

    // Pesos das forças
    this.alignWeight = 1.0;      // Aumentado de 0.7
    this.cohesionWeight = 0.6;   // Aumentado de 0.4
    this.separationWeight = 1.2; // Aumentado de 1.0

    if (this.segment === 3) {
      this.lineSegment = {
        x1: this.originalPos.x - 20,
        y1: this.originalPos.y - 20,
        x2: this.originalPos.x + 20,
        y2: this.originalPos.y + 20,
        freqIndex: floor(random(40, 120)),
        amplitudeFactor: random(2, 6),
        frequencyShift: 1,
        timbralVariation: 1
      };
    }

    if (this.segment === 4) {
      this.orgParams = {
        amplitude: random(1, 3),
        frequency: random(0.05, 0.1),
        phase: random(TWO_PI)
      };
    }
  }

  // Nova função para garantir que os vetores estão inicializados corretamente
  ensureVectorSafety() {
    if (this.segment === 3) {
      const segment = this.lineSegment;

      if (!segment.currentOffset1 || typeof segment.currentOffset1.set !== 'function') {
        segment.currentOffset1 = createVector(0, 0);
      }
      if (!segment.currentOffset2 || typeof segment.currentOffset2.set !== 'function') {
        segment.currentOffset2 = createVector(0, 0);
      }
      if (!segment.targetOffset1 || typeof segment.targetOffset1.set !== 'function') {
        segment.targetOffset1 = createVector(0, 0);
      }
      if (!segment.targetOffset2 || typeof segment.targetOffset2.set !== 'function') {
        segment.targetOffset2 = createVector(0, 0);
      }
    }
  }

  flock(nearbyBoids) {
    if (nearbyBoids.length <= 1) return;

    const alignment = createVector();
    const cohesion = createVector();
    const separation = createVector();
    let totalAlign = 0;
    let totalCohesion = 0;
    let totalSeparation = 0;

    for (let other of nearbyBoids) {
      if (other === this) continue;

      const dx = this.pos.x - other.pos.x;
      const dy = this.pos.y - other.pos.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < this.alignmentDistSq) {
        alignment.add(other.vel);
        totalAlign++;
      }

      if (distSq < this.cohesionDistSq) {
        cohesion.add(other.pos);
        totalCohesion++;
      }

      if (distSq < this.separationDistSq) {
        const diff = createVector(dx, dy);
        diff.div(distSq);
        separation.add(diff);
        totalSeparation++;
      }
    }

    // Aplicar forças com pesos balanceados
    if (totalAlign > 0) {
      alignment.div(totalAlign);
      alignment.setMag(this.maxSpeed);
      alignment.sub(this.vel);
      alignment.limit(this.maxForce);
      alignment.mult(0.7);
      this.acc.add(alignment);
    }

    if (totalCohesion > 0) {
      cohesion.div(totalCohesion);
      cohesion.sub(this.pos);
      cohesion.setMag(this.maxSpeed);
      cohesion.sub(this.vel);
      cohesion.limit(this.maxForce);
      cohesion.mult(0.4);
      this.acc.add(cohesion);
    }

    if (totalSeparation > 0) {
      separation.div(totalSeparation);
      separation.setMag(this.maxSpeed);
      separation.sub(this.vel);
      separation.limit(this.maxForce);
      separation.mult(1.0);
      this.acc.add(separation);
    }
  }

  returnToOrigin() {
    const dx = this.originalPos.x - this.pos.x;
    const dy = this.originalPos.y - this.pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0.5) {
      let strength = map(distance, 0, 100, 0, this.maxSpeed * formStrength);
      strength += distance * distance * elasticFactor;

      const returnForce = createVector(dx, dy);
      returnForce.normalize();
      returnForce.mult(strength);
      returnForce.limit(this.maxForce * 0.8);
      this.acc.add(returnForce);

      if (distance < 10) {
        this.lastStablePosition.lerp(this.pos, 0.1);
      }
    }

    this.color = color(0, 0, 100, 80);
    this.vel.mult(0.9);
  }

  update(bass, mid, treble, volume, isMoving, noiseFactor) {

    if (isNaN(bass)) bass = 0;
    if (isNaN(mid)) mid = 0;
    if (isNaN(treble)) treble = 0;
    if (isNaN(volume)) volume = 0;

    // Tentar seguir interação da câmera (se ativo)
    let isCameraInteracting = this.followCameraInteraction();

    // Tentar seguir interação do mouse (se ativo e não estiver seguindo a câmera)
    let isMouseInteracting = false;
    if (!isCameraInteracting && this.segment === interactionSegment && isUserInteracting) {
      isMouseInteracting = this.followUserInteraction();
    }

    if (isCameraInteracting) {
      // Se houver interação com a câmera, ignorar completamente o áudio
      // Apenas aplicar a força da câmera e uma leve força de retorno
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed * 2); // Aumentar velocidade para resposta mais rápida à câmera
      this.pos.add(this.vel);

      // Reduzir a velocidade gradualmente quando não há força aplicada
      this.vel.mult(0.9);

      // Limpamos a aceleração no final
      this.acc.mult(0);

      // Aplicar uma leve força de retorno caso a partícula se afaste demais
      const distFromOrigin = p5.Vector.dist(this.pos, this.originalPos);
      if (distFromOrigin > 150) {
        const returnForce = p5.Vector.sub(this.originalPos, this.pos);
        returnForce.normalize();
        returnForce.mult(0.3);
        this.acc.add(returnForce);
      }
    } else if (isMouseInteracting) {
      // Para interação com o mouse, ainda aplicar o comportamento normal, mas com menos intensidade
      const returnForce = p5.Vector.sub(this.originalPos, this.pos);
      returnForce.mult(0.01); // Força reduzida para permitir mais interatividade
      this.acc.add(returnForce);

      // Comportamento normal, mas com menos sensibilidade ao áudio
      this.applyOriginalUpdate(bass * 0.3, mid * 0.3, treble * 0.3, volume * 0.3, isMoving, noiseFactor * 0.5);
    } else {
      // Sem interação, comportamento normal de resposta ao áudio
      this.applyOriginalUpdate(bass, mid, treble, volume, isMoving, noiseFactor);
    }

    this.edges();
  }

  edges() {

    if (this.pos.x > width) this.pos.x = 0;
    else if (this.pos.x < 0) this.pos.x = width;

    if (this.pos.y > height) this.pos.y = 0;
    else if (this.pos.y < 0) this.pos.y = height;
  }

  show() {
    noStroke();
    fill(this.color);

    // Get current peak effect
    const peakEffect = peakDetector.getVisualMultiplier();

    if (this.segment === 3) { // Line segment
      let spectrum = fft.analyze();

      let segment = this.lineSegment;
      let freqIndex = constrain(
        segment.freqIndex + segment.frequencyShift,
        0,
        spectrum.length - 1
      );

      let freqValue = 0;
      if (spectrum && spectrum[freqIndex] !== undefined) {
        freqValue = spectrum[freqIndex] / 255.0;
        if (isNaN(freqValue)) freqValue = 0;
        freqValue *= segment.timbralVariation;
        freqValue = pow(freqValue, 0.6) * 3.5; // Stronger response curve
      }

      // Enhanced peak multiplier
      let peakMultiplier = 1 + (peakDetector.peakCount * 0.3);

      let x1 = this.pos.x + (segment.x1 - this.originalPos.x);
      let y1 = this.pos.y + (segment.y1 - this.originalPos.y) +
        sin(frameCount * 0.05) * freqValue * segment.amplitudeFactor * 30 * peakMultiplier;

      let x2 = this.pos.x + (segment.x2 - this.originalPos.x);
      let y2 = this.pos.y + (segment.y2 - this.originalPos.y) +
        sin(frameCount * 0.05 + 1) * freqValue * segment.amplitudeFactor * 30 * peakMultiplier;

      // Brighter, more vivid lines - Updated to respect theme
      const brightness = darkMode ? 70 : 30;
      const opacity = 60 + constrain(freqValue * 60, 0, 40);

      let strokeW = 1 + freqValue * (4 + peakDetector.peakCount * 0.8);

      // Use theme-appropriate stroke color
      stroke(darkMode ? 0 : 0, 0, brightness, opacity);
      strokeWeight(strokeW);

      line(x1, y1, x2, y2);

      // Add glow effect during peaks
      if (peakDetector.peakCount > 0 && freqValue > 0.3) {
        strokeWeight(strokeW * 2.5);
        stroke(darkMode ? 0 : 0, 0, brightness, opacity * 0.4);
        line(x1, y1, x2, y2);

        // Second glow for extra effect
        strokeWeight(strokeW * 4);
        stroke(darkMode ? 0 : 0, 0, brightness, opacity * 0.2);
        line(x1, y1, x2, y2);
      }
    } else {
      // Normal particle rendering with enhanced effects

      // Make particles pulse with the beat
      const pulseSize = this.size * (1 + sin(frameCount * 0.1) * 0.2 * peakEffect);
      ellipse(this.pos.x, this.pos.y, pulseSize);

      // Add connecting lines with enhanced visibility during audio peaks
      if (frameCount % 3 === 0) {
        const lineOpacity = brightness(this.color) * 0.4 * peakEffect;
        // Use theme-appropriate stroke color
        stroke(darkMode ? 0 : 0, 0, darkMode ? 100 : 0, lineOpacity);
        strokeWeight(0.5 * peakEffect);

        const moveDistance = p5.Vector.dist(this.originalPos, this.pos);
        if (moveDistance > 5) {
          line(this.originalPos.x, this.originalPos.y, this.pos.x, this.pos.y);
        }

        // Add more connections during peaks
        const connectionDistance = 20 + 15 * (peakEffect - 1);
        for (let j = 0; j < letterPoints.length; j += 5) {
          let other = letterPoints[j];
          if (!other || other.segment !== this.segment) continue;

          let d = p5.Vector.dist(this.pos, other.pos);
          if (d < connectionDistance && d > 0) {
            let alpha = map(d, 0, connectionDistance, lineOpacity, 0);
            stroke(darkMode ? 0 : 0, 0, darkMode ? 100 : 0, alpha);
            line(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
          }
        }
      }
    }
  }

  applyOriginalUpdate(bass, mid, treble, volume) {
    if (isNaN(bass)) bass = 0;
    if (isNaN(mid)) mid = 0;
    if (isNaN(treble)) treble = 0;
    if (isNaN(volume)) volume = 0;

    // Get visual multiplier from peak detector for stronger reactions
    const peakMultiplier = peakDetector.getVisualMultiplier();

    // Base return force to original position
    let returnForce = p5.Vector.sub(this.originalPos, this.pos);
    returnForce.mult(0.03);

    // Base brightness values for dark and light mode
    const baseBrightness = darkMode ? 60 : 30;
    const baseOpacity = 80;

    switch (this.segment) {
      // Na classe Particle, método applyOriginalUpdate:
      case 0: // Flocking behavior
        if (isInForm) {
          // Verificar se quadTree existe antes de usar query
          if (typeof quadTree !== 'undefined' && quadTree && typeof quadTree.query === 'function') {
            let nearbyBoids = quadTree.query(new Circle(this.pos.x, this.pos.y, 60));
            this.flock(nearbyBoids);
          }

          if (frameCount % 5 === 0) {
            const nx = this.pos.x * 0.005;
            const ny = this.pos.y * 0.005;
            const nt = frameCount * 0.03;
            const noiseValue = noise(nx, ny, nt) * max(0.1, volume * 2);

            const noiseAngle = noiseValue * TWO_PI;
            const noiseVector = p5.Vector.fromAngle(noiseAngle);
            noiseVector.mult(0.08 * volume * peakMultiplier);
            this.acc.add(noiseVector);
            this.acc.add(returnForce.copy().mult(2));
          }

          const brightness = map(volume * peakMultiplier, 0, 1, baseBrightness, darkMode ? 100 : 50);
          const opacity = map(bass * peakMultiplier, 0, 1, 30, baseOpacity);
          this.color = color(0, 0, brightness, opacity);
          this.size = map(volume * peakMultiplier, 0, 1, 3, 9);
        }
        break;

      case 1: // Bass orbital motion - MOVIMENTO ORBITAL RESPONSIVO AO BASS
        // MOVIMENTO ORBITAL: cada partícula orbita em torno da sua posição original
        // Mantém a forma das letras enquanto cria movimento circular
        
        if (bass * peakMultiplier > 0.01) {
          // MOVIMENTO ORBITAL: cada partícula orbita em torno da sua posição original
          const orbitRadius = bass * peakMultiplier * 25; // Raio da órbita baseado no bass
          const orbitSpeed = 0.04 + bass * peakMultiplier * 0.06; // Velocidade orbital
          
          // Ângulo orbital baseado no tempo
          const orbitAngle = frameCount * orbitSpeed;
          
          // Posição orbital: posição original + raio * (cos, sin)
          this.pos.x = this.originalPos.x + cos(orbitAngle) * orbitRadius;
          this.pos.y = this.originalPos.y + sin(orbitAngle) * orbitRadius;
        } else {
          // Sem bass: órbita muito pequena para manter movimento visível
          const orbitRadius = 3; // Órbita pequena constante
          const orbitSpeed = 0.02; // Velocidade lenta
          const orbitAngle = frameCount * orbitSpeed;
          
          this.pos.x = this.originalPos.x + cos(orbitAngle) * orbitRadius;
          this.pos.y = this.originalPos.y + sin(orbitAngle) * orbitRadius;
        }

        // DEBUG - verificar se pulsação está funcionando
        if (frameCount % 60 === 0 && this.letterIndex === 0) {
          const expansion = (bass * peakMultiplier > 0.02) ? (bass * peakMultiplier * 60 * (1 + sin(frameCount * 0.2) * 0.4)) : 0;
        }

        // Cores vibrantes para frequências de bass
        const brightness1 = map(bass * peakMultiplier, 0, 1, baseBrightness / 2, darkMode ? 50 : 30);
        const opacity1 = map(bass * peakMultiplier, 0, 1, 40, baseOpacity);
        this.color = color(0, 0, brightness1, opacity1);

        // Size reage ao bass com peak enhancement
        this.size = map(bass * peakMultiplier, 0, 1, 2, 8);
        break;

      case 2: // Mid frequency waves - MOVIMENTO DE ONDA MEXICANA HORIZONTAL
        const midLevel = mid * peakMultiplier;
        
        // Amplitude base sempre visível + amplitude dinâmica com som
        const baseAmplitude = 60; // Amplitude base MUITO maior para movimento bem visível
        const audioAmplitude = midLevel * 80; // Amplitude extra com som
        const totalAmplitude = baseAmplitude + audioAmplitude;
        
        // ONDA MEXICANA: todas as partículas seguem o mesmo padrão temporal
        // mas com delay baseado na posição X original
        const globalTime = frameCount * 0.12; // Velocidade global da onda MAIS RÁPIDA
        
        // Delay baseado na posição X original (partículas da esquerda começam primeiro)
        const delayFactor = (this.originalPos.x / width) * PI; // Delay progressivo
        const particleTime = globalTime - delayFactor;
        
        // Movimento horizontal de vai-e-vem (como onda mexicana)
        // Todas vão para direita, depois voltam para esquerda em sequência
        const horizontalOffset = sin(particleTime) * totalAmplitude;
        
        // Aplicar movimento horizontal sincronizado
        this.pos.x = this.originalPos.x + horizontalOffset;
        this.pos.y = this.originalPos.y; // Sem movimento vertical para clareza

        // Visual responsivo ao mid
        const brightness2 = map(midLevel, 0, 1, baseBrightness / 2, darkMode ? 40 : 20);
        const opacity2 = map(midLevel, 0, 1, 20, baseOpacity);
        this.color = color(0, 0, brightness2, opacity2);
        this.size = map(midLevel, 0, 1, 2, 9);
        break;

      case 3: // Lines for treble
        this.acc = returnForce.copy();

        // More dramatic line movement
        let trebleAmplitude = treble * peakMultiplier * 2;
        let lineForce = createVector(
          sin(this.angle + frameCount * 0.05) * trebleAmplitude,
          cos(this.angle + frameCount * 0.05) * trebleAmplitude
        );
        this.acc.add(lineForce);

        this.size = 2 + treble * peakMultiplier * 5;
        break;

      case 4: // Organic movement
        this.acc = returnForce.copy();

        // Enhanced wave motion
        let time = frameCount * this.orgParams.frequency;
        let amplitude = this.orgParams.amplitude * 0.4 * peakMultiplier;
        let energy = constrain((treble + mid) * 0.8, 0, 1) * peakMultiplier;

        let orgX = sin(time + this.orgParams.phase) * amplitude * energy;
        let orgY = cos(time * 0.2 + this.orgParams.phase) * amplitude * energy;

        let orgForce = createVector(orgX, orgY);
        this.acc.add(orgForce);

        // More vibrant appearance - theme aware
        const combinedFreq = (treble + mid) / 5 * peakMultiplier;
        const brightness4 = map(combinedFreq, 0, 1, darkMode ? 10 : 0, darkMode ? 30 : 15);
        const opacity4 = map(combinedFreq, 0, 1, 30, baseOpacity);
        this.color = color(0, 0, brightness4, opacity4);

        // Size reacts to combined frequencies
        this.size = map(combinedFreq, 0, 1, 2, 10);
        break;
    }

    // Apply peak multiplier to acceleration (mas NÃO para segmento 2 que usa posicionamento direto)
    if (peakDetector.peakCount > 0 && this.segment !== 2) {
      this.acc.mult(peakMultiplier);
    }

    // Update position (SKIP para segmento 2 que já define posição diretamente)
    if (this.segment !== 2) {
      this.vel.add(this.acc);

      // Dynamically adjust max speed based on audio features
      let maxSpeedMultiplier = 1;
      if (this.segment === 0) maxSpeedMultiplier = 1 + volume * peakMultiplier * 0.7;
      if (this.segment === 1) maxSpeedMultiplier = 1 + bass * peakMultiplier * 0.8;
      if (this.segment === 4) maxSpeedMultiplier = 1 + treble * peakMultiplier * 0.7;

      this.vel.limit(this.maxSpeed * maxSpeedMultiplier);
      this.pos.add(this.vel);
      this.vel.mult(0.95);
      this.acc.mult(0);
    }
  }


  adaptBehaviorToSegmentCount() {
    // Se temos menos segmentos, alguns comportamentos podem ser combinados
    if (this.numSegments < 5) {
      // Ajustar animationType baseado no número de segmentos disponíveis
      if (this.segment >= this.numSegments) {
        this.segment = this.segment % this.numSegments;
      }
    }
  }

  // Override do método followUserInteraction para considerar segmentos variáveis
  followUserInteraction() {
    // Ajustar interactionSegment baseado no número de segmentos
    let adjustedInteractionSegment = interactionSegment;
    if (this.numSegments < 5 && interactionSegment >= this.numSegments) {
      adjustedInteractionSegment = interactionSegment % this.numSegments;
    }

    if (this.segment !== adjustedInteractionSegment) return false;

    const dx = mouseX - this.pos.x;
    const dy = mouseY - this.pos.y;
    const distanceSquared = dx * dx + dy * dy;

    if (distanceSquared < interactionRadius * interactionRadius) {
      const force = createVector(dx, dy);
      const distance = sqrt(distanceSquared);
      const strength = map(distance, 0, interactionRadius, interactionStrength, 0.05);
      force.setMag(strength);
      this.acc.add(force);
      this.size = constrain(this.size * 1.2, 2, 12);

      this.color = color(0, 0, darkMode ? 30 : 100, 90);
      return true;
    }

    return false;
  }

  // Override do método followCameraInteraction para considerar segmentos variáveis
  followCameraInteraction() {
    if (!cameraActive || selectedSegmentForCamera === -1) {
      return false;
    }

    // Ajustar selectedSegmentForCamera baseado no número de segmentos
    let adjustedCameraSegment = selectedSegmentForCamera;
    if (this.numSegments < 5 && selectedSegmentForCamera >= this.numSegments) {
      adjustedCameraSegment = selectedSegmentForCamera % this.numSegments;
    }

    if (this.segment !== adjustedCameraSegment) {
      return false;
    }

    let wasAffected = false;

    for (let point of cameraInteractionPoints) {
      const dx = point.x - this.pos.x;
      const dy = point.y - this.pos.y;
      const distanceSquared = dx * dx + dy * dy;
      const radius = point.radius || interactionRadius;

      if (distanceSquared < radius * radius) {
        const force = createVector(dx, dy);
        const distance = sqrt(distanceSquared);
        const strength = map(distance, 0, radius, interactionStrength * 3 * point.strength, 0.2 * point.strength);
        force.setMag(strength);

        this.acc.mult(0);
        this.acc.add(force);

        this.size = constrain(this.size * 1.3, 3, 15);

        wasAffected = true;
        break;
      }
    }

    return wasAffected;
  }
}

// Classe para processar segmentos de letras
class SegmentProcessor {
  constructor(letterAnatomy) {
    this.anatomy = letterAnatomy;
  }

  // Organiza pontos por segmentos anatômicos
  organizePointsBySegments(points, canvasHeight, canvasCenterY) {
    const segments = {
      0: [], // Flocking - área principal
      1: [], // Bass waves - base da letra
      2: [], // Mid frequency - meio da letra
      3: [], // Treble lines - topo da letra
      4: []  // Organic movement - detalhes
    };

    points.forEach(point => {
      // Normalizar coordenadas
      const normalizedY = this.anatomy.normalizeY(point.y, canvasHeight, canvasCenterY);
      const region = this.anatomy.getAnatomicalRegion(normalizedY);

      // Mapear região anatômica para segmento correto
      let targetSegment = point.originalSegment || point.segment;

      // Ajustar segmento baseado na posição anatômica
      if (region === 'ascender' || region === 'capHeight') {
        targetSegment = 3; // Treble para partes superiores
      } else if (region === 'xHeight') {
        targetSegment = 2; // Mid para altura x
      } else if (region === 'baseline') {
        targetSegment = 1; // Bass para linha base
      } else if (region === 'descender') {
        targetSegment = 4; // Organic para descendentes
      }

      if (!segments.hasOwnProperty(targetSegment)) {
        segments[targetSegment] = [];
      }


      segments[targetSegment].push({
        x: point.x,
        y: normalizedY,
        originalSegment: point.originalSegment || point.segment,
        anatomicalRegion: region
      });
    });

    return segments;
  }

  // Cria contornos vetoriais para cada segmento
  createSegmentPaths(segments, letterBounds) {
    const paths = {};

    Object.keys(segments).forEach(segmentId => {
      const points = segments[segmentId];
      if (points.length === 0) return;

      const path = new opentype.Path();

      // Ordenar pontos para criar contorno coerente
      const sortedPoints = this.sortPointsForPath(points);

      if (sortedPoints.length > 0) {
        // Começar o path
        path.moveTo(sortedPoints[0].x, sortedPoints[0].y);

        // Adicionar pontos do contorno
        for (let i = 1; i < sortedPoints.length; i++) {
          path.lineTo(sortedPoints[i].x, sortedPoints[i].y);
        }

        // Fechar o path se necessário
        if (sortedPoints.length > 2) {
          path.closePath();
        }
      }

      paths[segmentId] = path;
    });

    return paths;
  }

  // Ordena pontos para criar um contorno coerente
  sortPointsForPath(points) {
    if (points.length <= 2) return points;

    // Algoritmo simples para ordenar pontos em contorno
    const sorted = [points[0]];
    const remaining = points.slice(1);

    while (remaining.length > 0) {
      const lastPoint = sorted[sorted.length - 1];
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      // Encontrar o ponto mais próximo
      remaining.forEach((point, index) => {
        const distance = Math.sqrt(
          Math.pow(point.x - lastPoint.x, 2) +
          Math.pow(point.y - lastPoint.y, 2)
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      sorted.push(remaining.splice(nearestIndex, 1)[0]);
    }

    return sorted;
  }
}

class MemoryManager {
  constructor() {
    this.disposables = new Set();
  }

  register(disposable) {
    this.disposables.add(disposable);
  }

  cleanup() {
    for (const disposable of this.disposables) {
      if (disposable.dispose) disposable.dispose();
    }
    this.disposables.clear();
  }
}

class AnimationLoop {
  constructor() {
    this.rafId = null;
    this.lastTime = 0;
  }

  start(updateFn) {
    const animate = (time) => {
      const deltaTime = time - this.lastTime;
      if (deltaTime > 16) { // ~60fps
        updateFn(deltaTime);
        this.lastTime = time;
      }
      this.rafId = requestAnimationFrame(animate);
    };
    this.rafId = requestAnimationFrame(animate);
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}

class OptimizedQuadTree extends QuadTree {
  query(range, found = new Set()) {
    if (!this.boundary.intersects(range)) return found;

    for (const p of this.points) {
      if (this.isInRange(p, range)) found.add(p);
    }

    if (this.divided) {
      this.northwest.query(range, found);
      this.northeast.query(range, found);
      this.southwest.query(range, found);
      this.southeast.query(range, found);
    }

    return found;
  }
}

class ParticlePool {
  constructor(size = 1000) {
    this.particles = [];
    this.active = new Set();

    // Pre-create particles
    for (let i = 0; i < size; i++) {
      this.particles.push(new Particle(0, 0, 0, 0, 0));
    }
  }

  acquire(x, y, segment, distance, angle) {
    let particle = this.particles.find(p => !this.active.has(p));
    if (particle) {
      particle.reset(x, y, segment, distance, angle);
      this.active.add(particle);
      return particle;
    }
    return new Particle(x, y, segment, distance, angle);
  }

  release(particle) {
    this.active.delete(particle);
  }
}