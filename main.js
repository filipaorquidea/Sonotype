// Variáveis globais
let textArea; // Nossa área de texto simplificada
let canvas;

//variaveis texto
let font;
let letterBoxes = []; // Make sure letterBoxes is also properly declared
let letterCellsByChar = [];
let fontSize = 600;
let letterSpacing = 0.5;
let textInput;
let cursorVisible = true;
let cursorBlinkTime = 0;

// Constants for textarea dimensions
let TEXTAREA_WIDTH;
let TEXTAREA_HEIGHT;
const TEXT_PADDING = 5;

// botoes 
let dropdowns = [];

// Variáveis para elementos da interface responsiva
let titleElement;
let installationButton;
let randomizeButton;
let toggleButton;
let anatomyDebugBtn;
let playPauseButton;
let audioDebugBtn;
let informationBtn;

//variaveis grelha
let rows = 10;
let cols = 10;
let gridSpacing;
let noiseOffset = 0.01;
let audioContext;
let analyser;
let dataArray;
let audioLevel = 0;
let gridPoints = [];

// Container dimensions
let containerWidth = 200;
let containerHeight = 200;
let containerX;
let containerY;

//variaveis som
let mic, fft;
let micLevel = 0;
let bassValue = 0;
let midValue = 0;
let trebleValue = 0;
let peakDetector;
let showAudioDebug = false;
let bass = bassValue;
let mid = midValue;
let treble = trebleValue;

let exportVariations = 3;

// Buffer para detecção de picos mais estável
let audioBuffer = [];
const BUFFER_SIZE = 5;

//variaveis desenho dos segmentos e comportamento
let quadTree;
let isInForm = true;
let formStrength = 0.5;
let elasticFactor = 0.001;
let sharedRange = new Circle(0, 0, 70);
let segmentAnimations = [0, 1, 2, 3, 4];
let interactionSegment = 0; // O segmento que está atualmente a interagir com o rato
let isUserInteracting = false; // Flag para controlar se o user está a interagir
let interactionRadius = 100; // Raio de interação do rato
let interactionStrength = 0.3; // Força da interação do rato
let mode = 'geometric';
let currentModeSegmentCount = 5; // Número de segmentos para o modo atual
let lastRenderMode = null; // Último modo de renderização usado
// ===== VARIÁVEIS GLOBAIS PARA CONTROLE DE SEGMENTOS =====
window.segmentSystemState = {
  currentModeSegmentCount: 5, // Número padrão de segmentos
  lastRenderMode: null,
  segmentAnimations: [0, 1, 2, 3, 4], // Animações padrão para 5 segmentos
  segmentVisibility: { 0: true, 1: true, 2: true, 3: true, 4: true }, // Visibilidade dos segmentos
  letterSegmentCounts: new Map(), // Armazenar contagem por letra
  isRandomizing: false
};

const activeLetterSegments = new Map();
window.activeLetterSegments = activeLetterSegments; // Make globally accessible

// Variáveis para controlo de camara
let capture;
let prevFrame;
let currFrame;
let motionPixels = [];
let cameraActive = false;
let cameraInteractionPoints = [];
let selectedSegmentForCamera = -1; // -1 significa nenhum segmento selecionado
let motionBuffer;

// Configurações de deteção de movimento
let motionThreshold = 30;      // Limiar para considerar movimento (0-255)
let skipPixels = 20;           // skip pixels para melhorar performance
let maxInteractionPoints = 5;  // Número máximo de pontos de interação
let motionDecayRate = 0.95;    // Taxa de decaimento para pontos de movimento
let cameraDebug = true;        // Mostrar debug da câmera

// Variáveis modo de instalacao
let installationMode = false;
let installationTimer = 0;
let installationInterval = 15000;
let exhibitButtonFadeEnabled = false; // Flag para controlar o efeito de fade do botão
let exhibitButtonMonitor = null; // Monitor para verificar o estado do botão
let shuffleMessageOpacity = 0; // Opacidade da mensagem de shuffle (0-255)
let shuffleMessageFadeDirection = 1; // Direção do fade (1 = aumentar, -1 = diminuir)

// Função para verificar se o botão Exhibit Mode deve ter estilos aplicados
function shouldApplyStylesToExhibitButton() {
  return !(installationMode || exhibitButtonFadeEnabled);
}

// Função para monitorar e corrigir o estado do botão Exhibit Mode
function startExhibitButtonMonitor() {
  if (exhibitButtonMonitor) {
    clearInterval(exhibitButtonMonitor);
  }
  
  exhibitButtonMonitor = setInterval(() => {
    const exhibitBtn = selectAll('button').find(btn => btn.html() === 'Exhibit Mode');
    if (exhibitBtn && !exhibitButtonFadeEnabled && !installationMode) {
      // Se o fade não deve estar ativo, forçar a remoção
      if (exhibitBtn.style('opacity') === '0') {
        // Forçando remoção do fade do botão Exhibit Mode
        exhibitBtn.style('opacity', '1');
        exhibitBtn.style('pointer-events', 'auto');
        exhibitBtn.style('transition', 'all 0.3s ease');
      }
    }
  }, 100); // Verificar a cada 100ms
}

// Função para parar o monitor
function stopExhibitButtonMonitor() {
  if (exhibitButtonMonitor) {
    clearInterval(exhibitButtonMonitor);
    exhibitButtonMonitor = null;
  }
}

// Densidade inicial (tamanho do grid)
let particleDensity = 10;
let particleDensitySlider;
let particleDensityLabel;

window.darkMode = false;
let showAnatomyDebug = false;
let isPaused = false;
let pauseBuffer;

// Variáveis globais para controlo de segmentos
let segmentCheckboxes = [];
let segmentVisibility = {
  0: true, // Flocking points
  1: true, // Pulsing points
  2: true, // Wave points
  3: true, // Line segments
  4: true  // Orbital points
};

// Nomes dos segmentos para display
const segmentNames = {
  0: 'Flocking Points',
  1: 'Pulsing Points',
  2: 'Wave Points',
  3: 'Rotation Lines',
  4: 'Orbital Points'
};

let capturer;
let isRecordingGif = false;
let frameCount = 0;
let gifFrameCount = 0;
const TOTAL_FRAMES = 30;

let isRecordingVideo = false;
let videoRecorder;
let recordButton;
let recordingMessage;
let gifRecordingMessage;
let statusMessage;
//----------------------------------------------------------------------------------------------------------

// Sistema simples de mensagens para OTF
function showOTFMessage(message, type = 'info', duration = 3000) {
  // Remover mensagem anterior
  if (statusMessage) {
    statusMessage.remove();
    statusMessage = null;
  }
  
  // Calcular posição
  const margin = Math.max(30, windowWidth * 0.02);
  const topMargin = Math.max(15, windowHeight * 0.02);
  const titleSize = Math.max(22, Math.min(42, windowWidth * 0.037));
  
  // Criar mensagem
  statusMessage = createDiv(message);
  statusMessage.position(margin, topMargin + titleSize + 30);
  statusMessage.style('font-family', 'Roboto, sans-serif');
  statusMessage.style('font-size', '14px'); // Voltar ao tamanho fixo mas responsivo via CSS
  statusMessage.style('font-weight', 'bold');
  statusMessage.style('z-index', '1000');
  statusMessage.style('padding', '8px 16px'); // Voltar ao padding em pixels
  statusMessage.style('border-radius', '4px'); // Voltar ao border-radius em pixels
  statusMessage.style('max-width', '300px'); // Voltar ao max-width em pixels
  
  // Cores baseadas no tipo
  if (type === 'success') {
    statusMessage.style('color', '#008800');
    statusMessage.style('background-color', '#f0fff0');
    statusMessage.style('border', '1px solid #008800');
  } else if (type === 'error') {
    statusMessage.style('color', '#ff0000');
    statusMessage.style('background-color', '#fff0f0');
    statusMessage.style('border', '1px solid #ff0000');
  } else {
    statusMessage.style('color', darkMode ? '#000000' : '#FFFFFF');
    statusMessage.style('background-color', darkMode ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.7)');
    statusMessage.style('border', `1px solid ${darkMode ? '#666666' : '#cccccc'}`);
  }
  
  // Auto-remover
  if (duration > 0) {
    setTimeout(() => {
      if (statusMessage) {
        statusMessage.remove();
        statusMessage = null;
      }
    }, duration);
  }
  
  return statusMessage;
}

// funcoes gerais -------------------------------------------
function preload() {
  font = loadFont('data/Roboto.ttf');
  window.font = font;
}

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 100);
  pixelDensity(1);
  frameRate(30);

  setupAudio();

 window.quadTree = new QuadTree(new Boundary(width / 2, height / 2, width, height), 10);

  // Criar elementos da interface com posicionamento responsivo
  createResponsiveInterface();

  TEXTAREA_WIDTH = window.innerWidth;
  TEXTAREA_HEIGHT = window.innerHeight * 0.7;

  // Configurar o blink do cursor
  setInterval(() => {
    cursorVisible = !cursorVisible;
  }, 530); // 530ms é um tempo padrão de piscada de cursor

  setupButtonStyles();
  setupCameraControls();
  setupParticleControls();
  setupSegmentSystem();
  createSegmentControls();
  setupCustomTextArea();
  setupOrientationListener();

  // Iniciar o monitor do botão Exhibit Mode
  startExhibitButtonMonitor();

  if (typeof window !== 'undefined') {
    window.letterBoxes = letterBoxes;
    // Exportar função de mensagens OTF
    window.showOTFMessage = showOTFMessage;
  }
}

