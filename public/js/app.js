document.addEventListener('click', e => {
    if(e.target.dataset.short){
        const url = `${window.location.origin}/${e.target.dataset.short}`;
        
        navigator.clipboard
        .writeText(url)
        .then(() => {
            console.log("Texto copiado...");
        })
        .catch((err) => {
            console.log("Hubo un error..." + err);
        });
    }
})