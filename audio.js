//funcoes do som ---------------------------------------------
function setupAudio() {
  userStartAudio();
  mic = new p5.AudioIn();
  mic.start();

  // FFT otimizado para melhor detecção
  fft = new p5.FFT(0.9, 256); // Maior resolução
  fft.setInput(mic);

  // Detector de picos melhorado
  peakDetector = new ImprovedPeakDetector();

  // Inicializar variáveis de suavização
  smoothedBass = 0;
  smoothedMid = 0;
  smoothedTreble = 0;
  smoothedMic = 0;
}

// ===== FUNÇÃO DE ATUALIZAÇÃO DE ÁUDIO OTIMIZADA =====
function updateAudioValues() {
  try {
    // Obter valores brutos
    const rawMicLevel = mic.getLevel();
    fft.analyze();

    const rawBass = fft.getEnergy("bass") / 255;
    const rawMid = fft.getEnergy("mid") / 255;
    const rawTreble = fft.getEnergy("treble") / 255;

    // Verificar NaN
    micLevel = isNaN(rawMicLevel) ? 0 : rawMicLevel;
    bassValue = isNaN(rawBass) ? 0 : Math.pow(rawBass * 0.9, 1.8);
    midValue = isNaN(rawMid) ? 0 : Math.pow(rawMid * 0.9, 1.8);
    trebleValue = isNaN(rawTreble) ? 0 : rawTreble;

    // Aplicar curvas de resposta otimizadas
    micLevel = constrain(Math.pow(micLevel * 14, 0.2), 0, 1);
    bassValue = constrain(Math.pow(bassValue * 4, 1.4), 0, 1);
    midValue = constrain(Math.pow(midValue * 3.5, 1.2), 0, 1);
    trebleValue = constrain(Math.pow(trebleValue * 4.5, 0.8), 0, 1);

    // Atualizar detector de picos
    peakDetector.update(micLevel);

  } catch (e) {
    console.log("Audio error:", e);
    micLevel = bassValue = midValue = trebleValue = 0;
  }
}

function getAudioLevel(type) {
  // Garantir um valor padrão para evitar NaN
  if (!type || typeof type !== 'string') return 0;

  switch (type.toLowerCase()) {
    case 'bass':
      return bassValue || 0;
    case 'mid':
      return midValue || 0;
    case 'treble':
      return trebleValue || 0;
    default:
      return micLevel || 0;
  }
}

// Função para obter valor combinado de frequências
function getCombinedAudioValue(weights = { bass: 0.4, mid: 0.4, treble: 0.2 }) {
  return (bassValue * weights.bass +
    midValue * weights.mid +
    trebleValue * weights.treble) * peakDetector.getVisualMultiplier();
}

function toggleAudioDebug() {
  showAudioDebug = !showAudioDebug;
}

function drawAudioDebug() {
  if (!showAudioDebug) return;

  // Visualização vertical das barras de áudio
  let barWidth = 40;
  let barMaxHeight = 120;
  let baseX = width - 300;
  let baseY = height - 220;
  let spacing = 18;

  // Dados e cores
  const audioData = [
    { value: micLevel, color: darkMode ? '#000000' : '#FFFFFF', label: `Mic: ${micLevel.toFixed(2)}` },
    { value: bassValue, color: darkMode ? '#000000' : '#FFFFFF', label: `Bass: ${bassValue.toFixed(2)}` },
    { value: midValue, color: darkMode ? '#000000' : '#FFFFFF', label: `Mid: ${midValue.toFixed(2)}` },
    { value: trebleValue, color: darkMode ? '#000000' : '#FFFFFF', label: `Treble: ${trebleValue.toFixed(2)}` },
    { value: getCombinedAudioValue(), color: darkMode ? '#000000' : '#FFFFFF', label: `Combined: ${getCombinedAudioValue().toFixed(2)}` }
  ];

  // Desenhar barras verticais
  for (let i = 0; i < audioData.length; i++) {
    let x = baseX + i * (barWidth + spacing);
    let h = audioData[i].value * barMaxHeight;
    noStroke();
    fill(...audioData[i].color);
    rect(x, baseY + barMaxHeight - h, barWidth, h);

    // Label por baixo da barra
    fill(darkMode ? 0 : 100, 90);
    textSize(13);
    textAlign(CENTER);
    text(audioData[i].label.split(':')[0], x + barWidth / 2, baseY + barMaxHeight + 18);
    // Valor por cima da barra
    textSize(12);
    text(audioData[i].value.toFixed(2), x + barWidth / 2, baseY + barMaxHeight - h - 8);
  }

  // Outros dados (picos)
  fill(darkMode ? 0 : 100, 90);
  textSize(13);
  textAlign(LEFT);
  text(`Peaks: ${peakDetector.peakCount}`, baseX, baseY + barMaxHeight + 40);
  text(`Peak Effect: ${peakDetector.getVisualMultiplier().toFixed(2)}`, baseX, baseY + barMaxHeight + 58);
}

function touchStarted() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
}

function getAudioTypeFromSegment(segmentType) {
  // Mapeamento de segmentos para tipos de animação
  return segmentAnimations[segmentType];
}