// Função para criar interface responsiva
function createResponsiveInterface() {
  // Criar título
  titleElement = createElement('text', 'Sonotype');
  titleElement.style('font-family', 'Roboto');
  titleElement.style('font-size', 'clamp(2rem, 5vw, 4rem)');
  titleElement.style('font-weight', 'bold');
  titleElement.style('color', darkMode ? '#000000' : '#FFFFFF');

  // Criar botões
  installationButton = createButton('Exhibit Mode');
  installationButton.mousePressed(function () {
    toggleInstallationMode();
  });

  randomizeButton = createButton('Shuffle Animations');
  randomizeButton.mousePressed(() => {
    randomizeSegments();
  });

  toggleButton = createButton('Switch Theme');
  toggleButton.mousePressed(toggleTheme);

  anatomyDebugBtn = createButton('Guidelines');
  anatomyDebugBtn.mousePressed(debugAnatomy);

  playPauseButton = createButton('Freeze');
  playPauseButton.mousePressed(() => {
    isPaused = !isPaused;
    playPauseButton.html(isPaused ? 'Unfreeze' : 'Freeze');
    
    // Reposicionar botões após mudança de texto
    updateResponsiveLayout();

    if (isPaused) {
      // Criar buffer e copiar o estado atual do canvas
      pauseBuffer = createGraphics(width, height);
      pauseBuffer.copy(get(), 0, 0, width, height, 0, 0, width, height);
    } else {
      // Limpar o buffer quando despausar
      if (pauseBuffer) {
        pauseBuffer.remove();
        pauseBuffer = null;
      }
    }
  });

  audioDebugBtn = createButton('Audio Tech');
  audioDebugBtn.mousePressed(toggleAudioDebug, drawAudioDebug);

  informationBtn = createButton('info');
  informationBtn.mousePressed(informations);

  // Criar dropdown de export
  dropdowns.push(createDropdown('Export', 0, 0, ['GIF', 'OTF', 'Video']));

  // Aplicar layout responsivo inicial
  updateResponsiveLayout();
}

// Função para atualizar layout responsivo
// Função helper para aplicar estilos responsivos aos botões
function applyResponsiveButtonStyles(btn, buttonWidth, buttonHeight, fontSize, buttonPadding, darkMode, installationMode, buttonText) {
  btn.style('width', buttonWidth + 'px');
  btn.style('height', buttonHeight + 'px');
  btn.style('font-size', fontSize + 'px');
  btn.style('padding', buttonPadding + 'px');
  
  // Não aplicar estilos ao botão Exhibit Mode se estiver no modo de instalação
  if (!(buttonText === 'Exhibit Mode' && installationMode)) {
    btn.style('color', darkMode ? '#000000' : '#FFFFFF');
    btn.style('background', 'none');
    btn.style('border', `1px solid ${darkMode ? '#000000' : '#FFFFFF'}`);
    btn.style('cursor', 'pointer');
    btn.style('transition', 'all 0.3s ease');
  }
}

function updateResponsiveLayout() {
  // Verificar se é uma tela pequena e usar layout específico
  if (isSmallScreen()) {
    updateResponsiveLayoutForSmallScreens();
    return;
  }

  // Sistema de dimensões responsivas baseado em viewport com valores apropriados
  const buttonHeight = Math.max(36, windowHeight * 0.042); // 36px mínimo
  const buttonPadding = Math.max(3, windowWidth * 0.005); // 3px mínimo  
  const fontSize = Math.max(11, Math.min(15, windowWidth * 0.011)); // Entre 11px e 15px
  const titleSize = Math.max(22, Math.min(42, windowWidth * 0.037)); // Entre 22px e 42px
  
  // Calcular posições responsivas baseadas em viewport
  const margin = Math.max(75, windowWidth * 0.02); // 75px mínimo
  const topMargin = Math.max(15, windowHeight * 0.02); // 15px mínimo
  
  titleElement.style('font-size', titleSize + 'px'); // Voltar aos pixels com cálculo responsivo
  
  // Calcular posição Y centralizada para os botões (alinhar com o centro do título)
  const titleCenterY = topMargin + (titleSize / 2);
  const buttonCenterY = titleCenterY - (buttonHeight / 2) + 7; // Ajustar para centralizar com o centro do título

  // Calcular largura dos botões baseada no texto e espaço disponível
  const availableWidth = width - (margin * 2);
  const titleWidth = titleSize * 7; // Aumentado para dar mais espaço ao título
  const remainingWidth = availableWidth - titleWidth - buttonPadding;
  
  // Definir larguras baseadas no texto de cada botão (garantir que todo texto seja visível)
  const buttonWidths = {
    'Exhibit Mode': Math.max(100, 'Exhibit Mode'.length * fontSize * 0.7 + 16),
    'Shuffle Animations': Math.max(130, 'Shuffle Animations'.length * fontSize * 0.7 + 16),
    'Switch Theme': Math.max(100, 'Switch Theme'.length * fontSize * 0.7 + 16),
    'Guidelines': Math.max(90, 'Guidelines'.length * fontSize * 0.7 + 16),
    'Freeze': Math.max(70, 'Freeze'.length * fontSize * 0.7 + 16),
    'Unfreeze': Math.max(80, 'Unfreeze'.length * fontSize * 0.7 + 16),
    'Audio Tech': Math.max(90, 'Audio Tech'.length * fontSize * 0.7 + 16),
    'info': Math.max(60, 'info'.length * fontSize * 0.7 + 16),
    'Export': Math.max(70, 'Export'.length * fontSize * 0.7 + 16)
  };

  // Calcular largura total dos botões (incluindo o botão Export com dropdown)
  const allButtons = [
    { button: installationButton, text: 'Exhibit Mode' },
    { button: randomizeButton, text: 'Shuffle Animations' },
    { button: toggleButton, text: 'Switch Theme' },
    { button: anatomyDebugBtn, text: 'Guidelines' },
    { button: playPauseButton, text: isPaused ? 'Unfreeze' : 'Freeze' },
    { button: audioDebugBtn, text: 'Audio Tech' },
    { button: dropdowns.length > 0 ? dropdowns[0].button : null, text: 'Export' },
    { button: informationBtn, text: 'info' }
  ];

  const dropdownWidth = buttonWidths['Export'];
  const totalButtonWidth = allButtons.reduce((sum, btn) => {
    if (btn.button && btn.text === 'Export') {
      return sum + buttonWidths['Export'];
    }
    return sum + buttonWidths[btn.text];
  }, 0);
  const totalPadding = (allButtons.length + 1) * buttonPadding; // +1 para o dropdown
  const totalButtonsWidth = totalButtonWidth + totalPadding;
  
  // Calcular a largura total do conjunto (título + espaçamento + botões)
  const titleActualWidth = titleSize * 5.5; // Largura aproximada do título "Sonotype"
  const spaceBetweenTitleAndButtons = 20; // Espaçamento entre título e botões
  const totalSetWidth = titleActualWidth + spaceBetweenTitleAndButtons + totalButtonsWidth;
  
  // Centralizar o conjunto completo na tela
  const setStartX = (windowWidth - totalSetWidth) / 2;
  
  // Posicionar título como parte do conjunto centralizado
  titleElement.position(setStartX, topMargin);
  
  // Posicionar botões após o título
  const buttonsStartX = setStartX + titleActualWidth + spaceBetweenTitleAndButtons;

  // Verificar se há espaço suficiente para uma linha
  if (totalButtonsWidth > remainingWidth) {
    // Reorganizar em múltiplas linhas para garantir que todo texto seja visível
    organizeButtonsInMultipleRows(allButtons, buttonWidths, dropdownWidth, margin, titleWidth, buttonPadding, topMargin, buttonHeight, fontSize);
  } else {
    // Posicionar botões em uma linha como parte do conjunto centralizado
    let currentX = buttonsStartX;
    
    // Posicionar todos os botões em sequência (incluindo o botão Export)
    allButtons.forEach((btnData, index) => {
      const btn = btnData.button;
      const buttonText = btnData.text;
      const buttonWidth = buttonWidths[buttonText];
      
      if (btn) {
        btn.position(currentX, buttonCenterY);
        applyResponsiveButtonStyles(btn, buttonWidth, buttonHeight, fontSize, buttonPadding, darkMode, installationMode, buttonText);
        
        // Se for o botão Export, configurar o dropdown
        if (buttonText === 'Export' && dropdowns.length > 0) {
          // Atualizar posições dos itens do dropdown
          dropdowns[0].items.forEach((item, index) => {
            item.position(currentX, buttonCenterY + buttonHeight + 5 + (index * (buttonHeight + 2)));
            item.style('width', buttonWidth + 'px');
            item.style('height', buttonHeight + 'px');
            item.style('font-size', fontSize + 'px');
            item.style('color', darkMode ? '#000000' : '#FFFFFF');
            item.style('background', 'none');
            item.style('border', `1px solid ${darkMode ? '#000000' : '#FFFFFF'}`);
            item.style('cursor', 'pointer');
            item.style('transition', 'all 0.3s ease');
          });
        }
        
        currentX += buttonWidth + buttonPadding;
      }
    });
  }

  // Atualizar posições dos dropdowns
  updateDropdownPositions();
}

