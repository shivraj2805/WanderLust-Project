const taxSwitch = document.getElementById("flexSwitchCheckDefault");

    // Function to toggle the visibility of tax information
    taxSwitch.addEventListener("change", () => {
      const taxInfoElements = document.querySelectorAll(".tax-info");
      if (taxSwitch.checked) {
        taxInfoElements.forEach(info => {
          info.style.display = "inline"; // Show the GST info
        });
      } else {
        taxInfoElements.forEach(info => {
          info.style.display = "none"; // Hide the GST info
        });
      }
    });

    // Set active category filter
    function setActiveCategory(category) {
      const filters = document.querySelectorAll('.filter');
      filters.forEach(filter => {
        const categoryName = filter.querySelector('p').textContent;
        if (categoryName === category) {
          filter.classList.add('active');
        } else {
          filter.classList.remove('active');
        }
      });
    }

    // Fetch and display filtered listings
    async function filterListings(category) {
      setActiveCategory(category);
      try {
        const response = await fetch(`/listings/category/${category}`);
        const listings = await response.json();
        displayListings(listings);
      } catch (err) {
        console.error('Error fetching listings:', err);
        alert('Failed to fetch listings. Please try again later.');
      }
    }

    // Render the fetched listings
    function displayListings(listings) {
      const container = document.getElementById('listing-container');
      container.innerHTML = ''; // Clear previous listings

      listings.forEach(listing => {
        const listingCard = `
          <a href="/listings/${listing._id}" class="listing-link">
            <div class="card col listing-card">
              <img src="${listing.image.url}" class="card-img-top" alt="listing_Image" style="height:20rem">
              <div class="card-body">
                <p class="card-text">
                  <b>${listing.title}</b><br>
                  ${listing.price ? `₹ ${listing.price.toLocaleString("en-IN")} /night` : 'Price not available'}
                  <i class="tax-info" style="display: none;"> &nbsp; + 18% GST</i>
                </p>
              </div>
            </div>
          </a>
        `;
        container.innerHTML += listingCard;
      });
    }