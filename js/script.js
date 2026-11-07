// Find our date picker inputs on the page
const startInput = document.getElementById('startDate');
const endInput = document.getElementById('endDate');

// Call the setupDateInputs function from dateRange.js
// This sets up the date pickers to:
// - Default to a range of 9 days (from 9 days ago to today)
// - Restrict dates to NASA's image archive (starting from 1995)
setupDateInputs(startInput, endInput);

const searchButton = document.getElementById('searchButton');
const gallery = document.getElementById('gallery');
const imageModal = document.getElementById('imageModal');
const closeModalButton = document.getElementById('closeModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');
const loadingScreen = document.getElementById('loadingScreen');
const loadingMessage = document.getElementById('loadingMessage');
let galleryImages = [];

const spaceFacts = [
	'Neutron stars are so dense that a teaspoon of their material would weigh about a billion tons on Earth.',
	'One day on Venus is longer than one year on Venus because it rotates so slowly.',
	'Jupiter is so large that more than 1,300 Earths could fit inside it.',
	'Light from the Sun takes about eight minutes and twenty seconds to reach Earth.',
	'There are more stars in the universe than grains of sand on all of Earth’s beaches.',
	'The footprints left by astronauts on the Moon can remain for millions of years because there is no wind.'
];

const loadingMessages = [
	'Scanning the stars for amazing images...',
	'Launching a telescope toward the cosmos...',
	'Collecting stardust and space stories...',
	'Finding something spectacular in the universe...'
];

document.getElementById('spaceFact').textContent =
	spaceFacts[Math.floor(Math.random() * spaceFacts.length)];

function formatApiDate(date) {
	const [year, month, day] = date.split('-');
	return `${year.slice(2)}${month}${day}`;
}

// Fetch the APOD entries for the dates selected by the user.
async function getSpaceImages() {
	const startDate = startInput.value;
	const endDate = endInput.value;
	const url = `https://science.nasa.gov/wp-json/wp/v2/apod-basic?date_from=${formatApiDate(startDate)}&date_to=${formatApiDate(endDate)}`;

	gallery.innerHTML = '<div class="placeholder"><p>Loading space images...</p></div>';
	searchButton.disabled = true;
	loadingMessage.textContent = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
	loadingScreen.classList.add('is-visible');
	loadingScreen.setAttribute('aria-hidden', 'false');

	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error('NASA API request failed');
		}

		const results = await response.json();
		galleryImages = results
			.filter((image) => image.media_type === 'image' && image.date && image.hdurl);

		const imageCards = galleryImages
			.map((image, index) => `
				<article class="gallery-item" data-image-index="${index}" tabindex="0">
					<img src="${image.hdurl}" alt="${image.title}" loading="lazy">
					<h2>${image.title}</h2>
					<p>${image.date}</p>
				</article>
			`)
			.join('');

		gallery.innerHTML = imageCards || '<div class="placeholder"><p>No images were found for these dates.</p></div>';
	} catch (error) {
		gallery.innerHTML = '<div class="placeholder"><p>Sorry, we could not load the space images. Please try again.</p></div>';
	} finally {
		searchButton.disabled = false;
		loadingScreen.classList.remove('is-visible');
		loadingScreen.setAttribute('aria-hidden', 'true');
	}
}

searchButton.addEventListener('click', getSpaceImages);

// Fill the modal with the selected image's full details.
function showImageModal(image) {
	modalImage.src = image.hdurl;
	modalImage.alt = image.title;
	modalTitle.textContent = image.title;
	modalDate.textContent = image.date;
	modalExplanation.innerHTML = image.explanation;
	imageModal.classList.add('is-open');
	imageModal.setAttribute('aria-hidden', 'false');
}

function hideImageModal() {
	imageModal.classList.remove('is-open');
	imageModal.setAttribute('aria-hidden', 'true');
}

gallery.addEventListener('click', (event) => {
	const galleryItem = event.target.closest('.gallery-item');

	if (galleryItem) {
		showImageModal(galleryImages[galleryItem.dataset.imageIndex]);
	}
});

gallery.addEventListener('keydown', (event) => {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault();
		const galleryItem = event.target.closest('.gallery-item');

		if (galleryItem) {
			showImageModal(galleryImages[galleryItem.dataset.imageIndex]);
		}
	}
});

closeModalButton.addEventListener('click', hideImageModal);

imageModal.addEventListener('click', (event) => {
	if (event.target === imageModal) {
		hideImageModal();
	}
});

document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape') {
		hideImageModal();
	}
});