// Função para detectar se é uma tela pequena
function isSmallScreen() {
  return windowWidth < 768;
}

// Função para detectar se é uma tela muito pequena
function isVerySmallScreen() {
  return windowWidth < 480;
}

// Função para reorganizar layout em telas pequenas
function updateResponsiveLayoutForSmallScreens() {
  if (isVerySmallScreen()) {
    // Layout muito compacto para telas muito pequenas
    const buttonHeight = 28;
    const buttonPadding = 2;
    const buttonFontSize = 9;
    const titleSize = 18;
    const margin = 8;
    const topMargin = 8;
    
    // Calcular largura do título
    const titleActualWidth = titleSize * 5.5;
    const spaceBetweenTitleAndButtons = 15;
    
    // Reorganizar botões em múltiplas linhas para telas muito pequenas
    const buttonWidths = {
      'Exhibit Mode': Math.max(60, 'Exhibit Mode'.length * buttonFontSize * 0.7 + 8),
      'Shuffle Animations': Math.max(80, 'Shuffle Animations'.length * buttonFontSize * 0.7 + 8),
      'Switch Theme': Math.max(60, 'Switch Theme'.length * buttonFontSize * 0.7 + 8),
      'Guidelines': Math.max(55, 'Guidelines'.length * buttonFontSize * 0.7 + 8),
      'Freeze': Math.max(45, 'Freeze'.length * buttonFontSize * 0.7 + 8),
      'Unfreeze': Math.max(50, 'Unfreeze'.length * buttonFontSize * 0.7 + 8),
      'Audio Tech': Math.max(55, 'Audio Tech'.length * buttonFontSize * 0.7 + 8),
      'info': Math.max(35, 'info'.length * buttonFontSize * 0.7 + 8),
      'Export': Math.max(45, 'Export'.length * buttonFontSize * 0.7 + 8)
    };
    
    const allButtons = [
      { button: installationButton, text: 'Exhibit Mode' },
      { button: randomizeButton, text: 'Shuffle Animations' },
      { button: toggleButton, text: 'Switch Theme' },
      { button: anatomyDebugBtn, text: 'Guidelines' },
      { button: playPauseButton, text: isPaused ? 'Unfreeze' : 'Freeze' },
      { button: audioDebugBtn, text: 'Audio Tech' },
      { button: dropdowns.length > 0 ? dropdowns[0].button : null, text: 'Export' },
      { button: informationBtn, text: 'info' }
    ];
    
    // Calcular largura total dos botões em duas linhas
    const firstRowButtons = allButtons.slice(0, 4);
    const secondRowButtons = allButtons.slice(4);
    
    const firstRowWidth = firstRowButtons.reduce((sum, btn) => sum + buttonWidths[btn.text] + buttonPadding, 0);
    const secondRowWidth = secondRowButtons.reduce((sum, btn) => sum + buttonWidths[btn.text] + buttonPadding, 0);
    
    // Centralizar conjunto título + primeira linha de botões
    const totalSetWidth = titleActualWidth + spaceBetweenTitleAndButtons + firstRowWidth;
    const setStartX = (windowWidth - totalSetWidth) / 2;
    
    // Posicionar título centralizado
    titleElement.position(setStartX, topMargin);
    titleElement.style('font-size', titleSize + 'px');
    
    // Calcular posições Y
    const titleCenterY = topMargin + (titleSize / 2);
    const buttonCenterY = titleCenterY - (buttonHeight / 2);
    
    // Primeira linha - posicionar após o título centralizado
    let currentX = setStartX + titleActualWidth + spaceBetweenTitleAndButtons;
    firstRowButtons.forEach(btnData => {
      const btn = btnData.button;
      const buttonText = btnData.text;
      const buttonWidth = buttonWidths[buttonText];
      
      if (btn) {
        btn.position(currentX, buttonCenterY);
        applyResponsiveButtonStyles(btn, buttonWidth, buttonHeight, buttonFontSize, buttonPadding, darkMode, installationMode, buttonText);
        currentX += buttonWidth + buttonPadding;
      }
    });
    
    // Segunda linha - centralizar independentemente
    const secondRowStartX = (windowWidth - secondRowWidth) / 2;
    currentX = secondRowStartX;
    secondRowButtons.forEach(btnData => {
      const btn = btnData.button;
      const buttonText = btnData.text;
      const buttonWidth = buttonWidths[buttonText];
      
      if (btn) {
        btn.position(currentX, buttonCenterY + buttonHeight + 5);
        applyResponsiveButtonStyles(btn, buttonWidth, buttonHeight, buttonFontSize, buttonPadding, darkMode, installationMode, buttonText);
        
        // Configurar dropdown se necessário
        if (buttonText === 'Export' && dropdowns.length > 0) {
          dropdowns[0].items.forEach((item, index) => {
            item.position(currentX, buttonCenterY + buttonHeight * 2 + 10 + (index * (buttonHeight + 2)));
            item.style('width', buttonWidth + 'px');
            item.style('height', buttonHeight + 'px');
            item.style('font-size', buttonFontSize + 'px');
            item.style('color', darkMode ? '#000000' : '#FFFFFF');
            item.style('background', 'none');
            item.style('border', `1px solid ${darkMode ? '#000000' : '#FFFFFF'}`);
            item.style('cursor', 'pointer');
            item.style('transition', 'all 0.3s ease');
          });
        }
        
        currentX += buttonWidth + buttonPadding;
      }
    });
    
    // Atualizar posições dos dropdowns
    updateDropdownPositions();
  } else if (isSmallScreen()) {
    // Layout compacto para telas pequenas (768px ou menos)
    const buttonHeight = 32;
    const buttonPadding = 3;
    const buttonFontSize = 11;
    const titleSize = 20;
    const margin = 20;
    const topMargin = 10;
    
    // Usar a função de múltiplas linhas com parâmetros ajustados para telas pequenas
    const titleActualWidth = titleSize * 5.5;
    const spaceBetweenTitleAndButtons = 15;
    const totalSetWidth = titleActualWidth + spaceBetweenTitleAndButtons + 400; // Estimativa para botões
    const setStartX = Math.max(10, (windowWidth - totalSetWidth) / 2);
    
    // Posicionar título
    titleElement.position(setStartX, topMargin);
    titleElement.style('font-size', titleSize + 'px');
    
    // Usar a função de organização em múltiplas linhas
    const buttonWidths = {
      'Exhibit Mode': Math.max(80, 'Exhibit Mode'.length * buttonFontSize * 0.7 + 12),
      'Shuffle Animations': Math.max(110, 'Shuffle Animations'.length * buttonFontSize * 0.7 + 12),
      'Switch Theme': Math.max(85, 'Switch Theme'.length * buttonFontSize * 0.7 + 12),
      'Guidelines': Math.max(75, 'Guidelines'.length * buttonFontSize * 0.7 + 12),
      'Freeze': Math.max(60, 'Freeze'.length * buttonFontSize * 0.7 + 12),
      'Unfreeze': Math.max(70, 'Unfreeze'.length * buttonFontSize * 0.7 + 12),
      'Audio Tech': Math.max(75, 'Audio Tech'.length * buttonFontSize * 0.7 + 12),
      'info': Math.max(50, 'info'.length * buttonFontSize * 0.7 + 12),
      'Export': Math.max(60, 'Export'.length * buttonFontSize * 0.7 + 12)
    };
    
    const allButtons = [
      { button: installationButton, text: 'Exhibit Mode' },
      { button: randomizeButton, text: 'Shuffle Animations' },
      { button: toggleButton, text: 'Switch Theme' },
      { button: anatomyDebugBtn, text: 'Guidelines' },
      { button: playPauseButton, text: isPaused ? 'Unfreeze' : 'Freeze' },
      { button: audioDebugBtn, text: 'Audio Tech' },
      { button: dropdowns.length > 0 ? dropdowns[0].button : null, text: 'Export' },
      { button: informationBtn, text: 'info' }
    ];
    
    organizeButtonsInMultipleRows(allButtons, buttonWidths, buttonWidths['Export'], setStartX, titleActualWidth, spaceBetweenTitleAndButtons, topMargin, buttonHeight, buttonFontSize);
  }
}

// Função para atualizar layout dos controles de partículas
function updateParticleControlsLayout() {
  if (particleDensityLabel && particleDensitySlider) {
    let margin, bottomMargin, fontSize, sliderWidth;
    
    if (isVerySmallScreen()) {
      margin = 10;
      bottomMargin = 200;
      fontSize = 10;
      sliderWidth = 120;
    } else if (isSmallScreen()) {
      margin = 15;
      bottomMargin = 250;
      fontSize = 12;
      sliderWidth = 140;
    } else {
      margin = Math.max(20, windowWidth * 0.02);
      bottomMargin = Math.max(280, windowHeight * 0.25);
      fontSize = Math.max(12, Math.min(16, windowWidth * 0.012));
      sliderWidth = Math.max(150, Math.min(200, windowWidth * 0.15));
    }
    
    // Posicionar label
    particleDensityLabel.position(margin, height - bottomMargin);
    particleDensityLabel.style('font-size', fontSize + 'px');
    particleDensityLabel.style('color', darkMode ? '#000000' : '#FFFFFF');
    
    // Posicionar slider
    particleDensitySlider.position(margin, height - bottomMargin + 30);
    particleDensitySlider.style('width', sliderWidth + 'px');
  }
}

