// --- GESTION DE LA NAVIGATION ---
document.getElementById('startBtn').addEventListener('click', function() {
    const hero = document.getElementById('hero');
    const booking = document.getElementById('booking');
    
    hero.style.transform = 'translateY(-100vh)';
    setTimeout(() => {
        hero.style.display = 'none';
        booking.classList.remove('hidden');
        booking.classList.add('slide-up');
    }, 400);
});

// --- DONNÉES DU MENU ---
const dishesData = {
    'attieke': { name: 'Attiékè', desc: 'Poisson frit ou poulet assaisonné, servi avec de l\'attiékè frais et des condiments.' },
    'brunch': { name: 'Pain Brunch', desc: 'Garni d\'œufs, saucisses et légumes frais, idéal pour un repas rapide.' },
    'spaghetti': { name: 'Spaghetti Express', desc: 'Sautés avec viande hachée, épices locales et sauce tomate maison.' },
    'salade': { name: 'Salade Composee', desc: 'Fraîcheur garantie avec légumes croquants, œuf dur et vinaigrette maison.' },
    'jollof': { name: 'Riz Jollof', desc: 'Riz au gras parfumé aux épices, accompagné de poulet ou poisson au choix.' },
    'grillades': { name: 'Grillades', desc: 'Brochettes de viande assaisonnées et grillées au feu de bois.' },
    'tchiep': { name: 'Tchiep', desc: 'Riz au poisson ou viandes façon sénégalaise.' },
    'chawarma': { name: 'Chawarma', desc: 'Pain pita fourré de viande bien assaisonnée, frites et sauce spéciale.' },
    'jus': { name: 'Jus Natures', desc: 'Jus frais maison (Bissap, Ananas, Gingembre ou Tamarin).' }
};

let selectedDish = null;
let cartItems = [];

function renderCart() {
    const cartContainer = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    cartCount.innerText = `${itemCount} ${itemCount === 1 ? 'article' : 'articles'}`;
    document.getElementById('totalAmount').innerText = `${total.toLocaleString()} FCFA`;

    if (!cartItems.length) {
        cartContainer.innerHTML = '<p class="empty-cart">Votre panier est vide. Choisissez un plat pour commencer.</p>';
        return;
    }

    cartContainer.innerHTML = cartItems.map((item, index) => `
        <div class="cart-row">
            <div>
                <strong>${item.name}</strong>
                <small>${item.quantity} x ${item.unitPrice.toLocaleString()} F${item.drinkDetails}</small>
            </div>
            <span class="cart-price">${item.totalPrice.toLocaleString()} F</span>
            <button type="button" class="remove-item" onclick="removeFromCart(${index})" aria-label="Supprimer ${item.name}">&times;</button>
        </div>
    `).join('');
}

function removeFromCart(index) {
    cartItems.splice(index, 1);
    renderCart();
}

// --- GESTION DU MODAL ---
function openDishModal(dishKey) {
    selectedDish = dishesData[dishKey];
    if (!selectedDish) return;

    document.getElementById('modalDishName').innerText = selectedDish.name;
    document.getElementById('modalDishDesc').innerText = selectedDish.desc;
    
    // Réinitialisation des choix
    document.getElementById('priceSelect').value = "1500";
    document.getElementById('customPriceInput').style.display = 'none';
    document.getElementById('customPriceInput').value = '';
    document.getElementById('addDrink').checked = false;
    document.getElementById('drinkQty').style.display = 'none';
    document.getElementById('drinkQty').value = 1;

    document.getElementById('dishModal').style.display = 'flex';
}

function closeDishModal() {
    document.getElementById('dishModal').style.display = 'none';
}

function toggleCustomPrice() {
    const priceSelect = document.getElementById('priceSelect');
    const customInput = document.getElementById('customPriceInput');
    customInput.style.display = (priceSelect.value === 'custom') ? 'block' : 'none';
}

// Gestion de la boisson
document.getElementById('addDrink').addEventListener('change', function() {
    document.getElementById('drinkQty').style.display = this.checked ? 'block' : 'none';
});

