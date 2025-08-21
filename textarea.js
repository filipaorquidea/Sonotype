const PLACEHOLDER_TEXT = "J";
const ABS_MIN_FONT_SIZE = 250;
const ABS_MAX_FONT_SIZE = 500;
const LINE_SPACING = 1.05; // espaçamento entre linhas mais compacto
let customText = "";
let cursorPosition = 0;
let selectionStart = null;
let selectionEnd = null;
let lastBlink = 0;
let showCursor = true;
let letterSegmentsMap = new Map();

function clearLetterSegments() {
  letterSegmentsMap.clear();
}

let persistentMinFontSize = null; // será atualizado dinamicamente

// Modificar updateText para usar apenas a implementação personalizada
function updateText() {
  if (window._DEBUG_TEXTAREA);

  // Antes de limpar, guardar mapeamentos existentes
  const preservedSegments = new Map();

  // Limpar todos os mapeamentos
  window.activeLetterSegments.clear();

  // Restaurar mapeamentos preservados
  for (const [key, value] of preservedSegments) {
    window.activeLetterSegments.set(key, value);
  }

  // Atualizar texto e recriar partículas
  letterPoints = [];
  letterBoxes = [];
  window.letterBoxes = letterBoxes;


  if (customText && customText.length > 0) {
    createMixedLetterPoints();
    window.letterBoxes = letterBoxes;
  }

  quadTree.clear();

  const availableWidth = TEXTAREA_WIDTH;
  const availableHeight = TEXTAREA_HEIGHT;
  fontSize = calculateOptimalFontSize(customText, availableWidth, availableHeight);
}

// Função para adicionar quebra de linha
function addLineBreak() {
  // Sempre tenta inserir uma quebra de linha, respeitando os limites
  const testText = customText.substring(0, cursorPosition) + '\n' + customText.substring(cursorPosition);
  if (!wouldExceedLimitsForText(testText)) {
    customText = testText;
    cursorPosition++;
    updateText();
  }
}

// Função para lidar com teclas pressionadas
function handleKeyDown(e) {
  // Prevenir comportamento padrão para todas as teclas de input
    e.preventDefault();
  if (e.ctrlKey || e.metaKey) {
    // Copy
    if (e.key.toLowerCase() === 'c' && hasSelection()) {
      const sel = getSelectedText();
      navigator.clipboard.writeText(sel);
      return;
    }
    // Paste
    if (e.key.toLowerCase() === 'v') {
      navigator.clipboard.readText().then(text => {
        insertTextAtCursor(text);
      });
      return;
    }
    // Select all
    if (e.key.toLowerCase() === 'a') {
      selectionStart = 0;
      selectionEnd = customText.length;
      cursorPosition = customText.length;
      return;
    }
  }
  switch (e.key) {
    case 'Backspace':
      if (hasSelection()) {
        deleteSelection();
      } else if (cursorPosition > 0) {
        customText = customText.slice(0, cursorPosition - 1) + customText.slice(cursorPosition);
        cursorPosition--;
        updateText();
      }
      clearSelection();
      break;
    case 'Delete':
      if (hasSelection()) {
        deleteSelection();
      } else if (cursorPosition < customText.length) {
        customText = customText.slice(0, cursorPosition) + customText.slice(cursorPosition + 1);
        updateText();
      }
      clearSelection();
      break;
    case 'Enter':
      insertTextAtCursor('\n');
      break;
    case 'ArrowLeft':
      if (e.shiftKey) {
        if (selectionStart === null) selectionStart = cursorPosition;
        cursorPosition = Math.max(0, cursorPosition - 1);
        selectionEnd = cursorPosition;
      } else {
        cursorPosition = Math.max(0, cursorPosition - 1);
        clearSelection();
      }
      break;
    case 'ArrowRight':
      if (e.shiftKey) {
        if (selectionStart === null) selectionStart = cursorPosition;
        cursorPosition = Math.min(customText.length, cursorPosition + 1);
        selectionEnd = cursorPosition;
      } else {
        cursorPosition = Math.min(customText.length, cursorPosition + 1);
        clearSelection();
      }
      break;
    case 'ArrowUp':
    case 'ArrowDown':
      // Opcional: mover cursor entre linhas (não implementado aqui)
      break;
    default:
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        insertTextAtCursor(e.key);
      }
      break;
  }
}

