(function(children, partner, location, job) {
    const sentence = `You will be a ${job} in ${location}, married to ${partner} with ${children} kids.`;
    
    document.body.innerHTML += `<p>${sentence}</p>`;
})(2, "Alex", "Nairobi", "Software Developer");