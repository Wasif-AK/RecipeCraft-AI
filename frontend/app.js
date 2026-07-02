// frontend/app.js

// State variables
let pantry = [];
let selectedDiets = [];
let currentRecipes = [];
let activeRecipe = null;
let currentStepIndex = 0;
let isSpeaking = false;
let speechSynth = window.speechSynthesis;
let currentUtterance = null;

// DOM Elements
const pantryInput = document.getElementById('pantry-input');
const addPantryBtn = document.getElementById('add-pantry-btn');
const pantryList = document.getElementById('pantry-list');
const pantryCount = document.getElementById('pantry-count');
const clearPantryBtn = document.getElementById('clear-pantry-btn');

const uploadZone = document.getElementById('upload-zone');
const photoUploadInput = document.getElementById('photo-upload-input');
const uploadPlaceholder = document.getElementById('upload-placeholder');
const uploadPreviewContainer = document.getElementById('upload-preview-container');
const uploadPreview = document.getElementById('upload-preview');
const removePhotoBtn = document.getElementById('remove-photo-btn');
const samplePhotoBtn = document.getElementById('sample-photo-btn');
const scanPhotoBtn = document.getElementById('scan-photo-btn');

const dietChips = document.querySelectorAll('.diet-chip');
const generateRecipesBtn = document.getElementById('generate-recipes-btn');

const recipeEmptyState = document.getElementById('recipe-empty-state');
const recipesLoading = document.getElementById('recipes-loading');
const recipeResults = document.getElementById('recipe-results');
const recipesGrid = document.getElementById('recipes-grid');

// Modals
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-modal-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const apiKeyInput = document.getElementById('api-key-input');
const demoModeToggle = document.getElementById('demo-mode-toggle');
const apiStatusText = document.getElementById('api-status-text');
const demoBanner = document.getElementById('demo-banner');

const recipeDetailModal = document.getElementById('recipe-detail-modal');
const closeDetailModalBtn = document.getElementById('close-detail-modal-btn');
const cancelDetailBtn = document.getElementById('cancel-detail-btn');
const startCookingBtn = document.getElementById('start-cooking-btn');

const chefCompanionModal = document.getElementById('chef-companion-modal');
const closeChefModalBtn = document.getElementById('close-chef-modal-btn');
const chefRecipeTitle = document.getElementById('chef-recipe-title');
const chefStepIndicator = document.getElementById('chef-step-indicator');
const chefPercentage = document.getElementById('chef-percentage');
const chefProgressBar = document.getElementById('chef-progress-bar');
const chefStepNum = document.getElementById('chef-step-num');
const chefStepText = document.getElementById('chef-step-text');
const speechBtn = document.getElementById('speech-btn');
const speakingVisualizer = document.getElementById('speaking-visualizer');
const chefPrevBtn = document.getElementById('chef-prev-btn');
const chefNextBtn = document.getElementById('chef-next-btn');
const pauseCookingBtn = document.getElementById('pause-cooking-btn');

const triggerSubBtn = document.getElementById('trigger-sub-btn');
const subSelectionForm = document.getElementById('sub-selection-form');
const missingIngredientSelect = document.getElementById('missing-ingredient-select');
const submitAdaptBtn = document.getElementById('submit-adapt-btn');
const adaptationResultBox = document.getElementById('adaptation-result-box');
const adaptationMsg = document.getElementById('adaptation-msg');
const adaptedStepsList = document.getElementById('adapted-steps-list');
const dismissAdaptationBtn = document.getElementById('dismiss-adaptation-btn');

// Image uploaded state (holds base64 data)
let uploadedImageBase64 = null;

// Initialize app
function init() {
    setupAuthListeners();
    checkAuthState();
}

function startApp() {
    loadSettings();
    loadPantry();
    setupEventListeners();
    updatePantryUI();
    updateSettingsUI();
}

// Load pantry from localStorage
function loadPantry() {
    const savedPantry = localStorage.getItem('recipe_craft_pantry');
    if (savedPantry) {
        try {
            pantry = JSON.parse(savedPantry);
        } catch (e) {
            pantry = [];
        }
    } else {
        // Pre-fill with a few items to look good initially
        pantry = ["eggs", "baby spinach", "cherry tomatoes", "garlic"];
        savePantry();
    }
}

// Save pantry to localStorage
function savePantry() {
    localStorage.setItem('recipe_craft_pantry', JSON.stringify(pantry));
    updatePantryUI();
}

