async function updateData() {
    try {
        const response = await fetch(window.location.href)
        const text = await response.text()
        const parser = new DOMParser()

        const doc = parser.parseFromString(text, 'text/html')
        const newTable = doc.querySelector('#tstatus')
        const olTable = document.querySelector('#tstatus')

        if (newTable && olTable) {
            olTable.innerHTML = newTable.innerHTML
        }
    } catch (error) {
        console.error('Error fetching status data:', error)
    }
}

setInterval(updateData, 1500) // Update every 5 seconds