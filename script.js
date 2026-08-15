// 1. Charger les données sauvegardées au démarrage de la page
document.addEventListener('DOMContentLoaded', () => {
    const savedNom = localStorage.getItem('resto_nom');
    const savedTel = localStorage.getItem('resto_tel');

    if (savedNom) document.getElementById('nom').value = savedNom;
    if (savedTel) document.getElementById('telephone').value = savedTel;
});

// 2. Transition au clic sur le bouton d'accueil
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

// 3. Gestion de la sélection dynamique des plats
let selectedPlat = null;
let selectedPrice = 0;

const menuCards = document.querySelectorAll('.menu-card');
const totalAmount = document.getElementById('totalAmount');

menuCards.forEach(card => {
    card.addEventListener('click', () => {
        menuCards.forEach(c => c.classList.remove('selected'));
        
        card.classList.add('selected');
        selectedPlat = card.getAttribute('data-name');
        selectedPrice = parseInt(card.getAttribute('data-price'));
        
        totalAmount.textContent = `${selectedPrice.toLocaleString()} FCFA`;
    });
});

// 4. Validation, Enregistrement et Lancement KKiaPay
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();

    if (!selectedPlat) {
        alert("Veuillez sélectionner un plat dans le menu !");
        return;
    }

    const nom = document.getElementById('nom').value;
    const telephone = document.getElementById('telephone').value;
    const heure = document.getElementById('heure').value;

    // Enregistrement local
    localStorage.setItem('resto_nom', nom);
    localStorage.setItem('resto_tel', telephone);

    if (typeof openKkiapayWidget === "undefined") {
        alert("Erreur : Le widget KKiaPay n'a pas pu être chargé.");
        return;
    }
 
// KKiaPay
// Fonction pour lancer le paiement
function lancerPaiement(total) {
    openKkiapayWidget({
        amount: total,
        position: "center",
        data: "Commande Resto_Express",
        key: "9b41eee62502b2decf60e28869c902091c1b53af",
        sandbox: true
    });
}

// Écouteur déclenché automatiquement par KKiaPay en cas de succès
window.addEventListener('successTransaction', function (response) {
    const transactionId = response.detail.transactionId;
    console.log("Paiement validé ! ID :", transactionId);

    // Étape suivante : Afficher un message de succès
    afficherConfirmationCommande(transactionId);
    
    // Envoyer les infos au backend si besoin
    if (typeof envoyerCommandeAuServeur === 'function') {
        envoyerCommandeAuServeur(transactionId);
    }
});

// Fonction d'affichage du message de confirmation
function afficherConfirmationCommande(id) {
    const conteneur = document.querySelector("#checkout-container"); // Remplace si ton ID HTML est différent
    if (conteneur) {
        conteneur.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <h2 style="color: #27ae60;">Commande validée avec succès ! 🎉</h2>
                <p>Merci pour votre commande. Référence de paiement : <strong>${id}</strong></p>
                <p>Votre plat est en cours de préparation dans la cuisine.</p>
                <button onclick="location.reload()" style="background: #e67e22; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                    Nouvelle commande
                </button>
            </div>
        `;
    }
}

// Écouteur officiel de succès KKiaPay
if (typeof addSuccessListener !== "undefined") {
    addSuccessListener((response) => {
        const nom = localStorage.getItem('resto_nom') || "Client";
        const telephone = localStorage.getItem('resto_tel') || "";
        const numeroResto = "2290148264516";

const messageTexte = `Une nouvelle commande payée a été passée :

*Statut :* Paiement valide par KKiaPay
*Nom :* ${nom}
*Telephone :* ${telephone}
*Transaction ID :* ${response.transactionId || "Valide"}

Merci de preparer la commande !`;
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${numeroResto}&text=${encodeURIComponent(messageTexte)}`;
        
        // Redirection directe pour éviter le blocage pop-up
        window.location.href = whatsappUrl;
    });
}