// Load configurations from localStorage
function loadSettings() {
    const apiKey = localStorage.getItem('recipe_craft_api_key') || '';
    const forceDemo = localStorage.getItem('recipe_craft_force_demo') !== 'false'; // default to true
    
    apiKeyInput.value = apiKey;
    demoModeToggle.checked = forceDemo;
}

// Save configurations to localStorage
function saveSettings() {
    localStorage.setItem('recipe_craft_api_key', apiKeyInput.value.trim());
    localStorage.setItem('recipe_craft_force_demo', demoModeToggle.checked);
    
    updateSettingsUI();
    settingsModal.style.display = 'none';
}

function updateSettingsUI() {
    const forceDemo = demoModeToggle.checked;
    const keySet = apiKeyInput.value.trim().length > 0;
    
    if (forceDemo) {
        apiStatusText.innerText = "Demo Mode (Mock)";
        apiStatusText.className = "status-demo";
        demoBanner.style.display = "flex";
    } else if (keySet) {
        apiStatusText.innerText = "Active (Custom API Key)";
        apiStatusText.className = "status-active";
        demoBanner.style.display = "none";
    } else {
        apiStatusText.innerText = "Server/Demo Mode";
        apiStatusText.className = "status-demo";
        demoBanner.style.display = "flex";
    }
}

// Event Listeners setup
function setupEventListeners() {
    // Pantry item adding
    addPantryBtn.addEventListener('click', addPantryItem);
    pantryInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addPantryItem();
    });
    clearPantryBtn.addEventListener('click', () => {
        pantry = [];
        savePantry();
    });

    // Uploader interactions
    uploadZone.addEventListener('click', () => photoUploadInput.click());
    
    // Drag & Drop
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = 'var(--brand-primary)';
    });
    uploadZone.addEventListener('dragleave', () => {
        uploadZone.style.borderColor = 'rgba(255, 255, 255, 0.15)';
    });
    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = 'rgba(255, 255, 255, 0.15)';
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleImageUpload(e.dataTransfer.files[0]);
        }
    });

    photoUploadInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
        }
    });

    removePhotoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetPhotoUploader();
    });

    samplePhotoBtn.addEventListener('click', loadSamplePhoto);
    scanPhotoBtn.addEventListener('click', scanPantryPhoto);

    // Diet chips selection
    dietChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const diet = chip.getAttribute('data-diet');
            chip.classList.toggle('selected');
            if (chip.classList.contains('selected')) {
                if (!selectedDiets.includes(diet)) selectedDiets.push(diet);
            } else {
                selectedDiets = selectedDiets.filter(d => d !== diet);
            }
        });
    });

    // Formulate button
    generateRecipesBtn.addEventListener('click', generateRecipes);

    // Modal buttons
    settingsBtn.addEventListener('click', () => {
        updateSettingsUI();
        settingsModal.style.display = 'flex';
    });
    closeSettingsBtn.addEventListener('click', () => settingsModal.style.display = 'none');
    saveSettingsBtn.addEventListener('click', saveSettings);

    // Detail Modal closing
    closeDetailModalBtn.addEventListener('click', () => recipeDetailModal.style.display = 'none');
    cancelDetailBtn.addEventListener('click', () => recipeDetailModal.style.display = 'none');
    startCookingBtn.addEventListener('click', launchChefCompanion);

    // Chef Modal closing
    closeChefModalBtn.addEventListener('click', exitChefCompanion);
    pauseCookingBtn.addEventListener('click', exitChefCompanion);

    // Cooking step controls
    chefPrevBtn.addEventListener('click', prevStep);
    chefNextBtn.addEventListener('click', nextStep);
    speechBtn.addEventListener('click', toggleSpeech);

    // Adaptation trigger
    triggerSubBtn.addEventListener('click', () => {
        subSelectionForm.style.display = subSelectionForm.style.display === 'none' ? 'block' : 'none';
    });
    submitAdaptBtn.addEventListener('click', requestRecipeAdaptation);
    dismissAdaptationBtn.addEventListener('click', () => {
        adaptationResultBox.style.display = 'none';
    });

    // Close modals on clicking outside the card
    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) settingsModal.style.display = 'none';
        if (e.target === recipeDetailModal) recipeDetailModal.style.display = 'none';
        if (e.target === chefCompanionModal) exitChefCompanion();
    });
}

// Pantry logic
function addPantryItem() {
    const text = pantryInput.value.trim().toLowerCase();
    if (!text) return;
    
    if (!pantry.includes(text)) {
        pantry.push(text);
        savePantry();
    }
    pantryInput.value = '';
    pantryInput.focus();
}

function removePantryItem(item) {
    pantry = pantry.filter(i => i !== item);
    savePantry();
}