// Função para verificar e aplicar limites de texto
function checkTextLimit() {
  let text = customText;
  const availableWidth = TEXTAREA_WIDTH - (TEXT_PADDING * 2);
  const availableHeight = TEXTAREA_HEIGHT - (TEXT_PADDING * 2);

  // Calcular fontSize ótimo para o texto atual
  fontSize = calculateOptimalFontSize(text, availableWidth, availableHeight);

  // Se o fontSize ficou muito pequeno, cortar o texto
  if (fontSize <= 200) {
    text = truncateTextToFit(text, availableWidth, availableHeight);
    customText = text;
    // Ajustar cursor se necessário
    cursorPosition = Math.min(cursorPosition, text.length);
    fontSize = calculateOptimalFontSize(text, availableWidth, availableHeight);
  }

  // Verificar se o texto cabe na altura disponível
  const lines = calculateTextLines(text, availableWidth, fontSize);
  const totalHeight = lines.length * fontSize * 1.2;

  if (totalHeight > availableHeight) {
    text = truncateTextToFitHeight(text, availableWidth, availableHeight);
    customText = text;
    cursorPosition = Math.min(cursorPosition, text.length);
  }

  createMixedLetterPoints();
}

function calculateOptimalFontSize(text, maxWidth, maxHeight) {
  if (!text || text.length === 0) return 200;

  // Ignorar quebras de linha, tudo numa só linha
  const singleLine = text.replace(/\n/g, ' ');
  let minSize = 400;
  let maxSize = 600;
  let bestFontSize = minSize;

  while (minSize <= maxSize) {
    let midSize = Math.floor((minSize + maxSize) / 2);
    let lineWidth = calculateTextWidth(singleLine, midSize);
    let totalHeight = midSize * 1.2;
    if (lineWidth <= maxWidth && totalHeight <= maxHeight) {
      bestFontSize = midSize;
      minSize = midSize + 1;
    } else {
      maxSize = midSize - 1;
    }
  }

  return bestFontSize;
}

// Função para criar pontos para uma única linha, reduzindo fontSize até ao mínimo
// Função para criar partículas animadas para o placeholder "J"
function createPlaceholderLetterPoints() {
  letterPoints = [];
  letterBoxes = [];
  window.quadTree.clear();
  
  // Configurar fonte para o placeholder
  const placeholderFontSize = 300; // Tamanho maior para o placeholder
  textSize(placeholderFontSize);
  textFont(window.font);
  
  // Calcular posição central
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Calcular dimensões do "J" para centralizar corretamente
  const charWidth = textWidth(PLACEHOLDER_TEXT);
  const ascent = textAscent();
  const descent = textDescent();
  const charHeight = ascent + descent;
  
  // Centralizar horizontalmente e verticalmente
  const startX = centerX - charWidth / 2;
  const startY = centerY - charHeight / 2 - BASELINE; // Centralizar sem ajuste de baseline
  
  // Criar partículas para o "J" placeholder
  const charIndex = 0;
  const placeholderPoints = createVectorLetterSingle(PLACEHOLDER_TEXT, charIndex, startX, startY, null);
  
  // Aplicar cor mais suave para o placeholder
  if (placeholderPoints && placeholderPoints.length > 0) {
    placeholderPoints.forEach(point => {
      // Usar uma cor mais suave (cinza claro) para o placeholder
      point.color = color(100, 0, 50, 80); // HSB: cinza claro com transparência
    });
  }
}

function createMixedLetterPoints() {
  letterPoints = [];
  letterBoxes = [];
  window.quadTree.clear();
  const availableWidth = TEXTAREA_WIDTH - (TEXT_PADDING * 2);
  let fontSz = fontSize;
  textSize(fontSz);
  textFont(window.font);
  const ascent = textAscent();
  const descent = textDescent();
  
  // Se não há texto, criar partículas para o placeholder "J"
  if (!customText || customText.length === 0) {
    createPlaceholderLetterPoints();
    return;
  }
  
  const lines = wrapTextToWidth(customText, availableWidth, fontSz, window.font);
  // Primeira linha fixa no topo
  const startY = TEXT_PADDING + ascent;
  for (let l = 0; l < lines.length; l++) {
    let line = lines[l];
    let cutLine = line;
    textSize(fontSz);
    textFont(window.font);
    while (textWidth(cutLine) > availableWidth && cutLine.length > 0) {
      cutLine = cutLine.slice(0, -1);
    }
    let lineWidth = textWidth(cutLine);
    let startX = TEXT_PADDING + (availableWidth - lineWidth) / 2;
    let currentX = startX;
    // Linhas crescem para cima
    let y = startY - (lines.length - 1 - l) * fontSz * LINE_SPACING;
    for (let i = 0; i < cutLine.length; i++) {
      let char = cutLine[i];
      let nextChar = i < cutLine.length - 1 ? cutLine[i + 1] : null;
      textSize(fontSz);
      textFont(window.font);
      let charAdvance = textWidth(char);
      let nextX = currentX + charAdvance;
      if (nextX > TEXTAREA_WIDTH - TEXT_PADDING) break;
      let charIndex = letterPoints.length;
      if (char === ' ') {
        currentX = nextX;
        continue;
      }
      if ((i + l) % 2 === 0) {
        currentX = createVectorLetterSingle(char, charIndex, currentX, y - fontSz, nextChar);
      } else {
        currentX = createGridLetterSingle(char, charIndex, currentX, y - fontSz, null, nextChar);
      }
      // Não sobrescrever currentX com nextX - deixar as funções de criação de letras
      // retornarem a posição correta com kerning aplicado
    }
  }
  fontSize = fontSz;
  persistentMinFontSize = fontSz;
}