// Função para atualizar layout dos controles de segmentos
function updateSegmentControlsLayout() {
  const segmentControls = select('#segment-controls');
  if (segmentControls) {
    let margin, bottomMargin, fontSize;
    
    if (isVerySmallScreen()) {
      margin = 10;
      bottomMargin = 150;
      fontSize = 9;
    } else if (isSmallScreen()) {
      margin = 15;
      bottomMargin = 180;
      fontSize = 11;
    } else {
      margin = Math.max(20, windowWidth * 0.02);
      bottomMargin = Math.max(200, windowHeight * 0.18);
      fontSize = Math.max(12, Math.min(16, windowWidth * 0.012));
    }
    
    // Posicionar container
    segmentControls.position(margin, height - bottomMargin);
    segmentControls.style('font-size', fontSize + 'px');
    segmentControls.style('color', darkMode ? '#000000' : '#FFFFFF');
    
    // Atualizar título
    const title = segmentControls.child('p');
    if (title) {
      title.style('font-size', fontSize + 'px');
      title.style('color', darkMode ? '#000000' : '#FFFFFF');
    }
    
    // Atualizar checkboxes
    segmentCheckboxes.forEach(checkbox => {
      if (checkbox) {
        // Aplicar estilos dinâmicos baseados no modo
        const checkboxElement = checkbox.elt.querySelector('input[type="checkbox"]');
        const labelElement = checkbox.elt.querySelector('label');
        
        if (checkboxElement) {
          checkboxElement.style.borderColor = darkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';
          checkboxElement.style.backgroundColor = 'transparent';
          
          if (checkboxElement.checked) {
            checkboxElement.style.backgroundColor = darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
            checkboxElement.style.borderColor = darkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)';
          }
        }
        
        if (labelElement) {
          labelElement.style.color = darkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)';
        }
      }
    });
  }
}

function draw() {
  // Debug removido
  
  background(darkMode ? 255 : 0);
  drawTextArea();

  // Controla a exibição dos itens dos dropdowns
  dropdowns.forEach(dd => {
    dd.items.forEach(item => {
      if (dd.show) item.show();
      else item.hide();
    });
  });

  if (isPaused && pauseBuffer) {
    // Se estiver pausado, apenas mostrar a imagem congelada
    image(pauseBuffer, 0, 0);
    return;
  }

  // Modo instalacao
  if (installationMode) {
    let currentTime = millis();
    if (currentTime - installationTimer >= installationInterval) {
      shuffleAnimations();
      applyAnimationMapping();
      installationTimer = currentTime;
    }

    // Mostrar contagem regressiva em posição que não interfira com o título
    let timeRemaining = ceil((installationInterval - (currentTime - installationTimer)) / 1000);
    
    // Verificar se o cursor está sobre a área da mensagem
    let messageX = 10;
    let messageY = height - 30;
    let messageWidth = textWidth('Next Shuffle: ' + timeRemaining + 's');
    let messageHeight = 15;
    
    let isHovering = mouseX >= messageX && mouseX <= messageX + messageWidth && 
                     mouseY >= messageY - messageHeight && mouseY <= messageY;
    
    // Aplicar efeito de fade baseado no hover (similar ao botão)
    if (isHovering) {
      shuffleMessageOpacity += (255 - shuffleMessageOpacity) * 0.1; // Fade in
    } else {
      shuffleMessageOpacity += (30 - shuffleMessageOpacity) * 0.1; // Fade out para opacidade muito baixa
    }
    
    // Definir explicitamente cor branca com opacidade, ignorando qualquer fill anterior
    push(); // Salvar estado atual
    colorMode(RGB);
    fill(255, 255, 255, shuffleMessageOpacity);
    noStroke();
    textSize(13);
    text('Next Shuffle: ' + timeRemaining + 's', messageX, messageY);
    pop(); // Restaurar estado
  }

  updateAudioValues();
  drawAudioDebug();

  quadTree = new QuadTree(new Boundary(width / 2, height / 2, width, height), 4);
  for (let p of window.letterPoints) {
    quadTree.insert(p);
  }

  drawLetterPoints(); // Reativado para verificar se há duplicação
  drawLetterPointsGrid(); // Esta é a função principal com segmentos
  drawLetterBoxes();
  drawAnatomyDebug();
  // Desenhar visualização da grade com comportamentos de segmentos
  updateAndDrawGridPoints();


  // Processar a câmera antes de desenhar
  processCamera();

  if (cameraActive && cameraDebug) {
    push();
    translate(width - 160, height - 120);

    if (capture && capture.loadedmetadata) {
      // converter para preto e branco antes de mostrar
      let grayImage = createImage(capture.width, capture.height);
      capture.loadPixels();
      grayImage.loadPixels();
      for (let i = 0; i < capture.pixels.length; i += 4) {
        let avg = (capture.pixels[i] + capture.pixels[i + 1] + capture.pixels[i + 2]) / 3;
        grayImage.pixels[i] = avg;
        grayImage.pixels[i + 1] = avg;
        grayImage.pixels[i + 2] = avg;
        grayImage.pixels[i + 3] = 255;
      }
      grayImage.updatePixels();
      image(grayImage, 0, 0, 160, 120);
    }

    pop();
  }


  // Destacar o segmento selecionado para câmera
  if (selectedSegmentForCamera !== -1) {
    for (let p of window.letterPoints) {
      if (p.segment === selectedSegmentForCamera) {
        // Desenhar um indicador sutil
        stroke(100, 100, 20);
        strokeWeight(1);
        noFill();
      }
    }
  }

  // Desenhar os pontos de interação da câmera no canvas principal
  if (cameraActive && selectedSegmentForCamera !== -1) {
    for (let point of cameraInteractionPoints) {
      noFill();
      stroke(60, 100, 100, point.strength * 70);
      strokeWeight(2);
      let radius = point.radius || interactionRadius;
    }
  }

  // Debug removido

  // Não mostrar mensagem no canvas para não aparecer no GIF

  // Remover mensagem de gravação do canvas para não aparecer na gravação
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Atualizar layout responsivo
  updateResponsiveLayout();
  
  // Atualizar controles de partículas
  updateParticleControlsLayout();
  
  // Atualizar controles de segmentos
  updateSegmentControlsLayout();
  
  let areaWidth = Math.min(700, window.innerWidth * 0.9);
  let areaHeight = Math.max(120, window.innerHeight * 0.18);
  if (textArea) {
    textArea.style('width', areaWidth + 'px');
    textArea.style('height', areaHeight + 'px');
    textArea.style('left', '50%');
    textArea.style('top', `calc(50% - ${areaHeight / 2}px)`);
    textArea.style('transform', 'translate(-50%, 0)');
  }
  TEXTAREA_WIDTH = areaWidth;
  TEXTAREA_HEIGHT = areaHeight;
  if (typeof QuadTree !== 'undefined' && typeof Boundary !== 'undefined') {
    quadTree = new QuadTree(new Boundary(width / 2, height / 2, width, height), 10);
  }
  shuffleAnimations();
  createMixedLetterPoints();
}

function mouseClicked() {
  if (!cameraActive) return;

  // Verificar se clicou em uma partícula
  for (let i = 0; i < window.letterPoints.length; i++) {
    const p = window.letterPoints[i];
    const d = dist(mouseX, mouseY, p.pos.x, p.pos.y);

    if (d < 15) {
      // Verificar se este segmento existe nesta letra (baseado em numSegments)
      if (!p.numSegments || p.originalSegment >= p.numSegments) {
        // Segmento não existe
        return;
      }

      // Se clicou na partícula e o segmento é válido, seleciona para interação da câmera
      if (selectedSegmentForCamera === p.segment) {
        selectedSegmentForCamera = -1; // Desselecionar se já estava selecionado
      } else {
        // Verificar se o segmento clicado é um dos segmentos originais da letra
        if (p.originalSegment !== p.segment) {
          // Segmento não é original desta letra
          return;
        }
        selectedSegmentForCamera = p.segment;
      }
      return;
    }
  }
}

function setupButtonStyles() {
  // Selecionar todos os botões
  selectAll('button').forEach(btn => {
    btn.style('color', darkMode ? '#000000' : '#FFFFFF');
    btn.style('background', 'none'); // Remover background
    btn.style('border', `1px solid ${darkMode ? '#000000' : '#FFFFFF'}`);
    btn.style('border-radius', '8px');
    btn.style('padding', '8px 16px');
    btn.style('cursor', 'pointer');
    btn.style('transition', 'all 0.3s ease');
  });
}

// Função auxiliar para aplicar estilos de botão com border-radius
function applyButtonStyles(element) {
  element.style('color', darkMode ? '#000000' : '#FFFFFF');
  element.style('background', 'none');
  element.style('border', `1px solid ${darkMode ? '#000000' : '#FFFFFF'}`);
  element.style('border-radius', '8px');
  element.style('cursor', 'pointer');
  element.style('transition', 'all 0.3s ease');
}
//----------------------------------------------------------------------------------------------------------