function updatePantryUI() {
    pantryCount.innerText = `${pantry.length} item${pantry.length === 1 ? '' : 's'} in pantry`;
    pantryList.innerHTML = '';
    
    if (pantry.length === 0) {
        pantryList.innerHTML = '<div class="pantry-empty-state">Pantry is empty. Type items or scan a photo!</div>';
        return;
    }
    
    pantry.forEach(item => {
        const div = document.createElement('div');
        div.className = 'pantry-item';
        div.innerHTML = `
            <span class="pantry-item-name">${item}</span>
            <div class="pantry-item-actions">
                <button class="delete-item-btn" aria-label="Delete ${item}">&times;</button>
            </div>
        `;
        
        div.querySelector('.delete-item-btn').addEventListener('click', () => {
            removePantryItem(item);
        });
        
        pantryList.appendChild(div);
    });
}

// Image handling
function handleImageUpload(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageBase64 = e.target.result;
        uploadPreview.src = uploadedImageBase64;
        uploadPlaceholder.style.display = 'none';
        uploadPreviewContainer.style.display = 'block';
        scanPhotoBtn.style.display = 'inline-flex';
        samplePhotoBtn.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function resetPhotoUploader() {
    uploadedImageBase64 = null;
    uploadPreview.src = '';
    photoUploadInput.value = '';
    uploadPlaceholder.style.display = 'flex';
    uploadPreviewContainer.style.display = 'none';
    scanPhotoBtn.style.display = 'none';
    samplePhotoBtn.style.display = 'inline-flex';
}

// Sample Photo Generation
function loadSamplePhoto() {
    // Generate simulated fridge scan image using direct reference to pre-placed image
    uploadedImageBase64 = "assets/fridge_sample.jpg";
    uploadPreview.src = uploadedImageBase64;
    uploadPlaceholder.style.display = 'none';
    uploadPreviewContainer.style.display = 'block';
    scanPhotoBtn.style.display = 'inline-flex';
    samplePhotoBtn.style.display = 'none';
    
    // Add visual laser pulsing to show user it is ready
    const laser = uploadPreviewContainer.querySelector('.scanner-laser');
    laser.style.animationPlayState = 'running';
}

// Scan Pantry Photo
async function scanPantryPhoto() {
    if (!uploadedImageBase64) return;
    
    scanPhotoBtn.disabled = true;
    scanPhotoBtn.innerHTML = '<div class="loading-spinner" style="width:14px;height:14px;margin:0;border-width:2px;"></div> Scanning...';
    
    const laser = uploadPreviewContainer.querySelector('.scanner-laser');
    laser.style.display = 'block';
    
    const api_key = localStorage.getItem('recipe_craft_api_key') || '';
    const demo_mode = localStorage.getItem('recipe_craft_force_demo') !== 'false';

    try {
        const response = await fetch('/api/recognize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                image: uploadedImageBase64,
                api_key: api_key,
                demo_mode: demo_mode
            })
        });
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Fridge scan API call failed");
        }
        
        const data = await response.json();
        
        // Add scanned ingredients to pantry
        if (data.ingredients && data.ingredients.length > 0) {
            data.ingredients.forEach(item => {
                const cleanItem = item.trim().toLowerCase();
                if (cleanItem && !pantry.includes(cleanItem)) {
                    pantry.push(cleanItem);
                }
            });
            savePantry();
            
            // Temporary popup animation success
            showNotification(`Gemini detected ${data.ingredients.length} items from photo! Added to pantry.`);
        }
        
        resetPhotoUploader();
        
    } catch (err) {
        console.error(err);
        alert(`Fridge Scan Failed: ${err.message}. Defaulting to sample mock items.`);
        // Fallback mock items
        const mockItems = ["chicken breast", "eggs", "cherry tomatoes", "baby spinach", "bell peppers", "greek yogurt", "garlic", "avocado"];
        mockItems.forEach(i => {
            if (!pantry.includes(i)) pantry.push(i);
        });
        savePantry();
        resetPhotoUploader();
    }
}