// Função para calcular largura de texto (mantida igual)
function calculateTextWidth(text, fontSz) {
  if (!text || text.length === 0) return 0;

  let testCanvas = createGraphics(500, 100);
  testCanvas.textFont(window.font);
  testCanvas.textSize(fontSz);
  let width = testCanvas.textWidth(text);
  testCanvas.remove();
  return width;
}

function getLetterBounds(buffer) {
  let minX = buffer.width;
  let maxX = 0;
  let minY = buffer.height;
  let maxY = 0;
  let pixelsFound = 0;

  // Escanear o buffer para encontrar os limites da letra
  for (let y = 0; y < buffer.height; y++) {
    for (let x = 0; x < buffer.width; x++) {
      let index = (x + y * buffer.width) * 4;
      if (buffer.pixels[index] > 200) { // Se o pixel faz parte da letra
        minX = min(minX, x);
        maxX = max(maxX, x);
        minY = min(minY, y);
        maxY = max(maxY, y);
        pixelsFound++;
      }
    }
  }

  // Se não encontrou nenhum pixel, usar valores padrão
  if (pixelsFound === 0) {
    return {
      minX: buffer.width * 0.25,
      maxX: buffer.width * 0.75,
      minY: buffer.height * 0.25,
      maxY: buffer.height * 0.75
    };
  }

  // Adicionar uma pequena margem aos limites para garantir cobertura completa
  const margin = 5;
  minX = max(0, minX - margin);
  maxX = min(buffer.width - 1, maxX + margin);
  minY = max(0, minY - margin);
  maxY = min(buffer.height - 1, maxY + margin);

  return { minX, maxX, minY, maxY };
}

function wrapTextToWidth(text, maxWidth, fontSize, fontObj) {
  let result = [];
  if (!text || typeof text !== 'string') {
    return result;
  }
  let paragraphs = text.split('\n');
  textSize(fontSize);
  textFont(fontObj);
  for (let p = 0; p < paragraphs.length; p++) {
    let words = paragraphs[p].split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      let testLine = line.length > 0 ? line + ' ' + words[n] : words[n];
      let w = textWidth(testLine);
      if (w > maxWidth && line.length > 0) {
        result.push(line);
        line = words[n];
        // Força quebra de palavras/letras longas
        while (textWidth(line) > maxWidth) {
          let cut = 1;
          while (cut < line.length && textWidth(line.substring(0, cut)) <= maxWidth) cut++;
          result.push(line.substring(0, cut - 1));
          line = line.substring(cut - 1);
        }
      } else {
        line = testLine;
      }
    }
    // Última linha do parágrafo
    while (textWidth(line) > maxWidth) {
      let cut = 1;
      while (cut < line.length && textWidth(line.substring(0, cut)) <= maxWidth) cut++;
      result.push(line.substring(0, cut - 1));
      line = line.substring(cut - 1);
    }
    if (line.length > 0) result.push(line);
  }
  return result;
}

function tryAddCharToCustomText(char) {
  const testText = customText.substring(0, cursorPosition) + char + customText.substring(cursorPosition);
  const availableWidth = TEXTAREA_WIDTH - (TEXT_PADDING * 2);
  const availableHeight = TEXTAREA_HEIGHT - (TEXT_PADDING * 2);

  // Calcular fontSize ótimo para o texto simulado
  let minSize = ABS_MIN_FONT_SIZE;
  let maxSize = ABS_MAX_FONT_SIZE;
  let bestFontSize = minSize;

  while (minSize <= maxSize) {
    let midSize = Math.floor((minSize + maxSize) / 2);
    const lines = wrapTextToWidth(testText, availableWidth, midSize, font);
    const totalHeight = lines.length * midSize * 1.2;
    if (totalHeight <= availableHeight) {
      bestFontSize = midSize;
      minSize = midSize + 1;
    } else {
      maxSize = midSize - 1;
    }
  }

  if (bestFontSize >= ABS_MIN_FONT_SIZE) {
    customText = testText;
    cursorPosition++;
    updateText();
  }
}