//funcionalidades ---------------------------------------

//funcoes da camara
function setupCamera() {
  capture = createCapture(VIDEO);
  capture.size(320, 240);
  capture.hide();

  // Inicializar frames
  motionBuffer = createGraphics(320, 240);
  prevFrame = createImage(capture.width, capture.height);
  currFrame = createImage(capture.width, capture.height);

}

function processCamera() {

  if (!capture || !capture.loadedmetadata || !capture.width || selectedSegmentForCamera === -1) {
    return;
  }

  try {
    // Get camera image
    capture.loadPixels();
    if (!motionBuffer) {
      motionBuffer = createGraphics(capture.width, capture.height);
    }
    motionBuffer.copy(capture, 0, 0, capture.width, capture.height, 0, 0, motionBuffer.width, motionBuffer.height);
    motionBuffer.loadPixels();

    if (!prevFrame) {
      prevFrame = createGraphics(capture.width, capture.height);
      prevFrame.copy(motionBuffer, 0, 0, motionBuffer.width, motionBuffer.height,
        0, 0, prevFrame.width, prevFrame.height);
      prevFrame.loadPixels();
      return;
    }

    // Detectar movimento
    let totalMotion = 0;
    let avgMotionX = 0;
    let avgMotionY = 0;
    let motionCount = 0;

    for (let y = 0; y < capture.height; y += skipPixels) {
      for (let x = 0; x < capture.width; x += skipPixels) {
        let i = (x + y * capture.width) * 4;

        let diff = Math.abs(motionBuffer.pixels[i] - prevFrame.pixels[i]) +
          Math.abs(motionBuffer.pixels[i + 1] - prevFrame.pixels[i + 1]) +
          Math.abs(motionBuffer.pixels[i + 2] - prevFrame.pixels[i + 2]);

        if (diff > motionThreshold) {
          totalMotion += diff;
          avgMotionX += x;
          avgMotionY += y;
          motionCount++;
        }
      }
    }

    // Se houver movimento suficiente
    if (motionCount > 0) {
      // Calcular posição média do movimento
      avgMotionX = avgMotionX / motionCount;
      avgMotionY = avgMotionY / motionCount;

      // Converter coordenadas da câmera para o canvas
      let targetX = map(avgMotionX, 0, capture.width, 0, width);
      let targetY = map(avgMotionY, 0, capture.height, 0, height);

      // Atualizar a posição das partículas do segmento selecionado
      window.letterPoints.forEach(p => {
        if (p.segment === selectedSegmentForCamera) {
          // Calcular direção do movimento com suavização
          let dx = targetX - p.pos.x;
          let dy = targetY - p.pos.y;

          // Aplicar força baseada na distância
          let dist = Math.sqrt(dx * dx + dy * dy);
          let force = map(dist, 0, width / 2, 0.15, 0.01); // Força diminui com a distância

          // Movimento mais suave
          p.pos.x += dx * force;
          p.pos.y += dy * force;

          // Limitar distância da posição original com retorno elástico
          let distFromOrigin = p5.Vector.dist(p.pos, p.originalPos);
          let maxDist = 150;

          if (distFromOrigin > maxDist) {
            let angle = atan2(p.pos.y - p.originalPos.y, p.pos.x - p.originalPos.x);
            let returnForce = map(distFromOrigin, maxDist, maxDist * 2, 0.01, 0.05);

            p.pos.x = lerp(p.pos.x, p.originalPos.x + cos(angle) * maxDist, returnForce);
            p.pos.y = lerp(p.pos.y, p.originalPos.y + sin(angle) * maxDist, returnForce);
          }

          // Desenhar linha conectora com opacidade baseada na distância
          let lineOpacity = map(distFromOrigin, 0, maxDist, 10, 30);
          stroke(darkMode ? 0 : 255, lineOpacity);
          strokeWeight(0.5);
          line(p.originalPos.x, p.originalPos.y, p.pos.x, p.pos.y);
        }
      });
    } else {
      // Retorno suave à posição original quando não há movimento
      window.letterPoints.forEach(p => {
        if (p.segment === selectedSegmentForCamera) {
          p.pos.x = lerp(p.pos.x, p.originalPos.x, 0.05);
          p.pos.y = lerp(p.pos.y, p.originalPos.y, 0.05);

          // Desenhar linha conectora apenas se ainda não retornou
          let dist = p5.Vector.dist(p.pos, p.originalPos);
          if (dist > 1) {
            stroke(darkMode ? 0 : 255, map(dist, 0, 150, 5, 30));
            strokeWeight(0.5);
            line(p.originalPos.x, p.originalPos.y, p.pos.x, p.pos.y);
          }
        }
      });
    }

    // Atualizar frame anterior
    prevFrame.copy(motionBuffer, 0, 0, motionBuffer.width, motionBuffer.height,
      0, 0, prevFrame.width, prevFrame.height);
    prevFrame.loadPixels();

  } catch (error) {
    // Error processing camera
  }
}

function setupCameraControls() {
  // Criar elementos de controle da câmera
  let cameraControls = createDiv('');
  cameraControls.id('camera-controls');
  cameraControls.position(10, 240);
  cameraControls.style('display', 'none'); // Inicialmente oculto

}

function mouseClicked() {
  if (!cameraActive) return;

  // Verificar se clicou em uma partícula
  for (let i = 0; i < window.letterPoints.length; i++) {
    const p = window.letterPoints[i];
    const d = dist(mouseX, mouseY, p.pos.x, p.pos.y);

    if (d < 15) {
      // Se clicou na partícula, seleciona o segmento para interação da câmera
      if (selectedSegmentForCamera === p.segment) {
        // Desselecionar se já estava selecionado
        selectedSegmentForCamera = -1;
      } else {
        selectedSegmentForCamera = p.segment;
      }
      return;
    }
  }
}

function debugAnatomy() {
  showAnatomyDebug = !showAnatomyDebug;
}

// Adicione esta função para ser chamada dentro do draw()
function drawAnatomyDebug() {
  if (!showAnatomyDebug) return;

  push();

  const anatomy = new LetterAnatomy();

  // Desenhar apenas as linhas de referência principais
  strokeWeight(1);
  stroke(255, 100, 100, 150);
  line(0, anatomy.ascender, width, anatomy.ascender);

  stroke(100, 255, 100, 150);
  line(0, anatomy.capHeight, width, anatomy.capHeight);

  stroke(100, 100, 255, 150);
  line(0, anatomy.xHeight, width, anatomy.xHeight);

  stroke(darkMode ? 0 : 255, 150);
  strokeWeight(2);
  line(0, anatomy.baseline, width, anatomy.baseline);

  stroke(255, 100, 255, 150);
  strokeWeight(1);
  line(0, anatomy.descender, width, anatomy.descender);

  // Labels simples
  noStroke();
  fill(darkMode ? 0 : 255);
  textSize(12);
  textAlign(LEFT);

  text("Ascender", width - 55, anatomy.ascender - 5);
  text("Cap", width - 25, anatomy.capHeight - 5);
  text("x-Height", width - 50, anatomy.xHeight - 5);
  text("Baseline", width - 50, anatomy.baseline - 5);
  text("Descender", width - 65, anatomy.descender + 15);

  pop();
}

// Criar slider para controlar densidade de particulas
function setupParticleControls() {
  // Label da densidade
  particleDensityLabel = createDiv('Particle Density');
  particleDensityLabel.style('color', darkMode ? '#000000' : '#FFFFFF');

  // Slider densidade
  particleDensitySlider = createSlider(5, 20, particleDensity, 1);
  particleDensitySlider.style('appearance', 'none');
  particleDensitySlider.style('-webkit-appearance', 'none');
  particleDensitySlider.style('height', '5px');
  particleDensitySlider.style('border-radius', '5px');
  particleDensitySlider.style('background', darkMode ? '#CCCCCC' : '#555555');
  particleDensitySlider.style('outline', 'none');
  particleDensitySlider.style('opacity', '0.9');

  particleDensitySlider.input(() => {
    particleDensity = particleDensitySlider.value();
    particleDensityLabel.html('Particle Density');
    createMixedLetterPoints();
  });

  // Aplicar layout responsivo inicial
  updateParticleControlsLayout();
}