// Generate Recipes call
async function generateRecipes() {
    if (pantry.length === 0) {
        alert("Please add at least one ingredient to your pantry first!");
        return;
    }
    
    // UI state loading
    recipeEmptyState.style.display = 'none';
    recipeResults.style.display = 'none';
    recipesLoading.style.display = 'flex';
    
    // Scroll results area into view
    recipesLoading.scrollIntoView({ behavior: 'smooth' });

    const api_key = localStorage.getItem('recipe_craft_api_key') || '';
    const demo_mode = localStorage.getItem('recipe_craft_force_demo') !== 'false';

    try {
        const response = await fetch('/api/recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ingredients: pantry,
                restrictions: selectedDiets,
                api_key: api_key,
                demo_mode: demo_mode
            })
        });
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Recipe generation failed");
        }
        
        const data = await response.json();
        currentRecipes = data.recipes || [];
        
        renderRecipesGrid();
        
        recipesLoading.style.display = 'none';
        recipeResults.style.display = 'block';
        
    } catch (err) {
        console.error(err);
        alert(`Recipe Generation Failed: ${err.message}. Loaded mock recipe recommendations.`);
        
        // Mock fallback to make demo complete
        const mockResponse = {
            "recipes": [
                {
                    "title": "Mediterranean Chicken Scramble",
                    "description": "A delicious, high-protein skillet scramble with juicy chicken breast, sautéed bell peppers, spinach, and cherry tomatoes, topped with fresh avocado.",
                    "prep_time": "15 mins",
                    "difficulty": "Easy",
                    "macros": {
                        "calories": 420,
                        "protein": "38g",
                        "carbs": "8g",
                        "fat": "24g"
                    },
                    "ingredients": [
                        {"name": "chicken breast", "amount": "150g", "is_staple": false, "in_pantry": pantry.includes("chicken breast")},
                        {"name": "eggs", "amount": "2 large", "is_staple": false, "in_pantry": pantry.includes("eggs")},
                        {"name": "cherry tomatoes", "amount": "1/2 cup", "is_staple": false, "in_pantry": pantry.includes("cherry tomatoes")},
                        {"name": "baby spinach", "amount": "1 cup", "is_staple": false, "in_pantry": pantry.includes("baby spinach")},
                        {"name": "bell peppers", "amount": "1/2 cup", "is_staple": false, "in_pantry": pantry.includes("bell peppers")},
                        {"name": "garlic", "amount": "1 clove", "is_staple": false, "in_pantry": pantry.includes("garlic")},
                        {"name": "avocado", "amount": "1/2", "is_staple": false, "in_pantry": pantry.includes("avocado")},
                        {"name": "olive oil", "amount": "1 tbsp", "is_staple": true, "in_pantry": true}
                    ],
                    "instructions": [
                        "Dice the chicken breast and bell peppers into bite-sized pieces. Halve the cherry tomatoes.",
                        "Heat olive oil in a skillet over medium-high heat. Add garlic and chicken, cooking until golden brown (about 6 mins).",
                        "Toss in the bell peppers and cook for 3 more minutes until slightly softened.",
                        "Whisk eggs in a bowl and pour into the skillet, stirring gently to scramble with the chicken and peppers.",
                        "Fold in the baby spinach and cherry tomatoes, cooking just until the spinach wilts (1-2 mins).",
                        "Serve hot, topped with sliced avocado and a dollop of greek yogurt if desired."
                    ]
                },
                {
                    "title": "Creamy Garlic Salad with Chicken",
                    "description": "A crisp, nutrient-dense spinach salad loaded with cherry tomatoes, seasoned chicken breast, and sliced avocado, drizzled with a high-protein garlic yogurt dressing.",
                    "prep_time": "15 mins",
                    "difficulty": "Easy",
                    "macros": {
                        "calories": 390,
                        "protein": "34g",
                        "carbs": "9g",
                        "fat": "22g"
                    },
                    "ingredients": [
                        {"name": "chicken breast", "amount": "120g", "is_staple": false, "in_pantry": pantry.includes("chicken breast")},
                        {"name": "greek yogurt", "amount": "1/3 cup", "is_staple": false, "in_pantry": pantry.includes("greek yogurt")},
                        {"name": "baby spinach", "amount": "2 cups", "is_staple": false, "in_pantry": pantry.includes("baby spinach")},
                        {"name": "cherry tomatoes", "amount": "1/2 cup", "is_staple": false, "in_pantry": pantry.includes("cherry tomatoes")},
                        {"name": "avocado", "amount": "1/2", "is_staple": false, "in_pantry": pantry.includes("avocado")},
                        {"name": "garlic", "amount": "1 clove", "is_staple": false, "in_pantry": pantry.includes("garlic")},
                        {"name": "lemon juice", "amount": "1 tsp", "is_staple": true, "in_pantry": true},
                        {"name": "olive oil", "amount": "1 tsp", "is_staple": true, "in_pantry": true}
                    ],
                    "instructions": [
                        "Season chicken breast with salt and pepper. Sauté in olive oil until fully cooked (6-8 mins), then slice.",
                        "To make the dressing: Whisk greek yogurt, minced garlic, lemon juice, salt, and pepper in a small bowl until smooth.",
                        "Wash spinach and place in a large serving bowl. Add halved cherry tomatoes.",
                        "Toss spinach and tomatoes with the garlic-yogurt dressing.",
                        "Top with sliced avocado and the sliced warm chicken breast. Serve immediately."
                    ]
                },
                {
                    "title": "Spinach & Pepper Egg Cups",
                    "description": "High-protein, low-carb baked egg muffins packed with chopped spinach, red bell peppers, and garlic. Perfect for meal prep.",
                    "prep_time": "20 mins",
                    "difficulty": "Easy",
                    "macros": {
                        "calories": 220,
                        "protein": "19g",
                        "carbs": "4g",
                        "fat": "14g"
                    },
                    "ingredients": [
                        {"name": "eggs", "amount": "4 large", "is_staple": false, "in_pantry": pantry.includes("eggs")},
                        {"name": "baby spinach", "amount": "1 cup", "is_staple": false, "in_pantry": pantry.includes("baby spinach")},
                        {"name": "bell peppers", "amount": "1/2 cup", "is_staple": false, "in_pantry": pantry.includes("bell peppers")},
                        {"name": "garlic", "amount": "1 clove", "is_staple": false, "in_pantry": pantry.includes("garlic")},
                        {"name": "salt & pepper", "amount": "to taste", "is_staple": true, "in_pantry": true}
                    ],
                    "instructions": [
                        "Preheat oven to 375°F (190°C) and grease a muffin tin with olive oil spray.",
                        "Finely chop the baby spinach, bell peppers, and mince the garlic.",
                        "Whisk the eggs in a large bowl. Stir in the chopped spinach, peppers, garlic, salt, and pepper.",
                        "Divide the egg mixture evenly among 4 muffin cups.",
                        "Bake for 15-18 minutes, or until the center of the egg cups is set and slightly golden.",
                        "Let cool for 2 minutes, then pop them out and serve."
                    ]
                }
            ]
        };
        currentRecipes = mockResponse.recipes;
        renderRecipesGrid();
        recipesLoading.style.display = 'none';
        recipeResults.style.display = 'block';
    }
}

