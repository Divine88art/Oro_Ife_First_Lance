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
 
//KKiaPAy
openKkiapayWidget({
    amount: total,
    position: "center",
    callback: "",
    data: "",
    key: "9b41eee62502b2decf60e28869c902091c1b53af",
    sandbox: true // Assure-toi que c'est sur true pour les tests
});
});

// Écouteur officiel de succès KKiaPay
if (typeof addSuccessListener !== "undefined") {
    addSuccessListener((response) => {
        const nom = localStorage.getItem('resto_nom') || "Client";
        const telephone = localStorage.getItem('resto_tel') || "";
        const numeroResto = "2290148264516";

        const messageTexte = 
            "Bonjour ! \u{1F372} Une nouvelle commande PAYÉE a été passée :\n\n" +
            "\u{2705} *Statut :* Paiement validé par KKiaPay\n" +
            "\u{1F464} *Nom :* " + nom + "\n" +
            "\u{1F4DE} *Téléphone :* " + telephone + "\n" +
            "\u{1F4B0} *Transaction ID :* " + (response.transactionId || "Validé") + "\n\n" +
            "Merci de préparer la commande !";

        const whatsappUrl = `https://api.whatsapp.com/send?phone=${numeroResto}&text=${encodeURIComponent(messageTexte)}`;
        window.open(whatsappUrl, '_blank');
    });
}
