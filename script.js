/**
 * Carte de Visite Numérique - Script Principal
 * Version: 2.0.0
 * Refactorisé pour modularité et performance
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- CONFIGURATION GLOBALE ---
    const CONFIG = {
        typingSpeed: 30,
        scrollThreshold: 0.1,
        currencyRates: {
            EUR: 655.957,
            USD: 610
        },
        prices: {
            base: {
                digital: 75000,
                gestion: 250000,
                logistique: 350000
            }
        },
        modes: {
            individual: {
                id: 'ID: AD-ML-2026',
                avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Adama&top=hoodie&accessories=sunglasses&hair=dreads&skinColor=edb98a&clotheColor=3c4f76',
                name: 'Adama Deze KONATE',
                role: 'Créateur',
                badges: ['GoLang', 'Java', 'SecOps'],
                backTitle: 'CONTACT',
                ctaText: 'TÉLÉCHARGER CV'
            },
            enterprise: {
                id: 'REF: ADK-LOG-88',
                avatar: 'ADKLOGO.png',
                name: 'ADK SERVICE',
                role: 'Transport & Transit',
                badges: ['Certifié ISO', 'B2B', 'International'],
                backTitle: 'NOS SERVICES',
                ctaText: 'PRENDRE RDV'
            },
            shop: {
                id: 'REF: PROD-2077',
                avatar: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=150&h=150&q=80',
                name: 'CASQUE NEURAL X1',
                role: '450.000 FCFA',
                badges: ['Promo -20%', 'En Stock', 'Garantie 2ans'],
                backTitle: 'COMMANDER',
                ctaText: 'ACHETER (WhatsApp)'
            }
        }
    };

    // --- CLASS: GESTION DE LA CARTE ---
    class BusinessCard {
        constructor() {
            this.card = document.getElementById('businessCard');
            this.resetBtn = document.getElementById('resetCardBtn');
            this.modeBtns = document.querySelectorAll('.mode-btn');
            
            // Cache des éléments UI pour éviter les requêtes répétées
            this.ui = {
                id: document.getElementById('card-id'),
                avatar: document.getElementById('card-avatar'),
                name: document.getElementById('card-name'),
                role: document.getElementById('card-role'),
                badges: document.getElementById('card-badges'),
                backTitle: document.getElementById('card-back-title'),
                ctaText: document.querySelector('#card-cta span')
            };

            if (this.card) this.init();
        }

        init() {
            this.bindEvents();
        }

        bindEvents() {
            // Retournement de la carte
            this.card.addEventListener('click', () => this.toggleFlip());

            // Empêcher le retournement sur les éléments interactifs
            this.card.querySelectorAll('a, button').forEach(el => {
                el.addEventListener('click', (e) => e.stopPropagation());
            });

            // Bouton Reset
            if (this.resetBtn) {
                this.resetBtn.addEventListener('click', () => this.resetState());
            }

            // Changement de mode
            this.modeBtns.forEach(btn => {
                btn.addEventListener('click', (e) => this.switchMode(e));
            });
        }

        toggleFlip() {
            this.card.classList.toggle('is-flipped');
        }

        resetState() {
            this.card.classList.remove('is-flipped');
            this.card.style.transform = '';
        }

        switchMode(e) {
            const btn = e.currentTarget; // Plus sûr que target si le bouton contient des icônes
            const mode = btn.dataset.mode;
            const data = CONFIG.modes[mode];

            if (!data) return;

            // Mise à jour UI des boutons
            this.modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Mise à jour du contenu
            this.updateContent(data, mode);
        }

        updateContent(data, mode) {
            const safeSet = (el, val) => { if(el) el.textContent = val; };
            
            safeSet(this.ui.id, data.id);
            if (this.ui.avatar) this.ui.avatar.src = data.avatar;
            safeSet(this.ui.name, data.name);
            safeSet(this.ui.role, data.role);
            safeSet(this.ui.backTitle, data.backTitle);
            safeSet(this.ui.ctaText, data.ctaText);

            if (this.ui.badges) {
                this.ui.badges.innerHTML = data.badges.map(badge => 
                    `<span class="tech-badge ${mode === 'enterprise' ? 'sec' : ''}">${badge}</span>`
                ).join('');
            }
        }
    }

    // --- CLASS: CALCULATEUR DE DEVIS ---
    class QuoteCalculator {
        constructor() {
            this.inputs = {
                service: document.getElementById('serviceType'),
                size: document.getElementById('companySize'),
                currency: document.getElementById('currencySelector'),
                btn: document.getElementById('calculateBtn')
            };
            this.display = document.getElementById('totalPrice');

            if (this.inputs.service && this.display) this.init();
        }

        init() {
            // Écouteurs globaux pour le recalcul en temps réel
            const allInputs = [
                this.inputs.service, 
                this.inputs.size, 
                this.inputs.currency,
                ...document.querySelectorAll('.feature-check')
            ];

            allInputs.forEach(input => {
                if(input) input.addEventListener('change', () => this.calculate());
            });

            if (this.inputs.btn) {
                this.inputs.btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.calculate();
                });
            }

            // Calcul initial
            this.calculate();
        }

        calculate() {
            const serviceType = this.inputs.service.value;
            const companySize = parseFloat(this.inputs.size.value) || 1;
            const currency = this.inputs.currency.value;
            
            // Prix de base
            const basePrice = CONFIG.prices.base[serviceType] || 0;

            // Options
            let featuresPrice = 0;
            document.querySelectorAll('.feature-check:checked').forEach(feature => {
                featuresPrice += parseFloat(feature.value) || 0;
            });

            // Total FCFA
            const total = (basePrice * companySize) + featuresPrice;

            this.render(total, currency);
        }

        render(amount, currency) {
            let finalPrice = amount;
            let symbol = ' FCFA';
            let decimals = 0;

            if (currency === 'EUR') {
                finalPrice = amount / CONFIG.currencyRates.EUR;
                symbol = ' €';
                decimals = 2;
            } else if (currency === 'USD') {
                finalPrice = amount / CONFIG.currencyRates.USD;
                symbol = ' $';
                decimals = 2;
            }

            const formatter = new Intl.NumberFormat('fr-FR', { 
                maximumFractionDigits: decimals,
                minimumFractionDigits: decimals
            });
            
            this.display.textContent = formatter.format(finalPrice) + symbol;
        }
    }

    // --- UTILS: ANIMATIONS ---
    const initAnimations = () => {
        // Scroll Reveal
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('active');
            });
        }, { threshold: CONFIG.scrollThreshold });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

        // Typewriter Effect (Optimisé)
        const heroText = document.querySelector('.hero-content p');
        if (heroText) {
            const text = "Solutions Numériques & Logistiques Globales.\nTransformez votre activité avec nos technologies de pointe.";
            heroText.textContent = ''; 
            heroText.style.opacity = '1';
            
            let i = 0;
            const type = () => {
                if (i < text.length) {
                    const char = text.charAt(i);
                    if (char === '\n') {
                        heroText.appendChild(document.createElement('br'));
                    } else {
                        heroText.appendChild(document.createTextNode(char));
                    }
                    i++;
                    setTimeout(type, CONFIG.typingSpeed);
                }
            };
            setTimeout(type, 800);
        }
    };

    // --- INITIALISATION ---
    new BusinessCard();
    new QuoteCalculator();
    initAnimations();
});
