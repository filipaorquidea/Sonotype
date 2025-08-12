const EXPORT_CONFIG = {
    alphabet: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,!?;:()[]{}',

    downloadDelay: 3000,        // Aumentado para 3 segundos
    urlCleanupDelay: 2000,      // Aumentado para 2 segundos
    gridExportDelay: 1500,      // Delay específico para exportação grelha
    vectorExportDelay: 2000,    // Delay específico para exportação vetorial

    segmentReactions: {
        enabled: true,
        audioSensitivity: 1.0,

        segment0: {
            sizeFactor: 0.001,      // Quase invisível
            minSize: 0.01,          // Extremamente pequeno
            maxSize: 0.05,          // Máximo muito reduzido
            brightnessFactor: 1.0,
            opacityFactor: 1.0,     // Multiplicador para opacidade (bass)
            movementFactor: 1.0,    // Multiplicador para movimento (noise)
            glowIntensity: 0.0,     // Desativado para não aumentar tamanho
            vibrationIntensity: 1.0, // Intensidade da vibração
            scaleFactor: 0.01,      // Quase zero
            flockingParticles: true // Adicionar partículas extras para flocking
        },
        segment1: {  // Bass waves - reage ao bass
            sizeFactor: 3.0,        // Multiplicador para tamanho (bass)
            minSize: 2,             // Tamanho mínimo
            maxSize: 8,             // Tamanho máximo
            brightnessFactor: 0.4,  // Multiplicador para brilho (bass)
            opacityFactor: 1.0,     // Multiplicador para opacidade (bass)
            rotationIntensity: 1.0, // Intensidade do movimento circular
            rotationSpeed: 1.0,     // Velocidade de rotação
            glowIntensity: 0.8,     // Intensidade do efeito glow
            vibrationIntensity: 1.2, // Intensidade da vibração
            scaleFactor: 1.0        // Multiplicador para escala
        },
        segment2: {  // Mid waves - reage às frequências médias
            sizeFactor: 3.5,        // Multiplicador para tamanho (mid)
            minSize: 2,             // Tamanho mínimo
            maxSize: 9,             // Tamanho máximo
            brightnessFactor: 0.3,  // Multiplicador para brilho (mid)
            opacityFactor: 3.0,     // Multiplicador para opacidade (mid)
            waveIntensity: 1.0,     // Intensidade do movimento ondulatório
            waveSpeed: 1.0,         // Velocidade das ondas
            glowIntensity: 0.6,     // Intensidade do efeito glow
            vibrationIntensity: 1.0, // Intensidade da vibração
            scaleFactor: 1.0        // Multiplicador para escala
        },
        segment3: {  // Treble lines - reage ao treble
            minThickness: 2,        // Espessura mínima das linhas
            maxThickness: 80,       // Espessura máxima das linhas
            lineIntensity: 1.0,     // Intensidade do movimento das linhas
            thicknessFactor: 15.0,  // Multiplicador para espessura
            movementFactor: 1.0,    // Multiplicador para movimento vertical
            glowIntensity: 1.2,     // Intensidade do efeito glow
            vibrationIntensity: 1.5, // Intensidade da vibração
            scaleFactor: 1.0        // Multiplicador para escala
        },
        segment4: {  // Organic - reage ao treble + mid
            sizeFactor: 4.0,        // Multiplicador para tamanho (treble+mid)
            minSize: 2,             // Tamanho mínimo
            maxSize: 10,            // Tamanho máximo
            brightnessFactor: 2.0,  // Multiplicador para brilho (treble+mid)
            opacityFactor: 1.67,    // Multiplicador para opacidade (treble+mid)
            organicIntensity: 1.0,  // Intensidade do movimento orgânico
            organicSpeed: 1.0,      // Velocidade do movimento orgânico
            glowIntensity: 0.7,     // Intensidade do efeito glow
            vibrationIntensity: 1.0, // Intensidade da vibração
            scaleFactor: 1.0        // Multiplicador para escala
        }
    },

    // Configurações de efeitos visuais avançados
    visualEffects: {
        glow: {
            enabled: true,          // Ativar efeito glow
            minIntensity: 5,        // Intensidade mínima para aplicar glow
            maxLayers: 3,           // Número máximo de camadas de glow
            layerMultiplier: 0.3,   // Multiplicador para tamanho de cada camada
            opacityFalloff: 2       // Quão rapidamente a opacidade diminui por camada
        },
        vibration: {
            enabled: true,          // Ativar efeito vibração
            minIntensity: 1,        // Intensidade mínima para aplicar vibração
            maxIntensity: 3,        // Intensidade máxima
            offsetMultiplier: 2,    // Multiplicador para offset da vibração
            opacityFactor: 0.5      // Fator de opacidade para vibrações
        },
        scale: {
            enabled: true,          // Ativar escala dinâmica
            minScale: 0.5,          // Escala mínima
            maxScale: 2.0,          // Escala máxima
            baseFactor: 1.0         // Fator base para escala
        }
    },

    // Configurações de animação para segmento 3 (linhas) - mantido para compatibilidade
    animatedLines: {
        enabled: true,          // Ativar captura de movimento reativo
        trailEffect: false,     // Criar efeito de rastro com múltiplos frames
        trailFrames: 3,         // Número de frames para o rastro
        frameStepSize: 10,      // Incremento entre frames simulados
        audioSensitivity: 1.0,  // Multiplicador para sensibilidade ao áudio
        minThickness: 4,        // Espessura mínima das linhas
        maxThickness: 60        // Espessura máxima das linhas
    }
};

let exportState = {
    isExporting: false,
    exportedFonts: [],
    errors: []
};

// Definir UNITS_PER_EM e ascender/descender normalizados com fontes padrão
const UNITS_PER_EM = 1000;
const ASCENDER = 800;
const DESCENDER = -200; // Normalizado para fontes padrão

// Função auxiliar para calcular largura de avanço proporcional
function calculateProportionalAdvanceWidth(char, glyphWidth = 0) {
    // Ajuste específico para exportação: reduzir espaçamento de letras estreitas
    const narrowLetters = 'iljfrt';
    const isNarrowLetter = narrowLetters.includes(char);

    // Espaçamento proporcional baseado no tipo de letra (ajustado para exportação)
    let standardSpacing;
    if (isNarrowLetter) {
        standardSpacing = UNITS_PER_EM * 0.02; // 2% do UNITS_PER_EM (reduzido para exportação)
    } else {
        standardSpacing = UNITS_PER_EM * 0.1; // 10% do UNITS_PER_EM (mantido)
    }

    // Largura mínima proporcional ao tipo de letra
    let minWidth;
    if (isNarrowLetter) {
        minWidth = UNITS_PER_EM * 0.25; // 25% do UNITS_PER_EM para letras estreitas (reduzido)
    } else {
        minWidth = UNITS_PER_EM * 0.6; // 60% do UNITS_PER_EM para letras normais
    }

    return Math.max(glyphWidth + standardSpacing, minWidth);
}

// Função auxiliar para verificar se uma letra é estreita
function isNarrowLetter(char) {
    const narrowLetters = 'iljfrt';
    return narrowLetters.includes(char);
}

// Função para calcular todas as reações de um segmento baseado no estado do áudio
// Função simples para reações básicas de segmento (usada na fonte vetorial e outros contextos)
function calculateSegmentReactions(segment, audioState, currentFrameCount, originalPoint = null) {
    const currentSpectrum = audioState && audioState.spectrum ? audioState.spectrum : [];
    const currentPeakData = audioState && audioState.peakData ? audioState.peakData : { peakCount: 0, visualMultiplier: 1 };

    // Calcular valores de áudio fundamentais
    const volume = currentSpectrum.length > 0 ? currentSpectrum.reduce((a, b) => a + b, 0) / currentSpectrum.length / 255 : 0;
    const bass = currentSpectrum.length > 0 ? currentSpectrum.slice(0, Math.floor(currentSpectrum.length * 0.1)).reduce((a, b) => a + b, 0) / (currentSpectrum.length * 0.1) / 255 : 0;
    const mid = currentSpectrum.length > 0 ? currentSpectrum.slice(Math.floor(currentSpectrum.length * 0.1), Math.floor(currentSpectrum.length * 0.7)).reduce((a, b) => a + b, 0) / (currentSpectrum.length * 0.6) / 255 : 0;
    const treble = currentSpectrum.length > 0 ? currentSpectrum.slice(Math.floor(currentSpectrum.length * 0.7)).reduce((a, b) => a + b, 0) / (currentSpectrum.length * 0.3) / 255 : 0;
    const peakMultiplier = Math.max(1, currentPeakData.visualMultiplier || 1);

    // Reações básicas simples para não afetar a fonte vetorial
    return {
        volume: volume,
        bass: bass,
        mid: mid,
        treble: treble,
        peakMultiplier: peakMultiplier,
        size: 3,
        brightness: 60,
        opacity: 80,
        movementX: 0,
        movementY: 0,
        rotation: 0,
        thickness: 4,
        scale: 1,
        vibration: 0,
        glow: 0
    };
}

// Função específica para calcular reações de segmento NA FONTE GRELHA APENAS
function calculateGridSegmentReactions(segment, audioState, currentFrameCount, originalPoint = null) {
    const currentSpectrum = audioState && audioState.spectrum ? audioState.spectrum : [];
    const currentPeakData = audioState && audioState.peakData ? audioState.peakData : { peakCount: 0, visualMultiplier: 1 };

    // Calcular valores de áudio fundamentais (mais precisos)
    const volume = currentSpectrum.length > 0 ? currentSpectrum.reduce((a, b) => a + b, 0) / currentSpectrum.length / 255 : 0;
    const bass = currentSpectrum.length > 0 ? currentSpectrum.slice(0, Math.floor(currentSpectrum.length * 0.1)).reduce((a, b) => a + b, 0) / (currentSpectrum.length * 0.1) / 255 : 0;
    const mid = currentSpectrum.length > 0 ? currentSpectrum.slice(Math.floor(currentSpectrum.length * 0.1), Math.floor(currentSpectrum.length * 0.7)).reduce((a, b) => a + b, 0) / (currentSpectrum.length * 0.6) / 255 : 0;
    const treble = currentSpectrum.length > 0 ? currentSpectrum.slice(Math.floor(currentSpectrum.length * 0.7)).reduce((a, b) => a + b, 0) / (currentSpectrum.length * 0.3) / 255 : 0;
    const peakMultiplier = Math.max(1, currentPeakData.visualMultiplier || 1);

    // Base values for brightness calculation (detectar tema atual)
    const isDarkMode = (typeof darkMode !== 'undefined' && darkMode) || true;
    const baseBrightness = isDarkMode ? 60 : 30;
    const baseOpacity = 80;

    // Configuração do segmento
    const segmentConfig = EXPORT_CONFIG.segmentReactions[`segment${segment}`] || {};
    const glowConfig = EXPORT_CONFIG.visualEffects.glow;
    const vibrationConfig = EXPORT_CONFIG.visualEffects.vibration;
    const scaleConfig = EXPORT_CONFIG.visualEffects.scale;

    let reactions = {
        volume: volume,
        bass: bass,
        mid: mid,
        treble: treble,
        peakMultiplier: peakMultiplier,
        size: 3,
        brightness: baseBrightness,
        opacity: baseOpacity,
        movementX: 0,
        movementY: 0,
        rotation: 0,
        thickness: 4,
        scale: 1,
        vibration: 0,
        glow: 0
    };

    switch (segment) {
        case 0: // Flocking - LÓGICA EXATA DO CANVAS
            // Usar valores amplificados do canvas se disponíveis
            const amplifiedMic = audioState.amplifiedMic || (audioState.mic * peakMultiplier);
            const amplifiedBass = audioState.amplifiedBass || (audioState.bass * peakMultiplier);
            const amplifiedMid = audioState.amplifiedMid || (audioState.mid * peakMultiplier);
            const amplifiedTreble = audioState.amplifiedTreble || (audioState.treble * peakMultiplier);

            // NOISE + JITTER igual ao canvas (frameCount % 5 === 0 check simulado)
            if (originalPoint && currentFrameCount) {
                // Jitter baseado no volume igual ao canvas
                const noiseValue = Math.sin(currentFrameCount * 0.1) * Math.max(0.1, volume * 2);
                const noiseAngle = noiseValue * Math.PI * 2;
                
                // Movimento jitter + noise (igual ao canvas, mas reduzido para grelha)
                const jitterX = Math.sin(noiseAngle) * 0.08 * volume * peakMultiplier * 10; // Reduzido para grelha
                const jitterY = Math.cos(noiseAngle) * 0.08 * volume * peakMultiplier * 10; // Reduzido para grelha
                
                reactions.movementX = jitterX;
                reactions.movementY = jitterY;
            }

            // Tamanho dinâmico baseado no volume * peakMultiplier (igual ao canvas)
            reactions.size = Math.max(1, Math.min(4, 
                3 + volume * peakMultiplier * 6)); // Reduzido para grelha (canvas: 3-9)

            // Brightness e opacity igual ao canvas
            reactions.brightness = Math.max(baseBrightness,
                Math.min(isDarkMode ? 100 : 50,
                    baseBrightness + (volume * peakMultiplier * 40)));
            reactions.opacity = Math.max(30,
                Math.min(baseOpacity,
                    30 + bass * peakMultiplier * 50));
            reactions.scale = 1 + (volume * peakMultiplier * 0.1);
            reactions.vibration = volume * peakMultiplier * 0.5;
            break;

        case 1: // Bass waves - MOVIMENTO ORBITAL igual ao canvas
            const amplifiedBass1 = audioState.amplifiedBass || (bass * peakMultiplier);
            
            // MOVIMENTO ORBITAL: cada partícula orbita em torno da sua posição original (igual ao canvas)
            if (originalPoint && currentFrameCount) {
                let orbitRadius, orbitSpeed;
                
                if (amplifiedBass1 > 0.01) {
                    // MOVIMENTO ORBITAL: cada partícula orbita em torno da sua posição original
                    orbitRadius = amplifiedBass1 * 12; // Raio da órbita baseado no bass (reduzido para grelha)
                    orbitSpeed = 0.04 + amplifiedBass1 * 0.06; // Velocidade orbital (igual ao canvas)
                } else {
                    // Sem bass: órbita muito pequena para manter movimento visível (igual ao canvas)
                    orbitRadius = 1.5; // Órbita pequena constante (reduzida para grelha)
                    orbitSpeed = 0.02; // Velocidade lenta
                }
                
                // Ângulo orbital baseado no tempo (igual ao canvas)
                const orbitAngle = currentFrameCount * orbitSpeed;
                
                // Posição orbital: movimento relativo à posição original
                reactions.movementX = Math.cos(orbitAngle) * orbitRadius;
                reactions.movementY = Math.sin(orbitAngle) * orbitRadius;
                reactions.rotation = orbitAngle;
            }

            reactions.size = Math.max(segmentConfig.minSize || 2,
                Math.min(segmentConfig.maxSize || 8,
                    3 + amplifiedBass1 * 4)); // Reduzido para grelha

            reactions.glow = amplifiedBass1 * 8 * (segmentConfig.glowIntensity || 0.8);
            reactions.brightness = Math.max(baseBrightness,
                Math.min(isDarkMode ? 100 : 60,
                    baseBrightness + (amplifiedBass1 * 25 * (segmentConfig.brightnessFactor || 0.4))));
            reactions.opacity = Math.max(70,
                Math.min(100,
                    70 + amplifiedBass1 * 30 * (segmentConfig.opacityFactor || 1.0)));
            reactions.scale = 1 + (amplifiedBass1 * 0.3 * (segmentConfig.scaleFactor || 1.0));
            reactions.vibration = amplifiedBass1 * 1.0 * (segmentConfig.vibrationIntensity || 1.2);
            break;

        case 2: // Mid waves - movimento ondulatório HORIZONTAL (igual ao canvas)
            const amplifiedMid2 = audioState.amplifiedMid || (mid * peakMultiplier);
            
            // ONDA MEXICANA HORIZONTAL igual ao canvas
            if (originalPoint && currentFrameCount) {
                const waveSpeed = segmentConfig.waveSpeed || 1.0;
                const waveIntensity = segmentConfig.waveIntensity || 1.0;
                
                // Amplitude base sempre visível + amplitude dinâmica com som (igual ao canvas)
                const baseAmplitude = 20; // Amplitude base para grelha (reduzida do canvas)
                const audioAmplitude = amplifiedMid2 * 30; // Amplitude extra com som
                const totalAmplitude = baseAmplitude + audioAmplitude;
                
                // ONDA MEXICANA: delay baseado na posição X original (igual ao canvas)
                const globalTime = currentFrameCount * 0.12; // Velocidade global da onda
                const delayFactor = ((originalPoint.pos ? originalPoint.pos.x : originalPoint.x) / 800) * Math.PI; // Delay progressivo
                const particleTime = globalTime - delayFactor;
                
                // Movimento HORIZONTAL de vai-e-vem (igual ao canvas)
                reactions.movementX = Math.sin(particleTime) * totalAmplitude;
                reactions.movementY = 0; // Sem movimento vertical para clareza
            }

            reactions.size = Math.max(segmentConfig.minSize || 2,
                Math.min(segmentConfig.maxSize || 9,
                    3 + amplifiedMid2 * 5)); // Reduzido para grelha

            reactions.glow = amplifiedMid2 * 6 * (segmentConfig.glowIntensity || 0.6);
            reactions.brightness = Math.max(baseBrightness,
                Math.min(isDarkMode ? 100 : 60,
                    baseBrightness + (amplifiedMid2 * 20 * (segmentConfig.brightnessFactor || 0.3))));
            reactions.opacity = Math.max(80,
                Math.min(100,
                    80 + amplifiedMid2 * 60 * (segmentConfig.opacityFactor || 3.0)));
            reactions.scale = 1 + (amplifiedMid2 * 0.2 * (segmentConfig.scaleFactor || 1.0));
            reactions.vibration = amplifiedMid2 * 0.8 * (segmentConfig.vibrationIntensity || 1.0);
            break;

        case 3: // Treble lines - LÓGICA EXATA DO CANVAS
            const amplifiedTreble3 = audioState.amplifiedTreble || (treble * peakMultiplier);
            
            // Movimento dramático das linhas igual ao canvas
            if (originalPoint && currentFrameCount) {
                const trebleAmplitude = amplifiedTreble3 * 1; // Reduzido para grelha (canvas usa *2)
                const angle = originalPoint.angle || 0; // Usar ângulo da partícula se disponível
                
                // Movimento igual ao canvas: sin/cos baseado no angle + frameCount
                const lineForceX = Math.sin(angle + currentFrameCount * 0.05) * trebleAmplitude;
                const lineForceY = Math.cos(angle + currentFrameCount * 0.05) * trebleAmplitude;
                
                reactions.movementX = lineForceX;
                reactions.movementY = lineForceY;
            }

            // Para treble, usar thickness em vez de size (igual ao canvas)
            reactions.thickness = Math.max(segmentConfig.minThickness || 2,
                Math.min(segmentConfig.maxThickness || 15, // Reduzido para grelha
                    2 + amplifiedTreble3 * 13)); // Canvas: 2 + treble*peakMultiplier*5

            reactions.size = reactions.thickness; // Usar thickness como size para compatibilidade
            reactions.glow = amplifiedTreble3 * 12 * (segmentConfig.glowIntensity || 1.2);
            reactions.brightness = Math.max(baseBrightness,
                Math.min(isDarkMode ? 100 : 60,
                    baseBrightness + (amplifiedTreble3 * 40)));
            reactions.opacity = Math.max(70, Math.min(100, 70 + amplifiedTreble3 * 30));
            reactions.scale = 1 + (amplifiedTreble3 * 0.2 * (segmentConfig.scaleFactor || 1.0));
            reactions.vibration = amplifiedTreble3 * 1.2 * (segmentConfig.vibrationIntensity || 1.5);
            break;

        case 4: // Organic - LÓGICA EXATA DO CANVAS
            const combinedAudio = (treble + mid) / 2;
            const amplifiedCombined = (audioState.amplifiedTreble + audioState.amplifiedMid) / 2 || (combinedAudio * peakMultiplier);
            
            // Movimento orgânico igual ao canvas
            if (originalPoint && currentFrameCount) {
                // Usar orgParams se disponível, senão criar valores padrão
                const frequency = (originalPoint.orgParams ? originalPoint.orgParams.frequency : 0.02);
                const amplitude = (originalPoint.orgParams ? originalPoint.orgParams.amplitude : 20) * 0.4; // Reduzido para grelha
                const phase = (originalPoint.orgParams ? originalPoint.orgParams.phase : 0);
                
                // Movimento orgânico igual ao canvas
                const time = currentFrameCount * frequency;
                const energy = Math.max(0, Math.min(1, amplifiedCombined * 0.8));
                
                const orgX = Math.sin(time + phase) * amplitude * energy;
                const orgY = Math.cos(time * 0.2 + phase) * amplitude * energy;
                
                reactions.movementX = orgX;
                reactions.movementY = orgY;
            }

            reactions.size = Math.max(segmentConfig.minSize || 2,
                Math.min(segmentConfig.maxSize || 10,
                    4 + amplifiedCombined * 6)); // Reduzido para grelha

            reactions.glow = amplifiedCombined * 7 * (segmentConfig.glowIntensity || 0.7);
            reactions.brightness = Math.max(baseBrightness,
                Math.min(isDarkMode ? 100 : 60,
                    baseBrightness + (amplifiedCombined * 50 * (segmentConfig.brightnessFactor || 2.0))));
            reactions.opacity = Math.max(40,
                Math.min(100,
                    40 + amplifiedCombined * 50 * (segmentConfig.opacityFactor || 1.67)));
            reactions.scale = 1 + (amplifiedCombined * 0.3 * (segmentConfig.scaleFactor || 1.0));
            reactions.vibration = amplifiedCombined * 1.0 * (segmentConfig.vibrationIntensity || 1.0);
            break;

        default:
            // Valores padrão para segmentos não reconhecidos
            reactions.size = 3;
            reactions.brightness = baseBrightness;
            reactions.opacity = baseOpacity;
            break;
    }

    return reactions;
}