// Renders the recipes list cards
function renderRecipesGrid() {
    recipesGrid.innerHTML = '';
    
    currentRecipes.forEach((recipe, idx) => {
        // Calculate background gradients based on title terms
        let gradientClass = "grad-default";
        const titleL = recipe.title.toLowerCase();
        if (titleL.includes("salad") || titleL.includes("spinach") || titleL.includes("veggie")) {
            gradientClass = "grad-green";
        } else if (titleL.includes("chicken") || titleL.includes("scramble") || titleL.includes("egg")) {
            gradientClass = "grad-copper";
        } else if (titleL.includes("muffins") || titleL.includes("cup") || titleL.includes("toast")) {
            gradientClass = "grad-pink";
        }
        
        // Count how many ingredients are available in pantry
        const totalNonStaples = recipe.ingredients.filter(i => !i.is_staple).length;
        const availableInPantry = recipe.ingredients.filter(i => !i.is_staple && i.in_pantry).length;
        const matchPct = totalNonStaples > 0 ? Math.round((availableInPantry / totalNonStaples) * 100) : 100;
        
        // Setup macro breakdown mini variables
        const prot = parseInt(recipe.macros.protein) || 20;
        const carb = parseInt(recipe.macros.carbs) || 20;
        const fat = parseInt(recipe.macros.fat) || 10;
        const sum = prot + carb + fat;
        const pPct = Math.round((prot / sum) * 100);
        const cPct = Math.round((carb / sum) * 100);
        const fPct = 100 - pPct - cPct;
        
        const card = document.createElement('article');
        card.className = 'recipe-card';
        card.innerHTML = `
            <div class="recipe-card-header ${gradientClass}">
                <div class="card-gradient-overlay"></div>
                <div class="card-badges">
                    <span class="card-badge">${recipe.difficulty}</span>
                    <span class="card-badge">${recipe.prep_time}</span>
                </div>
                <h3 class="recipe-card-title">${recipe.title}</h3>
            </div>
            <div class="recipe-card-body">
                <p class="recipe-card-desc">${recipe.description}</p>
                <div class="card-meta-row">
                    <div class="card-stat">
                        <span class="stat-val">${recipe.macros.calories} kcal</span>
                        <span class="stat-label">Energy</span>
                    </div>
                    <div class="card-stat">
                        <span class="stat-val" style="color:var(--brand-primary);">${matchPct}% Match</span>
                        <span class="stat-label">${availableInPantry}/${totalNonStaples} ingredients</span>
                    </div>
                    <div class="macro-circle-container">
                        <div class="macro-mini-chart" style="background: conic-gradient(var(--brand-pink) 0% ${pPct}%, var(--brand-accent) ${pPct}% ${pPct + cPct}%, var(--brand-secondary) ${pPct + cPct}% 100%)"></div>
                        <div class="macro-mini-legend">
                            <div>P: <strong>${recipe.macros.protein}</strong></div>
                            <div>C: <strong>${recipe.macros.carbs}</strong></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => openRecipeDetail(recipe));
        recipesGrid.appendChild(card);
    });
}

// Color headers gradient style injections
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  .grad-green { background: linear-gradient(135deg, #0f5132 0%, #157347 100%); }
  .grad-copper { background: linear-gradient(135deg, #664d03 0%, #856404 100%); }
  .grad-pink { background: linear-gradient(135deg, #6b21a8 0%, #8b5cf6 100%); }
  .grad-default { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); }
`;
document.head.appendChild(styleSheet);

// Open Detailed View
function openRecipeDetail(recipe) {
    activeRecipe = recipe;
    
    // Set Header Gradient class
    const titleL = recipe.title.toLowerCase();
    const gradHeader = document.getElementById('detail-header-gradient');
    gradHeader.className = "recipe-detail-header-img";
    if (titleL.includes("salad") || titleL.includes("spinach") || titleL.includes("veggie")) {
        gradHeader.classList.add("grad-green");
    } else if (titleL.includes("chicken") || titleL.includes("scramble") || titleL.includes("egg")) {
        gradHeader.classList.add("grad-copper");
    } else if (titleL.includes("muffins") || titleL.includes("cup") || titleL.includes("toast")) {
        gradHeader.classList.add("grad-pink");
    } else {
        gradHeader.classList.add("grad-default");
    }
    
    // Set title and content
    document.getElementById('detail-title').innerText = recipe.title;
    document.getElementById('detail-desc').innerText = recipe.description;
    document.getElementById('detail-difficulty').innerText = recipe.difficulty;
    document.getElementById('detail-time').innerText = recipe.prep_time;
    document.getElementById('detail-calories').innerText = `${recipe.macros.calories} kcal`;
    
    document.getElementById('detail-p').innerText = recipe.macros.protein;
    document.getElementById('detail-c').innerText = recipe.macros.carbs;
    document.getElementById('detail-f').innerText = recipe.macros.fat;
    
    // Adjust mini macro ring chart
    const prot = parseInt(recipe.macros.protein) || 20;
    const carb = parseInt(recipe.macros.carbs) || 20;
    const fat = parseInt(recipe.macros.fat) || 10;
    const sum = prot + carb + fat;
    const pPct = Math.round((prot / sum) * 100);
    const cPct = Math.round((carb / sum) * 100);
    
    const chart = document.getElementById('detail-macro-chart');
    chart.style.background = `conic-gradient(var(--brand-pink) 0% ${pPct}%, var(--brand-accent) ${pPct}% ${pPct + cPct}%, var(--brand-secondary) ${pPct + cPct}% 100%)`;
    
    // Populate ingredients list with pantry matching visual cues
    const ingList = document.getElementById('detail-ingredients-list');
    ingList.innerHTML = '';
    recipe.ingredients.forEach(ing => {
        // Skip hidden items (e.g. vegetarian adjustments)
        if (ing.hide) return;
        
        const li = document.createElement('li');
        li.className = ing.in_pantry ? 'in-pantry-item' : 'missing-pantry-item';
        li.innerHTML = `<span><strong>${ing.amount || ''}</strong> ${ing.name}</span>`;
        ingList.appendChild(li);
    });
    
    // Populate steps overview
    const stepsList = document.getElementById('detail-steps-list');
    stepsList.innerHTML = '';
    recipe.instructions.forEach(step => {
        const li = document.createElement('li');
        li.innerText = step;
        stepsList.appendChild(li);
    });
    
    recipeDetailModal.style.display = 'flex';
}

// Launch Step by Step Chef
function launchChefCompanion() {
    recipeDetailModal.style.display = 'none';
    chefRecipeTitle.innerText = activeRecipe.title;
    currentStepIndex = 0;
    
    // Reset any previous adaptations
    adaptationResultBox.style.display = 'none';
    
    // Populate dropdown with secondary (non-staple) ingredients of this recipe
    missingIngredientSelect.innerHTML = '';
    const ingredientsToChoose = activeRecipe.ingredients.filter(i => !i.is_staple);
    ingredientsToChoose.forEach(ing => {
        const opt = document.createElement('option');
        opt.value = ing.name;
        opt.innerText = ing.name;
        missingIngredientSelect.appendChild(opt);
    });
    
    renderActiveStep();
    chefCompanionModal.style.display = 'flex';
}

// Renders the cooking step
function renderActiveStep() {
    const totalSteps = activeRecipe.instructions.length;
    const progressPct = Math.round(((currentStepIndex + 1) / totalSteps) * 100);
    
    chefStepIndicator.innerText = `Step ${currentStepIndex + 1} of ${totalSteps}`;
    chefPercentage.innerText = `${progressPct}% Complete`;
    chefProgressBar.style.width = `${progressPct}%`;
    
    chefStepNum.innerText = currentStepIndex + 1;
    chefStepText.innerText = activeRecipe.instructions[currentStepIndex];
    
    // Prev button state
    chefPrevBtn.disabled = currentStepIndex === 0;
    
    // Next / Finish button label
    if (currentStepIndex === totalSteps - 1) {
        chefNextBtn.querySelector('span').innerText = "Finish Recipe";
    } else {
        chefNextBtn.querySelector('span').innerText = "Next Step";
    }
    
    // Stop speaking when step changes
    stopSpeaking();
}

function prevStep() {
    if (currentStepIndex > 0) {
        currentStepIndex--;
        renderActiveStep();
    }
}

function nextStep() {
    const totalSteps = activeRecipe.instructions.length;
    if (currentStepIndex < totalSteps - 1) {
        currentStepIndex++;
        renderActiveStep();
    } else {
        // Complete cooking
        exitChefCompanion();
        showNotification("Congratulations! You've crafted a delicious meal with RecipeCraft AI!");
    }
}

// Voice synthesis
function toggleSpeech() {
    if (isSpeaking) {
        stopSpeaking();
    } else {
        startSpeaking();
    }
}

function startSpeaking() {
    if (!speechSynth) {
        alert("Text-to-speech is not supported in your browser.");
        return;
    }
    
    // Cancel any ongoing speaking
    speechSynth.cancel();
    
    const text = chefStepText.innerText;
    currentUtterance = new SpeechSynthesisUtterance(text);
    
    currentUtterance.onend = function() {
        stopSpeaking();
    };
    
    currentUtterance.onerror = function() {
        stopSpeaking();
    };
    
    isSpeaking = true;
    speechBtn.classList.add('speaking-active');
    speechBtn.querySelector('span').innerText = "Stop Reading";
    speakingVisualizer.style.display = 'flex';
    
    speechSynth.speak(currentUtterance);
}

function stopSpeaking() {
    if (speechSynth && isSpeaking) {
        speechSynth.cancel();
    }
    isSpeaking = false;
    speechBtn.classList.remove('speaking-active');
    speechBtn.querySelector('span').innerText = "Listen to Instructions";
    speakingVisualizer.style.display = 'none';
}

// Adapt recipe mid-way endpoint call
//async class AdaptPayload {
  //  constructor(recipe_title, current_step, missing_ingredient, api_key, demo_mode) {
    //    this.recipe_title = recipe_title;
      //  this.current_step = current_step;
        //this.missing_ingredient = missing_ingredient;
  //      this.api_key = api_key;
    //    this.demo_mode = demo_mode;
    //}
//}

async function requestRecipeAdaptation() {
    const missingIng = missingIngredientSelect.value;
    if (!missingIng) return;
    
    submitAdaptBtn.disabled = true;
    submitAdaptBtn.innerText = "Adapting...";
    
    const api_key = localStorage.getItem('recipe_craft_api_key') || '';
    const demo_mode = localStorage.getItem('recipe_craft_force_demo') !== 'false';
    const currentStepText = activeRecipe.instructions[currentStepIndex];

    try {
        const response = await fetch('/api/adapt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                recipe_title: activeRecipe.title,
                current_step: currentStepText,
                missing_ingredient: missingIng,
                api_key: api_key,
                demo_mode: demo_mode
            })
        });
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Recipe adaptation failed");
        }
        
        const data = await response.json();
        
        // Display results
        adaptationMsg.innerHTML = data.substitution_message || `Substitute ${missingIng} dynamically.`;
        
        adaptedStepsList.innerHTML = '';
        const steps = data.adapted_instructions || [];
        steps.forEach(st => {
            const li = document.createElement('li');
            li.innerText = st;
            adaptedStepsList.appendChild(li);
        });
        
        // Hide request panel inputs, show response panel
        subSelectionForm.style.display = 'none';
        adaptationResultBox.style.display = 'block';
        
    } catch (err) {
        console.error(err);
        alert(`Adaptation request failed: ${err.message}. Applied simple substitution recommendation.`);
        
        // Fallback local substitution logic
        adaptationMsg.innerHTML = `No worries! Since you ran out of **${missingIng}**, you can skip it or substitute it with similar pantry items.`;
        adaptedStepsList.innerHTML = `
            <li>Step ${currentStepIndex + 1}: Sauté remaining ingredients, omitting ${missingIng}.</li>
            <li>Step [Adjusted]: Increase heating time slightly for the remaining items if needed.</li>
        `;
        subSelectionForm.style.display = 'none';
        adaptationResultBox.style.display = 'block';
    } finally {
        submitAdaptBtn.disabled = false;
        submitAdaptBtn.innerText = "Adapt Recipe";
    }
}