function createSegmentControls() {
  let controlsContainer = createDiv();
  controlsContainer.id('segment-controls');
  controlsContainer.style('background-color', 'none');
  controlsContainer.style('border-radius', '5px');
  controlsContainer.style('color', darkMode ? '#000000' : '#FFFFFF');

  let title = createP('Animations:');
  title.parent(controlsContainer);
  title.style('margin', '0 0 10px 0');
  title.style('font-weight', 'bold');
  title.style('color', darkMode ? '#000000' : '#FFFFFF');

  segmentCheckboxes = [];
  for (let i = 0; i < 5; i++) {
    let checkboxContainer = createDiv();
    checkboxContainer.parent(controlsContainer);
    checkboxContainer.style('margin', '2px 0');
    checkboxContainer.style('color', 'flex');

    let checkbox = createCheckbox(segmentNames[i], true);
    checkbox.parent(checkboxContainer);
    
    // Aplicar estilos iniciais baseados no modo
    const checkboxElement = checkbox.elt.querySelector('input[type="checkbox"]');
    const labelElement = checkbox.elt.querySelector('label');
    
    if (checkboxElement) {
      checkboxElement.style.borderColor = darkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';
      checkboxElement.style.backgroundColor = 'transparent';
      checkboxElement.style.borderRadius = '4px';
      checkboxElement.style.transition = 'all 0.3s ease';
      checkboxElement.style.marginRight = '8px';
      checkboxElement.style.verticalAlign = 'middle';
      checkboxElement.style.cursor = 'pointer';
      
      if (checkboxElement.checked) {
        checkboxElement.style.backgroundColor = darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
        checkboxElement.style.borderColor = darkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)';
      }
    }
    
    if (labelElement) {
      labelElement.style.color = darkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)';
      labelElement.style.fontFamily = "'Roboto', sans-serif";
      labelElement.style.display = 'flex';
      labelElement.style.alignItems = 'center';
      labelElement.style.cursor = 'pointer';
      labelElement.style.fontSize = '14px';
      labelElement.style.transition = 'color 0.3s ease';
    }
    checkbox.changed(() => {
      let activeCount = Object.values(segmentVisibility).filter(v => v).length;
      if (!checkbox.checked() && activeCount <= 1) {
        // Se tentar desmarcar o último checkbox ativo, impedir e voltar a marcar
        checkbox.checked(true);
        return;
      }
      updateSegmentVisibility(i, checkbox.checked());
      
      // Atualizar estilos após mudança
      const checkboxElement = checkbox.elt.querySelector('input[type="checkbox"]');
      if (checkboxElement) {
        if (checkboxElement.checked) {
          checkboxElement.style.backgroundColor = darkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
          checkboxElement.style.borderColor = darkMode ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)';
        } else {
          checkboxElement.style.backgroundColor = 'transparent';
          checkboxElement.style.borderColor = darkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';
        }
      }
    });

    segmentCheckboxes.push(checkbox);
  }
  
  // Aplicar layout responsivo inicial
  updateSegmentControlsLayout();
}

function toggleTheme() {
  darkMode = !darkMode;

  if (darkMode) {
    background(255);
  } else {
    background(0, 10);
  }

  // Atualiza a cor das letras
  for (let p of window.letterPoints) {
    p.color = darkMode ? color(0, 0, 0, 100) : color(0, 0, 100, 100);
  }

  // Atualizar layout responsivo com novo tema
  updateResponsiveLayout();
  updateParticleControlsLayout();
  updateSegmentControlsLayout();

  // Atualizar título
  if (titleElement) {
    titleElement.style('color', darkMode ? '#000000' : '#FFFFFF');
  }
}

function toggleInstallationMode() {
  installationMode = !installationMode;

  const elementsToToggle = [
    select('#segment-controls'),
    particleDensityLabel,
    particleDensitySlider,
    ...selectAll('button').filter(btn => !btn.elt.innerHTML.includes('Exhibit Mode'))
  ];

  const exhibitBtn = selectAll('button').find(btn => btn.html() === 'Exhibit Mode');

  if (installationMode) {
    // Oculta completamente todos os outros elementos
    elementsToToggle.forEach(el => {
      if (el) {
        el.style('display', 'none');
      }
    });

    // Inicializar opacidade da mensagem de shuffle com valor muito baixo
    shuffleMessageOpacity = 80;

    // Aplica o efeito de fade ao botão "Exhibit Mode"
    if (exhibitBtn) {
      setFadeHoverEffect(exhibitBtn);
      stopExhibitButtonMonitor(); // Parar o monitor quando o fade está ativo
    }

    // Ativa a câmera e seleciona segmento normalmente
    if (!cameraActive) {
      if (!capture) {
        setupCamera();
      }
      cameraActive = true;
      const cameraControls = select('#camera-controls');
      if (cameraControls) cameraControls.style('display', 'block');
    }

    const activeSegments = Object.entries(segmentVisibility)
      .filter(([_, visible]) => visible)
      .map(([index]) => parseInt(index));
    if (activeSegments.length > 0) {
      selectedSegmentForCamera = random(activeSegments);
    }

    shuffleAnimations();
    applyAnimationMapping();
    installationTimer = millis();
    installationInterval = 15000;

  } else {
    // Mostrar todos os elementos normalmente
    elementsToToggle.forEach(el => {
      if (el) {
        el.style('display', 'block');
      }
    });

    if (exhibitBtn) {
      // Desativando modo de instalação
      
      // Usar a função dedicada para remover o efeito de fade
      removeFadeHoverEffect(exhibitBtn);
      
      // Iniciar o monitor para garantir que o fade seja removido
      startExhibitButtonMonitor();
      
      // Garantir que o botão seja reestilizado corretamente após a atualização do layout
      setTimeout(() => {
        if (exhibitBtn && exhibitBtn.elt) {
          // Reaplicando estilos padrão ao botão
          // Reaplicar estilos padrão do botão
          exhibitBtn.style('color', darkMode ? '#000000' : '#FFFFFF');
          exhibitBtn.style('background', 'none');
          exhibitBtn.style('border', `1px solid ${darkMode ? '#000000' : '#FFFFFF'}`);
          exhibitBtn.style('border-radius', '8px');
          exhibitBtn.style('padding', '8px 16px');
          exhibitBtn.style('cursor', 'pointer');
          exhibitBtn.style('transition', 'all 0.3s ease');
          exhibitBtn.style('opacity', '1');
          exhibitBtn.style('pointer-events', 'auto');
        }
      }, 50);

      // Adicionar mais um timeout para garantir que tudo seja aplicado
      setTimeout(() => {
        if (exhibitBtn && exhibitBtn.elt) {
          exhibitBtn.style('opacity', '1');
          exhibitBtn.style('pointer-events', 'auto');
          exhibitBtn.style('transition', 'all 0.3s ease');
        }
      }, 200);
    }

    // Atualizar layout responsivo quando sair do modo instalação
    updateResponsiveLayout();
    updateParticleControlsLayout();
    updateSegmentControlsLayout();

    // Desativar câmera
    if (cameraActive) {
      cameraActive = false;
      try {
        if (capture) {
          capture.stop();
          capture.remove(); // força limpeza no DOM
          capture = null;
        }
      } catch (e) {
        console.warn("Erro ao parar a câmera:", e);
      }
      selectedSegmentForCamera = -1;
      const cameraControls = select('#camera-controls');
      if (cameraControls) cameraControls.style('display', 'none');
    }
  }
}

function setFadeHoverEffect(el) {
  if (!el) return;

  exhibitButtonFadeEnabled = true;

  // Limpar qualquer efeito anterior
  if (el._hoverIn) {
    el.elt.removeEventListener('mouseenter', el._hoverIn);
  }
  if (el._hoverOut) {
    el.elt.removeEventListener('mouseleave', el._hoverOut);
  }

  // Configurar o efeito de fade
  el.style('opacity', '0');
  el.style('pointer-events', 'auto');
  el.style('transition', 'opacity 0.4s ease');

  // Funções armazenadas para poder remover depois
  el._hoverIn = () => {
    if (exhibitButtonFadeEnabled) {
      el.style('opacity', '1');
    }
  };
  el._hoverOut = () => {
    if (exhibitButtonFadeEnabled) {
      el.style('opacity', '0');
    }
  };

  el.elt.addEventListener('mouseenter', el._hoverIn);
  el.elt.addEventListener('mouseleave', el._hoverOut);
}

function removeFadeHoverEffect(el) {
  if (!el) return;

  exhibitButtonFadeEnabled = false;

  // Remover event listeners
  if (el._hoverIn) {
    el.elt.removeEventListener('mouseenter', el._hoverIn);
    el._hoverIn = null;
  }
  if (el._hoverOut) {
    el.elt.removeEventListener('mouseleave', el._hoverOut);
    el._hoverOut = null;
  }

  // Forçar remoção de todos os event listeners relacionados ao hover
  const clonedElement = el.elt.cloneNode(true);
  el.elt.parentNode.replaceChild(clonedElement, el.elt);
  el.elt = clonedElement;

  // Restaurar estilo padrão completamente
  el.style('opacity', '1');
  el.style('pointer-events', 'auto');
  el.style('transition', 'all 0.3s ease');
  el.style('transform', 'none');
  el.style('filter', 'none');

  // Forçar a aplicação dos estilos com múltiplos delays
  setTimeout(() => {
    if (el && el.elt) {
      el.style('opacity', '1');
      el.style('pointer-events', 'auto');
      el.style('transition', 'all 0.3s ease');
    }
  }, 10);

  setTimeout(() => {
    if (el && el.elt) {
      el.style('opacity', '1');
      el.style('pointer-events', 'auto');
      el.style('transition', 'all 0.3s ease');
    }
  }, 100);

  setTimeout(() => {
    if (el && el.elt) {
      el.style('opacity', '1');
      el.style('pointer-events', 'auto');
      el.style('transition', 'all 0.3s ease');
    }
  }, 500);

  // Adicionar um listener global para garantir que o botão não seja afetado
  const forceRemoveFade = () => {
    if (el && el.elt && !exhibitButtonFadeEnabled) {
      el.style('opacity', '1');
      el.style('pointer-events', 'auto');
      el.style('transition', 'all 0.3s ease');
    }
  };

  // Adicionar listener para mouseover e mouseout para forçar a remoção
  el.elt.addEventListener('mouseenter', forceRemoveFade);
  el.elt.addEventListener('mouseleave', forceRemoveFade);
}

