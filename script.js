// Data des plats pour la modale
const DISHES_DATA = {
    attieke: { name: "Attiékè", desc: "Attiékè servi avec poisson ou viande au choix, garni d'oignons et piments." },
    brunch: { name: "Pain Brunch", desc: "Pain garni complet spécial brunch du chef." },
    spaghetti: { name: "Spaghetti", desc: "Spaghetti sautés assaisonnés à la béninoise." },
    salade: { name: "Salade Express", desc: "Mélange frais de crudités et garnitures." },
    jollof: { name: "Riz Jollof", desc: "Riz gras épicé accompagné de sa viande/poisson." },
    grillades: { name: "Grillades", desc: "Assortiment de viandes ou poissons grillés au feu de bois." },
    tchiep: { name: "Tchiep", desc: "Riz au poisson ou viandes façon sénégalaise." },
    chawarma: { name: "Chawarma", desc: "Pain pita garni de viande émincée, sauce et crudités." },
    jus: { name: "Jus Natures", desc: "Jus faits maison sans additifs (Bissap, Ananas, Gingembre...)." }
};

let currentDishKey = null;
let currentCart = [];

// 1. Charger les informations enregistrées
document.addEventListener('DOMContentLoaded', () => {
    const savedNom = localStorage.getItem('resto_nom');
    const savedTel = localStorage.getItem('resto_tel');

    if (savedNom) document.getElementById('nom').value = savedNom;
    if (savedTel) document.getElementById('telephone').value = savedTel;
});

// 2. Transition de la page d'accueil
document.getElementById('startBtn').addEventListener('click', () => {
    const hero = document.getElementById('hero');
    const booking = document.getElementById('booking');

    hero.style.transform = 'translateY(-100vh)';

    setTimeout(() => {
        hero.style.display = 'none';
        booking.classList.remove('hidden');
        booking.classList.add('slide-up');
    }, 400);
});

// 3. Gestion de la Modale
function openDishModal(dishKey) {
    currentDishKey = dishKey;
    const dish = DISHES_DATA[dishKey] || { name: "Plat", desc: "" };

    document.getElementById('modalDishName').textContent = dish.name;
    document.getElementById('modalDishDesc').textContent = dish.desc;

    // Reset du formulaire modale
    document.getElementById('priceSelect').value = "1500";
    document.getElementById('customPriceInput').style.display = "none";
    document.getElementById('customPriceInput').value = "";
    document.getElementById('addDrink').checked = false;
    document.getElementById('drinkQty').style.display = "none";
    document.getElementById('drinkQty').value = "1";

    document.getElementById('dishModal').style.display = "flex";
}

function closeDishModal() {
    document.getElementById('dishModal').style.display = "none";
}

function toggleCustomPrice() {
    const select = document.getElementById('priceSelect');
    const customInput = document.getElementById('customPriceInput');
    customInput.style.display = (select.value === 'custom') ? 'block' : 'none';
}

// Option afficher la quantité de jus
document.getElementById('addDrink').addEventListener('change', (e) => {
    document.getElementById('drinkQty').style.display = e.target.checked ? 'block' : 'none';
});

// 4. Ajouter la sélection au Panier
function addToCart() {
    const select = document.getElementById('priceSelect');
    let price = 0;

    if (select.value === 'custom') {
        price = parseInt(document.getElementById('customPriceInput').value);
        if (isNaN(price) || price < 1000) {
            alert("Veuillez saisir un montant valide d'au moins 1 000 FCFA.");
            return;
        }
    } else {
        price = parseInt(select.value);
    }

    const dishName = DISHES_DATA[currentDishKey] ? DISHES_DATA[currentDishKey].name : "Plat";
    
    // Ajout du plat
    currentCart.push({ name: dishName, price: price });

    // Ajout du Jus si coché
    const addDrink = document.getElementById('addDrink').checked;
    if (addDrink) {
        const qty = parseInt(document.getElementById('drinkQty').value) || 1;
        const drinkPrice = qty * 250;
        currentCart.push({ name: `Jus Nature (x${qty})`, price: drinkPrice });
    }

    updateTotalUI();
    closeDishModal();
}