// Função dedicada para lógica de segmentos da grelha, igual ao canvas
function createGridContoursFromPoints(points, gridBoxes, audioState) {
    
    // PRIMEIRA ANÁLISE: Verificar se os dados vieram corretamente do canvas
    if (typeof window !== 'undefined' && window.letterPoints) {
        const totalCanvasPoints = window.letterPoints.length;
        const gridCanvasPoints = window.letterPoints.filter(p => p.renderType === 'grid').length;
        
        // Verificar distribuição de segmentos no canvas
        const canvasSegmentStats = {};
        window.letterPoints.filter(p => p.renderType === 'grid').forEach(point => {
            const segment = point.segment !== undefined ? point.segment : 'undefined';
            canvasSegmentStats[segment] = (canvasSegmentStats[segment] || 0) + 1;
        });
        
        // DEBUG ESPECÍFICO SEGMENTO 3 - Verificar se lineSegment existe
        const segment3Canvas = window.letterPoints.filter(p => p.renderType === 'grid' && p.segment === 3);
        segment3Canvas.slice(0, 3).forEach((p, i) => {
            if (p.lineSegment) {
            }
        });
    }
    
    // SEGUNDA ANÁLISE: Verificar os dados que chegaram na função
    const receivedSegmentStats = {};
    points.forEach(point => {
        const segment = point.segment !== undefined ? point.segment : 'undefined';
        receivedSegmentStats[segment] = (receivedSegmentStats[segment] || 0) + 1;
    });
    
    // DEBUG ESPECÍFICO SEGMENTO 3 - Verificar se lineSegment foi transferido
    const segment3Received = points.filter(p => p.segment === 3);
    segment3Received.slice(0, 3).forEach((p, i) => {
        if (p.lineSegment) {
        }
    });
    
    // COMPARAR: Se há diferenças entre canvas e dados recebidos
    if (typeof window !== 'undefined' && window.letterPoints) {
        const canvasSegmentStats = {};
        window.letterPoints.filter(p => p.renderType === 'grid').forEach(point => {
            const segment = point.segment !== undefined ? point.segment : 'undefined';
            canvasSegmentStats[segment] = (canvasSegmentStats[segment] || 0) + 1;
        });
        
        Object.keys(canvasSegmentStats).forEach(segment => {
            const canvasCount = canvasSegmentStats[segment];
            const receivedCount = receivedSegmentStats[segment] || 0;
            if (canvasCount !== receivedCount) {
            } else {
            }
        });
    }
    
    // TERCEIRA ANÁLISE: Debug detalhado dos primeiros pontos (removido)
    
    // Agrupar pontos por posição exata - PRESERVAR TODOS OS DADOS ORIGINAIS
    const uniquePoints = [];
    const processedPositions = new Set();
    let segment3Original = 0;
    let segment3Filtered = 0;
    
    // Contar segmento 3 nos dados originais
    points.forEach(point => {
        if (point.segment === 3) segment3Original++;
    });
    
    points.forEach((point, index) => {
        const px = point.pos ? point.pos.x : point.x;
        const py = point.pos ? point.pos.y : point.y;
        
        // Usar chave única que preserve segmento + posição
        const key = `${px.toFixed(1)}_${py.toFixed(1)}_${point.segment || 0}`;
        
        if (!processedPositions.has(key)) {
            processedPositions.add(key);
            const uniquePoint = {
                ...point, // Preservar TODOS os dados originais
                actualX: px,
                actualY: py,
                originalIndex: index
            };
            uniquePoints.push(uniquePoint);
            
            // Contar segmento 3 após filtragem
            if (point.segment === 3) {
                segment3Filtered++;
            }
        }
    });
    

    // Verificar distribuição após filtragem
    const finalSegmentStats = {};
    uniquePoints.forEach(point => {
        const segment = point.segment !== undefined ? point.segment : 'undefined';
        finalSegmentStats[segment] = (finalSegmentStats[segment] || 0) + 1;
    });

    // Calcular bounds
    const allX = uniquePoints.map(p => p.actualX);
    const allY = uniquePoints.map(p => p.actualY);
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);
    const width = maxX - minX || 1;
    const height = maxY - minY || 1;
    const positionScale = UNITS_PER_EM / Math.max(width, height);
    
    // CENTRAMENTO COMO NA FUNÇÃO VETORIAL
    const glyphWidth = width * positionScale;
    const glyphHeight = height * positionScale;
    const advanceWidth = calculateProportionalAdvanceWidth(char, glyphWidth);
    const centeringOffset = (advanceWidth - glyphWidth) / 2;
    
    // CENTRAMENTO VERTICAL: Ajustar para Y invertido nas fontes
    // Nas fontes: Y=0 está na baseline, Y positivo vai para cima
    // Queremos centrar a letra verticalmente no espaço da fonte
    const targetCenterY = UNITS_PER_EM * 0.4; // Centro visual da fonte (40% da altura)
    const currentCenterY = glyphHeight / 2; // Centro da letra atual
    const verticalOffset = targetCenterY - currentCenterY;


    const contours = [];

    // 1. CRIAR QUADRADOS DA GRELHA (apenas bordas, sem preenchimento)
    gridBoxes.forEach((box, boxIndex) => {
        const size = box.width * positionScale;
        const cx = (box.x + box.width / 2 - minX) * positionScale + centeringOffset;
        // Y invertido: (maxY - y) converte para coordenadas de fonte, + verticalOffset centra
        const cy = (maxY - (box.y + box.height / 2)) * positionScale + verticalOffset;
        const half = size / 2;
        const lineThickness = Math.max(1, size * 0.03);

        // Criar 4 linhas separadas para formar o quadrado (sem preenchimento)
        // Linha superior
        contours.push({
            type: 'path',
            points: [
                { x: cx - half, y: cy - half, type: 'move' },
                { x: cx + half, y: cy - half, type: 'line' }
            ],
            lineWidth: lineThickness,
            metadata: { type: 'grid_square_top', boxIndex: boxIndex }
        });
        
        // Linha direita
        contours.push({
            type: 'path',
            points: [
                { x: cx + half, y: cy - half, type: 'move' },
                { x: cx + half, y: cy + half, type: 'line' }
            ],
            lineWidth: lineThickness,
            metadata: { type: 'grid_square_right', boxIndex: boxIndex }
        });
        
        // Linha inferior
        contours.push({
            type: 'path',
            points: [
                { x: cx + half, y: cy + half, type: 'move' },
                { x: cx - half, y: cy + half, type: 'line' }
            ],
            lineWidth: lineThickness,
            metadata: { type: 'grid_square_bottom', boxIndex: boxIndex }
        });
        
        // Linha esquerda
        contours.push({
            type: 'path',
            points: [
                { x: cx - half, y: cy + half, type: 'move' },
                { x: cx - half, y: cy - half, type: 'line' }
            ],
            lineWidth: lineThickness,
            metadata: { type: 'grid_square_left', boxIndex: boxIndex }
        });
    });


    // 2. CRIAR PARTÍCULAS PRESERVANDO POSIÇÃO RELATIVA DENTRO DE CADA QUADRADO
    let segment3Count = 0; // Contador específico para segmento 3
    
    uniquePoints.forEach((point, pointIndex) => {
        const segment = point.segment !== undefined ? point.segment : 0;
        
        // Contar segmento 3 especificamente
        if (segment === 3) {
            segment3Count++;
            
            // Debug para verificar lineSegment
            if (point.lineSegment) {
            } else {
            }
        }
        
        
        // ENCONTRAR O QUADRADO QUE CONTÉM ESTA PARTÍCULA
        let containingBox = null;
        let boxIndex = -1;
        
        for (let i = 0; i < gridBoxes.length; i++) {
            const box = gridBoxes[i];
            if (point.actualX >= box.x && point.actualX <= box.x + box.width &&
                point.actualY >= box.y && point.actualY <= box.y + box.height) {
                containingBox = box;
                boxIndex = i;
                break;
            }
        }
        
        if (!containingBox) {
            return;
        }
        
        
        // CALCULAR POSIÇÃO RELATIVA DENTRO DO QUADRADO (0.0 a 1.0)
        const relativeX = (point.actualX - containingBox.x) / containingBox.width;
        const relativeY = (point.actualY - containingBox.y) / containingBox.height;
        
        // TRANSFORMAR PARA COORDENADAS DA FONTE MANTENDO A POSIÇÃO RELATIVA
        const boxSize = containingBox.width * positionScale;
        const boxCenterX = (containingBox.x + containingBox.width / 2 - minX) * positionScale + centeringOffset;
        const boxCenterY = (maxY - (containingBox.y + containingBox.height / 2)) * positionScale + verticalOffset;
        
        // Posicionar a partícula na mesma posição relativa dentro do quadrado da fonte
        const halfBox = boxSize / 2;
        const x = boxCenterX - halfBox + (relativeX * boxSize);
        const y = boxCenterY - halfBox + ((1 - relativeY) * boxSize); // Invertido para coordenadas da fonte
        
        
        // Calcular reações baseadas no estado atual da partícula no canvas
        let reactions = {
            size: 8, // Tamanho base maior para visibilidade
            movementX: 0,
            movementY: 0,
            opacity: 1,
            glow: 0,
            thickness: 3
        };

        // Se há estado de áudio, aplicar reações
        if (audioState) {
            reactions = calculateGridSegmentReactions(segment, audioState, audioState.frameCount || 0, point);
            // Debug removido
        }

        // Aplicar escala às reações - TAMANHOS MAIORES para melhor visibilidade
        const scaledSize = Math.max(5, reactions.size * positionScale * 0.3); // Aumentado ainda mais para visibilidade
        
        // Aplicar movimentos das reações proporcionalmente ao tamanho do quadrado
        const movementScale = boxSize * 0.05; // Movimento proporcional ao quadrado
        const finalX = x + (reactions.movementX || 0) * movementScale;
        const finalY = y + (reactions.movementY || 0) * movementScale;

        let particleContour = null;

        // Criar contornos específicos por tipo de segmento - TODOS BEM VISÍVEIS
        switch (segment) {
            case 0: // FLOCKING - círculos pequenos mas bem visíveis
                particleContour = {
                    type: 'circle',
                    centerX: finalX,
                    centerY: finalY,
                    radius: Math.max(3, scaledSize * 0.8), // Aumentado de 0.7 para 0.8
                    segment: segment,
                    audioReactions: reactions,
                    metadata: { type: 'flocking_particle', pointIndex: pointIndex }
                };
                break;
                
            case 1: // BASS WAVES - círculos médios bem visíveis
                particleContour = {
                    type: 'circle',
                    centerX: finalX,
                    centerY: finalY,
                    radius: Math.max(5, scaledSize * 1.2), // Aumentado de 1.0 para 1.2
                    segment: segment,
                    audioReactions: reactions,
                    metadata: { type: 'bass_wave', pointIndex: pointIndex }
                };
                break;
                
            case 2: // MID WAVES - círculos com movimento, bem visíveis
                particleContour = {
                    type: 'circle',
                    centerX: finalX,
                    centerY: finalY,
                    radius: Math.max(4, scaledSize * 1.0), // Aumentado de 0.9 para 1.0
                    segment: segment,
                    audioReactions: reactions,
                    metadata: { type: 'mid_wave', pointIndex: pointIndex }
                };
                break;
                
            case 3: // TREBLE LINES - criar linhas variadas como no canvas
                
                // Criar linha variada baseada na posição e características da partícula
                const baseLength = Math.max(25, scaledSize * 4.0); // Aumentado de 15 e 2.5 para 25 e 4.0
                const angleVariation = (point.actualX + point.actualY) * 0.01; // Ângulo baseado na posição
                const lengthVariation = 0.8 + (point.actualX % 50) / 80; // Variação no comprimento (mais uniforme)
                
                const lineLength = baseLength * lengthVariation;
                const lineAngle = angleVariation; // Ângulo em radianos
                
                // Calcular pontos da linha com ângulo
                const halfLength = lineLength / 2;
                const dx = Math.cos(lineAngle) * halfLength;
                const dy = Math.sin(lineAngle) * halfLength;
                
                const x1 = finalX - dx;
                const y1 = finalY - dy;
                const x2 = finalX + dx;
                const y2 = finalY + dy;
                
                particleContour = {
                    type: 'path',
                    points: [
                        { x: x1, y: y1, type: 'move' },
                        { x: x2, y: y2, type: 'line' }
                    ],
                    lineWidth: Math.max(1, scaledSize * 0.15), // Reduzido para linhas finas: de 4 e 0.8 para 1 e 0.15
                    segment: segment,
                    audioReactions: reactions,
                    metadata: { type: 'treble_line_varied', pointIndex: pointIndex }
                };
                break;
                
            case 4: // ORGANIC - formas orgânicas maiores
                particleContour = {
                    type: 'circle',
                    centerX: finalX,
                    centerY: finalY,
                    radius: Math.max(6, scaledSize * 1.5), // Aumentado de 1.1 para 1.5
                    segment: segment,
                    audioReactions: reactions,
                    metadata: { type: 'organic_shape', pointIndex: pointIndex }
                };
                break;
                
            default:
                particleContour = {
                    type: 'circle',
                    centerX: finalX,
                    centerY: finalY,
                    radius: Math.max(2, scaledSize * 0.8),
                    segment: segment,
                    audioReactions: reactions,
                    metadata: { type: 'default_particle', pointIndex: pointIndex }
                };
                break;
        }

        if (particleContour) {
            contours.push(particleContour);
            
            // Debug detalhado para cada tipo
        } else {
        }
    });

    // Estatísticas finais
    const linhasQuadrados = contours.filter(c => c.metadata?.type?.startsWith('grid_square')).length;
    const particulas = contours.filter(c => !c.metadata?.type?.startsWith('grid_square')).length;
    const numQuadrados = Math.floor(linhasQuadrados / 4); // 4 linhas por quadrado
    const porSegmento = {};
    contours.forEach(c => {
        if (c.segment !== undefined) {
            porSegmento[c.segment] = (porSegmento[c.segment] || 0) + 1;
        }
    });

    
    // DEBUG DETALHADO: Verificar as primeiras partículas do segmento 3 criadas
    const segment3Contours = contours.filter(c => c.segment === 3);

    return contours;
}

// FUNÇÃO REMOVIDA - Duplicada, mantendo apenas a versão com intercepção

function captureCurrentAudioState() {
    try {
        // Capturar variáveis globais do contexto principal
        const currentFft = (typeof fft !== 'undefined' && fft) ? fft : null;
        const currentPeakDetector = (typeof peakDetector !== 'undefined' && peakDetector) ? peakDetector : null;
        const currentFrameCount = (typeof frameCount !== 'undefined' && frameCount) ? frameCount : Date.now() * 0.01;

        // Capturar valores de áudio específicos do canvas
        const currentBass = (typeof bassValue !== 'undefined') ? bassValue : 0.5;
        const currentMid = (typeof midValue !== 'undefined') ? midValue : 0.5;
        const currentTreble = (typeof trebleValue !== 'undefined') ? trebleValue : 0.5;
        const currentMic = (typeof micLevel !== 'undefined') ? micLevel : 0.5;

        // Capturar análise do spectrum no momento exato
        let spectrum = [];
        if (currentFft && typeof currentFft.analyze === 'function') {
            spectrum = currentFft.analyze();
        }

        // Capturar dados do peak detector
        let peakData = {
            peakCount: 0,
            visualMultiplier: 1,
            hasPeaks: false
        };

        if (currentPeakDetector) {
            peakData.peakCount = currentPeakDetector.peakCount || 0;
            peakData.visualMultiplier = (typeof currentPeakDetector.getVisualMultiplier === 'function')
                ? currentPeakDetector.getVisualMultiplier()
                : 1;
            peakData.hasPeaks = peakData.peakCount > 0;
        }

        // Capturar valores suavizados se disponíveis
        const smoothedBass = (typeof smoothedBass !== 'undefined') ? smoothedBass : currentBass;
        const smoothedMid = (typeof smoothedMid !== 'undefined') ? smoothedMid : currentMid;
        const smoothedTreble = (typeof smoothedTreble !== 'undefined') ? smoothedTreble : currentTreble;
        const smoothedMic = (typeof smoothedMic !== 'undefined') ? smoothedMic : currentMic;

        // Calcular valores amplificados como no canvas
        const audioMultiplier = peakData.visualMultiplier;
        const amplifiedBass = Math.pow(smoothedBass * 0.4, 1.2) * audioMultiplier;
        const amplifiedMid = Math.pow(smoothedMid * 0.7, 1.1) * audioMultiplier;
        const amplifiedTreble = Math.pow(smoothedTreble * 1.2, 1.8) * audioMultiplier;
        const amplifiedMic = Math.pow(smoothedMic * 1.0, 1.3) * audioMultiplier;

        return {
            spectrum: spectrum,
            peakData: peakData,
            frameCount: currentFrameCount,
            timestamp: Date.now(),
            // Valores específicos do canvas
            bass: currentBass,
            mid: currentMid,
            treble: currentTreble,
            mic: currentMic,
            // Valores suavizados
            smoothedBass: smoothedBass,
            smoothedMid: smoothedMid,
            smoothedTreble: smoothedTreble,
            smoothedMic: smoothedMic,
            // Valores amplificados
            amplifiedBass: amplifiedBass,
            amplifiedMid: amplifiedMid,
            amplifiedTreble: amplifiedTreble,
            amplifiedMic: amplifiedMic
        };
    } catch (error) {
        return {
            spectrum: [],
            peakData: { peakCount: 0, visualMultiplier: 1, hasPeaks: false },
            frameCount: Date.now() * 0.01,
            timestamp: Date.now(),
            // Valores padrão
            bass: 0.5,
            mid: 0.5,
            treble: 0.5,
            mic: 0.5,
            smoothedBass: 0.5,
            smoothedMid: 0.5,
            smoothedTreble: 0.5,
            smoothedMic: 0.5,
            amplifiedBass: 0.5,
            amplifiedMid: 0.5,
            amplifiedTreble: 0.5,
            amplifiedMic: 0.5
        };
    }
}

