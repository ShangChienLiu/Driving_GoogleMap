async function fetchAPIKey() {
    const response = await fetch('config.yml');
    const text = await response.text();
    const yamlData = jsyaml.load(text);
    const apiKey = yamlData.api_key;
    return apiKey;
}

fetchAPIKey().then(apiKey => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
});