// Exit Chef companion cleanly
function exitChefCompanion() {
    stopSpeaking();
    chefCompanionModal.style.display = 'none';
}

// Floating notification helper
function showNotification(message) {
    const div = document.createElement('div');
    div.innerText = message;
    div.style.position = 'fixed';
    div.style.bottom = '20px';
    div.style.left = '50%';
    div.style.transform = 'translateX(-50%)';
    div.style.background = 'rgba(16, 185, 129, 0.95)';
    div.style.color = '#042f1a';
    div.style.padding = '0.8rem 1.6rem';
    div.style.borderRadius = '30px';
    div.style.fontWeight = 'bold';
    div.style.fontSize = '0.88rem';
    div.style.zIndex = '300';
    div.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    div.style.animation = 'fadeIn 0.3s ease, fadeOut 0.3s ease 2.7s';
    
    document.body.appendChild(div);
    
    // Auto-remove notification from DOM after animation completes
    setTimeout(() => {
        div.remove();
    }, 3000);
}

// Inject fadeOut animation helper style for notifications
const fadeOutStyle = document.createElement("style");
fadeOutStyle.innerText = `
  @keyframes fadeOut {
    from { opacity: 1; transform: translate(-50%, 0); }
    to { opacity: 0; transform: translate(-50%, 10px); }
  }
`;
document.head.appendChild(fadeOutStyle);
// ===== AUTH LOGIC (Mocked) =====