function addToCart() {
    const priceSelect = document.getElementById('priceSelect');
    let itemPrice = 0;

    if (priceSelect.value === 'custom') {
        itemPrice = parseInt(document.getElementById('customPriceInput').value) || 0;
        if (itemPrice < 1000) {
            alert('Le montant personnalisé doit être d\'au moins 1 000 F CFA.');
            return;
        }
    } else {
        itemPrice = parseInt(priceSelect.value);
    }

    let drinkPrice = 0;
    let drinkDetails = '';
    const addDrinkChecked = document.getElementById('addDrink').checked;
    
    if (addDrinkChecked) {
        const drinkQty = parseInt(document.getElementById('drinkQty').value) || 1;
        drinkPrice = drinkQty * 250;
        drinkDetails = ` + ${drinkQty} Jus Nature (${drinkPrice} F CFA)`;
    }

    const totalItemPrice = itemPrice + drinkPrice;

    cartItems.push({
        name: selectedDish.name,
        unitPrice: itemPrice,
        quantity: 1,
        drinkDetails: drinkDetails,
        totalPrice: totalItemPrice
    });

    renderCart();
    closeDishModal();
}

// --- PAIEMENT KK IAPAY & REDIRECTION WHATSAPP ---
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();

    if (!cartItems.length) {
        alert("Veuillez sélectionner au moins un plat avant de valider votre commande.");
        return;
    }

    const nom = document.getElementById('nom').value.trim();
    const telephone = document.getElementById('telephone').value.trim();
    const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

    openKkiapayWidget({
        amount: total,
        position: "center",
        callback: "",
        data: nom,
        phone: telephone,
        key: "b3dfef70678d11f1853bf54095493c04" // Ta clé KKiaPay
    });
});

// Écoute de la réussite du paiement
addSuccessListener(function(response) {
    const nom = document.getElementById('nom').value.trim();
    const telephone = document.getElementById('telephone').value.trim();
    const heure = document.getElementById('heure').value;
    const numeroResto = "2290198567898"; // Ton numéro WhatsApp avec indicatif

    const total = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const detailsCommande = cartItems.map(item =>
        `🍽️ *${item.name}* - ${item.quantity} x ${item.unitPrice} FCFA${item.drinkDetails}\n`
    ).join('');

    const messageTexte = `*NOUVELLE COMMANDE ORO IFE FOODS* 🍲\n` +
        `--------------------------------\n` +
        `👤 *Client :* ${nom}\n` +
        `📞 *Contact :* ${telephone}\n` +
        `⏰ *Heure de retrait :* ${heure}\n` +
        `--------------------------------\n` +
        detailsCommande +
        `--------------------------------\n` +
        `💳 *Total Payé :* ${total} FCFA\n` +
        `🆔 *Ref Transaction :* ${response.transactionId}`;

    // Utilisation du lien natif wa.me sans blocage pop-up
    const whatsappUrl = `https://wa.me/${numeroResto}?text=${encodeURIComponent(messageTexte)}`;

    // Redirection directe + affichage du bouton de secours
    const conteneur = document.getElementById("checkout-container");
    if (conteneur) {
        conteneur.innerHTML = `
            <div class="glass-card" style="text-align: center; padding: 30px;">
                <h2 style="color: #4ade80; margin-bottom: 10px;">Paiement Réussi ! 🎉</h2>
                <p style="color: #cbd5e1;">Référence : <strong>${response.transactionId}</strong></p>
                <p style="margin: 20px 0; font-size: 0.9rem; color: #94a3b8;">
                    Si WhatsApp ne s'ouvre pas automatiquement, cliquez ci-dessous pour envoyer la commande :
                </p>
                <a href="${whatsappUrl}" class="btn-submit" style="display: inline-block; text-decoration: none; padding: 12px 24px;">
                    Envoyer ma commande sur WhatsApp 💬
                </a>
            </div>
        `;
    }

    window.location.href = whatsappUrl;
});