function hasSelection() {
  return selectionStart !== null && selectionEnd !== null && selectionStart !== selectionEnd;
}
function clearSelection() {
  selectionStart = null;
  selectionEnd = null;
}
function deleteSelection() {
  if (!hasSelection()) return;
  const [start, end] = [Math.min(selectionStart, selectionEnd), Math.max(selectionStart, selectionEnd)];
  customText = customText.slice(0, start) + customText.slice(end);
  cursorPosition = start;
  clearSelection();
  updateText();
}
function getSelectedText() {
  if (!hasSelection()) return "";
  const [start, end] = [Math.min(selectionStart, selectionEnd), Math.max(selectionStart, selectionEnd)];
  return customText.slice(start, end);
}

function fitsInBox(text) {
  const availableWidth = TEXTAREA_WIDTH - (TEXT_PADDING * 2);
  const availableHeight = TEXTAREA_HEIGHT - (TEXT_PADDING * 2);
  let minSize = ABS_MIN_FONT_SIZE;
  let maxSize = ABS_MAX_FONT_SIZE;
  let bestFontSize = minSize;
  let fits = false;
  while (minSize <= maxSize) {
    let midSize = Math.floor((minSize + maxSize) / 2);
    const lines = wrapTextToWidth(text, availableWidth, midSize, font);
    const totalHeight = lines.length * midSize * LINE_SPACING;
    let anyLineTooLong = false;
    for (let line of lines) {
      if (textWidth(line) > availableWidth) {
        anyLineTooLong = true;
        break;
      }
    }
    if (!anyLineTooLong && totalHeight <= availableHeight) {
      bestFontSize = midSize;
      minSize = midSize + 1;
      fits = true;
    } else {
      maxSize = midSize - 1;
    }
  }
  // Só cabe se mesmo no mínimo couber na altura
  const lines = wrapTextToWidth(text, availableWidth, ABS_MIN_FONT_SIZE, font);
  const minTotalHeight = lines.length * ABS_MIN_FONT_SIZE * LINE_SPACING;
  if (minTotalHeight > availableHeight) return false;
  return true;
}

function updateText() {
  const availableWidth = TEXTAREA_WIDTH - (TEXT_PADDING * 2);
  const availableHeight = TEXTAREA_HEIGHT - (TEXT_PADDING * 2);
  let minSize = ABS_MIN_FONT_SIZE;
  let maxSize = ABS_MAX_FONT_SIZE;
  let bestFontSize = minSize;
  while (minSize <= maxSize) {
    let midSize = Math.floor((minSize + maxSize) / 2);
    textSize(midSize);
    textFont(window.font);
    const ascent = textAscent();
    const descent = textDescent();
    const lines = wrapTextToWidth(customText, availableWidth, midSize, window.font);
    let anyLineTooLong = false;
    for (let line of lines) {
      textSize(midSize);
      textFont(font);
      if (textWidth(line) > availableWidth) {
        anyLineTooLong = true;
        break;
      }
    }
    // Aceita se o fundo do bloco não ultrapassa o fundo do canvas
    const blockBottom = TEXT_PADDING + ascent + (lines.length - 1) * midSize * LINE_SPACING + descent;
    const fitsVertically = blockBottom <= TEXTAREA_HEIGHT;
    if (!anyLineTooLong && fitsVertically) {
      bestFontSize = midSize;
      minSize = midSize + 1;
    } else {
      maxSize = midSize - 1;
    }
  }
  fontSize = bestFontSize;
 
  createMixedLetterPoints();
}

function drawTextArea() {
  // O placeholder "J" agora é desenhado pelas partículas animadas
  // Não precisamos desenhar nada aqui, pois as partículas são desenhadas por drawLetterPoints()
}