function updateTotalUI() {
    const total = currentCart.reduce((sum, item) => sum + item.price, 0);
    document.getElementById('totalAmount').textContent = `${total.toLocaleString()} FCFA`;
}

// 5. Validation et Lancement KKiaPay
document.getElementById('orderForm').addEventListener('submit', (e) => {
    e.preventDefault();

    if (currentCart.length === 0) {
        alert("Votre panier est vide ! Cliquez sur un plat pour choisir votre format.");
        return;
    }

    const nom = document.getElementById('nom').value;
    const telephone = document.getElementById('telephone').value;

    localStorage.setItem('resto_nom', nom);
    localStorage.setItem('resto_tel', telephone);

    if (typeof openKkiapayWidget === "undefined") {
        alert("Erreur : Le module KKiaPay n'a pas pu être chargé. Vérifiez votre connexion internet.");
        return;
    }

    const total = currentCart.reduce((sum, item) => sum + item.price, 0);

    openKkiapayWidget({
        amount: total,
        position: "center",
        data: "Commande Oro Ife Foods",
        key: "377de68097c711f1b6fc09343ab4492d",
        sandbox: true
    });
});

// 6. Gestion du succès de paiement et notification WhatsApp
if (typeof addSuccessListener !== "undefined") {
    addSuccessListener((response) => {
        const transactionId = response.transactionId || "VALIDE";
        const nom = localStorage.getItem('resto_nom') || "Client";
        const telephone = localStorage.getItem('resto_tel') || "";
        const heure = document.getElementById('heure').value || "Non précisée";
        const numeroResto = "2290197373849";

        // Détails du panier
        let recapPanier = currentCart.map(item => `- ${item.name} : ${item.price} FCFA`).join('\n');
        const total = currentCart.reduce((sum, item) => sum + item.price, 0);

        const messageTexte = `*NOUVELLE COMMANDE PAYÉE* 🎯\n\n` +
            `*Nom :* ${nom}\n` +
            `*Téléphone :* ${telephone}\n` +
            `*Heure de retrait :* ${heure}\n\n` +
            `*Détails de la commande :*\n${recapPanier}\n\n` +
            `*Total payé :* ${total} FCFA\n` +
            `*ID Transaction :* ${transactionId}`;

        // Afficher la confirmation à l'écran
        afficherConfirmationCommande(transactionId);

        // Redirection WhatsApp 
// Méthode recommandée (Redirige vers l'appli sur mobile, et Web sur PC)
const whatsappUrl = `https://wa.me/${numeroResto}?text=${encodeURIComponent(messageTexte)}`;

// OU pour forcer l'ouverture directe de l'application mobile (deep link) :
 const whatsappUrl = `whatsapp://send?phone=${numeroResto}&text=${encodeURIComponent(messageTexte)}`;
        setTimeout(() => {
            window.location.href = whatsappUrl;
        }, 2000);
    });
}

function afficherConfirmationCommande(id, whatsappUrl) {
    const conteneur = document.querySelector("#checkout-container");
    if (conteneur) {
        conteneur.innerHTML = `
            <div style="text-align: center; padding: 30px;">
                <h2 style="color: #2ea44f;">Commande confirmée & payée ! 🎉</h2>
                <p style="margin: 15px 0;">Référence : <strong>${id}</strong></p>
                <p style="margin-bottom: 20px;">Si la redirection vers WhatsApp ne se fait pas automatiquement :</p>
                
                <a href="${whatsappUrl}" class="btn-submit" style="display: inline-block; text-decoration: none;">
                    Envoyer le reçu sur WhatsApp 💬
                </a>
            </div>
        `;
    }
}