function informations() {
  // Remove overlay e caixa anteriores se existirem
  let overlay = select('#info-overlay');
  if (overlay) overlay.remove();
  let infoBox = select('#info-box');
  if (infoBox) infoBox.remove();
  
  // Criar overlay que bloqueia todo o site
  overlay = createDiv();
  overlay.id('info-overlay');
  overlay.parent();
  overlay.style('position', 'fixed');
  overlay.style('top', '0');
  overlay.style('left', '0');
  overlay.style('width', '100%');
  overlay.style('height', '100%');
  overlay.style('background', 'rgba(0, 0, 0, 0.7)');
  overlay.style('z-index', '999');
  overlay.style('cursor', 'default');
  
  // Cria nova caixa de informações
  infoBox = createDiv();
  infoBox.id('info-box');
  infoBox.position(width / 2 - 360, height / 2 - 240);
  infoBox.size(700, 460);
  infoBox.style('background', darkMode ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.55)');
  infoBox.style('border-radius', '10px');
  infoBox.style('box-shadow', '0 4px 24px rgba(0,0,0,0.15)');
  infoBox.style('padding', '32px');
  infoBox.style('color', darkMode ? '#000000' : '#FFFFFF');
  infoBox.style('font-size', '18px');
  infoBox.style('z-index', '1000');
  infoBox.style('display', 'flex');
  infoBox.style('flex-direction', 'column');
  infoBox.style('justify-content', 'center');
  infoBox.style('align-items', 'center');
  infoBox.style('position', 'absolute');

  // Adiciona botão de fechar (cruz)
  let closeBtn = createDiv('&#10006;');
  closeBtn.id('close-info-box');
  closeBtn.parent(infoBox);
  closeBtn.style('position', 'absolute');
  closeBtn.style('top', '12px');
  closeBtn.style('right', '18px');
  closeBtn.style('font-size', '28px');
  closeBtn.style('color', darkMode ? '#000000' : '#FFFFFF');
  closeBtn.style('cursor', 'pointer');
  closeBtn.style('opacity', '0.7');
  closeBtn.mousePressed(() => { 
    overlay.remove(); 
    infoBox.remove(); 
  });

  let html = `<b>Informações do Sistema Sonotype</b>
  <p>Este sistema é uma exploração de tipografia, onde cada letra é composta por partículas que se comportam de maneira dinâmica e interativa.</p>
  <p>Existem 2 fontes distintas que irão ser demonstradas à medida que for escrevendo, também existem botões e outras interações disponíveis.</p>
  <p>Pode aumentar ou diminuir o número de partículas na fontes, dar shuffle na posição de animações, remover alguma animação das letras, congelar o estado atual,
  ver valores de áudio e as linhas de anatomia da letra e ainda exportar em diferentes formatos.</p>
  <p> Existe ainda um modo de exibição para usar em instalações interativas.</p>
  <p>Explore o que este sistema tem para oferecer!</p>
  `;
  infoBox.html(html);
  // Garante que o botão de fechar fica acima do conteúdo
  infoBox.child(closeBtn);
  
  // Permitir fechar com a tecla ESC
  let escHandler = (e) => {
    if (e.key === 'Escape') {
      overlay.remove();
      infoBox.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

function createDropdown(label, x, y, itemsList) {
  let dropdown = {
    button: null,
    items: [],
    show: false,
    selectedOption: null
  };

  // Criar e estilizar o botão dropdown
  dropdown.button = createButton(label);
  dropdown.button.class('dropbtn');
  dropdown.button.position(x, y);
  dropdown.button.style('color', darkMode ? '#000000' : '#FFFFFF');
  dropdown.button.style('background', 'none');
  dropdown.button.style('border', `1px solid ${darkMode ? '#000000' : '#FFFFFF'}`);
  dropdown.button.style('padding', '8px 16px');
  dropdown.button.style('cursor', 'pointer');
  dropdown.button.style('width', '100px'); // Definir largura fixa

  dropdown.button.mousePressed(() => {
    if (dropdown.show) {
      dropdown.show = false;
    } else {
      dropdowns.forEach(dd => dd.show = false);
      dropdown.show = true;
    }
  });

  // Criar itens do dropdown
  itemsList.forEach((itemLabel, i) => {
    let item = createButton(itemLabel);
    item.class('dropdown-content');
    item.position(x, y + 30 + i * 30);
    item.style('color', darkMode ? '#000000' : '#FFFFFF');
    item.style('background', 'none');
    item.style('border', `1px solid ${darkMode ? '#000000' : '#FFFFFF'}`);
    item.style('padding', '8px 16px');
    item.style('cursor', 'pointer');
    item.style('width', '100px'); // Mesma largura do botão
    item.style('transition', 'all 0.3s ease');

    item.mousePressed(() => {
      // Reset estilo de todos os itens
      dropdown.items.forEach(otherItem => {
        if (otherItem !== dropdown.items[dropdown.items.length - 1]) {
          otherItem.style('background', 'none');
          otherItem.style('color', darkMode ? '#000000' : '#FFFFFF');
        }
      });

      // Destacar item selecionado
      if (item !== dropdown.items[dropdown.items.length - 1]) {
        item.style('background', darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)');
        item.style('color', darkMode ? '#000000' : '#FFFFFF');
      }

      dropdown.selectedOption = itemLabel;
    });

    item.hide();
    dropdown.items.push(item);
  });

  // Criar botão de export como último item
  let exportButton = createButton('Export');
  exportButton.class('dropdown-content');
  exportButton.position(x, y + 30 + (itemsList.length * 30));
  exportButton.style('color', darkMode ? '#000000' : '#FFFFFF');
  exportButton.style('background', 'none');
  exportButton.style('border', `1px solid ${darkMode ? '#000000' : '#FFFFFF'}`);
  exportButton.style('padding', '8px 16px');
  exportButton.style('cursor', 'pointer');
  exportButton.style('width', '100px'); // Mesma largura dos outros itens
  exportButton.mousePressed(() => {
    if (dropdown.selectedOption) {
      exportSelected(dropdown.selectedOption);
      dropdown.show = false;
    } 
  });
  exportButton.hide();
  dropdown.items.push(exportButton);

  return dropdown;
}

// Função para exportar baseado na seleção
function exportSelected(type) {
  switch (type) {
    case 'OTF':
      // Mostrar mensagem imediatamente ao clicar
      showOTFMessage('🔄 Iniciando export de fonte OTF...', 'info', 0);
      exportarFonteComoOTF();
      break;
    case 'GIF':
      exportAsGif();
      break;
    case 'Video':
      exportAsVideo();
      break;
  }
}

function exportAsGif() {
  if (!isRecordingGif) {
    
    // Criar mensagem de gravação (fora do canvas)
    const margin = Math.max(75, windowWidth * 0.02);
    const topMargin = Math.max(15, windowHeight * 0.02);
    const titleSize = Math.max(22, Math.min(42, windowWidth * 0.037));
    
    gifRecordingMessage = createDiv('Recording GIF...');
    gifRecordingMessage.position(margin, topMargin + titleSize + 10);
    gifRecordingMessage.style('color', darkMode ? '#000000' : '#FFFFFF');
    gifRecordingMessage.style('font-family', 'Roboto, sans-serif');
    gifRecordingMessage.style('font-size', '14px');
    gifRecordingMessage.style('font-weight', 'bold');
    gifRecordingMessage.style('z-index', '1000');
    
    // Implementação super simples
    let frames = [];
    let currentFrame = 0;
    const totalFrames = 30; // 1 segundo a 30fps
    
    isRecordingGif = true;
    
    function captureFrame() {
      if (currentFrame < totalFrames && isRecordingGif) {
        // Aguardar um momento para garantir que o frame foi renderizado
        setTimeout(() => {
          try {
            // Capturar o canvas atual com todo o conteúdo
            const canvasElement = canvas.canvas;
            const canvasData = canvasElement.toDataURL('image/png');
            
            // Verificar se há conteúdo no canvas (mais que apenas fundo preto/branco)
            const context = canvasElement.getContext('2d');
            const imageData = context.getImageData(0, 0, canvasElement.width, canvasElement.height);
            const pixels = imageData.data;
            let hasContent = false;
            
            // Verificar se há pixels que não sejam apenas preto (0,0,0) ou branco (255,255,255)
            for (let i = 0; i < pixels.length; i += 4) {
              const r = pixels[i];
              const g = pixels[i + 1];
              const b = pixels[i + 2];
              if (!(r === 0 && g === 0 && b === 0) && !(r === 255 && g === 255 && b === 255)) {
                hasContent = true;
                break;
              }
            }
            
            frames.push(canvasData);
            currentFrame++;
           
            // Agendar próximo frame
            setTimeout(captureFrame, 150); // Um pouco mais lento para capturar melhor
          } catch (error) {
            console.error('Error capturing frame:', error);
            isRecordingGif = false;
          }
        }, 50); // Pequeno delay para garantir renderização
      } else {
        isRecordingGif = false;
        
        // Atualizar mensagem
        if (gifRecordingMessage) {
          gifRecordingMessage.html('Processing GIF...');
        }
        
        createSimpleGif(frames);
      }
    }
    
    // Iniciar captura após um delay para garantir que está tudo renderizado
    setTimeout(captureFrame, 200);
  }
}

function createSimpleGif(frames) {
  
  try {
    // Usar as dimensões do canvas atual
    const canvasWidth = canvas.canvas.width;
    const canvasHeight = canvas.canvas.height;
    
    
    // Criar um GIF simples usando a biblioteca gif.js
    const gif = new GIF({
      workers: 2,
      quality: 10,
      workerScript: 'lib/gif.worker.js',
      width: canvasWidth,
      height: canvasHeight
    });
    
    let loadedFrames = 0;
    
    frames.forEach((frameData, index) => {
      const img = new Image();
      img.onload = function() {
        gif.addFrame(img, {delay: 100});
        loadedFrames++;
        
        if (loadedFrames === frames.length) {
          gif.render();
        }
      };
      img.src = frameData;
    });
    
    gif.on('finished', function(blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `simple_typeface_${Date.now()}.gif`;
      a.click();
      URL.revokeObjectURL(url);
      
      // Remover mensagem de gravação
      if (gifRecordingMessage) {
        gifRecordingMessage.remove();
        gifRecordingMessage = null;
      }
    });
    
    gif.on('progress', function(p) {
      const progress = Math.round(p * 100);
      
      // Atualizar mensagem com progresso
      if (gifRecordingMessage) {
        gifRecordingMessage.html(`Processing GIF... ${progress}%`);
      }
    });
    
  } catch (error) {
    console.error('Error creating GIF:', error);
    alert('Erro ao criar GIF. Tente novamente.');
  }
}

function exportAsVideo() {
  if (!isRecordingVideo) {
    // Verificar se o navegador suporta captureStream
    const canvasElement = canvas.canvas;
    if (!canvasElement.captureStream) {
      alert('Seu navegador não suporta gravação de vídeo. Tente usar o Chrome ou Firefox mais recente.');
      return;
    }

    // Criar botão de controle de gravação
    recordButton = createButton('Stop Recording');
    // Posicionar por baixo do FontSound
    const margin = Math.max(75, windowWidth * 0.02);
    const topMargin = Math.max(15, windowHeight * 0.02);
    const titleSize = Math.max(22, Math.min(42, windowWidth * 0.037));
    recordButton.position(margin, topMargin + titleSize + 10);
    recordButton.style('color', darkMode ? '#000000' : '#FFFFFF');
    recordButton.style('background', 'none');
    recordButton.style('border', `1px solid ${darkMode ? '#000000' : '#FFFFFF'}`);
    recordButton.style('padding', '8px 16px');
    recordButton.style('cursor', 'pointer');

    // Criar mensagem de gravação (fora do canvas)
    recordingMessage = createDiv('Recording Video...');
    recordingMessage.position(margin + 130, topMargin + titleSize + 15);
    recordingMessage.style('color', darkMode ? '#000000' : '#FFFFFF');
    recordingMessage.style('font-family', 'Roboto, sans-serif');
    recordingMessage.style('font-size', '14px');
    recordingMessage.style('font-weight', 'bold');
    recordingMessage.style('z-index', '1000');

    // Configurar MediaRecorder
    const stream = canvasElement.captureStream(30);
    
    // Verificar suporte a diferentes formatos de vídeo
    let mimeType = 'video/webm;codecs=vp9';
    let fileExtension = 'webm';
    
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp8';
    }
    
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
    }
    
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/mp4';
      fileExtension = 'mp4';
    }
    
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      alert('Seu navegador não suporta nenhum formato de vídeo compatível.');
      return;
    }
    
    videoRecorder = new MediaRecorder(stream, {
      mimeType: mimeType,
      videoBitsPerSecond: 5000000
    });

    // Array para armazenar chunks do vídeo
    const chunks = [];

    videoRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    videoRecorder.onstop = () => {
      // Criar blob e download
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TypefaceVideo_${Date.now()}.${fileExtension}`;
      a.click();
      URL.revokeObjectURL(url);

      // Limpar recursos
      recordButton.remove();
      recordingMessage.remove();
    };

    // Iniciar gravação
    videoRecorder.start();
    isRecordingVideo = true;

    // Configurar botão para parar gravação
    recordButton.mousePressed(() => {
      if (isRecordingVideo) {
        videoRecorder.stop();
        isRecordingVideo = false;
        recordButton.remove();
        recordingMessage.remove();
      }
    });
  }
}
//----------------------------------------------------------------------------------------------------------

// Listener para mudanças de orientação em dispositivos móveis
function setupOrientationListener() {
  window.addEventListener('orientationchange', () => {
    // Aguardar um pouco para que a orientação seja aplicada
    setTimeout(() => {
      updateResponsiveLayout();
      updateParticleControlsLayout();
      updateSegmentControlsLayout();
    }, 100);
  });
  
  // Listener para mudanças de tamanho da janela
  window.addEventListener('resize', () => {
    // Debounce para evitar muitas chamadas
    clearTimeout(window.resizeTimeout);
    window.resizeTimeout = setTimeout(() => {
      updateResponsiveLayout();
      updateParticleControlsLayout();
      updateSegmentControlsLayout();
    }, 250);
  });
}

// Função para atualizar posições dos itens do dropdown
function updateDropdownPositions() {
  dropdowns.forEach(dropdown => {
    if (dropdown.button && dropdown.items.length > 0) {
      const buttonX = parseInt(dropdown.button.style('left'));
      const buttonY = parseInt(dropdown.button.style('top'));
      const buttonHeight = parseInt(dropdown.button.style('height')) || 40;
      const itemHeight = buttonHeight;
      const itemSpacing = 2;
      
      dropdown.items.forEach((item, index) => {
        const itemY = buttonY + buttonHeight + 5 + (index * (itemHeight + itemSpacing));
        item.position(buttonX, itemY);
      });
    }
  });
}

// Função para organizar botões em múltiplas linhas quando não há espaço suficiente
function organizeButtonsInMultipleRows(allButtons, buttonWidths, dropdownWidth, margin, titleWidth, buttonPadding, topMargin, buttonHeight, fontSize) {
  const availableWidth = width - (margin * 2);
  // Calcular largura média dos botões para determinar quantos cabem por linha
  const averageButtonWidth = Object.values(buttonWidths).reduce((sum, width) => sum + width, 0) / Object.keys(buttonWidths).length;
  const maxButtonsPerRow = Math.floor(availableWidth / (averageButtonWidth + buttonPadding));
  
  // Calcular posição Y centralizada para alinhar com o título
  const titleSize = Math.max(22, Math.min(42, windowWidth * 0.037));
  const titleCenterY = topMargin + (titleSize / 2);
  const buttonCenterY = titleCenterY - (buttonHeight / 2); // Ajustar para centralizar com o centro do título
  
  let currentRow = 0;
  let currentX = margin + titleWidth + buttonPadding + 2; // Posicionar após o título com espaçamento mínimo
  let buttonsInCurrentRow = 0;
  
  // Organizar botões em linhas
  allButtons.forEach((btnData, index) => {
    const btn = btnData.button;
    const buttonText = btnData.text;
    const buttonWidth = buttonWidths[buttonText];
    
    if (btn) {
      // Verificar se precisa ir para a próxima linha
      if (buttonsInCurrentRow >= maxButtonsPerRow || 
          (currentX + buttonWidth + buttonPadding) > (width - margin)) {
        currentRow++;
        currentX = margin + titleWidth + buttonPadding + 2; // Manter alinhamento após o título com espaçamento mínimo
        buttonsInCurrentRow = 0;
      }
      
      const buttonY = buttonCenterY + (currentRow * (buttonHeight + 5));
      
      btn.position(currentX, buttonY);
      btn.style('width', buttonWidth + 'px');
      btn.style('height', buttonHeight + 'px');
      btn.style('font-size', fontSize + 'px');
      btn.style('padding', buttonPadding + 'px');
      
      // Não aplicar estilos ao botão Exhibit Mode se estiver no modo de instalação
      if (!(buttonText === 'Exhibit Mode' && installationMode)) {
        btn.style('color', darkMode ? '#000000' : '#FFFFFF');
        btn.style('background', 'none');
        btn.style('border', `1px solid ${darkMode ? '#000000' : '#FFFFFF'}`);
        btn.style('cursor', 'pointer');
        btn.style('transition', 'all 0.3s ease');
      }
      
      // Se for o botão Export, configurar o dropdown
      if (buttonText === 'Export' && dropdowns.length > 0) {
        // Atualizar posições dos itens do dropdown
        dropdowns[0].items.forEach((item, index) => {
          item.position(currentX, buttonY + buttonHeight + 5 + (index * (buttonHeight + 2)));
          item.style('width', buttonWidth + 'px');
          item.style('height', buttonHeight + 'px');
          item.style('font-size', fontSize + 'px');
          item.style('color', darkMode ? '#000000' : '#FFFFFF');
          item.style('background', 'none');
          item.style('border', `1px solid ${darkMode ? '#000000' : '#FFFFFF'}`);
          item.style('cursor', 'pointer');
          item.style('transition', 'all 0.3s ease');
        });
      }
      
      currentX += buttonWidth + buttonPadding;
      buttonsInCurrentRow++;
    }
  });
}