function getCursorLineAndPos(lines) {
  let chars = 0;
  const availableWidth = TEXTAREA_WIDTH - (TEXT_PADDING * 2);
  let y = (TEXTAREA_HEIGHT - (lines.length * fontSize * 1.2)) / 2 + fontSize;
  for (let i = 0; i < lines.length; i++) {
    if (cursorPosition <= chars + lines[i].length) {
      textSize(fontSize);
      textFont(font);
      const sub = lines[i].substring(0, cursorPosition - chars);
      const w = textWidth(sub);
      return {
        x: TEXTAREA_WIDTH / 2 - textWidth(lines[i]) / 2 + w,
        y: y
      };
    }
    chars += lines[i].length;
    y += fontSize * 1.2;
  }
  return {
    x: TEXTAREA_WIDTH / 2,
    y: y
  };
}

function setupCustomTextArea() {
  window.addEventListener('keydown', handleKeyDown);
  createMixedLetterPoints();
}

function getLineHeight(line, fontSize) {
  let maxHeight = 0;
  for (let i = 0; i < line.length; i++) {
    let char = line[i];
    // Criar um buffer temporário para obter bounds reais
    let buffer = createGraphics(fontSize * 2, fontSize * 2);
    buffer.textFont(font);
    buffer.textSize(fontSize);
    buffer.textAlign(CENTER, BASELINE);
    buffer.background(0);
    buffer.fill(255);
    buffer.text(char, buffer.width / 2, buffer.height * 0.7);
    buffer.loadPixels();
    let bounds = getLetterBounds(buffer);
    let charHeight = bounds.maxY - bounds.minY;
    if (charHeight > maxHeight) maxHeight = charHeight;
    buffer.remove();
  }
  // Adiciona um pequeno padding extra (ex: 10% do fontSize)
  return maxHeight + fontSize * 0.1;
}

function getTotalTextHeight(lines, fontSize) {
  let total = 0;
  for (let l = 0; l < lines.length; l++) {
    total += getLineHeight(lines[l], fontSize);
  }
  return total;
}

function insertTextAtCursor(text) {
  if (hasSelection()) {
    deleteSelection();
    // deleteSelection já chama updateText, por isso não chamar aqui
    // O texto novo será inserido depois
  }
  const testText = customText.slice(0, cursorPosition) + text + customText.slice(cursorPosition);
  const availableWidth = TEXTAREA_WIDTH - (TEXT_PADDING * 2);
  const availableHeight = TEXTAREA_HEIGHT - (TEXT_PADDING * 2);

  // Busca binária para encontrar o maior fontSize possível para o texto simulado
  let minSize = ABS_MIN_FONT_SIZE;
  let maxSize = ABS_MAX_FONT_SIZE;
  let bestFontSize = minSize;
  let fits = false;
  while (minSize <= maxSize) {
    let midSize = Math.floor((minSize + maxSize) / 2);
    textSize(midSize);
    textFont(window.font);
    const ascent = textAscent();
    const descent = textDescent();
    const lines = wrapTextToWidth(testText, availableWidth, midSize, window.font);
    let anyLineTooLong = false;
    for (let line of lines) {
      textSize(midSize);
      textFont(window.font);
      if (textWidth(line) > availableWidth) {
        anyLineTooLong = true;
        break;
      }
    }
    // Aceita se o fundo do bloco não ultrapassa o fundo do canvas
    const blockBottom = TEXT_PADDING + ascent + (lines.length - 1) * midSize * LINE_SPACING + descent;
    const fitsVertically = blockBottom <= TEXTAREA_HEIGHT;
    if (!anyLineTooLong && fitsVertically) {
      bestFontSize = midSize;
      minSize = midSize + 1;
      fits = true;
    } else {
      maxSize = midSize - 1;
    }
  }
  // Só aceita se couber, mesmo no mínimo (vertical e horizontal)
  const linesMin = wrapTextToWidth(testText, availableWidth, ABS_MIN_FONT_SIZE, window.font);
  let anyLineTooLongMin = false;
  textSize(ABS_MIN_FONT_SIZE);
  textFont(window.font);
  const ascentMin = textAscent();
  const descentMin = textDescent();
  for (let line of linesMin) {
    textSize(ABS_MIN_FONT_SIZE);
    textFont(window.font);
    if (textWidth(line) > availableWidth) {
      anyLineTooLongMin = true;
      break;
    }
  }
  const blockBottomMin = TEXT_PADDING + ascentMin + (linesMin.length - 1) * ABS_MIN_FONT_SIZE * LINE_SPACING + descentMin;
  let canFit = blockBottomMin <= TEXTAREA_HEIGHT && !anyLineTooLongMin;
  if (fits && canFit) {
    customText = testText;
    cursorPosition += text.length;
    clearSelection();
    updateText();
  }
}