function getUsers() {
    const raw = localStorage.getItem('recipe_craft_users');
    return raw ? JSON.parse(raw) : {};
}

function saveUsers(users) {
    localStorage.setItem('recipe_craft_users', JSON.stringify(users));
}

function checkAuthState() {
    const currentUser = localStorage.getItem('recipe_craft_current_user');
    const authModal = document.getElementById('auth-modal');
    const appWrapper = document.getElementById('app-wrapper');

    if (currentUser) {
        const user = JSON.parse(currentUser);
        document.getElementById('user-name-display').innerText = user.name;
        authModal.style.display = 'none';
        appWrapper.style.display = 'block';
        startApp();
    } else {
        authModal.style.display = 'flex';
        appWrapper.style.display = 'none';
    }
}

function setupAuthListeners() {
    const loginTabBtn = document.getElementById('login-tab-btn');
    const signupTabBtn = document.getElementById('signup-tab-btn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const logoutBtn = document.getElementById('logout-btn');

    loginTabBtn.addEventListener('click', () => {
        loginTabBtn.classList.add('active');
        signupTabBtn.classList.remove('active');
        loginForm.style.display = 'flex';
        signupForm.style.display = 'none';
    });

    signupTabBtn.addEventListener('click', () => {
        signupTabBtn.classList.add('active');
        loginTabBtn.classList.remove('active');
        signupForm.style.display = 'flex';
        loginForm.style.display = 'none';
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim().toLowerCase();
        const password = document.getElementById('signup-password').value;
        const errorEl = document.getElementById('signup-error');

        const users = getUsers();
        if (users[email]) {
            errorEl.innerText = "An account with this email already exists.";
            return;
        }

        users[email] = { name, password };
        saveUsers(users);

        localStorage.setItem('recipe_craft_current_user', JSON.stringify({ name, email }));
        errorEl.innerText = '';
        checkAuthState();
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');

        const users = getUsers();
        const user = users[email];

        if (!user || user.password !== password) {
            errorEl.innerText = "Invalid email or password.";
            return;
        }

        localStorage.setItem('recipe_craft_current_user', JSON.stringify({ name: user.name, email }));
        errorEl.innerText = '';
        checkAuthState();
    });

    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('recipe_craft_current_user');
        checkAuthState();
    });
}

// Run init on DOM load
window.addEventListener('DOMContentLoaded', init);