async function exportarFonteComoOTF() {
    
    if (exportState.isExporting) {
        // Mostrar mensagem se já está exportando
        if (typeof window.showOTFMessage === 'function') {
            window.showOTFMessage('Export já em progresso. Aguarde...', 'info', 3000);
        }
        return;
    }

    let prevFlockingVisibility = null; // Garante que a variável existe

    try {
        exportState.isExporting = true;
        exportState.errors = [];
        exportState.exportedFonts = [];

        // Forçar segmento 0 ativo durante exportação
        if (typeof segmentSystemState !== 'undefined' && segmentSystemState.segmentVisibility) {
            prevFlockingVisibility = segmentSystemState.segmentVisibility[0];
            segmentSystemState.segmentVisibility[0] = true;
        }

        // CAPTURAR ESTADO DO ÁUDIO NO MOMENTO EXATO DA EXPORTAÇÃO
        const audioState = captureCurrentAudioState();

        // Mostrar mensagem de análise imediatamente
        if (typeof window.showOTFMessage === 'function') {
            window.showOTFMessage('Analisando pontos das letras...', 'info', 0);
        }

        // Verificar se há pontos de letra visíveis
        
        if (typeof window.letterPoints === 'undefined' || !window.letterPoints || window.letterPoints.length === 0) {
            throw new Error("Nenhuma letra visível no canvas. Digite algo primeiro!");
        }

        // --- DETECTAR TIPO DE FONTE AUTOMATICAMENTE ---
        // Separar pontos por tipo de renderização
        const gridLetterGroups = new Map();
        const vectorLetterGroups = new Map();

        window.letterPoints.forEach(point => {
            if (point.character && point.character.trim() !== '') {
                // Se não tiver renderType definido, assumir que é grelha se estiver no segmento 0
                const isGrid = point.renderType === 'grid' || (point.renderType === undefined && point.segment === 0);
                const isVector = point.renderType === 'vector' || (point.renderType === undefined && point.segment !== 0);

                if (isGrid) {
                    if (!gridLetterGroups.has(point.character)) {
                        gridLetterGroups.set(point.character, []);
                    }
                    gridLetterGroups.get(point.character).push(point);
                } else if (isVector) {
                    if (!vectorLetterGroups.has(point.character)) {
                        vectorLetterGroups.set(point.character, []);
                    }
                    vectorLetterGroups.get(point.character).push(point);
                }
            }
        });


        // Permitir que a mesma letra exista em ambos os grupos (diferentes instâncias)
        const gridKeys = Array.from(gridLetterGroups.keys());
        const vectorKeys = Array.from(vectorLetterGroups.keys());

        const commonKeys = gridKeys.filter(key => vectorKeys.includes(key));

        // Mostrar progresso da detecção
        if (typeof window.showOTFMessage === 'function') {
            const totalLetters = gridKeys.length + vectorKeys.length;
            if (totalLetters > 0) {
                window.showOTFMessage(`${totalLetters} letras detetadas. Preparando export...`, 'info', 0);
            }
        }

        if (gridLetterGroups.size > 0 && vectorLetterGroups.size === 0) {
            // Mostrar mensagem para fonte de grelha
            if (typeof window.showOTFMessage === 'function') {
                const lettersCount = gridLetterGroups.size;
                window.showOTFMessage(`Processando fonte de grelha (${lettersCount} letras)...`, 'info', 0);
                // Pequeno delay para mostrar a mensagem
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            await exportarFonteGrelhaSeparada(gridLetterGroups, audioState);
        } else if (vectorLetterGroups.size > 0 && gridLetterGroups.size === 0) {
            // Mostrar mensagem para fonte vectorial
            if (typeof window.showOTFMessage === 'function') {
                const lettersCount = vectorLetterGroups.size;
                window.showOTFMessage(`Processando fonte vectorial (${lettersCount} letras)...`, 'info', 0);
                // Pequeno delay para mostrar a mensagem
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            await exportarFonteVectorOriginal(vectorLetterGroups, audioState);
        } else if (gridLetterGroups.size > 0 && vectorLetterGroups.size > 0) {
            // Mostrar mensagem para fonte de grelha
            if (typeof window.showOTFMessage === 'function') {
                const gridCount = gridLetterGroups.size;
                window.showOTFMessage(`Processando fonte de grelha (${gridCount} letras)...`, 'info', 0);
                // Pequeno delay para mostrar a mensagem
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            await exportarFonteGrelhaSeparada(gridLetterGroups, audioState);

            await new Promise(resolve => setTimeout(resolve, EXPORT_CONFIG.vectorExportDelay));

            // Mostrar mensagem para fonte vectorial
            if (typeof window.showOTFMessage === 'function') {
                const vectorCount = vectorLetterGroups.size;
                window.showOTFMessage(`Processando fonte vectorial (${vectorCount} letras)...`, 'info', 0);
                // Pequeno delay para mostrar a mensagem
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            await exportarFonteVectorOriginal(vectorLetterGroups, audioState);
        } else {
            throw new Error("Nenhuma letra válida encontrada para exportação!");
        }
        
        // Mensagem de sucesso final
        if (typeof window.showOTFMessage === 'function') {
            const fontCount = exportState.exportedFonts.length;
            const message = fontCount > 1 
                ? `${fontCount} fontes OTF criadas e transferidas com sucesso!`
                : 'Fonte OTF criada e transferida com sucesso!';
            window.showOTFMessage(message, 'success', 5000);
        }
    } catch (error) {
        exportState.errors.push(error.message);
        
        // Mostrar mensagem de erro
        if (typeof window.showOTFMessage === 'function') {
            window.showOTFMessage(`Erro no export: ${error.message}`, 'error', 6000);
        }
        
        throw error;
    } finally {
        // Restaurar visibilidade original do segmento 0
        if (typeof segmentSystemState !== 'undefined' && segmentSystemState.segmentVisibility && prevFlockingVisibility !== null) {
            segmentSystemState.segmentVisibility[0] = prevFlockingVisibility;
        }
        exportState.isExporting = false;
    }
}

// Ajuste em createFontFromVisibleLetters para aceitar referenceName e definir familyName único
async function createFontFromVisibleLetters(letterGroups, renderType, audioState = null, referenceName = "") {
    const glyphs = [];
    glyphs.push(createNotDefGlyph());
    const availableLetters = Array.from(letterGroups.keys());
    for (const char of availableLetters) {
        try {
            const charPoints = letterGroups.get(char) || [];
            const glyphData = await createGlyphFromPoints(char, charPoints, renderType, audioState);
            if (glyphData) {
                glyphs.push(glyphData);
            }
        } catch (error) {
        }
    }
    for (const char of EXPORT_CONFIG.alphabet) {
        if (!availableLetters.includes(char)) {
            const emptyGlyph = createEmptyGlyph(char);
            glyphs.push(emptyGlyph);
        }
    }
    // Nome único para cada fonte exportada
    const fontName = renderType === 'vector'
        ? `SketchFont-Vector-${referenceName}`
        : `SketchFont-Grid-${referenceName}`;
    return {
        familyName: fontName,
        styleName: 'Regular',
        version: '1.0',
        glyphs: glyphs,
        unitsPerEm: UNITS_PER_EM,
        ascender: ASCENDER,
        descender: DESCENDER,
        metadata: {
            renderType: renderType,
            exportTime: new Date().toISOString(),
            visibleLetters: Array.from(letterGroups.keys()),
            totalGlyphs: glyphs.length
        }
    };
}

async function createGlyphFromPoints(char, charPoints, renderType, audioState = null) {
    if (renderType === 'vector') {
        return createVectorGlyphFromPoints(char, charPoints, audioState);
    }
    // Para grid, chama sempre a função grid
    if (renderType === 'grid') {
        // Garantir que charPoints tem a estrutura correta para grid
        const gridCharPoints = {
            points: Array.isArray(charPoints) ? charPoints : (charPoints.points || []),
            gridBoxes: charPoints.gridBoxes || []
        };
        return createGridGlyphFromPoints(char, gridCharPoints, audioState);
    }
    // Fallback vazio
    return createEmptyGlyph(char);
}

async function createVectorGlyphFromPoints(char, charPoints, audioState = null) {
    // Garantir que charPoints é um array válido
    if (!Array.isArray(charPoints)) charPoints = [];
    // Se não há pontos, fallback imediato
    if (charPoints.length === 0) {
        const advanceWidth = calculateProportionalAdvanceWidth(char);

        // Fallback: círculo grande centralizado
        return {
            unicode: char.charCodeAt(0),
            name: getGlyphName(char),
            advanceWidth: advanceWidth,
            contours: [createCircleContour(UNITS_PER_EM * 0.9, UNITS_PER_EM * 0.9, UNITS_PER_EM * 1.2)],
            metadata: {
                renderType: 'vector',
                pointCount: 0,
                isDirect: false,
                exportType: 'vector_particles_fallback',
                fallback: true,
                isNarrowLetter: isNarrowLetter(char)
            }
        };
    }
    // Se todos os pontos têm segment definido, assume que já vêm clonados (letra não visível)
    const allHaveSegment = charPoints.every(p => p.segment !== undefined);
    let pointsToUse;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    if (allHaveSegment) {
        // Letras não visíveis: usar todos os pontos na ordem original
        pointsToUse = charPoints;
        // Calcular bounds dos pontos clonados
        pointsToUse.forEach(point => {
            let x = point.pos && point.pos.x !== undefined ? point.pos.x : point.x;
            let y = point.pos && point.pos.y !== undefined ? point.pos.y : point.y;
            if (x === undefined || y === undefined) return;
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        });
    } else {
        // Para letras visíveis, remover duplicados por posição
        const seen = new Set();
        pointsToUse = [];
        charPoints.forEach(point => {
            let x = point.pos && point.pos.x !== undefined ? point.pos.x : point.x;
            let y = point.pos && point.pos.y !== undefined ? point.pos.y : point.y;
            if (x === undefined || y === undefined) return;
            const key = `${Math.round(x)}_${Math.round(y)}`;
            if (!seen.has(key)) {
                seen.add(key);
                pointsToUse.push(point);
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
        });
    }

    // Calcular positionScale proporcional ao novo UNITS_PER_EM
    let positionScale = (UNITS_PER_EM / 1000) * 10; // Escalar proporcionalmente
    if (allHaveSegment) {
        positionScale = (UNITS_PER_EM / 1000) * 2.5;
    }

    // Tratamento adequado para descendentes
    // Letras minúsculas: g, j, p, q, y
    // Letras maiúsculas: Q (tem cauda que desce abaixo da baseline)
    // Algumas fontes também podem ter: J (dependendo do design)
    const descendentesMinusculas = 'gjpqy';
    const descendentesMaiusculas = 'Q'; // Q sempre
    const isLower = (char >= 'a' && char <= 'z');
    const isUpper = (char >= 'A' && char <= 'Z');
    const hasDescendente = (isLower && descendentesMinusculas.includes(char)) || 
                          (isUpper && descendentesMaiusculas.includes(char));
    
    let descendenteOffset = 0;
    let descendenteScale = 1.0;

    if (hasDescendente) {
        // Calcular offset baseado na altura da fonte e posição dos pontos
        const fontHeight = maxY - minY;

        // Offset diferente para maiúsculas vs minúsculas
        if (isUpper && descendentesMaiusculas.includes(char)) {
            // Para Q maiúsculo: offset menor (cauda mais curta que minúsculas)
            if (char === 'Q') {
                descendenteOffset = fontHeight * 0.4; // Q tem cauda diagonal curta
            } 
        } else {
            // Para letras minúsculas: offset maior (descendente mais longo)
            descendenteOffset = fontHeight * 0.8;
        }

        // --- IMPORTANTE: Estender os bounds para incluir a área da cauda ---
        const caudaTargetY = maxY + descendenteOffset;
        maxY = Math.max(maxY, caudaTargetY); // Estender o maxY para incluir a área da cauda
    }

    // Calcula os pontos normalizados SEM offset
    const tempParticlePositions = pointsToUse.map((point, index) => {
        let x, y;
        if (point.pos && point.pos.x !== undefined && point.pos.y !== undefined) {
            x = point.pos.x;
            y = point.pos.y;
        } else if (point.x !== undefined && point.y !== undefined) {
            x = point.x;
            y = point.y;
        } else {
            x = 0;
            y = 0;
        }
        const normalizedX = (x - minX) * positionScale;
        const normalizedY = (maxY - y) * positionScale;
        return {
            ...point,
            x: normalizedX,
            y: normalizedY,
            renderType: 'vector',
            originalIndex: index
        };
    });

    // Calcula o minY após scaling
    const minYAfterScale = Math.min(...tempParticlePositions.map(p => p.y));
    // Offset global para alinhar baseline
    const baselineOffset = -minYAfterScale;

    // Calcular o centro do glifo para centralização
    const glyphCenterX = (Math.min(...tempParticlePositions.map(p => p.x)) + Math.max(...tempParticlePositions.map(p => p.x))) / 2;

    const particlePositions = tempParticlePositions.map(p => {
        // Aplicar scaling para descendentes
        let scaledX = p.x;
        let scaledY = p.y;

        if (descendenteScale !== 1.0) {
            // Calcular centro para scaling
            const centerX = (Math.min(...tempParticlePositions.map(p => p.x)) + Math.max(...tempParticlePositions.map(p => p.x))) / 2;
            const centerY = (Math.min(...tempParticlePositions.map(p => p.y)) + Math.max(...tempParticlePositions.map(p => p.y))) / 2;

            // Aplicar scaling a partir do centro
            scaledX = centerX + (p.x - centerX) * descendenteScale;
            scaledY = centerY + (p.y - centerY) * descendenteScale;
        }

        return {
            ...p,
            x: scaledX,
            y: scaledY + baselineOffset - descendenteOffset
        };
    });

    // Garantir que todos os pontos tenham coordenadas válidas
    const validParticlePositions = particlePositions.filter(p => {
        return !isNaN(p.x) && !isNaN(p.y) &&
            isFinite(p.x) && isFinite(p.y);
        // Removido p.x >= 0 && p.y >= 0 para permitir coordenadas negativas dos descendentes
    });

    if (validParticlePositions.length === 0) {

        const advanceWidth = calculateProportionalAdvanceWidth(char);

        return {
            unicode: char.charCodeAt(0),
            name: getGlyphName(char),
            advanceWidth: advanceWidth,
            contours: [createCircleContour(UNITS_PER_EM * 0.9, UNITS_PER_EM * 0.9, UNITS_PER_EM * 1.2)],
            metadata: {
                renderType: 'vector',
                pointCount: 0,
                isDirect: false,
                exportType: 'vector_particles_fallback',
                fallback: true,
                isNarrowLetter: isNarrowLetter(char)
            }
        };
    }
    const contours = [];
    const segmentGroups = new Map();
    validParticlePositions.forEach((p, originalIndex) => {
        if (!segmentGroups.has(p.segment)) {
            segmentGroups.set(p.segment, []);
        }
        segmentGroups.get(p.segment).push({ ...p, originalIndex });
    });
    segmentGroups.forEach((segmentPoints, segment) => {
        segmentPoints.forEach((p, idx) => {
            // --- INÍCIO DO BLOCO DE EXPORTAÇÃO POR SEGMENTO ---
            const originalPoint = validParticlePositions[p.originalIndex];
            const scaleFactor = 1.5;
            let dynamicSize;

            // SEGMENTO 0: FLOCKING
            if (segment === 0 && originalPoint) {
                // --- NOVO: Cálculo fiel ao canvas ---
                // Simular valores de áudio se não existirem
                let audioMultiplier = 1.0;
                let avgAudio = 0.5;
                if (audioState && audioState.spectrum && audioState.spectrum.length > 0) {
                    // Calcular volume médio
                    const spectrum = audioState.spectrum;
                    const volume = spectrum.reduce((a, b) => a + b, 0) / spectrum.length / 255;
                    audioMultiplier = audioState.peakData && audioState.peakData.visualMultiplier ? audioState.peakData.visualMultiplier : 1.0;
                    avgAudio = volume;
                }
                // Jitter igual ao canvas, usando posição original do ponto
                const jitterAmount = 2.0 * audioMultiplier;
                const baseX = originalPoint.pos && originalPoint.pos.x !== undefined ? originalPoint.pos.x : originalPoint.x;
                const baseY = originalPoint.pos && originalPoint.pos.y !== undefined ? originalPoint.pos.y : originalPoint.y;
                const posX = baseX + Math.sin((originalPoint.letterIndex || 0) * 0.5) * jitterAmount;
                const posY = baseY + Math.cos((originalPoint.letterIndex || 0) * 0.5) * jitterAmount;
                // Tamanho igual ao canvas
                const pointSize = (p.size || 3) * avgAudio;
                // Normalização explícita (igual aos outros pontos)
                const normX = (posX - minX) * positionScale;
                const normY = (maxY - posY) * positionScale + baselineOffset - descendenteOffset;
                // Verificar se as coordenadas são válidas antes de criar o contorno
                let circleContour = null;
                if (!isNaN(normX) && !isNaN(normY) && isFinite(normX) && isFinite(normY)) {
                    circleContour = createCircleContour(normX, normY, pointSize * positionScale * 1.5);
                    circleContour.segment = p.segment;
                    circleContour.audioReactions = {
                        avgAudio,
                        audioMultiplier,
                        pointSize
                    };
                    contours.push(circleContour);
                }
                // Glow opcional (como no export original)
                if (avgAudio * audioMultiplier * 50 > 5 && circleContour) {
                    const glowSize = pointSize + avgAudio * audioMultiplier * 10;
                    const glowContour = createCircleContour(normX, normY, glowSize * positionScale * 1.2);
                    glowContour.segment = p.segment;
                    glowContour.audioReactions = { ...circleContour.audioReactions, glow: avgAudio * audioMultiplier * 50 };
                    contours.push(glowContour);
                }
            }

            // SEGMENTO 1: BASS WAVES
            else if (segment === 1 && originalPoint) {
                const reactions = calculateSegmentReactions(1, audioState, audioState ? audioState.frameCount : 0, originalPoint);

                // Usar coordenadas originais como o segmento 0 (que funciona corretamente)
                const baseX = originalPoint.pos && originalPoint.pos.x !== undefined ? originalPoint.pos.x : originalPoint.x;
                const baseY = originalPoint.pos && originalPoint.pos.y !== undefined ? originalPoint.pos.y : originalPoint.y;
                
                // Normalização explícita igual ao segmento 0
                const adjustedX = (baseX - minX) * positionScale;
                const adjustedY = (maxY - baseY) * positionScale + baselineOffset - descendenteOffset;

                dynamicSize = (reactions.size * (reactions.scale || 1.0)) * positionScale * scaleFactor;
                
                // Verificar se as coordenadas são válidas antes de criar o contorno
                let circleContour = null;
                if (!isNaN(adjustedX) && !isNaN(adjustedY) && isFinite(adjustedX) && isFinite(adjustedY)) {
                    circleContour = createCircleContour(adjustedX, adjustedY, dynamicSize);
                    circleContour.segment = p.segment;
                    if (circleContour) {
                        circleContour.audioReactions = {
                            brightness: reactions.brightness,
                            opacity: reactions.opacity,
                            volume: reactions.volume,
                            bass: reactions.bass,
                            mid: reactions.mid,
                            treble: reactions.treble,
                            peakCount: reactions.peakMultiplier,
                            size: dynamicSize,
                            rotation: reactions.rotation
                        };
                        contours.push(circleContour);
                    }
                }
                // Glow para bass se intensidade suficiente
                if (reactions.glow > 5 && circleContour) {
                    const glowSize = dynamicSize + reactions.glow * 0.25;
                    const glowContour = createCircleContour(adjustedX, adjustedY, glowSize);
                    glowContour.segment = p.segment;
                    if (glowContour) {
                        glowContour.audioReactions = { ...circleContour.audioReactions, glow: reactions.glow };
                        contours.push(glowContour);
                    }
                }
            }

            // SEGMENTO 2: MID WAVES - RENDERIZAÇÃO FIEL AO CANVAS
            else if (segment === 2 && originalPoint) {
                const reactions = calculateSegmentReactions(2, audioState, audioState ? audioState.frameCount : 0, originalPoint);

                // SEGMENTO 2 usa originalPos diretamente (posição fixa, movimento de onda mexicana)
                // No canvas: this.pos.x = this.originalPos.x + horizontalOffset
                // Para export: usar apenas originalPos (posição base sem movimento)
                let baseX, baseY;

                if (originalPoint.originalPos && originalPoint.originalPos.x !== undefined && originalPoint.originalPos.y !== undefined) {
                    // Usar originalPos se disponível (posição fixa antes do movimento de onda)
                    baseX = originalPoint.originalPos.x;
                    baseY = originalPoint.originalPos.y;
                } else if (originalPoint.pos && originalPoint.pos.x !== undefined && originalPoint.pos.y !== undefined) {
                    // Fallback para pos
                    baseX = originalPoint.pos.x;
                    baseY = originalPoint.pos.y;
                } else {
                    // Último fallback
                    baseX = originalPoint.x || 0;
                    baseY = originalPoint.y || 0;
                }
                
                // Normalização explícita usando as coordenadas originais (posição base)
                const adjustedX = (baseX - minX) * positionScale;
                const adjustedY = (maxY - baseY) * positionScale + baselineOffset - descendenteOffset;

                // Tamanho dinâmico baseado no áudio
                dynamicSize = (reactions.size * (reactions.scale || 1.0)) * positionScale * scaleFactor;

                // Criar contorno principal
                let circleContour = null;
                if (!isNaN(adjustedX) && !isNaN(adjustedY) && isFinite(adjustedX) && isFinite(adjustedY)) {
                    circleContour = createCircleContour(adjustedX, adjustedY, dynamicSize);
                    circleContour.segment = p.segment;
                    if (circleContour) {
                        circleContour.audioReactions = {
                            brightness: reactions.brightness,
                            opacity: reactions.opacity,
                            volume: reactions.volume,
                            bass: reactions.bass,
                            mid: reactions.mid,
                            treble: reactions.treble,
                            peakCount: reactions.peakMultiplier,
                            size: dynamicSize,
                            staticPosition: true,
                            usesOriginalPos: true // Flag para indicar que usa originalPos
                        };
                        contours.push(circleContour);
                    }
                }

                // Efeito de glow mais intenso para mid waves
                if (reactions.glow > 3 && circleContour) {
                    const glowSize = dynamicSize + reactions.glow * 0.3;
                    const glowContour = createCircleContour(adjustedX, adjustedY, glowSize);
                    glowContour.segment = p.segment;
                    if (glowContour) {
                        glowContour.audioReactions = {
                            ...circleContour.audioReactions,
                            glow: reactions.glow,
                            isGlow: true
                        };
                        contours.push(glowContour);
                    }
                }

                // IMPORTANTE: Não adicionar movimento porque segmento 2 usa posição fixa no export
                // O movimento de onda mexicana é dinâmico durante a reprodução
            }

            // SEGMENTO 3: TREBLE LINES - RENDERIZAÇÃO FIEL AO CANVAS
            else if (segment === 3 && originalPoint) {
                const reactions = calculateSegmentReactions(3, audioState, audioState ? audioState.frameCount : 0, originalPoint);

                // Usar a lógica exata do canvas: coordenadas baseadas na posição original
                let originalPosX, originalPosY;

                if (originalPoint.originalPos && typeof originalPoint.originalPos.x === 'number' && typeof originalPoint.originalPos.y === 'number') {
                    originalPosX = originalPoint.originalPos.x;
                    originalPosY = originalPoint.originalPos.y;
                } else if (originalPoint.pos && typeof originalPoint.pos.x === 'number' && typeof originalPoint.pos.y === 'number') {
                    originalPosX = originalPoint.pos.x;
                    originalPosY = originalPoint.pos.y;
                } else {
                    // Fallback: usar posição atual se não houver coordenadas originais válidas
                    originalPosX = p.x;
                    originalPosY = p.y;
                }

                // IMPORTANTE: Comprimento aumentado para preencher melhor
                const lineLength = 35; // Comprimento aumentado para preencher mais a letra
                const seed = originalPoint.seed || originalPoint.letterIndex || 0;

                // IMPORTANTE: Usar o seed de forma mais variada para garantir rotações únicas
                // Combinar seed com posição do ponto para maior variação
                const positionHash = (p.x * 1000 + p.y * 100) % 1000;
                const uniqueSeed = seed + positionHash;

                // Calcular ângulo base usando uma fórmula mais variada
                const baseAngle = (uniqueSeed * Math.PI / 3.14159) % (Math.PI * 2);

                // Adicionar variação de rotação baseada no áudio
                const frameTime = audioState ? audioState.frameCount * 0.05 : 0;
                const rotationVariation = Math.sin(frameTime + uniqueSeed) * 0.1; // Variação menor
                const angle = baseAngle + rotationVariation;

                // Calcular pontos da linha rotacionada
                const dx = Math.cos(angle) * lineLength;
                const dy = Math.sin(angle) * lineLength;

                const x1 = originalPosX - dx;
                const y1 = originalPosY - dy;
                const x2 = originalPosX + dx;
                const y2 = originalPosY + dy;

                // Aplicar offset da posição atual (como no canvas)
                const offsetX = p.x - originalPosX;
                const offsetY = p.y - originalPosY;

                const finalX1 = x1 + offsetX;
                const finalY1 = y1 + offsetY;
                const finalX2 = x2 + offsetX;
                const finalY2 = y2 + offsetY;

                // Aplicar movimento dinâmico baseado no áudio (como no canvas)
                const freqValue = reactions.treble || 0.5;
                const amplitudeFactor = 3; // Valor padrão como no canvas
                const peakMultiplier = reactions.peakMultiplier || 1;

                // Movimento simples como no canvas - todas as linhas com o mesmo tamanho
                const movement = Math.sin(frameTime + uniqueSeed * 0.1) * freqValue * amplitudeFactor * 30 * peakMultiplier;
                const dynamicY1 = finalY1 + movement;
                const dynamicY2 = finalY2 + movement;

                // IMPORTANTE: Usar espessura fina para que pareçam linhas
                const thickness = 1.5; // Espessura fina para linhas

                // Verificar se as coordenadas são válidas
                if (!isNaN(dynamicY1) && !isNaN(dynamicY2) &&
                    isFinite(dynamicY1) && isFinite(dynamicY2) &&
                    !isNaN(finalX1) && !isNaN(finalX2) &&
                    isFinite(finalX1) && isFinite(finalX2)) {

                    // Criar linha principal
                    const lineContour = createLineContour([{ x: finalX1, y: dynamicY1 }, { x: finalX2, y: dynamicY2 }], thickness);
                    if (lineContour) {
                        lineContour.segment = p.segment;
                        lineContour.audioReactions = {
                            thickness,
                            freqValue,
                            amplitudeFactor,
                            peakMultiplier,
                            isTrebleLine: true,
                            dynamicMovement: true,
                            lineLength: lineLength, // Log do comprimento para debug
                            isFixedSize: true
                        };
                        contours.push(lineContour);
                    }

                    // Adicionar efeito de glow para linhas
                    // Usar espessuras proporcionais
                    const glowThickness1 = 5; // Glow interno
                    const glowLine1 = createLineContour([{ x: finalX1, y: dynamicY1 }, { x: finalX2, y: dynamicY2 }], glowThickness1);
                    if (glowLine1) {
                        glowLine1.segment = p.segment;
                        glowLine1.audioReactions = {
                            ...lineContour.audioReactions,
                            glow: 1,
                            isGlow: true,
                            glowLayer: 1
                        };
                        contours.push(glowLine1);
                    }

                    // Segundo glow
                    const glowThickness2 = 8; // Glow externo
                    const glowLine2 = createLineContour([{ x: finalX1, y: dynamicY1 }, { x: finalX2, y: dynamicY2 }], glowThickness2);
                    if (glowLine2) {
                        glowLine2.segment = p.segment;
                        glowLine2.audioReactions = {
                            ...lineContour.audioReactions,
                            glow: 2,
                            isGlow: true,
                            glowLayer: 2
                        };
                        contours.push(glowLine2);
                    }
                }
            }

            // SEGMENTO 4: ORGANIC
            else if (segment === 4 && originalPoint) {
                const reactions = calculateSegmentReactions(4, audioState, audioState ? audioState.frameCount : 0, originalPoint);

                // Usar coordenadas originais como o segmento 0 (que funciona corretamente)
                const baseX = originalPoint.pos && originalPoint.pos.x !== undefined ? originalPoint.pos.x : originalPoint.x;
                const baseY = originalPoint.pos && originalPoint.pos.y !== undefined ? originalPoint.pos.y : originalPoint.y;
                
                // Normalização explícita igual ao segmento 0
                const adjustedX = (baseX - minX) * positionScale;
                const adjustedY = (maxY - baseY) * positionScale + baselineOffset - descendenteOffset;

                dynamicSize = (reactions.size * (reactions.scale || 1.0)) * positionScale * scaleFactor;
                
                let circleContour = null;
                circleContour = createCircleContour(adjustedX, adjustedY, dynamicSize);
                circleContour.segment = p.segment;
                if (circleContour) {
                    circleContour.audioReactions = {
                        brightness: reactions.brightness,
                        opacity: reactions.opacity,
                        volume: reactions.volume,
                        bass: reactions.bass,
                        mid: reactions.mid,
                        treble: reactions.treble,
                        peakCount: reactions.peakMultiplier,
                        size: dynamicSize
                    };
                    contours.push(circleContour);
                }
                // Glow para organic se intensidade suficiente
                if (reactions.glow > 5 && circleContour) {
                    const glowSize = dynamicSize + reactions.glow * 0.18;
                    const glowContour = createCircleContour(adjustedX, adjustedY, glowSize);
                    glowContour.segment = p.segment;
                    if (glowContour) {
                        glowContour.audioReactions = { ...circleContour.audioReactions, glow: reactions.glow };
                        contours.push(glowContour);
                    }
                }
            }
        });
    });

    // Verificar se temos contornos válidos
    const validContours = contours.filter(contour => {
        if (contour.type === 'circle') {
            return !isNaN(contour.centerX) && !isNaN(contour.centerY) &&
                isFinite(contour.centerX) && isFinite(contour.centerY) &&
                contour.radius > 0;
        } else if (contour.type === 'path' && contour.points) {
            return contour.points.length >= 2 &&
                contour.points.every(point =>
                    !isNaN(point.x) && !isNaN(point.y) &&
                    isFinite(point.x) && isFinite(point.y)
                );
        }
        return false;
    });

    // Fallback robusto: se não houver contornos válidos, criar círculo grande centralizado
    if (validContours.length === 0) {

        const advanceWidth = calculateProportionalAdvanceWidth(char);

        // Tentar usar o centro dos pontos válidos, senão usar centro padrão
        let cx = advanceWidth / 2, cy = UNITS_PER_EM / 2;
        if (validParticlePositions.length > 0) {
            const sum = validParticlePositions.reduce((acc, p) => {
                acc.x += p.x;
                acc.y += p.y;
                return acc;
            }, { x: 0, y: 0 });
            cx = sum.x / validParticlePositions.length;
            cy = sum.y / validParticlePositions.length;
        }

        return {
            unicode: char.charCodeAt(0),
            name: getGlyphName(char),
            advanceWidth: advanceWidth,
            contours: [createCircleContour(cx, cy, UNITS_PER_EM * 0.4)],
            metadata: {
                renderType: 'vector',
                pointCount: validParticlePositions.length,
                segmentCount: segmentGroups.size,
                segments: Array.from(segmentGroups.keys()),
                isDirect: false,
                exportType: 'vector_particles_fallback',
                fallback: true,
                isNarrowLetter: isNarrowLetter(char)
            }
        };
    }

    // Calcular advanceWidth normalizado com espaçamento proporcional
    const glyphWidth = (maxX - minX) * positionScale;
    const advanceWidth = calculateProportionalAdvanceWidth(char, glyphWidth);

    // Centralizar o glifo horizontalmente dentro do seu espaço de avanço
    const glyphWidthAfterScale = (maxX - minX) * positionScale;
    const centeringOffset = (advanceWidth - glyphWidthAfterScale) / 2;

    // Aplicar offset de centralização a todos os contornos
    const centeredContours = validContours.map(contour => {
        if (contour.type === 'circle') {
            return {
                ...contour,
                centerX: contour.centerX + centeringOffset
            };
        } else if (contour.type === 'path' && contour.points) {
            return {
                ...contour,
                points: contour.points.map(point => ({
                    ...point,
                    x: point.x + centeringOffset
                }))
            };
        }
        return contour;
    });

    return {
        unicode: char.charCodeAt(0),
        name: getGlyphName(char),
        advanceWidth: advanceWidth,
        contours: centeredContours,
        metadata: {
            renderType: 'vector',
            pointCount: validParticlePositions.length,
            segmentCount: segmentGroups.size,
            segments: Array.from(segmentGroups.keys()),
            isDirect: true,
            exportType: 'vector_particles',
            centeringOffset: centeringOffset
        }
    };
}

function createGridGlyphFromPoints(char, charPoints, audioState = null) {
    
    // CAPTURAR DIRETAMENTE DO CANVAS EM TEMPO REAL
    let points = [];
    let gridBoxes = [];
    
    // PRIORIDADE 1: Capturar DIRETAMENTE do window.letterPoints NO MOMENTO DA EXPORTAÇÃO
    if (typeof window !== 'undefined' && window.letterPoints && window.letterPoints.length > 0) {
        // Filtrar pontos da grelha para este caractere
        const canvasGridPoints = window.letterPoints.filter(p => 
            p.character === char && 
            (p.renderType === 'grid' || p.renderType === undefined)
        );
        
        
        if (canvasGridPoints.length > 0) {
            points = canvasGridPoints;
            
            // Debug dos segmentos encontrados no canvas
            const canvasSegments = {};
            points.forEach(p => {
                const seg = p.segment !== undefined ? p.segment : 'undefined';
                canvasSegments[seg] = (canvasSegments[seg] || 0) + 1;
            });
            
            // Mostrar alguns pontos de exemplo
                points.slice(0, 5).map(p => ({
                    x: p.x, 
                    y: p.y, 
                    segment: p.segment, 
                    renderType: p.renderType
                }))
        }
    }
    
    // PRIORIDADE 2: Capturar letterBoxes se disponível
    if (typeof window !== 'undefined' && window.letterBoxes && window.letterBoxes.length > 0) {
        const canvasGridBoxes = window.letterBoxes.filter(box => box.character === char);
        if (canvasGridBoxes.length > 0) {
            gridBoxes = canvasGridBoxes;
        }
    }
    
    // PRIORIDADE 3: Se ainda não há dados, usar parâmetros recebidos
    if (points.length === 0 && charPoints) {
        if (Array.isArray(charPoints)) {
            points = charPoints;
        } else if (charPoints.points) {
            points = charPoints.points;
            gridBoxes = charPoints.gridBoxes || gridBoxes;
        }
    }
    
    
    // Garantir estrutura (fallback original)
    if (points.length === 0) {
        points = charPoints.points || [];
    }
    if (gridBoxes.length === 0) {
        gridBoxes = charPoints.gridBoxes || [];
    }


    // Fallback: se não houver gridBoxes mas houver pontos, criar um gridBox para cada ponto
    if ((!gridBoxes || gridBoxes.length === 0) && points.length > 0) {
        gridBoxes = points.map(p => {
            const px = p.pos ? p.pos.x : p.x;
            const py = p.pos ? p.pos.y : p.y;
            return {
                x: px - 25,
                y: py - 25,
                width: 50,
                height: 50,
                character: char
            };
        });
    }


    // INTERCEPTAR AQUI E USAR NOVA LÓGICA
    
    try {
        const newContours = createGridContoursFromPoints(points, gridBoxes, audioState);
        
        if (newContours && newContours.length > 0) {
            const xs = points.map(p => p.pos?.x ?? p.x ?? 0);
            const letterWidth = Math.max(...xs) - Math.min(...xs) || 1;
            const advanceWidth = letterWidth * (UNITS_PER_EM / letterWidth);
            
            const result = { 
                contours: newContours,
                unicode: char.charCodeAt(0),
                name: getGlyphName(char),
                advanceWidth: Math.max(advanceWidth, UNITS_PER_EM * 0.3),
                metadata: { 
                    renderType: 'grid', 
                    pointCount: points.length, 
                    contourCount: newContours.length,
                    dataSource: 'intercepted_new_logic'
                }
            };
            
            return result;
        }
    } catch (error) {
    }
    

    // Fallback: se não houver pontos nem gridBoxes, exportar um quadrado central grande - IDÊNTICO AO CANVAS
    if ((points.length === 0) && (gridBoxes.length === 0)) {
        const advanceWidth = calculateProportionalAdvanceWidth(char);
        const size = UNITS_PER_EM * 0.4;
        const centeringOffset = (advanceWidth - size) / 2;
        const half = size / 2;
        const centerX = centeringOffset + half;
        const centerY = UNITS_PER_EM / 2;

        return {
            unicode: char.charCodeAt(0),
            name: getGlyphName(char),
            advanceWidth: advanceWidth,
            contours: [
                // Linha superior
                {
                    type: 'path',
                    points: [
                        { x: centerX - half, y: centerY - half, type: 'move' },
                        { x: centerX + half, y: centerY - half, type: 'line' }
                    ]
                },
                // Linha direita
                {
                    type: 'path',
                    points: [
                        { x: centerX + half, y: centerY - half, type: 'move' },
                        { x: centerX + half, y: centerY + half, type: 'line' }
                    ]
                },
                // Linha inferior
                {
                    type: 'path',
                    points: [
                        { x: centerX + half, y: centerY + half, type: 'move' },
                        { x: centerX - half, y: centerY + half, type: 'line' }
                    ]
                },
                // Linha esquerda
                {
                    type: 'path',
                    points: [
                        { x: centerX - half, y: centerY + half, type: 'move' },
                        { x: centerX - half, y: centerY - half, type: 'line' }
                    ]
                }
            ],
            metadata: {
                renderType: 'grid',
                fallback: true,
                isNarrowLetter: isNarrowLetter(char)
            }
        };
    }

    // Remover duplicados por posição
    const seen = new Set();
    const uniquePoints = [];
    points.forEach(point => {
        const px = point.pos ? point.pos.x : point.x;
        const py = point.pos ? point.pos.y : point.y;
        const key = `${Math.round(px)}_${Math.round(py)}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniquePoints.push(point);
        }
    });

    // Bounding box dos pontos grid
    const allX = uniquePoints.map(p => (p.pos ? p.pos.x : p.x));
    const allY = uniquePoints.map(p => (p.pos ? p.pos.y : p.y));
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);
    const width = maxX - minX || 1;
    const height = maxY - minY || 1;
    const positionScale = UNITS_PER_EM / Math.max(width, height);
    const baselineOffset = -minY * positionScale;

    const contours = [];

    // Exportar quadrados que formam a letra - IDÊNTICO AO CANVAS (linhas simples, sem preenchimento)
    gridBoxes.forEach((box) => {
        const size = box.width * positionScale;
        const cx = (box.x + box.width / 2 - minX) * positionScale;
        const cy = (maxY - (box.y + box.height / 2)) * positionScale + baselineOffset;
        const half = size / 2;
        const lineThickness = 1; // Linha mais fina para não cobrir as partículas

        // Linha superior
        contours.push({
            type: 'path',
            points: [
                { x: cx - half, y: cy - half, type: 'move' },
                { x: cx + half, y: cy - half, type: 'line' }
            ],
            lineWidth: lineThickness
        });

        // Linha direita
        contours.push({
            type: 'path',
            points: [
                { x: cx + half, y: cy - half, type: 'move' },
                { x: cx + half, y: cy + half, type: 'line' }
            ],
            lineWidth: lineThickness
        });

        // Linha inferior
        contours.push({
            type: 'path',
            points: [
                { x: cx + half, y: cy + half, type: 'move' },
                { x: cx - half, y: cy + half, type: 'line' }
            ],
            lineWidth: lineThickness
        });

        // Linha esquerda
        contours.push({
            type: 'path',
            points: [
                { x: cx - half, y: cy + half, type: 'move' },
                { x: cx - half, y: cy - half, type: 'line' }
            ],
            lineWidth: lineThickness
        });
    });

    // ADICIONAR REAÇÕES DE SEGMENTO À FONTE GRELHA
    if (audioState && points.length > 0) {
        // Agrupar pontos por segmento
        const segmentGroups = new Map();
        points.forEach(point => {
            const segment = point.segment !== undefined ? point.segment : 0;
            if (!segmentGroups.has(segment)) {
                segmentGroups.set(segment, []);
            }
            segmentGroups.get(segment).push(point);
        });

        // Para cada gridBox, adicionar os segmentos correspondentes
        gridBoxes.forEach((box, boxIndex) => {
            // Calcular posição central do gridBox
            const boxCenterX = (box.x + box.width / 2 - minX) * positionScale;
            const boxCenterY = (maxY - (box.y + box.height / 2)) * positionScale + baselineOffset;
            
            // Encontrar pontos que correspondem a este gridBox
            const correspondingPoints = uniquePoints.filter(point => {
                const px = point.pos ? point.pos.x : point.x;
                const py = point.pos ? point.pos.y : point.y;
                
                // Verificar se o ponto está dentro deste gridBox (com tolerância)
                return px >= (box.x - 10) && px <= (box.x + box.width + 10) &&
                       py >= (box.y - 10) && py <= (box.y + box.height + 10);
            });

            // Se não há pontos correspondentes, pular este gridBox
            if (correspondingPoints.length === 0) return;

            // Agrupar por segmento os pontos deste gridBox
            const boxSegmentGroups = new Map();
            correspondingPoints.forEach(point => {
                const segment = point.segment !== undefined ? point.segment : 0;
                if (!boxSegmentGroups.has(segment)) {
                    boxSegmentGroups.set(segment, []);
                }
                boxSegmentGroups.get(segment).push(point);
            });

            // Criar contornos reativos para cada segmento neste gridBox
            for (const [segment, segmentPoints] of boxSegmentGroups) {
                if (segmentPoints.length === 0) continue;

                const originalPoint = segmentPoints[0]; // Usar primeiro ponto como referência

                // SEGMENTO 0: FLOCKING (posicionado no centro do gridBox)
                if (segment === 0 && originalPoint) {
                    // Usar valores de áudio amplificados como no canvas
                    const amplifiedMic = audioState.amplifiedMic || (audioState.mic * (audioState.peakData?.visualMultiplier || 1));
                    const currentFrameCount = audioState.frameCount || Date.now() * 0.01;
                    
                    // Canvas logic: jitter com sin/cos baseado no frameCount * 0.1
                    const jitterAmount = 3 * amplifiedMic; // Ajustado para grelha
                    const frameCountSlow = currentFrameCount * 0.1;
                    
                    // Aplicar jitter exatamente como no canvas
                    const jitterX = Math.sin(frameCountSlow + (originalPoint.letterIndex || boxIndex) * 0.5) * jitterAmount;
                    const jitterY = Math.cos(frameCountSlow + (originalPoint.letterIndex || boxIndex) * 0.5) * jitterAmount;
                    
                    // Posição final: centro do gridBox + jitter
                    const jitteredX = boxCenterX + jitterX;
                    const jitteredY = boxCenterY + jitterY;
                    
                    // Tamanho baseado no áudio médio
                    const avgAudio = (audioState.amplifiedBass + audioState.amplifiedMid + audioState.amplifiedTreble) / 3;
                    const pointSize = Math.max(3, Math.min(8, 3 + avgAudio * 3)); // Ajustado para grelha
                    
                    if (!isNaN(jitteredX) && !isNaN(jitteredY) && isFinite(jitteredX) && isFinite(jitteredY)) {
                        const circleContour = createCircleContour(jitteredX, jitteredY, pointSize);
                        circleContour.segment = segment;
                        circleContour.audioReactions = { avgAudio, amplifiedMic, pointSize };
                        contours.push(circleContour);
                        
                        // Glow se intensidade suficiente
                        if (avgAudio * (audioState.peakData?.visualMultiplier || 1) * 20 > 5) {
                            const glowSize = pointSize + avgAudio * 3;
                            const glowContour = createCircleContour(jitteredX, jitteredY, glowSize);
                            glowContour.segment = segment;
                            glowContour.audioReactions = { isGlow: true };
                            contours.push(glowContour);
                        }
                    }
                }

                // SEGMENTO 1: BASS WAVES (posicionado no centro do gridBox)
                else if (segment === 1 && originalPoint) {
                    let audioMultiplier = 1.0;
                    let bassValue = 0.5;
                    if (audioState && audioState.spectrum && audioState.spectrum.length > 0) {
                        const spectrum = audioState.spectrum;
                        const bass = spectrum.slice(0, Math.floor(spectrum.length * 0.1)).reduce((a, b) => a + b, 0) / (spectrum.length * 0.1) / 255;
                        audioMultiplier = audioState.peakData?.visualMultiplier || 1;
                        bassValue = bass * audioMultiplier;
                    }

                    // Canvas logic: pulsação baseada em sin
                    const pulseFreq = 0.03 + bassValue * 0.2;
                    const currentFrameCount = audioState.frameCount || Date.now() * 0.01;
                    const pulsationBase = Math.sin(currentFrameCount * pulseFreq + (originalPoint.letterIndex || boxIndex) * 0.3);

                    // Tamanho com pulsação como no canvas
                    const bassSize = Math.max(3, Math.min(10, 4 + bassValue * 4 + pulsationBase * 2)); // Ajustado para grelha

                    // Movimento circular no centro do gridBox
                    const rotationAmount = 5 * bassValue; // Ajustado para grelha
                    const angleOffset = (originalPoint.letterIndex || boxIndex) * 0.1;
                    const bassX = boxCenterX + Math.cos(angleOffset) * rotationAmount;
                    const bassY = boxCenterY + Math.sin(angleOffset) * rotationAmount;

                    if (!isNaN(bassX) && !isNaN(bassY) && isFinite(bassX) && isFinite(bassY)) {
                        const bassContour = createCircleContour(bassX, bassY, bassSize);
                        bassContour.segment = segment;
                        bassContour.audioReactions = { bassValue, pulsationBase, bassSize };
                        contours.push(bassContour);

                        // Bass glow
                        if (bassValue * audioMultiplier * 15 > 5) {
                            const bassGlowSize = bassSize + bassValue * 3;
                            const bassGlowContour = createCircleContour(bassX, bassY, bassGlowSize);
                            bassGlowContour.segment = segment;
                            bassGlowContour.audioReactions = { isGlow: true };
                            contours.push(bassGlowContour);
                        }
                    }
                }

                // SEGMENTO 2: MID WAVES (posicionado no centro do gridBox)
                else if (segment === 2 && originalPoint) {
                    let audioMultiplier = 1.0;
                    let midValue = 0.5;
                    if (audioState && audioState.spectrum && audioState.spectrum.length > 0) {
                        const spectrum = audioState.spectrum;
                        const mid = spectrum.slice(Math.floor(spectrum.length * 0.1), Math.floor(spectrum.length * 0.7)).reduce((a, b) => a + b, 0) / (spectrum.length * 0.6) / 255;
                        audioMultiplier = audioState.peakData?.visualMultiplier || 1;
                        midValue = mid * audioMultiplier;
                    }

                    // Tamanho baseado no áudio, mas SEM movimento
                    const midSize = Math.max(3, Math.min(12, 4 + midValue * 4)); // Removido waveBase

                    // Posição fixa no centro do gridBox - SEM movimento ondulatório
                    const midX = boxCenterX;
                    const midY = boxCenterY; // Removido movimento vertical

                    if (!isNaN(midX) && !isNaN(midY) && isFinite(midX) && isFinite(midY)) {
                        const midContour = createCircleContour(midX, midY, midSize);
                        midContour.segment = segment;
                        midContour.audioReactions = { midValue, midSize, staticPosition: true };
                        contours.push(midContour);

                        // Mid glow
                        if (midValue * audioMultiplier * 12 > 5) {
                            const midGlowSize = midSize + midValue * 3;
                            const midGlowContour = createCircleContour(midX, midY, midGlowSize);
                            midGlowContour.segment = segment;
                            midGlowContour.audioReactions = { isGlow: true, staticPosition: true };
                            contours.push(midGlowContour);
                        }
                    }
                }

                // SEGMENTO 3: TREBLE LINES (posicionado no centro do gridBox)
                else if (segment === 3 && originalPoint) {
                    let audioMultiplier = 1.0;
                    let trebleValue = 0.5;
                    if (audioState && audioState.spectrum && audioState.spectrum.length > 0) {
                        const spectrum = audioState.spectrum;
                        const treble = spectrum.slice(Math.floor(spectrum.length * 0.7)).reduce((a, b) => a + b, 0) / (spectrum.length * 0.3) / 255;
                        audioMultiplier = audioState.peakData?.visualMultiplier || 1;
                        trebleValue = treble * audioMultiplier;
                    }

                    // Canvas logic: linhas rotacionadas
                    const currentFrameCount = audioState.frameCount || Date.now() * 0.01;
                    const seed = originalPoint.seed || originalPoint.letterIndex || boxIndex;
                    const positionHash = (boxCenterX * 1000 + boxCenterY * 100) % 1000;
                    const uniqueSeed = seed + positionHash;
                    
                    // Ângulo baseado no seed único
                    const baseAngle = (uniqueSeed * Math.PI / 3.14159) % (Math.PI * 2);
                    const frameTime = currentFrameCount * 0.05;
                    const rotationVariation = Math.sin(frameTime + uniqueSeed) * 0.1;
                    const angle = baseAngle + rotationVariation;
                    
                    // Comprimento e movimento ajustados para grelha
                    const lineLength = Math.max(8, Math.min(trebleValue * 12 + 6, 20));
                    const movement = Math.sin(frameTime + uniqueSeed * 0.1) * trebleValue * 3 * audioMultiplier;
                    
                    // Calcular pontos da linha centrados no gridBox
                    const dx = Math.cos(angle) * lineLength;
                    const dy = Math.sin(angle) * lineLength;
                    
                    const x1 = boxCenterX - dx;
                    const y1 = boxCenterY - dy + movement;
                    const x2 = boxCenterX + dx;
                    const y2 = boxCenterY + dy + movement;
                    
                    // Espessura baseada no treble
                    const lineThickness = Math.max(2, Math.min(trebleValue * 6 + 2, 8));

                    if (!isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2) && 
                        isFinite(x1) && isFinite(y1) && isFinite(x2) && isFinite(y2)) {
                        const lineContour = createLineContour([{ x: x1, y: y1 }, { x: x2, y: y2 }], lineThickness);
                        if (lineContour) {
                            lineContour.segment = segment;
                            lineContour.audioReactions = { trebleValue, lineLength, lineThickness };
                            contours.push(lineContour);

                            // Treble glow
                            if (trebleValue * audioMultiplier * 8 > 3) {
                                const glowLineContour = createLineContour([{ x: x1, y: y1 }, { x: x2, y: y2 }], lineThickness + 2);
                                if (glowLineContour) {
                                    glowLineContour.segment = segment;
                                    glowLineContour.audioReactions = { isGlow: true };
                                    contours.push(glowLineContour);
                                }
                            }
                        }
                    }
                }

                // SEGMENTO 4: ORGANIC (posicionado no centro do gridBox)
                else if (segment === 4 && originalPoint) {
                    let audioMultiplier = 1.0;
                    let combinedAudio = 0.5;
                    if (audioState && audioState.spectrum && audioState.spectrum.length > 0) {
                        const spectrum = audioState.spectrum;
                        const mid = spectrum.slice(Math.floor(spectrum.length * 0.1), Math.floor(spectrum.length * 0.7)).reduce((a, b) => a + b, 0) / (spectrum.length * 0.6) / 255;
                        const treble = spectrum.slice(Math.floor(spectrum.length * 0.7)).reduce((a, b) => a + b, 0) / (spectrum.length * 0.3) / 255;
                        audioMultiplier = audioState.peakData?.visualMultiplier || 1;
                        combinedAudio = (mid + treble) * 0.5 * audioMultiplier;
                    }

                    // Canvas logic: movimento orgânico centrado no gridBox
                    const currentFrameCount = audioState.frameCount || Date.now() * 0.01;
                    const orgTime = (originalPoint.letterIndex || boxIndex) * 0.05;
                    const orgX = boxCenterX + Math.sin(orgTime * 2 + currentFrameCount * 0.02) * combinedAudio * 6; // Ajustado para grelha
                    const orgY = boxCenterY + Math.cos(orgTime * 1.5 + currentFrameCount * 0.02) * combinedAudio * 6; // Ajustado para grelha

                    // Tamanho baseado no áudio combinado
                    const organicSize = Math.max(4, Math.min(14, 5 + combinedAudio * 6)); // Ajustado para grelha

                    if (!isNaN(orgX) && !isNaN(orgY) && isFinite(orgX) && isFinite(orgY)) {
                        const organicContour = createCircleContour(orgX, orgY, organicSize);
                        organicContour.segment = segment;
                        organicContour.audioReactions = { combinedAudio, organicSize };
                        contours.push(organicContour);

                        // Organic glow
                        if (combinedAudio * audioMultiplier * 10 > 5) {
                            const organicGlowSize = organicSize + combinedAudio * 3;
                            const organicGlowContour = createCircleContour(orgX, orgY, organicGlowSize);
                            organicGlowContour.segment = segment;
                            organicGlowContour.audioReactions = { isGlow: true };
                            contours.push(organicGlowContour);
                        }
                    }
                }

                // SEGMENTOS DESCONHECIDOS: círculo simples no centro do gridBox
                else {
                    const defaultSize = Math.max(4, (originalPoint.size || 6)); // Ajustado para grelha
                    const defaultContour = createCircleContour(boxCenterX, boxCenterY, defaultSize);
                    defaultContour.segment = segment;
                    defaultContour.audioReactions = { size: defaultSize };
                    contours.push(defaultContour);
                }
            }
        });
    }

    // Fallback final: se não houver contornos, exportar um quadrado central - IDÊNTICO AO CANVAS
    if (contours.length === 0) {
        const size = UNITS_PER_EM * 0.4;
        const half = size / 2;
        const centerX = UNITS_PER_EM / 2;
        const centerY = UNITS_PER_EM / 2;

        // Linha superior
        contours.push({
            type: 'path',
            points: [
                { x: centerX - half, y: centerY - half, type: 'move' },
                { x: centerX + half, y: centerY - half, type: 'line' }
            ]
        });

        // Linha direita
        contours.push({
            type: 'path',
            points: [
                { x: centerX + half, y: centerY - half, type: 'move' },
                { x: centerX + half, y: centerY + half, type: 'line' }
            ]
        });

        // Linha inferior
        contours.push({
            type: 'path',
            points: [
                { x: centerX + half, y: centerY + half, type: 'move' },
                { x: centerX - half, y: centerY + half, type: 'line' }
            ]
        });

        // Linha esquerda
        contours.push({
            type: 'path',
            points: [
                { x: centerX - half, y: centerY + half, type: 'move' },
                { x: centerX - half, y: centerY - half, type: 'line' }
            ]
        });
    }

    // Calcular advanceWidth proporcional para grid também
    const glyphWidth = width * positionScale;
    const advanceWidth = calculateProportionalAdvanceWidth(char, glyphWidth);

    // Centralizar o glifo horizontalmente
    const centeringOffset = (advanceWidth - glyphWidth) / 2;

    // Aplicar offset de centralização a todos os contornos
    const centeredContours = contours.map(contour => {
        if (contour.type === 'path' && contour.points) {
            return {
                ...contour,
                points: contour.points.map(point => ({
                    ...point,
                    x: point.x + centeringOffset
                }))
            };
        }
        return contour;
    });

    const finalGlyph = {
        unicode: char.charCodeAt(0),
        name: getGlyphName(char),
        advanceWidth: advanceWidth,
        contours: centeredContours,
        metadata: {
            renderType: 'grid',
            pointCount: uniquePoints.length,
            gridBoxCount: gridBoxes.length,
            isDirect: true,
            exportType: 'grid_squares_with_segment_reactions',
            centeringOffset: centeringOffset,
            isNarrowLetter: isNarrowLetter(char),
            hasSegmentReactions: audioState !== null,
            segmentCount: audioState ? new Set(points.map(p => p.segment || 0)).size : 0
        }
    };


    // Verificar se o glyph é válido
    if (!finalGlyph.contours || finalGlyph.contours.length === 0) {
    }

    return finalGlyph;
}


// Função auxiliar para criar contorno de partícula baseado no segmento - FORMAS DIFERENTES
function createParticleContour(x, y, segment, size, audioState = null) {
    const contours = [];

    // Replicar exatamente o comportamento do canvas com reações de áudio
    let finalSize = size;
    let opacity = 0.7; // Opacidade base

    // Aplicar reações de áudio como no canvas
    if (audioState) {
        // Extrair valores de áudio do estado capturado
        const currentSpectrum = audioState.spectrum || [];
        const currentPeakData = audioState.peakData || { peakCount: 0, visualMultiplier: 1 };

        // Calcular valores de áudio como no canvas
        const volume = currentSpectrum.length > 0 ? currentSpectrum.reduce((a, b) => a + b, 0) / currentSpectrum.length / 255 : 0.5;
        const bass = currentSpectrum.length > 0 ? currentSpectrum.slice(0, Math.floor(currentSpectrum.length * 0.1)).reduce((a, b) => a + b, 0) / (currentSpectrum.length * 0.1) / 255 : 0.5;
        const mid = currentSpectrum.length > 0 ? currentSpectrum.slice(Math.floor(currentSpectrum.length * 0.1), Math.floor(currentSpectrum.length * 0.7)).reduce((a, b) => a + b, 0) / (currentSpectrum.length * 0.6) / 255 : 0.5;
        const treble = currentSpectrum.length > 0 ? currentSpectrum.slice(Math.floor(currentSpectrum.length * 0.7)).reduce((a, b) => a + b, 0) / (currentSpectrum.length * 0.3) / 255 : 0.5;
        const peakMultiplier = Math.max(1, currentPeakData.visualMultiplier || 1);

        switch (segment) {
            case 0: // Flocking - resposta ao mic e treble (COMO NO CANVAS)
                const avgAudio = (bass + mid + treble) / 3;
                finalSize = size * (0.8 + avgAudio * 0.4);  // Tamanho base como no canvas
                opacity = 0.6 + avgAudio * 0.3;              // Opacidade como no canvas
                break;

            case 1: // Bass - pulsação (COMO NO CANVAS)
                finalSize = size * (1.2 + bass * peakMultiplier * 0.8); // Tamanho maior para bass
                opacity = 0.7 + bass * peakMultiplier * 0.3; // Opacidade com bass
                break;

            case 2: // Wave - resposta ao mid (COMO NO CANVAS)
                finalSize = size * (1.0 + mid * 0.6); // Tamanho médio para mid
                opacity = 0.5 + mid * 0.4; // Opacidade com mid
                break;

            case 3: // Treble - linhas dinâmicas (COMO NO CANVAS)
                finalSize = size * (0.6 + treble * 0.8); // Espessura variável para treble
                opacity = 0.8 + treble * 0.2; // Alta opacidade para linhas
                break;

            case 4: // Organic - resposta combinada (COMO NO CANVAS)
                const combinedAudio = (bass + mid + treble) / 3;
                finalSize = size * (1.4 + combinedAudio * 0.6); // Tamanho maior para organic
                opacity = 0.6 + combinedAudio * 0.3; // Opacidade combinada
                break;
        }
    }

    let contourCount = Math.max(1, Math.floor(opacity * 3));

    // Reduzir contorno para segmento 0 (baseado no canvas)
    if (segment === 0) {
        contourCount = 1; // Apenas um contorno para segmento 0
        finalSize = finalSize * 1.0; // Manter tamanho calculado pelo canvas
    }

    switch (segment) {
        case 0: // Flocking - círculo normal
        case 1: // Bass - círculo maior (pulsação)
        case 2: // Wave - círculo menor (movimento ondulante)
        case 4: // Organic - círculo maior (movimento orgânico)
            // Usar círculo como no canvas (ellipse)
            for (let i = 0; i < contourCount; i++) {
                const layerSize = finalSize * (1 - i * 0.1); // Camadas menores para simular opacidade
                contours.push({
                    type: 'circle',
                    centerX: x,
                    centerY: y,
                    radius: layerSize
                });
            }
            break;

        case 3: // Treble - linha dinâmica (como no canvas)
            // Usar linha como no canvas (line)
            const lineLength = finalSize * 2;
            for (let i = 0; i < contourCount; i++) {
                const layerThickness = finalSize * (0.8 - i * 0.2);
                contours.push({
                    type: 'path',
                    points: [
                        { x: x - lineLength, y: y, type: 'move' },
                        { x: x + lineLength, y: y, type: 'line' }
                    ],
                    lineWidth: layerThickness
                });
            }
            break;

        default:
            // Fallback - círculo simples
            contours.push({
                type: 'circle',
                centerX: x,
                centerY: y,
                radius: finalSize
            });
    }

    return contours;
}

// Nova função para copiar propriedades de segmento e comportamento de uma letra para outra
function copySegmentProperties(sourcePoints, targetChar, targetCharIndex = 0) {
    if (!sourcePoints || sourcePoints.length === 0) {
        return [];
    }

    // Gerar pontos base para a letra alvo (mantendo sua geometria original)
    const targetBasePoints = generateReferencePoints(targetChar, 'vector');

    if (targetBasePoints.length === 0) {
        return [];
    }

    // Tratamento especial para descendentes na cópia de propriedades
    const descendentes = 'gjpqy';
    const isTargetDescender = descendentes.includes(targetChar);


    // Analisar distribuição de segmentos na fonte
    const sourceSegmentDistribution = {};
    sourcePoints.forEach(point => {
        const segment = point.segment || 0;
        sourceSegmentDistribution[segment] = (sourceSegmentDistribution[segment] || 0) + 1;
    });

    // Criar mapa de posições para segmentos da fonte
    const sourceBounds = getBounds(sourcePoints);
    const sourceWidth = sourceBounds.maxX - sourceBounds.minX;
    const sourceHeight = sourceBounds.maxY - sourceBounds.minY;

    // Agrupar pontos da fonte por segmento e calcular posição média de cada segmento
    const segmentPositions = {};
    sourcePoints.forEach(point => {
        const segment = point.segment || 0;
        if (!segmentPositions[segment]) {
            segmentPositions[segment] = { points: [], avgX: 0, avgY: 0 };
        }

        const x = point.pos?.x ?? point.x ?? 0;
        const y = point.pos?.y ?? point.y ?? 0;
        segmentPositions[segment].points.push({ x, y });
    });

    // Calcular posição média normalizada de cada segmento na fonte
    Object.keys(segmentPositions).forEach(segment => {
        const segData = segmentPositions[segment];
        if (segData.points.length > 0 && sourceWidth > 0 && sourceHeight > 0) {
            const sumX = segData.points.reduce((sum, p) => sum + p.x, 0);
            const sumY = segData.points.reduce((sum, p) => sum + p.y, 0);
            segData.avgX = (sumX / segData.points.length - sourceBounds.minX) / sourceWidth;
            segData.avgY = (sumY / segData.points.length - sourceBounds.minY) / sourceHeight;
        } else {
            // Fallback para segmentos sem pontos ou bounds inválidos
            segData.avgX = 0.5;
            segData.avgY = 0.5;
        }
    });

    // Copiar propriedades de segmento para os pontos da letra alvo
    const resultPoints = targetBasePoints.map((targetPoint, index) => {
        // Manter a geometria original do ponto alvo
        const resultPoint = {
            ...targetPoint, // Manter geometria original
            character: targetChar, // Atualizar caractere
            letterIndex: targetCharIndex, // Atualizar índice
            // Manter posições originais da letra alvo
            pos: targetPoint.pos,
            x: targetPoint.x,
            y: targetPoint.y,
            originalPos: targetPoint.originalPos || targetPoint.pos
        };

        // Determinar qual segmento aplicar baseado na posição relativa
        const targetBounds = getBounds(targetBasePoints);
        const targetWidth = targetBounds.maxX - targetBounds.minX;
        const targetHeight = targetBounds.maxY - targetBounds.minY;

        if (targetWidth > 0 && targetHeight > 0) {
            // Normalizar posição do ponto alvo (0-1)
            const targetX = targetPoint.pos?.x ?? targetPoint.x ?? 0;
            const targetY = targetPoint.pos?.y ?? targetPoint.y ?? 0;
            const normalizedTargetX = (targetX - targetBounds.minX) / targetWidth;
            const normalizedTargetY = (targetY - targetBounds.minY) / targetHeight;

            // Encontrar o segmento da fonte mais próximo desta posição
            let closestSegment = 0;
            let minDistance = Infinity;

            Object.keys(segmentPositions).forEach(segment => {
                const segData = segmentPositions[segment];
                const distance = Math.sqrt(
                    Math.pow(normalizedTargetX - segData.avgX, 2) +
                    Math.pow(normalizedTargetY - segData.avgY, 2)
                );

                if (distance < minDistance) {
                    minDistance = distance;
                    closestSegment = parseInt(segment);
                }
            });

            // Ajustar segmento para descendentes baseado na posição anatômica
            let finalSegment = closestSegment;

            if (isTargetDescender) {
                // Para descendentes, ajustar segmentos baseado na posição vertical
                if (normalizedTargetY > 0.7) {
                    // Parte inferior (descendente) - usar segmento 4 (organic)
                    finalSegment = 4;
                } else if (normalizedTargetY > 0.4) {
                    // Parte média - usar segmento 1 (bass) ou 2 (mid)
                    finalSegment = normalizedTargetY > 0.6 ? 1 : 2;
                } else {
                    // Parte superior - manter segmento original
                    finalSegment = closestSegment;
                }
            }

            resultPoint.segment = finalSegment;
            resultPoint.originalSegment = finalSegment;
            resultPoint.numSegments = Object.keys(segmentPositions).length;

            // Copiar propriedades específicas do segmento da fonte
            const sourcePointForSegment = sourcePoints.find(p => p.segment === closestSegment);
            if (sourcePointForSegment) {
                // Copiar parâmetros específicos dos segmentos
                resultPoint.waveParams = sourcePointForSegment.waveParams;
                resultPoint.orgParams = sourcePointForSegment.orgParams;
                resultPoint.lineSegment = sourcePointForSegment.lineSegment;
                resultPoint.angle = sourcePointForSegment.angle;
                resultPoint.seed = sourcePointForSegment.seed;
                resultPoint.size = sourcePointForSegment.size;

                // Copiar propriedades de comportamento
                resultPoint.renderType = sourcePointForSegment.renderType;

                // Garantir que parâmetros específicos sejam copiados corretamente
                if (closestSegment === 2 && sourcePointForSegment.waveParams) {
                    // Para segmento 2 (mid waves), garantir parâmetros de onda
                    resultPoint.waveParams = {
                        frequency: sourcePointForSegment.waveParams.frequency || 0.05,
                        amplitude: sourcePointForSegment.waveParams.amplitude || 2,
                        phase: sourcePointForSegment.waveParams.phase || 0,
                        baseAmplitude: sourcePointForSegment.waveParams.baseAmplitude || 1
                    };
                }

                if (closestSegment === 3) {
                    // Para segmento 3 (treble lines), copiar parâmetros necessários
                    // IMPORTANTE: Garantir que cada ponto tenha um seed único
                    const baseSeed = sourcePointForSegment.seed || Math.random() * 1000;
                    const positionVariation = (targetPoint.pos?.x ?? targetPoint.x ?? 0) * 100 + (targetPoint.pos?.y ?? targetPoint.y ?? 0) * 10;
                    resultPoint.seed = baseSeed + positionVariation;
                    resultPoint.letterIndex = sourcePointForSegment.letterIndex || 0;

                    // IMPORTANTE: Para letras não visíveis, usar as coordenadas do ponto atual como originais
                    // Isso garante que as linhas sejam calculadas corretamente
                    resultPoint.originalPos = {
                        x: targetPoint.pos?.x ?? targetPoint.x ?? 0,
                        y: targetPoint.pos?.y ?? targetPoint.y ?? 0
                    };

                    // Garantir que o pos atual também está correto
                    resultPoint.pos = {
                        x: targetPoint.pos?.x ?? targetPoint.x ?? 0,
                        y: targetPoint.pos?.y ?? targetPoint.y ?? 0
                    };
                }
            }

            // Marcar como copiado
            resultPoint._propertiesCopiedFrom = sourcePoints[0]?.character;
            resultPoint._copyIndex = index;
            resultPoint._distanceToSegment = minDistance;
        } else {
            // Fallback: usar distribuição circular se não conseguir calcular posições
            const segmentKeys = Object.keys(segmentPositions).map(Number).sort();
            const segmentIndex = index % segmentKeys.length;
            let targetSegment = segmentKeys[segmentIndex];


            resultPoint.segment = targetSegment;
            resultPoint.originalSegment = targetSegment;
            resultPoint.numSegments = segmentKeys.length;

            // Copiar propriedades do segmento
            const sourcePointForSegment = sourcePoints.find(p => p.segment === targetSegment);
            if (sourcePointForSegment) {
                resultPoint.waveParams = sourcePointForSegment.waveParams;
                resultPoint.orgParams = sourcePointForSegment.orgParams;
                resultPoint.lineSegment = sourcePointForSegment.lineSegment;
                resultPoint.angle = sourcePointForSegment.angle;
                resultPoint.seed = sourcePointForSegment.seed;
                resultPoint.size = sourcePointForSegment.size;
                resultPoint.renderType = sourcePointForSegment.renderType;

                // Para segmento 3, garantir coordenadas corretas e seed único
                if (targetSegment === 3) {
                    resultPoint.originalPos = {
                        x: targetPoint.pos?.x ?? targetPoint.x ?? 0,
                        y: targetPoint.pos?.y ?? targetPoint.y ?? 0
                    };
                    resultPoint.pos = {
                        x: targetPoint.pos?.x ?? targetPoint.x ?? 0,
                        y: targetPoint.pos?.y ?? targetPoint.y ?? 0
                    };

                    // Garantir seed único para cada ponto
                    const baseSeed = sourcePointForSegment.seed || Math.random() * 1000;
                    const positionVariation = (targetPoint.pos?.x ?? targetPoint.x ?? 0) * 100 + (targetPoint.pos?.y ?? targetPoint.y ?? 0) * 10;
                    resultPoint.seed = baseSeed + positionVariation;
                }
            }

            resultPoint._propertiesCopiedFrom = sourcePoints[0]?.character;
            resultPoint._copyIndex = index;
            resultPoint._fallbackUsed = true;
        }

        return resultPoint;
    });

    // Debug: verificar distribuição de segmentos
    const segmentDistribution = {};
    resultPoints.forEach(point => {
        const segment = point.segment || 0;
        segmentDistribution[segment] = (segmentDistribution[segment] || 0) + 1;
    });

    // Debug: verificar seeds únicos para segmento 3
    const segment3Points = resultPoints.filter(p => p.segment === 3);
    if (segment3Points.length > 0) {
        const uniqueSeeds = [...new Set(segment3Points.map(p => p.seed))];
    }

    // Debug: verificar alguns pontos resultantes
    if (resultPoints.length > 0) {
        const firstPoint = resultPoints[0];
        const lastPoint = resultPoints[resultPoints.length - 1];
    }

    return resultPoints;
}

// Função reformulada para obter pontos de letra usando propriedades copiadas
function getLetterPointsSync(char, renderType, visibleReferencePoints = null, forceNoFlocking = false) {
    if (visibleReferencePoints && visibleReferencePoints.length > 0) {

        // Copiar propriedades de segmento dos pontos de referência para esta letra
        const copiedPoints = copySegmentProperties(visibleReferencePoints, char, 0);

        if (copiedPoints.length > 0) {
            return copiedPoints;
        }
    }

    // Isolar completamente window.letterPoints durante exportação
    let points;
    const originalArray = window.letterPoints;
    const originalContent = Array.isArray(originalArray) ? originalArray.map(p => ({ ...p })) : [];
    let arrayWasReplaced = false;

    try {
        if (renderType === 'grid') {

            // Criar pontos e caixas de grelha simples para exportação
            const tempPoints = [];
            const tempBoxes = [];

            // Criar uma grelha simples 4x4 para a letra
            const gridSize = 4;
            const cellSize = 50;
            const startX = 100;
            const startY = 100;

            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    // Criar caixa
                    const box = {
                        x: startX + i * cellSize,
                        y: startY + j * cellSize,
                        width: cellSize,
                        height: cellSize,
                        letterIndex: 0,
                        cellX: i,
                        cellY: j,
                        character: char
                    };
                    tempBoxes.push(box);

                    // Criar pontos dentro da caixa
                    const pointsPerSide = 3;
                    const pointSpacing = cellSize / (pointsPerSide + 1);

                    for (let px = 1; px <= pointsPerSide; px++) {
                        for (let py = 1; py <= pointsPerSide; py++) {
                            const pointX = box.x + px * pointSpacing;
                            const pointY = box.y + py * pointSpacing;
                            const segmentType = Math.floor(Math.random() * 5);

                            const point = {
                                pos: { x: pointX, y: pointY },
                                segment: segmentType,
                                character: char,
                                letterIndex: 0,
                                renderType: 'grid',
                                size: 10
                            };
                            tempPoints.push(point);
                        }
                    }
                }
            }

            points = {
                points: tempPoints,
                gridBoxes: tempBoxes
            };
        } else if (typeof window.createVectorLetterSingle === 'function') {
            const tempPoints = [];
            window.letterPoints = tempPoints;
            arrayWasReplaced = true;
            window.createVectorLetterSingle(char, 0, 0);
            points = tempPoints.map(p => ({ ...p }));
        } else {
            points = [];
        }
    } finally {
        if (arrayWasReplaced) {
            window.letterPoints = originalArray;
            if (Array.isArray(window.letterPoints)) {
                window.letterPoints.length = 0;
                for (const p of originalContent) window.letterPoints.push(p);
            }
        }
    }

    return points || [];
}

function createEmptyGlyph(char) {
    const advanceWidth = calculateProportionalAdvanceWidth(char);

    return {
        unicode: char.charCodeAt(0),
        name: getGlyphName(char),
        advanceWidth: advanceWidth,
        contours: [],
        metadata: {
            isEmpty: true,
            isNarrowLetter: isNarrowLetter(char)
        }
    };
}

function createNotDefGlyph() {
    const notDefGlyph = {
        unicode: 0,
        name: '.notdef',
        advanceWidth: 1500, // Aumentar drasticamente
        contours: [
            {
                type: 'path',
                points: [
                    { x: 150, y: 0, type: 'move' }, // Aumentar dimensões
                    { x: 1350, y: 0, type: 'line' },
                    { x: 1350, y: 1800, type: 'line' }, // Altura muito maior
                    { x: 150, y: 1800, type: 'line' },
                    { type: 'close' }
                ]
            }
        ]
    };

    return notDefGlyph;
}

function getGlyphName(char) {
    if (char >= 'A' && char <= 'Z') return char;
    if (char >= 'a' && char <= 'z') return char.toLowerCase();
    if (char >= '0' && char <= '9') return `digit${char}`;

    const specialChars = {
        '.': 'period',
        ',': 'comma',
        '!': 'exclamation',
        '?': 'question',
        ';': 'semicolon',
        ':': 'colon',
        '(': 'parenleft',
        ')': 'parenright',
        '[': 'bracketleft',
        ']': 'bracketright',
        '{': 'braceleft',
        '}': 'braceright'
    };

    return specialChars[char] || `char${char.charCodeAt(0)}`;
}

function calculateAdvanceWidthFromPoints(points, char = null) {
    if (points.length === 0) {
        // Se não há pontos, usar cálculo proporcional se o caractere for fornecido
        if (char) {
            return calculateProportionalAdvanceWidth(char, 0);
        }
        return 1500; // Fallback
    }

    const minX = Math.min(...points.map(p => p.x));
    const maxX = Math.max(...points.map(p => p.x));
    const width = maxX - minX;

    // Usar cálculo proporcional se o caractere for fornecido
    if (char) {
        return calculateProportionalAdvanceWidth(char, width * 2);
    }

    return Math.max(width * 2, 1000);
}

// Helper functions para criar contornos
function createCircleContour(x, y, size) {
    return {
        type: 'circle',
        centerX: x,
        centerY: y,
        radius: size / 2
    };
}

function createPathContour(points) {
    if (points.length < 3) return null;

    const pathPoints = [];
    pathPoints.push({ x: points[0].x, y: points[0].y, type: 'move' });

    for (let i = 1; i < points.length; i++) {
        pathPoints.push({ x: points[i].x, y: points[i].y, type: 'line' });
    }

    pathPoints.push({ type: 'close' });

    return {
        type: 'path',
        points: pathPoints
    };
}

// Função para processar contornos no OpenType
function addContourToPath(path, contour) {
    if (!contour) {

        return;
    }



    if (contour.type === 'circle') {
        // Criar círculo usando curvas bezier
        const r = contour.radius;
        const x = contour.centerX;
        const y = contour.centerY;

        path.moveTo(x + r, y);
        path.curveTo(x + r, y + r * 0.552, x + r * 0.552, y + r, x, y + r);
        path.curveTo(x - r * 0.552, y + r, x - r, y + r * 0.552, x - r, y);
        path.curveTo(x - r, y - r * 0.552, x - r * 0.552, y - r, x, y - r);
        path.curveTo(x + r * 0.552, y - r, x + r, y - r * 0.552, x + r, y);
        path.close();
    } else if (contour.type === 'path' && contour.points) {
        // Verificar se é um contorno de linha simples (apenas 2 pontos)
        if (contour.points.length === 2) {
            const p1 = contour.points[0];
            const p2 = contour.points[1];

            // Verificar se os pontos são válidos
            if (!p1 || !p2 || isNaN(p1.x) || isNaN(p1.y) || isNaN(p2.x) || isNaN(p2.y)) {
                return;
            }

            // Se tem lineWidth, criar linha grossa como na fonte vetorial
            if (contour.lineWidth) {
                const thickness = contour.lineWidth;
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const length = Math.sqrt(dx * dx + dy * dy);

                if (length > 0) {
                    // Calcular vetor perpendicular
                    const perpX = -dy / length;
                    const perpY = dx / length;
                    const halfThickness = thickness / 2;

                    // Criar retângulo fino para simular linha grossa
                    const x1 = p1.x + perpX * halfThickness;
                    const y1 = p1.y + perpY * halfThickness;
                    const x2 = p1.x - perpX * halfThickness;
                    const y2 = p1.y - perpY * halfThickness;
                    const x3 = p2.x - perpX * halfThickness;
                    const y3 = p2.y - perpY * halfThickness;
                    const x4 = p2.x + perpX * halfThickness;
                    const y4 = p2.y + perpY * halfThickness;

                    // Criar retângulo fechado
                    path.moveTo(x1, y1);
                    path.lineTo(x4, y4);
                    path.lineTo(x3, y3);
                    path.lineTo(x2, y2);
                    path.close();
                }
            } else {
                // Linha simples sem espessura - criar linha grossa para ser visível
                const thickness = 2; // Espessura fixa para contornos
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const length = Math.sqrt(dx * dx + dy * dy);

                if (length > 0) {
                    // Calcular vetor perpendicular
                    const perpX = -dy / length;
                    const perpY = dx / length;
                    const halfThickness = thickness / 2;

                    // Criar retângulo fino para simular linha grossa
                    const x1 = p1.x + perpX * halfThickness;
                    const y1 = p1.y + perpY * halfThickness;
                    const x2 = p1.x - perpX * halfThickness;
                    const y2 = p1.y - perpY * halfThickness;
                    const x3 = p2.x - perpX * halfThickness;
                    const y3 = p2.y - perpY * halfThickness;
                    const x4 = p2.x + perpX * halfThickness;
                    const y4 = p2.y + perpY * halfThickness;

                    // Criar retângulo fechado
                    path.moveTo(x1, y1);
                    path.lineTo(x4, y4);
                    path.lineTo(x3, y3);
                    path.lineTo(x2, y2);
                    path.close();
                }
            }

            return;
        }
        // Processamento normal para outros tipos de contorno
        let moveDone = false;
        let pointCount = 0;

        contour.points.forEach((point, index) => {
            if (point.type === 'move') {
                path.moveTo(point.x, point.y);
                moveDone = true;
                pointCount++;
            } else if (point.type === 'line') {
                path.lineTo(point.x, point.y);
                pointCount++;
            } else if (point.type === 'close') {
                // Só fechar se for explicitamente solicitado
                path.close();
            }
        });

        // NÃO fechar automaticamente - deixar como linhas simples
    }
}

// Função para criar glyph OpenType
function createOpenTypeGlyph(glyphData) {
    try {
        const path = new opentype.Path();

        // Processar contornos baseado no tipo
        if (glyphData.contours && glyphData.contours.length > 0) {
            glyphData.contours.forEach(contour => {
                addContourToPath(path, contour);
            });
        }

        const glyph = new opentype.Glyph({
            name: glyphData.name,
            unicode: glyphData.unicode,
            advanceWidth: glyphData.advanceWidth || 500,
            path: path
        });

        return glyph;

    } catch (error) {
        return null;
    }
}

// Função para converter dados da fonte para formato OpenType
async function convertToOpenType(fontData) {

    if (typeof opentype === 'undefined') {
        throw new Error("opentype.js não está disponível");
    }



    try {
        const glyphs = [];

        // Processar cada glyph
        for (const glyphData of fontData.glyphs) {
            const path = new opentype.Path();

            // Converter contornos para OpenType path
            if (glyphData.contours) {
                glyphData.contours.forEach((contour, index) => {
                    addContourToPath(path, contour);
                });
            }

            // Criar glyph OpenType
            const glyph = new opentype.Glyph({
                name: glyphData.name,
                unicode: glyphData.unicode,
                advanceWidth: glyphData.advanceWidth,
                path: path
            });

            glyphs.push(glyph);
        }

        // Criar fonte OpenType
        const font = new opentype.Font({
            familyName: fontData.familyName,
            styleName: fontData.styleName,
            unitsPerEm: fontData.unitsPerEm,
            ascender: fontData.ascender || ASCENDER,
            descender: fontData.descender || DESCENDER,
            glyphs: glyphs
        });

        const arrayBuffer = font.toArrayBuffer();

        return arrayBuffer;

    } catch (error) {
        throw error;
    }
}

// Função global para exportar segmentos com reações (acessível via console)
window.exportarSegmentosComReacoes = exportarSegmentosComReacoes;

// Função para salvar arquivo da fonte
async function saveFontFile(fontData, filename) {
    try {
        // Converter dados da fonte para formato OpenType
        const otfData = await convertToOpenType(fontData);

        // Criar e fazer download do arquivo
        const blob = new Blob([otfData], { type: 'font/otf' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        // Adicionar ao DOM e clicar
        document.body.appendChild(link);

        // Tentar download
        try {
            link.click();
        } catch (clickError) {
        }

        // Remover do DOM
        document.body.removeChild(link);

        // Limpar URL após um delay
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, EXPORT_CONFIG.urlCleanupDelay);

        // Aguardar para evitar bloqueio de múltiplos downloads
        await new Promise(resolve => setTimeout(resolve, EXPORT_CONFIG.downloadDelay));

        // Delay adicional para garantir que o download foi processado
        await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
        throw error;
    }
}

// Exportar função principal para uso global
if (typeof window !== 'undefined') {
    window.exportarFonteComoOTF = exportarFonteComoOTF;
    
    // Fallback para mensagens se não existir
    if (!window.showOTFMessage) {
        window.showOTFMessage = function(message, type = 'info', duration = 3000) {
            console.log(`[OTF ${type.toUpperCase()}] ${message}`);
            if (type === 'error') {
                alert(message);
            }
        };
    }

    // Função de teste para forçar exportação grelha
    window.testarExportacaoGrelha = async function () {
        try {
            // Criar dados de teste simples
            const testData = new Map();
            testData.set('A', {
                points: [
                    { pos: { x: 100, y: 100 }, character: 'A', segment: 0 },
                    { pos: { x: 150, y: 100 }, character: 'A', segment: 0 },
                    { pos: { x: 200, y: 100 }, character: 'A', segment: 0 }
                ],
                gridBoxes: [
                    { x: 75, y: 75, width: 50, height: 50, character: 'A' },
                    { x: 125, y: 75, width: 50, height: 50, character: 'A' },
                    { x: 175, y: 75, width: 50, height: 50, character: 'A' }
                ]
            });

            // Criar fonte de teste
            const fontData = await createFontFromGridLetters(testData, null, 'TESTE');

            // Salvar arquivo
            const filename = 'Grid_TESTE_A.otf';
            await saveFontFile(fontData, filename);

        } catch (error) {
        }
    };

    // Função de teste ultra-simples
    window.testarExportacaoSimples = async function () {
        try {
            // Criar fonte com apenas um glyph simples
            const simpleFontData = {
                familyName: 'TestFont',
                styleName: 'Regular',
                version: '1.0',
                glyphs: [
                    {
                        unicode: 0,
                        name: '.notdef',
                        advanceWidth: 1000,
                        contours: [
                            {
                                type: 'path',
                                points: [
                                    { x: 100, y: 100, type: 'move' },
                                    { x: 900, y: 100, type: 'line' },
                                    { x: 900, y: 900, type: 'line' },
                                    { x: 100, y: 900, type: 'line' },
                                    { type: 'close' }
                                ]
                            }
                        ]
                    },
                    {
                        unicode: 65, // 'A'
                        name: 'A',
                        advanceWidth: 1000,
                        contours: [
                            {
                                type: 'path',
                                points: [
                                    { x: 100, y: 100, type: 'move' },
                                    { x: 500, y: 900, type: 'line' },
                                    { x: 900, y: 100, type: 'line' },
                                    { type: 'close' }
                                ]
                            }
                        ]
                    }
                ],
                unitsPerEm: 1000,
                ascender: 800,
                descender: -200
            };

            // Salvar arquivo
            const filename = 'Teste_Simples.otf';
            await saveFontFile(simpleFontData, filename);

        } catch (error) {
        }
    };

    // Função para testar exportação grelha específica
    window.testarExportacaoGrelhaEspecifica = async function () {
        try {
            // Criar dados de teste específicos para grelha
            const testGridData = new Map();
            testGridData.set('A', {
                points: [
                    { pos: { x: 100, y: 100 }, character: 'A', segment: 0 },
                    { pos: { x: 150, y: 100 }, character: 'A', segment: 0 },
                    { pos: { x: 200, y: 100 }, character: 'A', segment: 0 }
                ],
                gridBoxes: [
                    { x: 75, y: 75, width: 50, height: 50, character: 'A' },
                    { x: 125, y: 75, width: 50, height: 50, character: 'A' },
                    { x: 175, y: 75, width: 50, height: 50, character: 'A' }
                ]
            });

            // Chamar diretamente a função de exportação grelha
            await exportarFonteGrelhaSeparada(testGridData, null);

        } catch (error) {
        }
    };

    // Função para testar criação de glyph individual
    window.testarGlyphIndividual = function () {
        try {
            const testCharPoints = {
                points: [
                    { pos: { x: 100, y: 100 }, character: 'A', segment: 0 },
                    { pos: { x: 150, y: 100 }, character: 'A', segment: 0 },
                    { pos: { x: 200, y: 100 }, character: 'A', segment: 0 }
                ],
                gridBoxes: [
                    { x: 75, y: 75, width: 50, height: 50, character: 'A' },
                    { x: 125, y: 75, width: 50, height: 50, character: 'A' },
                    { x: 175, y: 75, width: 50, height: 50, character: 'A' }
                ]
            };

            const glyph = createGridGlyphFromPointsSeparada('A', testCharPoints, null);

            if (glyph && glyph.contours && glyph.contours.length > 0) {
            } else {
            }

        } catch (error) {
        }
    };

    // Função para forçar detecção de grelha
    window.forcarDetecaoGrelha = function () {
        if (!window.letterPoints || window.letterPoints.length === 0) {
            return;
        }

        // Forçar todos os pontos como grelha
        window.letterPoints.forEach(point => {
            if (point.character && point.character.trim() !== '') {
                point.renderType = 'grid';
                point.segment = 0;
            }
        });
    };

    // Função para verificar detecção
    window.verificarDetecao = function () {
        if (!window.letterPoints || window.letterPoints.length === 0) {
            return;
        }

        const gridLetterGroups = new Map();
        const vectorLetterGroups = new Map();

        window.letterPoints.forEach(point => {
            if (point.character && point.character.trim() !== '') {
                const isGrid = point.renderType === 'grid' || (point.renderType === undefined && point.segment === 0);
                const isVector = point.renderType === 'vector' || (point.renderType === undefined && point.segment !== 0);

                if (isGrid) {
                    if (!gridLetterGroups.has(point.character)) {
                        gridLetterGroups.set(point.character, []);
                    }
                    gridLetterGroups.get(point.character).push(point);
                } else if (isVector) {
                    if (!vectorLetterGroups.has(point.character)) {
                        vectorLetterGroups.set(point.character, []);
                    }
                    vectorLetterGroups.get(point.character).push(point);
                }
            }
        });

        // Verificar duplicados (mas não remover)
        const gridKeys = Array.from(gridLetterGroups.keys());
        const vectorKeys = Array.from(vectorLetterGroups.keys());

        const commonKeys = gridKeys.filter(key => vectorKeys.includes(key));
    };

    // Função para verificar dados grelha
    window.verificarDadosGrelha = function () {
        if (!window.letterPoints || window.letterPoints.length === 0) {
            return;
        }

        // Verificar pontos grelha
        const gridPoints = window.letterPoints.filter(p =>
            p.character && p.character.trim() !== '' &&
            (p.renderType === 'grid' || (p.renderType === undefined && p.segment === 0))
        );

        // Verificar letterBoxes
        if (window.letterBoxes && window.letterBoxes.length > 0) {
        } else {
        }

        // Agrupar por letra
        const gridByLetter = {};
        gridPoints.forEach(point => {
            if (!gridByLetter[point.character]) {
                gridByLetter[point.character] = [];
            }
            gridByLetter[point.character].push(point);
        });
    };

    // Função para criar quadrado com "buraco" no centro (simula contorno vazio)
    function createGridSquareContour(x, y, size) {
        const half = size / 2;
        const borderThickness = size * 0.2; // Espessura da borda
        const innerSize = size - (borderThickness * 2);
        const innerHalf = innerSize / 2;

        // Contorno externo (quadrado cheio)
        const outerContour = {
            type: 'path',
            points: [
                { x: x - half, y: y - half, type: 'move' },
                { x: x + half, y: y - half, type: 'line' },
                { x: x + half, y: y + half, type: 'line' },
                { x: x - half, y: y + half, type: 'line' },
                { type: 'close' }
            ]
        };

        // Contorno interno (buraco no centro)
        const innerContour = {
            type: 'path',
            points: [
                { x: x - innerHalf, y: y - innerHalf, type: 'move' },
                { x: x + innerHalf, y: y - innerHalf, type: 'line' },
                { x: x + innerHalf, y: y + innerHalf, type: 'line' },
                { x: x - innerHalf, y: y + innerHalf, type: 'line' },
                { type: 'close' }
            ]
        };

        return [outerContour, innerContour];
    }

    // Função para testar timers
    window.testarTimers = async function () {
        // Teste de delay
        await new Promise(resolve => setTimeout(resolve, 2000));
    };

    // Função para testar contornos de quadrados
    window.testarContornosQuadrados = function () {
        const testContours = createGridSquareContour(100, 100, 50);

        testContours.forEach((contour, index) => {
        });
    };

    // Função para testar grelha fiel ao canvas
    window.testarGrelhaFiel = function () {
        // Verificar dados do canvas
        if (window.letterPoints && window.letterPoints.length > 0) {
            const gridPoints = window.letterPoints.filter(p => p.renderType === 'grid');

            if (gridPoints.length > 0) {
                // Mostrar todos os pontos grelha com seus segmentos
                gridPoints.forEach((p, i) => {
                });
            }
        }

        if (window.letterBoxes && window.letterBoxes.length > 0) {
        }

        // Simular uma caixa
        const boxSize = 50;
        const cx = 100;
        const cy = 100;

        // 1. Testar contornos do quadrado (linhas finas)
        const lineThickness = 2;
        const halfSize = boxSize / 2;

        const topLine = {
            type: 'path',
            points: [
                { x: cx - halfSize, y: cy - halfSize, type: 'move' },
                { x: cx + halfSize, y: cy - halfSize, type: 'line' }
            ],
            lineWidth: lineThickness
        };

        // 2. Testar partículas com segmentos reais do canvas
        const pointsPerSide = 2;
        const pointSpacing = boxSize / (pointsPerSide + 1);

        // Simular pontos do canvas
        const mockCanvasPoints = [
            { segment: 0, pos: { x: 100, y: 100 } },
            { segment: 1, pos: { x: 110, y: 100 } },
            { segment: 2, pos: { x: 100, y: 110 } },
            { segment: 3, pos: { x: 110, y: 110 } }
        ];

        mockCanvasPoints.forEach((canvasPoint, index) => {
            const pointX = cx - halfSize + ((index % pointsPerSide) + 1) * pointSpacing;
            const pointY = cy - halfSize + (Math.floor(index / pointsPerSide) + 1) * pointSpacing;
            const realSegment = canvasPoint.segment;
            const particleContours = createParticleContour(pointX, pointY, realSegment, pointSpacing * 0.3);
        });
    };

    // Função para testar download
    window.testarDownload = async function () {
        try {
            // Criar um blob simples
            const testData = new Uint8Array([1, 2, 3, 4, 5]);
            const blob = new Blob([testData], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);

            // Criar link e fazer download
            const link = document.createElement('a');
            link.href = url;
            link.download = 'teste.txt';
            link.style.display = 'none';

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            // Limpar URL
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1000);

        } catch (error) {
        }
    };
}

function createSquareContour(x, y, size, lineThickness = 4) {
    // Nova abordagem: Criar linhas simples sem fechamento
    // Isso garante que não haja preenchimento nos quadrados
    const halfSize = size / 2;

    // 4 linhas retas para formar os lados do quadrado
    return [
        // Linha superior
        {
            type: 'path',
            points: [
                { x: x - halfSize, y: y - halfSize, type: 'move' },
                { x: x + halfSize, y: y - halfSize, type: 'line' }
            ],
            isGridBox: true,
            isGridBoxOutline: true,
            lineWidth: lineThickness
        },
        // Linha direita
        {
            type: 'path',
            points: [
                { x: x + halfSize, y: y - halfSize, type: 'move' },
                { x: x + halfSize, y: y + halfSize, type: 'line' }
            ],
            isGridBox: true,
            isGridBoxOutline: true,
            lineWidth: lineThickness
        },
        // Linha inferior
        {
            type: 'path',
            points: [
                { x: x + halfSize, y: y + halfSize, type: 'move' },
                { x: x - halfSize, y: y + halfSize, type: 'line' }
            ],
            isGridBox: true,
            isGridBoxOutline: true,
            lineWidth: lineThickness
        },
        // Linha esquerda
        {
            type: 'path',
            points: [
                { x: x - halfSize, y: y + halfSize, type: 'move' },
                { x: x - halfSize, y: y - halfSize, type: 'line' }
            ],
            isGridBox: true,
            isGridBoxOutline: true,
            lineWidth: lineThickness
        }
    ];
}

function createLineContour(points, thickness) {
    // Criar contorno de linha simples (apenas 2 pontos)
    if (points.length < 2) {
        return null;
    }
    return {
        type: 'path',
        points: [
            { x: points[0].x, y: points[0].y, type: 'move' },
            { x: points[1].x, y: points[1].y, type: 'line' }
        ],
        lineWidth: thickness
    };
}

function createReactiveContour(x, y, size, reactions, segment) {
    const contours = [];

    // Aplicar escala baseada nas reações
    const scaledSize = size * (reactions.scale || 1);

    // SEMPRE criar um contorno principal primeiro
    const mainContour = createCircleContour(x, y, scaledSize);
    contours.push(mainContour);

    // Adicionar efeito de glow baseado no brilho/volume
    if (reactions.glow > 5) {
        const glowLayers = Math.min(3, Math.floor(reactions.glow / 15));
        for (let i = 1; i <= glowLayers; i++) {
            const glowRadius = scaledSize + (i * reactions.glow * 0.3);
            const glowContour = createCircleContour(x, y, glowRadius);
            contours.push(glowContour);
        }
    }

    // Adicionar efeito de vibração como múltiplos contornos deslocados
    if (reactions.vibration > 1) {
        const vibrationIntensity = Math.min(3, Math.floor(reactions.vibration));
        const vibrationOffset = reactions.vibration * 2;

        for (let i = 0; i < vibrationIntensity; i++) {
            const angle = (i / vibrationIntensity) * Math.PI * 2;
            const offsetX = Math.cos(angle) * vibrationOffset;
            const offsetY = Math.sin(angle) * vibrationOffset;

            const vibrationContour = createCircleContour(x + offsetX, y + offsetY, scaledSize * 0.7);
            contours.push(vibrationContour);
        }
    }

    // Para segmentos específicos, adicionar efeitos extras
    if (segment === 0 && reactions.volume > 0.1) { // Flocking - partículas extras para simular movimento
        const flockingParticles = Math.min(2, Math.floor(reactions.volume * 3));
        for (let i = 0; i < flockingParticles; i++) {
            const angle = (i / flockingParticles) * Math.PI * 2;
            const distance = scaledSize * 0.8;
            const particleX = x + Math.cos(angle) * distance;
            const particleY = y + Math.sin(angle) * distance;

            const flockingContour = createCircleContour(particleX, particleY, scaledSize / 4);
            contours.push(flockingContour);
        }
    }

    // Se não temos efeitos avançados, aplicar lógica simples adicional
    if (contours.length === 1) {
        // Para simular opacidade e brilho na fonte, podemos variar a densidade dos contornos
        if (reactions.opacity < 50 || reactions.brightness < 30) {
            // Baixa opacidade/brilho: criar contorno menor
            const reducedSize = Math.max(scaledSize * 0.5, scaledSize * (reactions.opacity / 100) * (reactions.brightness / 100));
            const reducedContour = createCircleContour(x, y, reducedSize);
            contours.push(reducedContour);
        }

        if (reactions.brightness > 70) {
            // Alto brilho: criar contorno com efeito de "glow"
            const glowLayers = Math.max(1, Math.floor(reactions.brightness / 30));

            for (let i = 0; i < glowLayers; i++) {
                const layerSize = scaledSize * (1 + i * 0.15);
                contours.push(createCircleContour(x, y, layerSize));
            }
        }

        // Reação ao volume: variar espessura do contorno
        if (reactions.volume > 0.3) {
            const thicknessFactor = 1 + (reactions.volume * 1.5);
            const thickContour = createCircleContour(x, y, scaledSize * thicknessFactor);
            contours.push(thickContour);
        }
    }

    // SEMPRE retornar pelo menos um contorno
    return contours.length > 0 ? contours : [createCircleContour(x, y, scaledSize)];
}

// Função para criar linha reativa com efeitos visuais
function createReactiveLine(x1, y1, x2, y2, reactions) {

    const lines = [];

    // Aplicar movimento às posições finais
    const finalX2 = x2 + (reactions.movementX || 0);
    const finalY2 = y2 + (reactions.movementY || 0);

    const baseThickness = Math.max(4, reactions.thickness || 8); // Aumentar espessura mínima
    const linePoints = [{ x: x1, y: y1 }, { x: finalX2, y: finalY2 }];

    // SEMPRE criar linha principal primeiro
    const mainLine = createLineContour(linePoints, baseThickness);
    if (mainLine) {
        lines.push(mainLine);
    } else {
    }

    // Adicionar efeito de glow para linhas (reduzir threshold)
    if (reactions.glow > 5) { // Reduzir de 10 para 5
        const glowLayers = Math.min(2, Math.floor(reactions.glow / 15));
        for (let i = 1; i <= glowLayers; i++) {
            const glowThickness = baseThickness + (i * reactions.glow * 0.4); // Aumentar multiplicador
            const glowLine = createLineContour(linePoints, glowThickness);
            if (glowLine) {
                lines.push(glowLine);
            }
        }
    }

    // Adicionar efeito de vibração para linhas (reduzir threshold)
    if (reactions.vibration > 1) { // Reduzir de 2 para 1
        const vibrationLines = Math.min(2, Math.floor(reactions.vibration / 1.5)); // Reduzir divisor
        const vibrationOffset = reactions.vibration * 3; // Aumentar multiplicador


        for (let i = 0; i < vibrationLines; i++) {
            const offsetY = (i % 2 === 0 ? 1 : -1) * vibrationOffset;
            const vibratedPoints = [
                { x: x1, y: y1 + offsetY },
                { x: finalX2, y: finalY2 + offsetY }
            ];
            const vibratedLine = createLineContour(vibratedPoints, baseThickness * 0.8);
            if (vibratedLine) {
                lines.push(vibratedLine);
            }
        }
    }

    // Adicionar efeitos baseados na intensidade do áudio (comportamento original)
    if (reactions.peakMultiplier > 1.5) { // Reduzir threshold
        // Picos altos: criar linha com efeito de vibração
        const vibrationIntensity = (reactions.peakMultiplier - 1) * 8; // Aumentar multiplicador

        for (let i = -1; i <= 1; i++) {
            if (i === 0) continue; // Pular linha central (já temos a principal)

            const offsetX = Math.sin(i * 0.5) * vibrationIntensity;
            const offsetY = Math.cos(i * 0.5) * vibrationIntensity;

            const vibratedPoints = [
                { x: x1 + offsetX, y: y1 + offsetY },
                { x: finalX2 + offsetX, y: finalY2 + offsetY }
            ];

            const thickness = baseThickness * (1 - Math.abs(i) * 0.2);
            if (thickness > 2) {
                const vibratedLine = createLineContour(vibratedPoints, thickness);
                if (vibratedLine) {
                    lines.push(vibratedLine);
                }
            }
        }
    }

    // SEMPRE retornar pelo menos uma linha - melhorar fallback
    if (lines.length === 0) {
        // Criar uma linha simples e robusta
        const fallbackThickness = Math.max(8, baseThickness); // Garantir espessura mínima maior
        const fallbackLine = createLineContour(linePoints, fallbackThickness);

        if (fallbackLine) {
            return fallbackLine;
        } else {
            const rectWidth = fallbackThickness;
            const rectHeight = Math.sqrt((finalX2 - x1) ** 2 + (finalY2 - y1) ** 2);

            return {
                type: 'path',
                points: [
                    { x: x1 - rectWidth / 2, y: y1, type: 'move' },
                    { x: x1 + rectWidth / 2, y: y1, type: 'line' },
                    { x: finalX2 + rectWidth / 2, y: finalY2, type: 'line' },
                    { x: finalX2 - rectWidth / 2, y: finalY2, type: 'line' },
                    { type: 'close' }
                ]
            };
        }
    }

    return lines.length > 1 ? lines : lines[0];
}

// Função exclusiva para grid: cria um quadrado fechado como path
function createClosedSquareContour(x, y, size, lineThickness = 4) {
    const half = size / 2;
    return {
        type: 'path',
        points: [
            { x: x - half, y: y - half, type: 'move' },
            { x: x + half, y: y - half, type: 'line' },
            { x: x + half, y: y + half, type: 'line' },
            { x: x - half, y: y + half, type: 'line' },
            { type: 'close' }
        ],
        isGridBox: true,
        isGridBoxOutline: true,
        lineWidth: lineThickness
    };
}

// Nova função para obter reações por segmento da referência
function getReferenceSegmentReactions(referencePoints, audioState, frameCount) {
    const reactionsBySegment = {};
    const seen = new Set();
    for (const p of referencePoints) {
        const seg = p.segment || 0;
        if (!seen.has(seg)) {
            reactionsBySegment[seg] = calculateSegmentReactions(seg, audioState, frameCount, p);
            seen.add(seg);
        }
    }
    return reactionsBySegment;
}

function getBounds(pts) {
    if (!pts || pts.length === 0) {
        return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    pts.forEach(p => {
        // Tentar diferentes formatos de posição
        let x, y;
        if (p.pos && typeof p.pos.x === 'number' && typeof p.pos.y === 'number') {
            x = p.pos.x;
            y = p.pos.y;
        } else if (typeof p.x === 'number' && typeof p.y === 'number') {
            x = p.x;
            y = p.y;
        } else {
            // Fallback para valores padrão
            x = 0;
            y = 0;
        }

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    });

    // Garantir que temos bounds válidos
    if (minX === Infinity) minX = 0;
    if (maxX === -Infinity) maxX = 0;
    if (minY === Infinity) minY = 0;
    if (maxY === -Infinity) maxY = 0;

    return { minX, maxX, minY, maxY };
}

function normalizePoint(p, bounds) {
    return {
        x: ((p.x ?? (p.pos?.x ?? 0)) - bounds.minX) / (bounds.maxX - bounds.minX + 1e-6),
        y: ((p.y ?? (p.pos?.y ?? 0)) - bounds.minY) / (bounds.maxY - bounds.minY + 1e-6)
    };
}

function getAngle(p, cx, cy) {
    return Math.atan2((p.y ?? (p.pos?.y ?? 0)) - cy, (p.x ?? (p.pos?.x ?? 0)) - cx);
}

// Função para gerar explicitamente os pontos de referência para uma letra, sem depender de estado global
function generateReferencePoints(char, type) {

    // Criar um ambiente isolado para gerar os pontos
    const tempLetterPoints = [];
    const tempLetterBoxes = [];
    const originalLetterPoints = window.letterPoints;
    const originalLetterBoxes = window.letterBoxes;

    try {
        // Substituir temporariamente o estado global
        window.letterPoints = tempLetterPoints;
        window.letterBoxes = tempLetterBoxes;

        // Gerar pontos para esta letra específica
        if (typeof window.createVectorLetterSingle === 'function') {
            window.createVectorLetterSingle(char, 0, 0);
            const refPoints = tempLetterPoints.map(p => ({ ...p }));

            // Verificar se os pontos têm segmentos diferentes
            const segments = [...new Set(refPoints.map(p => p.segment))].sort();

            return refPoints;
        }
        return [];
    } finally {
        // Restaurar estado global original
        window.letterPoints = originalLetterPoints;
        window.letterBoxes = originalLetterBoxes;
    }
}

// NOVA FUNÇÃO: Exportar apenas fonte grelha (sem mexer na vetorial)
async function exportarFonteGrelhaSeparada(gridLetterGroups = null, audioState = null) {
    // Não verificar exportState.isExporting aqui porque pode estar a ser chamada durante uma exportação maior

    let prevFlockingVisibility = null;

    try {
        exportState.isExporting = true;
        exportState.errors = [];
        exportState.exportedFonts = [];

        // Forçar segmento 0 ativo durante exportação
        if (typeof segmentSystemState !== 'undefined' && segmentSystemState.segmentVisibility) {
            prevFlockingVisibility = segmentSystemState.segmentVisibility[0];
            segmentSystemState.segmentVisibility[0] = true;
        }

        // Usar parâmetros passados ou capturar estado
        const finalAudioState = audioState || captureCurrentAudioState();
        let finalGridLetterGroups = gridLetterGroups;

        // Se não foram passados dados, detectar automaticamente
        if (!finalGridLetterGroups) {
            // Verificar se há pontos de letra visíveis
            if (typeof window.letterPoints === 'undefined' || !window.letterPoints || window.letterPoints.length === 0) {
                throw new Error("Nenhuma letra visível no canvas. Digite algo primeiro!");
            }

            // --- APENAS FONTE GRELHA ---
            // Separar apenas pontos de grelha
            finalGridLetterGroups = new Map();



            window.letterPoints.forEach(point => {
                // Coletar TODOS os pontos de grelha, independentemente do segmento
                const isGrid = point.renderType === 'grid';

                if (point.character && point.character.trim() !== '' && isGrid) {
                    if (!finalGridLetterGroups.has(point.character)) {
                        finalGridLetterGroups.set(point.character, []);
                    }
                    finalGridLetterGroups.get(point.character).push(point);
                }
            });

            // Permitir que a mesma letra exista em ambos os tipos (diferentes instâncias)
            const gridKeys = Array.from(finalGridLetterGroups.keys());
            const hasVectorPoints = gridKeys.filter(key =>
                window.letterPoints.some(p =>
                    p.character === key &&
                    (p.renderType === 'vector' || (p.renderType === undefined && p.segment !== 0))
                )
            );

            if (hasVectorPoints.length > 0) {
            }
        }



        if (finalGridLetterGroups.size === 0) {
            throw new Error("Nenhuma letra grelha encontrada para exportação!");
        }

        // Exportar apenas fonte grelha (letras visíveis)
        const visibleLetters = Array.from(finalGridLetterGroups.keys());

        // Para grelha: exportar apenas as letras visíveis, não o alfabeto completo
        const allLettersGroup = new Map();

        // Adicionar todas as letras visíveis ao grupo
        visibleLetters.forEach(letter => {
            const originalVisiblePoints = finalGridLetterGroups.get(letter) || [];



            // Verificar se há letterBoxes disponíveis
            let gridBoxes = [];
            if (window.letterBoxes && window.letterBoxes.length > 0) {
                const letterBoxes = window.letterBoxes.filter(box => box.character === letter);
                if (letterBoxes.length > 0) {
                    gridBoxes = letterBoxes;
                }
            }

            // Se não houver letterBoxes, criar a partir dos pontos
            if (gridBoxes.length === 0 && originalVisiblePoints.length > 0) {
                gridBoxes = originalVisiblePoints.map(point => {
                    const px = point.pos ? point.pos.x : point.x;
                    const py = point.pos ? point.pos.y : point.y;
                    return {
                        x: px - 25,
                        y: py - 25,
                        width: 50,
                        height: 50,
                        character: letter
                    };
                });
            }

            allLettersGroup.set(letter, {
                points: originalVisiblePoints,
                gridBoxes: gridBoxes
            });
        });

        // Criar fonte com todas as letras visíveis

        let fontData = null;
        let filename = null;

        try {
            fontData = await createFontFromGridLetters(allLettersGroup, finalAudioState, visibleLetters.join(''));

            if (!fontData) {
                throw new Error('FontData não foi criado!');
            }

            // Verificar se fontData tem a estrutura correta
            if (!fontData.glyphs || fontData.glyphs.length === 0) {
                throw new Error('FontData não tem glyphs válidos!');
            }

            // Salvar arquivo
            filename = `Grid_${visibleLetters.join('')}.otf`;
            await saveFontFile(fontData, filename);

        } catch (fontError) {
            throw fontError;
        }

        // Adicionar ao estado de exportação
        if (fontData && filename) {
            exportState.exportedFonts.push({
                filename: filename,
                type: 'grid',
                letters: visibleLetters,
                letterCount: visibleLetters.length,
                glyphCount: fontData.glyphs.length,
                success: true
            });
        }

    } catch (error) {
        exportState.errors.push(error.message);
        throw error;
    } finally {
        // Restaurar visibilidade original do segmento 0
        if (typeof segmentSystemState !== 'undefined' && segmentSystemState.segmentVisibility && prevFlockingVisibility !== null) {
            segmentSystemState.segmentVisibility[0] = prevFlockingVisibility;
        }
        exportState.isExporting = false;
    }
}

// NOVA FUNÇÃO: Exportação vetorial original (sem mexer na lógica existente)
async function exportarFonteVectorOriginal(vectorLetterGroups, audioState) {
    const alphabet = EXPORT_CONFIG.alphabet;
    const visibleLetters = Array.from(vectorLetterGroups.keys());

    for (const visibleLetter of visibleLetters) {
        // Salvar estado global relevante
        const prevAudioState = window._lastAudioState ? JSON.parse(JSON.stringify(window._lastAudioState)) : null;
        const prevLetterPoints = Array.isArray(window.letterPoints) ? window.letterPoints.slice() : [];
        const prevLetterBoxes = Array.isArray(window.letterBoxes) ? window.letterBoxes.slice() : [];

        // Limpar estado global
        window.letterPoints = [];
        window.letterBoxes = [];

        try {
            // Obter os pontos originais da letra vetorial visível do canvas
            const originalVisiblePoints = vectorLetterGroups.get(visibleLetter) || [];

            // Para vector: manter lógica original - exportar alfabeto completo
            const allLettersGroup = new Map();

            for (const char of alphabet) {
                if (char === visibleLetter) {
                    allLettersGroup.set(char, originalVisiblePoints);
                } else {
                    // Usar a função original para vector
                    const charPoints = getLetterPointsSync(char, 'vector', originalVisiblePoints);
                    allLettersGroup.set(char, charPoints);
                }
            }

            const fontData = await createFontFromVisibleLetters(allLettersGroup, 'vector', audioState, visibleLetter);
            const filename = `Vector_${visibleLetter}.otf`;
            await saveFontFile(fontData, filename);
            exportState.exportedFonts.push({
                filename: filename,
                type: 'vector',
                letter: visibleLetter,
                letterIndex: visibleLetter.charCodeAt(0),
                isBase: true,
                letterCount: alphabet.length, // Alfabeto completo para vector
                glyphCount: fontData.glyphs.length,
                success: true
            });

            // Timer entre downloads para evitar conflitos
            if (visibleLetters.length > 1) {
                await new Promise(resolve => setTimeout(resolve, EXPORT_CONFIG.vectorExportDelay));
            }

        } finally {
            // Restaurar estado global
            window._lastAudioState = prevAudioState;
            window.letterPoints = prevLetterPoints;
            window.letterBoxes = prevLetterBoxes;
        }
    }
}

// NOVA FUNÇÃO: Criar glyph de grelha específico (sem mexer na vetorial)
function createGridGlyphFromPointsSeparada(char, charPoints, audioState = null) {

    // Garantir estrutura
    let points = charPoints.points || [];
    let gridBoxes = charPoints.gridBoxes || [];

    // Fallback: se não houver gridBoxes mas houver pontos, criar um gridBox para cada ponto
    if ((!gridBoxes || gridBoxes.length === 0) && points.length > 0) {
        gridBoxes = points.map(p => {
            const px = p.pos ? p.pos.x : p.x;
            const py = p.pos ? p.pos.y : p.y;
            return {
                x: px - 25,
                y: py - 25,
                width: 50,
                height: 50,
                character: char
            };
        });
    }

    // Fallback: se não houver pontos nem gridBoxes, exportar um quadrado central grande - IDÊNTICO AO CANVAS
    if ((points.length === 0) && (gridBoxes.length === 0)) {
        const advanceWidth = calculateProportionalAdvanceWidth(char);
        const size = UNITS_PER_EM * 0.4;
        const centeringOffset = (advanceWidth - size) / 2;
        const half = size / 2;
        const centerX = centeringOffset + half;
        const centerY = UNITS_PER_EM / 2;

        return {
            unicode: char.charCodeAt(0),
            name: getGlyphName(char),
            advanceWidth: advanceWidth,
            contours: [
                // Linha superior
                {
                    type: 'path',
                    points: [
                        { x: centerX - half, y: centerY - half, type: 'move' },
                        { x: centerX + half, y: centerY - half, type: 'line' }
                    ]
                },
                // Linha direita
                {
                    type: 'path',
                    points: [
                        { x: centerX + half, y: centerY - half, type: 'move' },
                        { x: centerX + half, y: centerY + half, type: 'line' }
                    ]
                },
                // Linha inferior
                {
                    type: 'path',
                    points: [
                        { x: centerX + half, y: centerY + half, type: 'move' },
                        { x: centerX - half, y: centerY + half, type: 'line' }
                    ]
                },
                // Linha esquerda
                {
                    type: 'path',
                    points: [
                        { x: centerX - half, y: centerY + half, type: 'move' },
                        { x: centerX - half, y: centerY - half, type: 'line' }
                    ]
                }
            ],
            metadata: {
                renderType: 'grid',
                fallback: true,
                isNarrowLetter: isNarrowLetter(char)
            }
        };
    }

    // Remover duplicados por posição
    const seen = new Set();
    const uniquePoints = [];
    points.forEach(point => {
        const px = point.pos ? point.pos.x : point.x;
        const py = point.pos ? point.pos.y : point.y;
        const key = `${Math.round(px)}_${Math.round(py)}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniquePoints.push(point);
        }
    });

    // Bounding box dos pontos grid
    const allX = uniquePoints.map(p => (p.pos ? p.pos.x : p.x));
    const allY = uniquePoints.map(p => (p.pos ? p.pos.y : p.y));
    const minX = Math.min(...allX);
    const maxX = Math.max(...allX);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);
    const width = maxX - minX || 1;
    const height = maxY - minY || 1;
    const positionScale = UNITS_PER_EM / Math.max(width, height);
    const baselineOffset = -minY * positionScale;

    const contours = [];



    // Criar grelha baseada nos dados reais do canvas
    if (gridBoxes && gridBoxes.length > 0) {

        gridBoxes.forEach((box, boxIndex) => {
            const boxSize = box.width * positionScale;
            const cx = (box.x + box.width / 2 - minX) * positionScale;
            const cy = (maxY - (box.y + box.height / 2)) * positionScale + baselineOffset;
            const half = boxSize / 2;

            // 1. Contorno do quadrado da grelha (linhas simples sem lineWidth para serem contornos)
            contours.push({
                type: 'path',
                points: [
                    { x: cx - half, y: cy - half, type: 'move' },
                    { x: cx + half, y: cy - half, type: 'line' }
                ]
            });
            contours.push({
                type: 'path',
                points: [
                    { x: cx + half, y: cy - half, type: 'move' },
                    { x: cx + half, y: cy + half, type: 'line' }
                ]
            });
            contours.push({
                type: 'path',
                points: [
                    { x: cx + half, y: cy + half, type: 'move' },
                    { x: cx - half, y: cy + half, type: 'line' }
                ]
            });
            contours.push({
                type: 'path',
                points: [
                    { x: cx - half, y: cy + half, type: 'move' },
                    { x: cx - half, y: cy - half, type: 'line' }
                ]
            });

            // 2. Encontrar partículas dentro deste quadrado
            const boxPoints = points.filter(p => {
                const px = p.pos ? p.pos.x : p.x;
                const py = p.pos ? p.pos.y : p.y;
                return px >= box.x && px <= box.x + box.width &&
                    py >= box.y && py <= box.y + box.height;
            });


            // Usar os segmentos reais do canvas
            if (boxPoints.length > 0) {

                // Criar um segmento para cada ponto real do canvas
                boxPoints.forEach((point, pointIndex) => {
                    const px = point.pos ? point.pos.x : point.x;
                    const py = point.pos ? point.pos.y : point.y;


                    // Posicionar o segmento dentro do quadrado (como no canvas)
                    // Usar a posição relativa dentro do quadrado em vez da posição absoluta
                    const relativeX = (px - box.x) / box.width; // 0 a 1 dentro do quadrado
                    const relativeY = (py - box.y) / box.height; // 0 a 1 dentro do quadrado

                    // Converter para coordenadas do glyph dentro do quadrado
                    const glyphX = cx - boxSize / 2 + (relativeX * boxSize) + 30;
                    const glyphY = cy - boxSize / 2 + (relativeY * boxSize);

                    // Usar o segmento real do canvas
                    const segment = point.segment !== undefined ? point.segment : 0;


                    // Criar partícula baseada no segmento real com reações de áudio
                    let particleSize = boxSize * 0.2;
                    // Ajustar para segmento 0 baseado no canvas
                    if (segment === 0) {
                        particleSize = boxSize * 0.1; // Menor mas visível
                    }
                    const particleContours = createParticleContour(glyphX, glyphY, segment, particleSize, audioState);
                    contours.push(...particleContours);
                });
            } else {
                // Fallback: criar um segmento centralizado se não houver pontos reais
                const finalX = cx;
                const finalY = cy;
                const segment = 0; // Segmento padrão


                let particleSize = boxSize * 0.3;
                // Ajustar para segmento 0 baseado no canvas
                if (segment === 0) {
                    particleSize = boxSize * 0.15; // Menor mas visível
                }
                const particleContours = createParticleContour(finalX, finalY, segment, particleSize, audioState);
                contours.push(...particleContours);
            }
        });

    } else {


        // Fallback: grelha simples 2x2
        const gridSize = UNITS_PER_EM * 0.3;
        const startX = (UNITS_PER_EM - gridSize) / 2;
        const startY = (UNITS_PER_EM - gridSize) / 2;
        const cellSize = gridSize / 2;

        for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 2; col++) {
                const x = startX + col * cellSize;
                const y = startY + row * cellSize;
                const centerX = x + cellSize / 2;
                const centerY = y + cellSize / 2;

                // Contorno do quadrado (linhas simples sem lineWidth para serem contornos)
                contours.push({
                    type: 'path',
                    points: [
                        { x: x, y: y, type: 'move' },
                        { x: x + cellSize, y: y, type: 'line' }
                    ]
                });
                contours.push({
                    type: 'path',
                    points: [
                        { x: x + cellSize, y: y, type: 'move' },
                        { x: x + cellSize, y: y + cellSize, type: 'line' }
                    ]
                });
                contours.push({
                    type: 'path',
                    points: [
                        { x: x + cellSize, y: y + cellSize, type: 'move' },
                        { x: x, y: y + cellSize, type: 'line' }
                    ]
                });
                contours.push({
                    type: 'path',
                    points: [
                        { x: x, y: y + cellSize, type: 'move' },
                        { x: x, y: y, type: 'line' }
                    ]
                });

                // Criar apenas um segmento centralizado dentro do quadrado
                const finalX = centerX;
                const finalY = centerY;

                // Atribuir segmento aleatoriamente como no canvas
                const segment = Math.floor(Math.random() * 5); // 0 a 4 aleatoriamente

                // Criar partícula baseada no segmento com reações de áudio
                let particleSize = cellSize * 0.3; // Tamanho adequado para ser visível
                // Ajustar para segmento 0 baseado no canvas
                if (segment === 0) {
                    particleSize = cellSize * 0.15; // Menor mas visível
                }
                const particleContours = createParticleContour(finalX, finalY, segment, particleSize, audioState);
                contours.push(...particleContours);
            }
        }
    }



    // Fallback final: se não houver contornos, exportar um quadrado central - IDÊNTICO AO CANVAS
    if (contours.length === 0) {
        const size = UNITS_PER_EM * 0.4;
        const half = size / 2;
        const centerX = UNITS_PER_EM / 2;
        const centerY = UNITS_PER_EM / 2;

        // Linha superior
        contours.push({
            type: 'path',
            points: [
                { x: centerX - half, y: centerY - half, type: 'move' },
                { x: centerX + half, y: centerY - half, type: 'line' }
            ]
        });

        // Linha direita
        contours.push({
            type: 'path',
            points: [
                { x: centerX + half, y: centerY - half, type: 'move' },
                { x: centerX + half, y: centerY + half, type: 'line' }
            ]
        });

        // Linha inferior
        contours.push({
            type: 'path',
            points: [
                { x: centerX + half, y: centerY + half, type: 'move' },
                { x: centerX - half, y: centerY + half, type: 'line' }
            ]
        });

        // Linha esquerda
        contours.push({
            type: 'path',
            points: [
                { x: centerX - half, y: centerY + half, type: 'move' },
                { x: centerX - half, y: centerY - half, type: 'line' }
            ]
        });
    }

    // Calcular advanceWidth proporcional para grid também
    const glyphWidth = width * positionScale;
    const advanceWidth = calculateProportionalAdvanceWidth(char, glyphWidth);

    // Centralizar o glifo horizontalmente
    const centeringOffset = (advanceWidth - glyphWidth) / 2;

    // Aplicar offset de centralização a todos os contornos
    const centeredContours = contours.map(contour => {
        if (contour.type === 'path' && contour.points) {
            return {
                ...contour,
                points: contour.points.map(point => ({
                    ...point,
                    x: point.x + centeringOffset
                }))
            };
        }
        return contour;
    });

    return {
        unicode: char.charCodeAt(0),
        name: getGlyphName(char),
        advanceWidth: advanceWidth,
        contours: centeredContours,
        metadata: {
            renderType: 'grid',
            pointCount: uniquePoints.length,
            gridBoxCount: gridBoxes.length,
            isDirect: true,
            exportType: 'grid_squares_with_particle_grid',
            centeringOffset: centeringOffset,
            isNarrowLetter: isNarrowLetter(char)
        }
    };
}

// NOVA FUNÇÃO: Criar fonte de grelha específica (sem mexer na vetorial)
async function createFontFromGridLetters(letterGroups, audioState = null, referenceName = "") {

    const glyphs = [];
    glyphs.push(createNotDefGlyph());
    const availableLetters = Array.from(letterGroups.keys());

    for (const char of availableLetters) {
        try {
            const rawCharPoints = letterGroups.get(char) || [];
            
            // Converter array de pontos para a estrutura esperada
            const charPoints = Array.isArray(rawCharPoints) ? 
                { points: rawCharPoints, gridBoxes: [] } : 
                rawCharPoints;
        
            const glyphData = createGridGlyphFromPoints(char, charPoints, audioState);
            if (glyphData) {
                glyphs.push(glyphData);
            }
        } catch (error) {
        }
    }

    // Nome único para fonte grelha
    const fontName = `SketchFont-Grid-${referenceName}`;

    const finalFontData = {
        familyName: fontName,
        styleName: 'Regular',
        version: '1.0',
        glyphs: glyphs,
        unitsPerEm: UNITS_PER_EM,
        ascender: ASCENDER,
        descender: DESCENDER,
        metadata: {
            renderType: 'grid',
            exportTime: new Date().toISOString(),
            visibleLetters: Array.from(letterGroups.keys()),
            totalGlyphs: glyphs.length
        }
    };

    return finalFontData;
}

// NOVA FUNÇÃO: Exportar segmentos com reações do canvas
async function exportarSegmentosComReacoes() {
    if (exportState.isExporting) {
        return;
    }

    try {
        exportState.isExporting = true;
        exportState.errors = [];
        exportState.exportedFonts = [];

        // CAPTURAR ESTADO DO ÁUDIO NO MOMENTO EXATO DA EXPORTAÇÃO
        const audioState = captureCurrentAudioState();

        // Garantir que o estado do áudio inclui todas as informações necessárias
        if (!audioState.spectrum || audioState.spectrum.length === 0) {
            // Criar estado de áudio simulado se não estiver disponível
            audioState.spectrum = new Array(128).fill(128); // Valores médios
            audioState.peakData = { peakCount: 1, visualMultiplier: 1.5, hasPeaks: true };
            audioState.frameCount = Date.now() * 0.01;
        }

        // Verificar se há pontos de letra visíveis
        if (typeof window.letterPoints === 'undefined' || !window.letterPoints || window.letterPoints.length === 0) {
            throw new Error("Nenhuma letra visível no canvas. Digite algo primeiro!");
        }

        // Agrupar pontos por caractere e segmento
        const letterSegmentGroups = new Map();

        window.letterPoints.forEach(point => {
            if (point.character && point.character.trim() !== '') {
                const char = point.character;
                const segment = point.segment !== undefined ? point.segment : 0;

                if (!letterSegmentGroups.has(char)) {
                    letterSegmentGroups.set(char, new Map());
                }

                const charSegments = letterSegmentGroups.get(char);
                if (!charSegments.has(segment)) {
                    charSegments.set(segment, []);
                }

                charSegments.get(segment).push(point);
            }
        });

        // Criar fonte com reações de segmento
        const glyphs = [];
        glyphs.push(createNotDefGlyph());

        for (const [char, segmentGroups] of letterSegmentGroups) {
            try {
                const glyphData = await createSegmentReactiveGlyph(char, segmentGroups, audioState);
                if (glyphData) {
                    glyphs.push(glyphData);
                }
            } catch (error) {
            }
        }

        // Adicionar glyphs vazios para caracteres não presentes
        for (const char of EXPORT_CONFIG.alphabet) {
            if (!letterSegmentGroups.has(char)) {
                const emptyGlyph = createEmptyGlyph(char);
                glyphs.push(emptyGlyph);
            }
        }

        // Criar dados da fonte
        const fontData = {
            familyName: `SketchFont-SegmentReactive-${Date.now()}`,
            styleName: 'Regular',
            version: '1.0',
            glyphs: glyphs,
            unitsPerEm: UNITS_PER_EM,
            ascender: ASCENDER,
            descender: DESCENDER,
            metadata: {
                renderType: 'segment_reactive',
                exportTime: new Date().toISOString(),
                visibleLetters: Array.from(letterSegmentGroups.keys()),
                totalGlyphs: glyphs.length,
                audioState: {
                    hasAudio: audioState.spectrum.length > 0,
                    peakCount: audioState.peakData.peakCount,
                    visualMultiplier: audioState.peakData.visualMultiplier,
                    timestamp: audioState.timestamp
                }
            }
        };

        // Salvar fonte
        const filename = `SketchFont-SegmentReactive-${Date.now()}.otf`;
        await saveFontFile(fontData, filename);

        exportState.exportedFonts.push({
            filename: filename,
            type: 'segment_reactive',
            timestamp: Date.now(),
            audioState: audioState
        });


    } catch (error) {
        exportState.errors.push(error.message);

        throw error;
    } finally {
        exportState.isExporting = false;
    }
}

// Função para criar glyph com reações de segmento
async function createSegmentReactiveGlyph(char, segmentGroups, audioState) {
    const contours = [];
    const segmentReactions = new Map();

    // Processar cada segmento separadamente
    for (const [segment, points] of segmentGroups) {
        if (points.length === 0) continue;

        // Calcular reações para este segmento
        const reactions = calculateSegmentReactions(segment, audioState, audioState.frameCount, points[0]);
        segmentReactions.set(segment, reactions);

        // Criar contornos baseados no segmento e suas reações
        const segmentContours = createSegmentContours(points, segment, reactions, audioState);
        contours.push(...segmentContours);
    }

    // Calcular advanceWidth
    const advanceWidth = calculateProportionalAdvanceWidth(char);

    return {
        unicode: char.charCodeAt(0),
        name: getGlyphName(char),
        advanceWidth: advanceWidth,
        contours: contours,
        metadata: {
            renderType: 'segment_reactive',
            segmentCount: segmentGroups.size,
            segments: Array.from(segmentGroups.keys()),
            segmentReactions: Object.fromEntries(segmentReactions),
            isNarrowLetter: isNarrowLetter(char)
        }
    };
}

// Função para criar contornos baseados no segmento
function createSegmentContours(points, segment, reactions, audioState) {
    const contours = [];
    const positionScale = (UNITS_PER_EM / 1000) * 10;

    // Calcular bounds dos pontos
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    points.forEach(point => {
        const x = point.pos?.x ?? point.x ?? 0;
        const y = point.pos?.y ?? point.y ?? 0;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
    });

    const baselineOffset = -minY * positionScale;

    points.forEach(point => {
        const x = point.pos?.x ?? point.x ?? 0;
        const y = point.pos?.y ?? point.y ?? 0;

        // Normalizar posição
        const normX = (x - minX) * positionScale;
        const normY = (maxY - y) * positionScale + baselineOffset;

        // Aplicar reações de movimento
        const finalX = normX + (reactions.movementX || 0);
        const finalY = normY + (reactions.movementY || 0);

        // Criar contorno baseado no segmento
        switch (segment) {
            case 0: // Flocking - círculos
            case 1: // Bass - círculos pulsantes
            case 2: // Mid - círculos ondulantes
            case 4: // Organic - círculos orgânicos
                const size = reactions.size * positionScale * 1.5;
                const circleContour = createCircleContour(finalX, finalY, size);
                circleContour.segment = segment;
                circleContour.audioReactions = reactions;
                contours.push(circleContour);

                // Adicionar glow se necessário
                if (reactions.glow > 5) {
                    const glowSize = size + reactions.glow * 0.3;
                    const glowContour = createCircleContour(finalX, finalY, glowSize);
                    glowContour.segment = segment;
                    glowContour.audioReactions = { ...reactions, isGlow: true };
                    contours.push(glowContour);
                }
                break;

            case 3: // Treble - linhas dinâmicas
                if (reactions.angle !== undefined && reactions.length !== undefined) {
                    const x1 = finalX + Math.cos(reactions.angle) * reactions.length;
                    const y1 = finalY + Math.sin(reactions.angle) * reactions.length;
                    const x2 = finalX - Math.cos(reactions.angle) * reactions.length;
                    const y2 = finalY - Math.sin(reactions.angle) * reactions.length;

                    const lineContour = createLineContour([{ x: x1, y: y1 }, { x: x2, y: y2 }], reactions.thickness);
                    if (lineContour) {
                        lineContour.segment = segment;
                        lineContour.audioReactions = reactions;
                        contours.push(lineContour);
                    }

                    // Adicionar glow para linhas
                    if (reactions.glow > 3) {
                        const glowLine = createLineContour([{ x: x1, y: y1 }, { x: x2, y: y2 }], reactions.thickness * 2);
                        if (glowLine) {
                            glowLine.segment = segment;
                            glowLine.audioReactions = { ...reactions, isGlow: true };
                            contours.push(glowLine);
                        }
                    }
                }
                break;
        }
    });

    return contours;
}

